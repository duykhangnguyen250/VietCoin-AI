import React, { useState } from 'react';
import { X, ArrowRight, Scan, Zap, Search, CheckCircle, Activity } from 'lucide-react';

interface DebugModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawImage: string | null;
  processedImage: string;
  preprocessingSteps?: {
    gray: string;
    sharpened: string;
    clahe: string;
    final: string;
  };
  crops: string[];
  finalResult: string;
}

const DebugModal: React.FC<DebugModalProps> = ({ 
  isOpen, 
  onClose, 
  rawImage, 
  processedImage, 
  preprocessingSteps,
  crops, 
  finalResult 
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [activePreprocessSubStep, setActivePreprocessSubStep] = useState<'gray' | 'sharpened' | 'clahe' | 'final'>('final');

  if (!isOpen) return null;

  const API_HOST = `http://${window.location.hostname}:2643`;
  
  const getFullUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // Remove duplicate slashes if any
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_HOST}${cleanPath}`;
  };

  const steps = [
    {
      title: "Ảnh Gốc",
      desc: "Dữ liệu hình ảnh thô được tải lên từ người dùng.",
      icon: <Scan className="w-5 h-5" />,
      content: <img src={rawImage || ''} className="w-full h-64 object-contain rounded-2xl bg-black/40 border border-white/10" alt="Raw" />
    },
    {
      title: "Tiền Xử Lý",
      desc: "Hệ thống thực hiện chuỗi thuật toán thị giác máy tính nâng cao để khôi phục và làm nổi rõ nét chữ cổ.",
      icon: <Zap className="w-5 h-5" />,
      content: (() => {
        if (!preprocessingSteps) {
          return <img src={getFullUrl(processedImage)} className="w-full h-64 object-contain rounded-2xl bg-black/40 border border-[#D4AF37]/20" alt="Processed" />;
        }
        
        const subSteps = [
          { key: 'gray', label: "1. Ảnh Xám & Phóng to 2x (Grayscale & Bicubic Resize)", desc: "Phóng to 2x tăng mật độ điểm ảnh pixel và chuyển đổi sang ảnh xám đơn kênh chuẩn bị cho xử lý cạnh." },
          { key: 'sharpened', label: "2. Lọc Sắc Nét Đường Viền (Laplacian Sharpen)", desc: "Sử dụng ma trận lọc sắc nét 2D Laplacian để gia tăng độ tương phản biên của nét chữ, tách biệt stroke chữ khỏi nền đồng rỉ." },
          { key: 'clahe', label: "3. Tăng Tương Phản Thích Ứng (CLAHE Enhancement)", desc: "Cân bằng histogram giới hạn độ tương phản cục bộ (clipLimit=5.0) để làm sáng rõ nét chữ mờ ẩn dưới patin đồng cổ." },
          { key: 'final', label: "4. Tự Động Đảo Màu & Lọc Khử Nhiễu (Bitwise Invert & Median Blur)", desc: "Tự động nghịch đảo màu thành chữ đen nền sáng dựa trên độ sáng trung bình và chạy bộ lọc trung vị để triệt tiêu sạn hạt rỉ sét." }
        ] as const;
        
        const activeSubStepObj = subSteps.find(s => s.key === activePreprocessSubStep) || subSteps[3];
        const activeImgUrl = getFullUrl(preprocessingSteps[activePreprocessSubStep]);

        return (
          <div className="flex flex-col space-y-4 w-full animate-fade">
            {/* SUB-TABS NAVIGATION */}
            <div className="grid grid-cols-4 gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5">
              {subSteps.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setActivePreprocessSubStep(s.key)}
                  className={`py-2 px-1 text-[9px] md:text-[10px] font-bold rounded-lg transition-all duration-300 ${
                    activePreprocessSubStep === s.key
                      ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30"
                      : "text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  {s.key === 'gray' ? 'ẢNH XÁM 2X' : 
                   s.key === 'sharpened' ? 'LÀM NÉT STROKE' :
                   s.key === 'clahe' ? 'CLAHE CONTRAST' : 'KHỬ NHIỄU FINAL'}
                </button>
              ))}
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="relative">
              <img 
                src={activeImgUrl} 
                className="w-full h-60 object-contain rounded-2xl bg-black/40 border border-[#D4AF37]/20 transition-all duration-500" 
                alt={activeSubStepObj.label} 
              />
              <div className="absolute top-3 left-3 px-3 py-1 bg-black/75 rounded-lg border border-white/10 text-[9px] text-[#D4AF37] font-bold uppercase tracking-widest">
                Bước {subSteps.indexOf(activeSubStepObj) + 1}/4
              </div>
            </div>

            {/* SUB-STEP DESCRIPTION */}
            <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <p className="text-xs font-bold text-white mb-1">{activeSubStepObj.label}</p>
              <p className="text-[11px] text-gray-400 font-serif italic">{activeSubStepObj.desc}</p>
            </div>
          </div>
        );
      })()
    },
    {
      title: "Trích Xuất Chữ Hán",
      desc: "Thuật toán phát hiện vùng văn bản định vị tọa độ Hán tự xung quanh lỗ vuông trung tâm, thực hiện tính toán góc nghiêng tự động xoay hiệu chỉnh trục (Affine Transformation) và cắt tách (Segmentation) thành các ký tự độc lập chuẩn bị cho bộ suy luận OCR.",
      icon: <Search className="w-5 h-5" />,
      content: (
        <div className="grid grid-cols-2 gap-4">
          {crops && crops.length > 0 ? crops.map((c, i) => (
            <div key={i} className="relative group">
               <img src={getFullUrl(c)} className="w-full h-28 object-contain rounded-xl bg-white/5 border border-white/10 group-hover:border-[#D4AF37]/50 transition-colors" alt={`Crop ${i}`} />
               <span className="absolute bottom-1 right-2 text-[8px] text-gray-500 uppercase">Vùng {i+1}</span>
            </div>
          )) : (
            <div className="col-span-2 py-10 text-center text-gray-500 italic text-sm">Hệ thống đang trích xuất từ dữ liệu AI...</div>
          )}
        </div>
      )
    },
    {
      title: "Kết Luận",
      desc: "Hệ thống tích hợp biểu quyết đồng thuận 4 lớp (Stable 4-Layer Voting) kết hợp phân tích phân loại của ResNet34, nhận diện OCR từ PaddleOCR, phản hồi chuyên sâu của Gemini Vision API và kiểm chứng tri thức từ Google Search để đưa ra kết quả giám định tối ưu nhất.",
      icon: <CheckCircle className="w-5 h-5" />,
      content: (
        <div className="flex flex-col items-center justify-center h-64 bg-[#D4AF37]/5 rounded-2xl border border-[#D4AF37]/20">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] mb-4 animate-bounce">
            <CheckCircle size={32} />
          </div>
          <h4 className="text-2xl font-cinzel font-black gold-gradient-text text-center px-4">{finalResult}</h4>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">Kết quả đã được phê duyệt</p>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[999] flex items-center justify-center p-4 md:p-10 animate-fade">
      <div className="glass-card w-full max-w-4xl rounded-[40px] border border-white/10 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden max-h-[90vh] md:max-h-none shadow-2xl">
        
        {/* LEFT SIDE: STEPS NAVIGATION */}
        <div className="w-full md:w-80 bg-white/[0.02] border-b md:border-b-0 md:border-r border-white/5 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6 md:mb-10">
             <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                <Activity size={18} />
             </div>
             <h3 className="font-bold text-white tracking-wide">Quy trình AI</h3>
          </div>

          <div className="space-y-4">
            {steps.map((step, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 ${
                  activeStep === i 
                  ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 md:translate-x-2" 
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeStep === i ? "bg-black/10" : "bg-white/5"}`}>
                  {step.icon}
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Bước {i+1}</p>
                  <p className="text-xs font-bold">{step.title}</p>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-6 md:mt-20 p-4 bg-white/5 rounded-2xl border border-white/5">
             <p className="text-[9px] text-gray-500 leading-relaxed uppercase tracking-tighter">
                * Đây là quy trình xử lý thị giác máy tính kết hợp AI Consensus độc quyền của VietCoin.
             </p>
          </div>
        </div>

        {/* RIGHT SIDE: CONTENT */}
        <div className="flex-1 p-6 md:p-12 relative flex flex-col">
          <button onClick={onClose} className="absolute top-6 right-6 md:top-8 md:right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>

          <div className="mb-10">
            <h2 className="text-2xl font-cinzel font-black text-white mb-2">{steps[activeStep].title}</h2>
            <p className="text-sm text-gray-400 font-serif italic max-w-xl">{steps[activeStep].desc}</p>
          </div>

          <div className="flex-1 flex items-center justify-center mb-8">
            <div className="w-full animate-fade-in-up">
              {steps[activeStep].content}
            </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-white/5">
            <button 
              disabled={activeStep === 0}
              onClick={() => setActiveStep(p => p - 1)}
              className="px-6 py-3 rounded-xl border border-white/10 text-gray-500 hover:text-white disabled:opacity-0 transition-all"
            >
              Quay lại
            </button>
            <div className="flex gap-2">
               {steps.map((_, i) => (
                 <div key={i} className={`h-1 rounded-full transition-all duration-500 ${activeStep === i ? "w-8 bg-[#D4AF37]" : "w-2 bg-white/10"}`}></div>
               ))}
            </div>
            {activeStep < 3 ? (
              <button 
                onClick={() => setActiveStep(p => p + 1)}
                className="btn-gold px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
              >
                Tiếp tục <ArrowRight size={14} />
              </button>
            ) : (
              <button 
                onClick={onClose}
                className="bg-white/10 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all"
              >
                Hoàn tất
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugModal;
