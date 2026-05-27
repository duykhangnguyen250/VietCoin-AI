from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from pydantic import BaseModel
from app.security.security import get_current_user
from app.models.base_db import UserDB
from app.inference.consensus import ConsensusRecognizer
from app.utils.coin_mapping import get_coin_info
from app.config import settings
import io
import numpy as np

router = APIRouter(prefix="/coin", tags=["coin"])

# Singleton for recognizer
recognizer = ConsensusRecognizer()

DYNASTY_NAME_MAP = {
    "Dinh": "Đinh",
    "Ho": "Hồ",
    "Le_So": "Lê Sơ",
    "Le_Trung_Hung": "Lê Trung Hưng",
    "Ly": "Lý",
    "Mac": "Mạc",
    "Nguyen": "Nguyễn",
    "Tay_Son": "Tây Sơn",
    "Tien_Le": "Tiền Lê",
    "Tran": "Trần"
}

@router.post("/predict")
async def predict_coin(
    file: UploadFile = File(...),
    user=Depends(get_current_user),
    tta: bool = Query(False, description="Enable Test-Time Augmentation")
):
    try:
        contents = await file.read()
        
        # =========================
        # 🔥 TOKEN CHECK
        # =========================
        db = UserDB()
        db_user = db.get_by_email(user["email"])

        if not db_user:
            db.close()
            raise HTTPException(404, "User không tồn tại")

        COST = 0.2
        if db_user["token_balance"] < COST:
            db.close()
            raise HTTPException(403, "Không đủ token để nhận diện")

        # =========================
        # 🔥 RUN 4-LAYER CONSENSUS
        # =========================
        res = await recognizer.run_consensus(contents)
        
        label = res["label"]
        status = res["status"]
        gemini_info = res["gemini_info"]
        
        # Check if Gemini says it's not a coin
        if settings.ENABLE_GEMINI and not gemini_info.get("is_coin", True):
            db.close()
            return {
                "label": "NOT_COIN",
                "display_name": "Không phải đồng xu",
                "confidence": 0,
                "suggestions": [],
                "tokens_used": 0,
                "new_balance": db_user["token_balance"],
                "han_canonical": "N/A",
                "description": "Hình ảnh không được nhận diện là đồng xu Việt Nam cổ.",
                "ocr_text": []
            }

        # Handle Low Confidence
        if status == "RETRY" and res["confidence"] < 15:
             db.close()
             return {
                "label": "LOW_CONFIDENCE",
                "display_name": "Độ tin cậy thấp",
                "confidence": round(res["confidence"], 2),
                "suggestions": [],
                "tokens_used": 0,
                "new_balance": db_user["token_balance"],
                "han_canonical": "N/A",
                "description": "Hệ thống không chắc chắn. Vui lòng chụp ảnh rõ nét hơn.",
                "ocr_text": []
            }

        # =========================
        # 🔥 DEDUCT TOKENS
        # =========================
        new_balance = db.change_token_balance(
            user_id=db_user["id"],
            amount=COST,
            description=f"Giám định 4 lớp: {label}",
            tx_type="out"
        )
        db.close()

        # =========================
        # 🔥 PREPARE FINAL RESPONSE (Ultra-Rich Info)
        # =========================
        coin_info = get_coin_info(label)
        
        display_name = coin_info["display_name"]
        static_desc = coin_info["description"]
        ocr_text = [res["ocr_text"]] if res["ocr_text"] else []

        # Build Description Sections
        desc_history = f"TỔNG QUAN LỊCH SỬ\n\n{static_desc}"
        
        desc_ai = ""
        if gemini_info.get("dynasty") != "Unknown":
            ocr_text = [gemini_info.get("text", "N/A")]
            raw_dynasty = gemini_info.get("dynasty", label)
            dyn_display = DYNASTY_NAME_MAP.get(raw_dynasty, raw_dynasty)
            display_name = f"{dyn_display} - {gemini_info.get('vietnamese_reading', '')}"
            
            desc_ai = (
                f"PHÂN TÍCH CHUYÊN SÂU (AI)\n\n"
                f"• Phiên âm: {gemini_info.get('vietnamese_reading', '')} ({gemini_info.get('translation', '')})\n\n"
                f"• Bối cảnh: {gemini_info.get('historical_context', '')}\n\n"
                f"• Vật lý: {gemini_info.get('physical_features', '')}\n\n"
                f"• Độ hiếm: {gemini_info.get('rarity', 'Phổ thông')}"
            )

        # Base description
        if desc_ai:
            description = f"{desc_history}\n\n\n\n{desc_ai}"
        else:
            description = desc_history

        # Suggestions from ResNet probabilities
        suggestions = []
        if "all_probs" in res:
            all_probs = np.array(res["all_probs"])
            top_indices = np.argsort(all_probs)[::-1][:3]
            from app.inference.consensus import CLASS_NAMES
            for s_idx in top_indices:
                s_label = CLASS_NAMES[s_idx]
                s_info = get_coin_info(s_label)
                suggestions.append({
                    "label": s_label,
                    "display_name": s_info.get("display_name", s_label),
                    "confidence": round(float(all_probs[s_idx]) * 100, 2)
                })

        # Determine precise Han Canonical
        han_canonical = coin_info.get("han", "N/A")
        ocr_result_text = res.get("ocr_text", "")
        
        if gemini_info.get("dynasty") != "Unknown" and gemini_info.get("text"):
            # Gemini provides exact reading and text
            viet_reading = gemini_info.get("vietnamese_reading", "")
            han_text = gemini_info.get("text", "")
            if viet_reading and han_text:
                han_canonical = f"{viet_reading} ({han_text})"
            elif han_text:
                han_canonical = han_text
        elif ocr_result_text:
            # Fallback to OCR detected keyword
            import re
            clean_ocr = re.sub(r'\s+', '', ocr_result_text).lower()
            if ("thiênhưng" in clean_ocr or "天興" in clean_ocr or "天通" in clean_ocr) and label == "Le_So":
                han_canonical = "Thiên Hưng Thông Bảo (天興通寶)"
            elif ("đạihòa" in clean_ocr or "tháihòa" in clean_ocr or "大和" in clean_ocr or "太和" in clean_ocr) and label == "Le_So":
                han_canonical = "Đại Hòa Thông Bảo (大和通寶)"
            elif "đạiđịnh" in clean_ocr or "大定" in clean_ocr or "天定" in clean_ocr:
                han_canonical = "Đại Định Thông Bảo (大定通寶)"
            elif "thuậnthiên" in clean_ocr or "順天" in clean_ocr:
                han_canonical = "Thuận Thiên Nguyên Bảo (順天元寶)"
            elif "tháibình" in clean_ocr or "太平" in clean_ocr or ("天" in clean_ocr and "bình" in clean_ocr) or ("thái" in clean_ocr and "bình" in clean_ocr):
                han_canonical = "Thái Bình Hưng Bảo (太平興寶)"
            elif "cảnhhưng" in clean_ocr or "景興" in clean_ocr:
                han_canonical = "Cảnh Hưng Thông Bảo (景興通寶)"
            elif "quangtrung" in clean_ocr or "光中" in clean_ocr:
                han_canonical = "Quang Trung Thông Bảo (光中通寶)"
            elif "tháiđức" in clean_ocr or "泰德" in clean_ocr:
                han_canonical = "Thái Đức Thông Bảo (泰德通寶)"
            elif "cảnhthịnh" in clean_ocr or "景盛" in clean_ocr:
                han_canonical = "Cảnh Thịnh Thông Bảo (景盛通寶)"
            elif "bảođại" in clean_ocr or "保大" in clean_ocr:
                han_canonical = "Bảo Đại Thông Bảo (保大通寶)"
            elif "minhđức" in clean_ocr or "明德" in clean_ocr:
                if label == "Tay_Son":
                    han_canonical = "Minh Đức Thông Bảo (Tây Sơn) (明德通寶)"
                else:
                    han_canonical = "Minh Đức Thông Bảo (Triều Mạc) (明德通寶)"
            elif "minhmạng" in clean_ocr or "明命" in clean_ocr:
                han_canonical = "Minh Mạng Thông Bảo (明命通寶)"
            elif "tựđức" in clean_ocr or "嗣der" in clean_ocr or "嗣德" in clean_ocr:
                han_canonical = "Tự Đức Thông Bảo (嗣德通寶)"
            elif "gialong" in clean_ocr or "嘉隆" in clean_ocr:
                han_canonical = "Gia Long Thông Bảo (嘉隆通寶)"

        # Append specific coin detail if available
        from app.utils.coin_mapping import get_specific_coin_detail
        specific_detail = get_specific_coin_detail(han_canonical)
        if specific_detail:
            # Format the specific detail nicely
            formatted_detail = specific_detail.replace("🌟 **THÔNG TIN ĐỒNG XU:**", "THÔNG TIN CHI TIẾT")
            description = f"{formatted_detail}\n\n\n\n{description}"

        # =========================
        # 🔥 NORMALIZE & REMOVE MARKDOWN BOLD SYMBOLS (**)
        # =========================
        def clean_text_formatting(s):
            if not s: return s
            # Normalize naming
            s = s.replace("Minh Mệnh", "Minh Mạng").replace("Minh mệnh", "Minh mạng")
            # Strip all raw markdown bold markers
            s = s.replace("**", "")
            return s

        display_name = clean_text_formatting(display_name)
        han_canonical = clean_text_formatting(han_canonical)
        description = clean_text_formatting(description)

        return {
            "label": label,
            "display_name": display_name,
            "confidence": round(res["confidence"], 2),
            "suggestions": suggestions,
            "tokens_used": COST,
            "new_balance": new_balance,
            "han_canonical": han_canonical,
            "description": description,
            "ocr_text": ocr_text,
            "status": status,
            "debug_images": res.get("debug_images", {})
        }

    except Exception as e:
        if 'db' in locals():
            db.close()
        print(f"[API ERROR] {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống giám định: {str(e)}")


class GameRewardClaim(BaseModel):
    game_type: str  # "spin" or "memory"
    reward_amount: float
    description: str

@router.post("/claim-game-tokens")
async def claim_game_tokens(
    data: GameRewardClaim,
    user=Depends(get_current_user)
):
    if data.reward_amount <= 0 or data.reward_amount > 5.0:
        raise HTTPException(status_code=400, detail="Lượng token nhận thưởng không hợp lệ")

    db = UserDB()
    db_user = db.get_by_email(user["email"])
    if not db_user:
        db.close()
        raise HTTPException(404, "User không tồn tại")

    new_balance = db.change_token_balance(
        user_id=db_user["id"],
        amount=data.reward_amount,
        description=f"Thưởng game ({data.game_type}): {data.description}",
        tx_type="in"
    )
    db.close()
    
    return {
        "message": "Nhận thưởng thành công!",
        "reward_amount": data.reward_amount,
        "new_balance": new_balance
    }