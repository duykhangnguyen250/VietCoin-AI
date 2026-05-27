import os
import sys
import numpy as np
import cv2
import json
import time
import asyncio
from PIL import Image
import onnxruntime as ort
import httpx
from paddleocr import PaddleOCR
import uuid
from app.config import settings

# Stable environment flags for Paddle 2.x
os.environ['PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION'] = 'python'
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'
os.environ['FLAGS_use_onednn'] = '0'

CLASS_NAMES = [
    "Dinh", "Ho", "Le_So", "Le_Trung_Hung", "Ly", 
    "Mac", "Nguyen", "Tay_Son", "Tien_Le", "Tran"
]

INSCRIPTION_MAP = {
    "Thái Bình": "Dinh", "太平": "Dinh", "Thái Bình Hưng Bảo": "Dinh", "太平興寶": "Dinh", "天平興寶": "Dinh",
    "Thánh Nguyên": "Ho", "聖元": "Ho",
    "Thuận Thiên": "Le_So", "順天": "Le_So",
    "Thiệu Bình": "Le_So", "紹平": "Le_So",
    "Hồng Đức": "Le_So", "洪德": "Le_So",
    "Cảnh Hưng": "Le_Trung_Hung", "景興": "Le_Trung_Hung",
    "Chiêu Thống": "Le_Trung_Hung", "昭統": "Le_Trung_Hung",
    "Thiên Phúc": "Tien_Le", "天福": "Tien_Le",
    "Thái Hòa": "Le_So", "太和": "Le_So", "Đại Hòa": "Le_So", "大和": "Le_So",
    "Thái Hòa Thông Bảo": "Le_So", "太和通寶": "Le_So", "Đại Hòa Thông Bảo": "Le_So", "大和通寶": "Le_So",
    "Thái Phù": "Ly", "泰符": "Ly",
    "Minh Đạo": "Ly", "明道": "Ly",
    "Thiên Cảm": "Ly", "天感": "Ly",
    "Trần Phù": "Tran", "陳符": "Tran",
    "Vĩnh Thọ": "Le_Trung_Hung", "永壽": "Le_Trung_Hung",
    "Minh Mạng": "Nguyen", "明命": "Nguyen",
    "Tự Đức": "Nguyen", "嗣德": "Nguyen",
    "Bảo Đại": "Nguyen", "保大": "Nguyen",
    "Gia Long": "Nguyen", "嘉隆": "Nguyen",
    "Quang Trung": "Tay_Son", "光中": "Tay_Son",
    "Cảnh Thịnh": "Tay_Son", "景盛": "Tay_Son",
    "Thuận Thiên Nguyên Bảo": "Le_So", "順天元寶": "Le_So",
    "Thuận Thiên Đại Bảo": "Ly", "順天大寶": "Ly",
    "Đại Định": "Ly", "大定": "Ly", "天定": "Ly",
    "Chính Long": "Ly", "正隆": "Ly", "Chính Long Nguyên Bảo": "Ly", "正隆元寶": "Ly",
    "Thiên Hưng": "Le_So", "天興": "Le_So",
    "Thiên Thông": "Le_So", "天通": "Le_So",
    "Đồng Khánh": "Nguyen", "同慶": "Nguyen", "同慶通寶": "Nguyen",
    "Thành Thái": "Nguyen", "成泰": "Nguyen", "成泰通寶": "Nguyen",
    "Duy Tân": "Nguyen", "維新": "Nguyen", "維新通寶": "Nguyen",
    "Khải Định": "Nguyen", "啟定": "Nguyen", "啟定通寶": "Nguyen",
    "Hàm Nghi": "Nguyen", "咸宜": "Nguyen", "咸宜通寶": "Nguyen",
    "Kiến Phúc": "Nguyen", "建福": "Nguyen", "建福通寶": "Nguyen"
}

# Dynasty Synonyms for Search Matching
DYNASTY_SYNONYMS = {
    "Le_So": ["hậu lê", "lê sơ", "lê thái tổ", "lê lợi"],
    "Le_Trung_Hung": ["lê trung hưng", "chúa trịnh", "chúa nguyễn"],
    "Tay_Son": ["tây sơn", "quang trung", "nguyễn huệ"],
    "Nguyen": ["nhà nguyễn", "gia long", "minh mạng", "tự đức", "bảo đại"],
    "Ho": ["nhà hồ", "hồ quý ly", "thánh nguyên"],
    "Dinh": ["nhà đinh", "đinh tiên hoàng"],
    "Ly": ["nhà lý", "lý thái tổ"],
    "Tran": ["nhà trần", "trần hưng đạo"],
    "Tien_Le": ["tiền lê", "lê đại hành"],
    "Mac": ["nhà mạc", "mạc đăng dung"]
}

class ConsensusRecognizer:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ConsensusRecognizer, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
            
        print("[*] Initializing Stable 4-Layer Voting System...")
        # Layer 1: ONNX
        model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models_ai", "coin_model.onnx")
        if not os.path.exists(model_path):
             model_path = os.path.join(settings.DIR_ROOT, "..", "models_ai", "coin_model.onnx")
        
        self.session = ort.InferenceSession(model_path)
        self.input_name = self.session.get_inputs()[0].name
        
        # Layer 2: PaddleOCR (Stable 2.8.x)
        self.ocr_engine = PaddleOCR(use_angle_cls=True, lang='ch', show_log=False)
        
        # Key management
        self.gemini_keys = []
        if getattr(settings, "GEMINI_API_KEY", None):
            self.gemini_keys.append(settings.GEMINI_API_KEY)
            
        self.gemini_keys.extend([
            # --- Account 1 (duykhangnguyen250) - Project: CoinVietnam ---
            "AIzaSyAmkersNxrTo7O9YSCfEpEYhN0GO6lc5LA",
            "AIzaSyAMN9Zi9zBGxLf6pOvjiL3YzqezqBL6_GY",
            "AIzaSyB5LjaSQHT3m8RLOkoJN2BiEpQtGx39_xo",
            "AIzaSyDBsTTBopXe0GBCC49X7I4f4heTkc_AZb4",
            # --- Account 1 - Project: TienXuCoVN ---
            "AIzaSyBUhRpKAh4gNdWK4X1wxXItwuVzZ3robgo",
            "AIzaSyCyaKvTXzKgks047cWHaCKOD7yj9fq3Z1k",
            # --- Account 1 - Project: Tiền XuCổ Việt Nam ---
            "AIzaSyB1uv0o89s3oY7csnLnMDN_wib_LEkcYaE",
            "AIzaSyAPG4wfaGI4qzk-YY3HKkO5ZdeCYSp5cxU",
            # --- Account 1 - Project: gen-lang-client ---
            "AIzaSyBoj2ty3hC9uVZGPadh3SSynsQjuUNyxyY",
            "AIzaSyCI73XFzyr_FJEEeq022qGwnk1fMa3TOdY",
            # --- Account 2 (duykhang23022004) - Project: Gemini mặc định ---
            "AIzaSyBVb18J1mUONSEkS-X3dsNfrA4yPCI8PhI",
            # --- Account 2 - Project: TienXu ---
            "AIzaSyDFZNtugMvPa-WPqHZjYXp8EmrZsqZrpmA",
            # --- Account 2 - Project: CoinVN ---
            "AIzaSyBL3GkyjzRpgQCt2oMw7-6nWttPGY2BKL0",
            "AIzaSyA_0hAQe9i0bRNbez4v_9y6aEAIi8MjBXE",
            # --- Account 2 - Project: KeyAPIVietcom ---
            "AIzaSyCPmQWAU7fAJ00Cpb4CBeaIhlZ1wRv0hj8",
            # --- Account 3 (khangdaniel713) - Project: 927188651211 ---
            "AIzaSyDDH43sxaIr--HWxZcJY6L4GBUH2e75eBE",
            # --- Account 3 - Project: 229085907755 ---
            "AIzaSyAzEKZoryNfr1LbMYDH2caLl20860NpOp4",
            # --- Account 3 - Project: 825838348584 ---
            "AIzaSyC94S4axUV4EC57pEPq0HPnIz252ns-y04",
        ])
        self.serp_keys = [
            "b6948c44d1652bcc9f31267f7e8f41b8ddad85b26946b76d645c97f177158c9b",
            "5b3c345d21c8a76e02701518c6b1eab6230fe54bb5d2291279adfff120bc7202",
            "77c9371681d8ae08eda15ebef66ba9fb0d665c4b8f70980543a56bb3c8e967c3",
            "c57ce2c29d20881bf3956fe54ae05a05e50462e31a3f3f01eb2e1ed22d730629"
        ]
        
        self.current_key_index = 0
        self.current_serp_index = 0
        self.key_cooldowns = {}
        self._initialized = True

        # Ensure download directory exists (Absolute Path)
        self.download_dir = os.path.join(settings.DIR_ROOT, "utils", "download")
        os.makedirs(self.download_dir, exist_ok=True)
        
        print(f"[OK] Stable layers initialized. Debug images at: {self.download_dir}")

    def preprocess_for_ocr(self, img_np):
        """Upscale -> Strong Sharpen -> CLAHE -> Auto-Invert -> Median Blur."""
        save_dir = self.download_dir
        uid = uuid.uuid4().hex
        
        # Step B: 2x Resize and Grayscale conversion
        img = cv2.resize(img_np, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
        gray_filename = f"step1_gray_{uid}.png"
        cv2.imwrite(os.path.join(save_dir, gray_filename), gray)
        
        # Step C: Edge Sharpening with 2D Laplacian
        kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
        sharpened = cv2.filter2D(gray, -1, kernel)
        sharpen_filename = f"step2_sharpen_{uid}.png"
        cv2.imwrite(os.path.join(save_dir, sharpen_filename), sharpened)
        
        # Step D: Adaptive CLAHE Contrast Enhancement
        clahe = cv2.createCLAHE(clipLimit=5.0, tileGridSize=(8,8))
        enhanced = clahe.apply(sharpened)
        clahe_filename = f"step3_clahe_{uid}.png"
        cv2.imwrite(os.path.join(save_dir, clahe_filename), enhanced)
        
        # Step E: Dynamic Binarization / Inversion & Noise Reduction (Median Blur)
        if np.mean(enhanced) < 127:
            enhanced = cv2.bitwise_not(enhanced)
        final = cv2.medianBlur(enhanced, 3)
        
        proc_filename = f"proc_{uid}.png"
        proc_path = os.path.join(save_dir, proc_filename)
        cv2.imwrite(proc_path, final)

        # Return dict of all steps
        steps_dict = {
            "gray": gray_filename,
            "sharpened": sharpen_filename,
            "clahe": clahe_filename,
            "final": proc_filename
        }

        return final, steps_dict

    def get_resnet_prediction(self, image_pil):
        img = image_pil.convert('RGB')
        img = img.resize((224, 224), Image.Resampling.LANCZOS)
        img_array = np.array(img, dtype=np.float32) / 255.0
        mean = np.array([0.485, 0.456, 0.406]).reshape(1, 1, 3)
        std = np.array([0.229, 0.224, 0.225]).reshape(1, 1, 3)
        img_normalized = (img_array - mean) / std
        tensor = np.transpose(img_normalized, (2, 0, 1))[np.newaxis, ...]
        
        outputs = self.session.run(None, {self.input_name: tensor.astype(np.float32)})
        exp_x = np.exp(outputs[0] - np.max(outputs[0]))
        probs = exp_x / exp_x.sum()
        idx = np.argmax(probs)
        return CLASS_NAMES[idx], float(np.max(probs)), probs[0]

    def get_ocr_prediction(self, img_np):
        processed_img, steps_dict = self.preprocess_for_ocr(img_np)
        best_match = ("Unknown", "")
        detected_text = ""
        han_crops = []
        
        save_dir = self.download_dir

        # Step 3: Extracting Han characters (Crops)
        # First, capture the 4 main regions at angle 0 as a baseline for the UI
        for name, region_img in {
            "T": processed_img[0:int(processed_img.shape[0]*0.4), int(processed_img.shape[1]*0.3):int(processed_img.shape[1]*0.7)],
            "B": processed_img[int(processed_img.shape[0]*0.6):processed_img.shape[0], int(processed_img.shape[1]*0.3):int(processed_img.shape[1]*0.7)],
            "L": processed_img[int(processed_img.shape[0]*0.3):int(processed_img.shape[0]*0.7), 0:int(processed_img.shape[1]*0.4)],
            "R": processed_img[int(processed_img.shape[0]*0.3):int(processed_img.shape[0]*0.7), int(processed_img.shape[1]*0.6):processed_img.shape[1]]
        }.items():
            if region_img.size > 0:
                crop_filename = f"crop_{name}_{uuid.uuid4().hex[:8]}.png"
                cv2.imwrite(os.path.join(save_dir, crop_filename), region_img)
                han_crops.append(crop_filename)

        for angle in [0, 45, 90, 135, 180, 225, 270, 315]:
            (h, w) = processed_img.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, angle, 1.0)
            img = cv2.warpAffine(processed_img, M, (w, h))
            
            cx, cy = w // 2, h // 2
            offset = int(min(w, h) * 0.12) 
            size = int(min(w, h) * 0.45) 
            
            regions = {
                "T": img[0:cy-offset, cx-size//2:cx+size//2],
                "B": img[cy+offset:h, cx-size//2:cx+size//2],
                "L": img[cy-size//2:cy+size//2, 0:cx-offset],
                "R": img[cy-size//2:cy+size//2, cx+offset:w]
            }
            
            for name, region_img in regions.items():
                if region_img.size == 0: continue
                region_bgr = cv2.cvtColor(region_img, cv2.COLOR_GRAY2BGR)
                result = self.ocr_engine.ocr(region_bgr, det=False, cls=True)
                if result and result[0]:
                    text, conf = result[0][0]
                    if conf > 0.45:
                        detected_text += text + " "
                        
        # Check against INSCRIPTION_MAP first for exact/partial matches
        clean_text = detected_text.lower().replace(" ", "")
        
        # Sort INSCRIPTION_MAP keys by length descending to match longest string first 
        # (e.g., match "Thuận Thiên Đại Bảo" before "Thuận Thiên")
        sorted_keys = sorted(INSCRIPTION_MAP.keys(), key=len, reverse=True)
        
        for key in sorted_keys:
            clean_key = key.lower().replace(" ", "")
            # Check Chinese chars in raw detected_text, or Vietnamese in clean_text
            if clean_key in clean_text or key in detected_text:
                best_match = (INSCRIPTION_MAP[key], key)
                break

        # Post-processing for common OCR errors ONLY if no match found
        if best_match[0] == "Unknown":
            if "tháibình" in clean_text or "太平" in clean_text:
                best_match = ("Dinh", "Thái Bình Hưng Bảo")
            elif "đồngkhánh" in clean_text or "同慶" in clean_text:
                best_match = ("Nguyen", "Đồng Khánh Thông Bảo")

        return best_match[0], best_match[1] if best_match[0] != "Unknown" else detected_text.strip(), steps_dict, han_crops

    async def get_gemini_prediction(self, image_bytes):
        prompt = """
        Bạn là chuyên gia thẩm định tiền cổ Việt Nam số 1 thế giới.
        Nhiệm vụ: Nhận diện chữ Hán và cung cấp hồ sơ lịch sử chi tiết.
        
        ⚠️ CHÚ Ý QUAN TRỌNG ĐỂ TRÁNH NHẬN DIỆN SAI (HALLUCINATION):
        - Nhìn kỹ các nét chữ để phân biệt những chữ dễ nhầm lẫn dưới lớp gỉ đồng (patina).
        - Đặc biệt lưu ý phân biệt đồng "Chính Long Nguyên Bảo" (正隆元寶 - triều Lý/Kim) với các đồng phổ biến hơn thời Lê Trung Hưng như "Chính Hòa Thông Bảo" (正 và 和) hay "Cảnh Hưng Nguyên Bảo" (景 và 興).
        - Nếu đồng tiền có chữ "正" (Chính) ở trên và chữ "隆" (Long) ở dưới, "元" (Nguyên) bên phải, "寶" (Bảo) bên trái -> Đó chắc chắn là đồng "Chính Long Nguyên Bảo" (正隆元寶) của triều nhà Kim / Lý Anh Tông. Hãy trả về dynasty là "Ly" (theo danh mục cổ Việt Nam) hoặc nhà Kim.
        
        Yêu cầu trả về JSON chính xác:
        {
          "dynasty": "Dinh/Ho/Le_So/Le_Trung_Hung/Ly/Mac/Nguyen/Tay_Son/Tien_Le/Tran",
          "text": "Chữ Hán trên đồng xu",
          "vietnamese_reading": "Phiên âm Hán Việt",
          "translation": "Dịch nghĩa tên đồng tiền",
          "historical_context": "Bối cảnh lịch sử chi tiết (vị vua, năm đúc, sự kiện liên quan)",
          "physical_features": "Đặc điểm vật lý (chất liệu đồng, kích thước phổ biến, đặc điểm lỗ vuông)",
          "rarity": "Đánh giá độ hiếm (Phổ thông/Khá hiếm/Cực hiếm)",
          "is_coin": true
        }
        """
        import base64
        encoded_image = base64.b64encode(image_bytes).decode('utf-8')
        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {"inline_data": {"mime_type": "image/jpeg", "data": encoded_image}}
                ]
            }]
        }
        headers = {'Content-Type': 'application/json'}

        def _parse(response, model_name):
            res_json = response.json()
            text_res = res_json['candidates'][0]['content']['parts'][0]['text']
            try:
                print(f"[*] Gemini Success ({model_name}): {text_res[:50]}...")
            except Exception:
                print(f"[*] Gemini Success ({model_name}): [Response printed safely]")
            import re
            json_match = re.search(r'\{.*\}', text_res, re.DOTALL)
            data = json.loads(json_match.group()) if json_match else json.loads(text_res.strip())
            gem_dyn = data.get("dynasty", "Unknown")
            for key, synonyms in DYNASTY_SYNONYMS.items():
                if gem_dyn.lower() in synonyms or any(s in gem_dyn.lower() for s in synonyms):
                    data["dynasty"] = key
                    break
            return data

        max_attempts = 5
        attempts = 0

        for model_name in ["gemini-flash-latest", "gemini-2.0-flash"]:
            for _ in range(len(self.gemini_keys)):
                if attempts >= max_attempts:
                    break

                now = time.time()
                # Check keys that are not cooling down for this specific model
                available_keys = [
                    (idx, k) for idx, k in enumerate(self.gemini_keys)
                    if now >= self.key_cooldowns.get((k, model_name), 0)
                ]

                if not available_keys:
                    # Fallback: Pick the key that has been cooling down the longest for this specific model
                    sorted_by_cooldown = sorted(
                        enumerate(self.gemini_keys),
                        key=lambda x: self.key_cooldowns.get((x[1], model_name), 0)
                    )
                    chosen_idx, api_key = sorted_by_cooldown[0]
                    print(f"[!] Gemini: All keys in cooldown for model {model_name}. Reusing oldest key {chosen_idx} (cooldown: {self.key_cooldowns.get((api_key, model_name), 0) - now:.1f}s remaining).")
                else:
                    # Pick the next key at or after current_key_index that is available for this model
                    start_pos = self.current_key_index % len(self.gemini_keys)
                    available_keys.sort(key=lambda x: (x[0] < start_pos, x[0]))
                    chosen_idx, api_key = available_keys[0]

                self.current_key_index = (chosen_idx + 1) % len(self.gemini_keys)
                attempts += 1

                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
                try:
                    async with httpx.AsyncClient(timeout=15.0) as client:
                        response = await client.post(url, json=payload, headers=headers)
                        if response.status_code == 200:
                            return _parse(response, model_name)
                        elif response.status_code == 429:
                            # 429 Rate limit: Cooldown for 60 seconds for this specific model
                            self.key_cooldowns[(api_key, model_name)] = now + 60.0
                            print(f"[!] Gemini {model_name} rate limited (HTTP 429) on Key {chosen_idx}. Cooldown active.")
                        else:
                            # Other failure: Cooldown for 15 seconds for this specific model
                            self.key_cooldowns[(api_key, model_name)] = now + 15.0
                            print(f"[!] Gemini {model_name} failed (HTTP {response.status_code}) on Key {chosen_idx}")
                            if response.status_code == 400 and "expired" in response.text.lower():
                                if api_key == getattr(settings, "GEMINI_API_KEY", None):
                                    print("[WARNING] Key 0 (GEMINI_API_KEY from .env) is EXPIRED! Please update the key in your .env file.")
                except Exception as e:
                    self.key_cooldowns[(api_key, model_name)] = now + 15.0
                    print(f"[!] Gemini Direct Call Error on Key {chosen_idx}: {str(e)}")

        return {"dynasty": "Unknown", "is_coin": True}

    async def get_google_search_validation(self, text_query):
        if not self.serp_keys or not text_query or len(text_query) < 2:
            return "Unknown", "No Data"
        api_key = self.serp_keys[self.current_serp_index % len(self.serp_keys)]
        from serpapi import GoogleSearch
        query = f"đồng tiền '{text_query}' thuộc triều đại nào Việt Nam"
        params = {"engine": "google", "q": query, "api_key": api_key, "hl": "vi"}
        try:
            search = GoogleSearch(params)
            data = await asyncio.to_thread(search.get_dict)
            if "error" in data:
                self.current_serp_index += 1
                return await self.get_google_search_validation(text_query) 
            snippet = "".join([res.get("snippet", "").lower() for res in data.get("organic_results", [])[:3]])
            
            # Use synonym matching for search snippets
            for key, synonyms in DYNASTY_SYNONYMS.items():
                for syn in synonyms:
                    if syn in snippet:
                        return key, "Verified"
            return "Unknown", "No result"
        except: return "Unknown", "Error"

    async def run_consensus(self, image_bytes):
        import io
        image_pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_np = cv2.cvtColor(np.array(image_pil), cv2.COLOR_RGB2BGR)

        res_task = asyncio.to_thread(self.get_resnet_prediction, image_pil)
        ocr_task = asyncio.to_thread(self.get_ocr_prediction, img_np)
        gemini_task = self.get_gemini_prediction(image_bytes)
        
        res_dynasty, res_conf, all_probs = await res_task
        ocr_dynasty, ocr_text, steps_dict, han_crops = await ocr_task
        gemini_res = await gemini_task
        gem_dynasty = gemini_res.get("dynasty", "Unknown")
        gem_text = gemini_res.get("text", "Unknown")
        
        # Strict Override: If Gemini extracts correct text but wrong dynasty, fix it using Dictionary
        sorted_keys = sorted(INSCRIPTION_MAP.keys(), key=len, reverse=True)
        if gem_text != "Unknown":
            for key in sorted_keys:
                if key in gem_text or key.lower() in gem_text.lower():
                    gem_dynasty = INSCRIPTION_MAP[key]
                    break
        elif ocr_dynasty != "Unknown":
            # If Gemini fails but OCR found something exact in dictionary
            gem_dynasty = ocr_dynasty
        
        search_query = gem_text if gem_text != "Unknown" else ocr_text
        lens_dynasty, _ = await self.get_google_search_validation(search_query)

        scores = {}
        def add_score(dynasty, weight):
            if dynasty == "Unknown": return
            scores[dynasty] = scores.get(dynasty, 0) + weight

        add_score(res_dynasty, 1.5)
        # Reduce OCR weight (5.0 -> 3.0) to prevent noisy OCR from overriding everything
        add_score(ocr_dynasty, 3.0)
        add_score(gem_dynasty, 2.5)
        add_score(lens_dynasty, 2.5) 
        
        final_decision = "Unknown"
        status = "RETRY"
        if scores:
            sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
            final_decision, top_score = sorted_scores[0]
            if top_score >= 4.0: status = "SUCCESS"
            elif top_score >= 2.5: status = "WARNING"

        return {
            "label": final_decision,
            "confidence": float(res_conf * 100) if final_decision == res_dynasty else 90.0,
            "status": status,
            "ocr_text": ocr_text,
            "gemini_text": gem_text,
            "gemini_info": gemini_res,
            "all_probs": all_probs.tolist(),
            "debug_images": {
                "processed": f"/api/v1/upload-file/view/{steps_dict['final']}",
                "crops": [f"/api/v1/upload-file/view/{c}" for c in han_crops[:4]],
                "preprocessing_steps": {
                    "gray": f"/api/v1/upload-file/view/{steps_dict['gray']}",
                    "sharpened": f"/api/v1/upload-file/view/{steps_dict['sharpened']}",
                    "clahe": f"/api/v1/upload-file/view/{steps_dict['clahe']}",
                    "final": f"/api/v1/upload-file/view/{steps_dict['final']}"
                }
            }
        }
