import React, { useState } from "react";
import { api } from "../api";
import DebugModal from "./DebugModal";

// Tách các ký tự CJK (chữ Hán thuần) khỏi chuỗi
function extractHanChars(text: string): string[] {
  if (!text) return [];
  // Regex CJK Unified Ideographs
  return Array.from(text.matchAll(/[\u4E00-\u9FFF\u3400-\u4DBF]/g)).map(m => m[0]);
}

// Component hiển thị chữ Hán cân đối
function HanDisplay({ text }: { text: string }) {
  const chars = extractHanChars(text);

  if (chars.length === 0) {
    return (
      <span className="text-3xl font-serif text-[#D4AF37] tracking-widest">
        {text || 'N/A'}
      </span>
    );
  }

  // 1–2 chữ: 1 dòng
  if (chars.length <= 2) {
    return (
      <div className="flex justify-center gap-3">
        {chars.map((c, i) => (
          <span key={i} className="text-7xl font-serif text-[#D4AF37] leading-none">{c}</span>
        ))}
      </div>
    );
  }

  // 3–4 chữ: 2 cột × 2 hàng (cân đối)
  if (chars.length <= 4) {
    const rows: string[][] = [];
    for (let i = 0; i < chars.length; i += 2) {
      rows.push(chars.slice(i, i + 2));
    }
    // Nếu 3 chữ, hàng cuối chỉ có 1 — pad để cân
    if (rows[rows.length - 1].length === 1) rows[rows.length - 1].push('');
    return (
      <div className="flex flex-col items-center gap-2">
        {rows.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-3">
            {row.map((c, ci) => (
              <span key={ci} className="text-6xl font-serif text-[#D4AF37] leading-none w-[1em] text-center">{c}</span>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // 5+ chữ: chạy tự nhiên nhưng center
  return (
    <div className="flex flex-wrap justify-center gap-1">
      {chars.map((c, i) => (
        <span key={i} className="text-5xl font-serif text-[#D4AF37] leading-none">{c}</span>
      ))}
    </div>
  );
}

export default function CoinView() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const handleFileChange = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    try {
      setLoading(true);
      const res = await api.predictCoin(form);
      setResult(res);

      // 🔥 UPDATE TOKEN NGAY
      const userRes = await api.checkAuth();
      localStorage.setItem("user", JSON.stringify(userRes.user));

      // 🔥 TRIGGER UPDATE TOÀN APP
      window.dispatchEvent(new Event("update_user"));

    } catch (err: any) {
      if (err instanceof Response) {
        try {
          const errorData = await err.json();
          alert(errorData.detail || "Có lỗi xảy ra trên máy chủ");
        } catch {
          alert("Lỗi kết nối máy chủ");
        }
      } else {
        alert(err.message || "Lỗi không xác định");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-12 animate-fade">
        <header className="mb-8 md:mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-cinzel font-black gold-gradient-text tracking-[2px] md:tracking-[4px] mb-4 text-center leading-relaxed pt-6 pb-2">
            GIÁM ĐỊNH TIỀN CỔ
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-12 bg-[#D4AF37]/30"></div>
            <p className="text-gray-400 font-serif italic text-xs md:text-sm tracking-widest uppercase">
              Xác định triều đại & thời kỳ lịch sử
            </p>
            <div className="h-[1px] w-12 bg-[#D4AF37]/30"></div>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* ================= UPLOAD ZONE ================= */}
          <div className="glass-card p-6 md:p-10 rounded-[24px] md:rounded-[32px] border border-white/10 group transition-all duration-500 hover:border-[#D4AF37]/30">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h2 className="text-xl font-bold text-white tracking-wide">Tải Lên Hình Ảnh</h2>
            </div>

            <label className="block relative cursor-pointer group/upload">
              <div className="border-2 border-dashed border-white/10 rounded-3xl p-8 md:p-12 text-center group-hover/upload:border-[#D4AF37]/50 group-hover/upload:bg-white/5 transition-all duration-500">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover/upload:scale-110 transition-transform duration-500">
                  <svg className="w-8 h-8 text-gray-500 group-hover/upload:text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </div>
                <p className="text-gray-400 font-medium mb-1">Kéo thả ảnh đồng xu vào đây</p>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest">Hỗ trợ JPG, PNG, WEBP</p>
              </div>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
            </label>

            {preview && (
              <div className="mt-8 relative animate-fade">
                <div className="absolute inset-0 bg-[#D4AF37]/10 blur-2xl rounded-full"></div>
                <img
                  src={preview}
                  className="relative rounded-2xl w-full object-contain max-h-[400px] border border-[#D4AF37]/20 bg-black/40 shadow-2xl"
                  alt="Preview"
                />
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="mt-10 w-full btn-premium btn-gold py-5 rounded-2xl shadow-2xl disabled:opacity-30 disabled:grayscale transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Đang Giám Định...
                </span>
              ) : (
                "Xác Định Triều Đại"
              )}
            </button>

            {result && !['NOT_COIN', 'ERROR'].includes(result.label) && (
               <button 
                onClick={() => setShowDebug(true)}
                className="mt-4 w-full py-4 rounded-2xl border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-black uppercase tracking-[3px] hover:bg-[#D4AF37]/5 transition-all flex items-center justify-center gap-3"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                 Chi Tiết Nhận Diện
               </button>
            )}
          </div>

          {/* ================= RESULT ZONE ================= */}
          <div className="flex flex-col">
            <div className="glass-card flex-1 p-6 md:p-10 rounded-[24px] md:rounded-[32px] border border-white/10 overflow-hidden relative min-h-[400px] md:min-h-[500px]">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-white tracking-wide">Thông Tin Triều Đại</h2>
              </div>

              {!result && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5 opacity-50">
                    <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="text-gray-500 font-serif italic">Hệ thống đang chờ dữ liệu hình ảnh từ bạn...</p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20 space-y-6">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-[#D4AF37]/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[#D4AF37] rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-[#D4AF37] font-bold uppercase tracking-widest text-xs animate-pulse">Đang truy vấn sử liệu triều đại...</p>
                </div>
              )}

              {result && (() => {
                const isRejected = ['NOT_COIN', 'NOT_VIETNAMESE_ANCIENT', 'ERROR'].includes(result.label);

                if (isRejected) {
                  const isError = result.label === 'ERROR';
                  return (
                    <div className="animate-fade flex flex-col items-center justify-center py-16 text-center space-y-6">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${isError ? 'bg-yellow-500/10' : 'bg-red-500/10'}`}>
                        {isError ? '⏳' : '🚫'}
                      </div>
                      <div>
                        <h3 className={`text-2xl font-cinzel font-black mb-3 ${isError ? 'text-yellow-400' : 'text-red-400'}`}>
                          {result.display_name}
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed font-serif italic max-w-sm mx-auto">
                          {result.description}
                        </p>
                      </div>
                      <div className="px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest text-gray-500 border-white/10">
                        Tokens giữ nguyên — Không bị trừ
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="animate-fade space-y-8">
                    <div className="historical-certificate shadow-inner overflow-hidden">
                      <div className="text-center">
                        <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-[4px] mb-6">XÁC NHẬN TRIỀU ĐẠI LỊCH SỬ</p>
                        <div className="mb-6">
                          <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Triều đại / Thời kỳ được nhận diện</p>
                          <h3 className="text-2xl md:text-3xl font-cinzel font-black gold-text leading-relaxed py-2 max-w-[85%] mx-auto" style={{ textWrap: 'balance' } as React.CSSProperties}>
                            {result.display_name || result.label.replace(/_/g, ' ')}
                          </h3>
                        </div>
                        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent my-8"></div>
                        <div className="flex flex-col items-center">
                          <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-4">Độ tin cậy của AI</p>
                          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                              <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-[#D4AF37]" strokeDasharray={377} strokeDashoffset={377 - (377 * result.confidence) / 100} style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                            </svg>
                            <div className="absolute text-2xl font-bold text-white">
                              {result.confidence}<span className="text-xs text-gray-500">%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {result.tokens_used && (
                        <div className="mt-10 pt-6 border-t border-white/5 text-center">
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                            Chi phí giám định: <span className="text-[#D4AF37] font-bold">{result.tokens_used} TOKENS</span>
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                      <p className="text-[10px] text-gray-500 uppercase tracking-[2px] font-black text-center">Chữ Hán Định Danh</p>
                      <div className="flex flex-col items-center justify-center py-8 px-4 bg-black/20 rounded-xl border border-white/5 text-center gap-4">
                        <HanDisplay text={result.han_canonical || ''} />
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest italic">Hán tự chuẩn định theo lịch sử</span>
                      </div>
                    </div>

                    <div className="glass-card p-8 rounded-3xl border border-white/5">
                      <p className="text-[10px] text-gray-500 uppercase tracking-[2px] font-black mb-6 border-b border-white/5 pb-2">Ghi Chú Lịch Sử</p>
                      <div className="text-sm text-[#D4AF37]/90 leading-[1.8] font-serif whitespace-pre-line">
                        {result.description || "Dữ liệu lịch sử đang được biên soạn..."}
                      </div>
                    </div>

                    {result.suggestions && result.suggestions.slice(1).filter((s: any) => s.confidence >= 10).length > 0 && (
                      <div className="space-y-4">
                        <p className="text-[10px] text-gray-500 uppercase tracking-[3px] font-black px-1">CÁC TRIỀU ĐẠI TIỀM NĂNG KHÁC</p>
                        <div className="grid gap-3">
                          {result.suggestions.slice(1).filter((s: any) => s.confidence >= 10).map((sug: any, idx: number) => (
                            <div key={idx} className="glass-card p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-[#D4AF37]/30 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                  #{idx + 2}
                                </div>
                                <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">
                                  {sug.display_name || sug.label.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-gray-600 group-hover:bg-[#D4AF37] transition-all" style={{ width: `${sug.confidence}%` }}></div>
                                </div>
                                <span className="text-[10px] font-mono text-gray-500 group-hover:text-[#D4AF37]">{sug.confidence}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                      <p className="text-xs text-blue-400 font-medium leading-relaxed italic">
                        * Lưu ý: Kết quả được cung cấp bởi AI dựa trên tập dữ liệu hình ảnh. Vui lòng tham khảo ý kiến chuyên gia khảo cổ cho các giao dịch quan trọng.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
      {result && (
        <DebugModal 
          isOpen={showDebug}
          onClose={() => setShowDebug(false)}
          rawImage={preview}
          processedImage={result.debug_images?.processed || ""}
          preprocessingSteps={result.debug_images?.preprocessing_steps}
          crops={result.debug_images?.crops || []}
          finalResult={result.display_name}
        />
      )}
    </div>
  );
}