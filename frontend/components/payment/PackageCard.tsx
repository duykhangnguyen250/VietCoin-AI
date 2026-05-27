import React from 'react';
import { PaymentPackage } from '../../types';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface PackageCardProps {
  pkg: PaymentPackage;
  onSelect: (pkgId: number) => void;
  isProcessing: boolean;
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg, onSelect, isProcessing }) => {
  return (
    <div 
      className="glass-card p-1 rounded-[32px] group transition-all duration-500 hover:scale-[1.02]"
    >
      <div className="bg-gradient-to-br from-[#1A1A20] to-[#0b0b0d] rounded-[31px] p-8 h-full flex flex-col border border-white/5 relative overflow-hidden">
        {/* GLOW DECORATION */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[#D4AF37]/10 transition-all duration-500"></div>

        <div className="flex items-center justify-between mb-8">
           <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center text-[#D4AF37]">
              <Sparkles size={24} />
           </div>
           {pkg.tokens >= 1000 && (
             <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest">
                Phổ biến nhất
             </span>
           )}
        </div>

        <h3 className="text-xl font-bold text-white mb-2 tracking-wide">{pkg.name}</h3>
        <p className="text-xs text-gray-500 font-serif italic mb-6">"Khai thông tuệ nhãn, nhìn thấu cổ vật"</p>

        <div className="flex items-baseline gap-2 mb-8">
           <span className="text-5xl font-cinzel font-black gold-text tracking-tighter">
              {pkg.tokens.toLocaleString()}
           </span>
           <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Tokens</span>
        </div>

        <div className="space-y-4 mb-10">
           <div className="flex items-center gap-3 text-gray-400 text-xs">
              <CheckCircle2 size={16} className="text-green-500" />
              <span>Sử dụng trọn đời, không hết hạn</span>
           </div>
           <div className="flex items-center gap-3 text-gray-400 text-xs">
              <CheckCircle2 size={16} className="text-green-500" />
              <span>Ưu tiên băng thông giám định AI</span>
           </div>
           <div className="flex items-center gap-3 text-gray-400 text-xs">
              <CheckCircle2 size={16} className="text-green-500" />
              <span>Hỗ trợ kỹ thuật 24/7</span>
           </div>
        </div>

        <button 
          onClick={() => onSelect(pkg.id)}
          disabled={isProcessing}
          className="mt-auto w-full btn-premium btn-gold py-4 rounded-2xl shadow-xl flex flex-col items-center group/btn transition-all active:scale-95"
        >
          <span className="text-lg font-black">{pkg.amount_vnd.toLocaleString('vi-VN')} VNĐ</span>
          <span className="text-[9px] opacity-80 uppercase tracking-widest font-bold">Nạp qua VietQR tự động</span>
        </button>
      </div>
    </div>
  );
};

export default PackageCard;
