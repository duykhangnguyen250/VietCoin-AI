import React from 'react';
import { Package, Plus, Trash2, Edit3, Sparkles } from 'lucide-react';

interface PackagesTabProps {
  packages: any[];
  onCreatePackage: () => void;
  onDeletePackage: (id: number) => void;
  onUpdatePackage: (pkg: any) => void;
}

const PackagesTab: React.FC<PackagesTabProps> = ({ 
  packages, 
  onCreatePackage, 
  onDeletePackage, 
  onUpdatePackage 
}) => {
  return (
    <div className="space-y-10 animate-fade">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-cinzel font-black gold-gradient-text tracking-[2px]">QUẢN LÝ CUNG ỨNG</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-[3px] mt-1 font-bold">Quản Lý Gói Tokens</p>
        </div>
        <button 
          onClick={onCreatePackage}
          className="btn-premium btn-gold px-8 py-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-2xl"
        >
          <Plus size={16} />
          Khởi Tạo Gói Mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {packages.map((pkg) => (
          <div key={pkg.id} className="glass-card relative overflow-hidden group rounded-[32px] border border-white/10 transition-all duration-500 hover:border-[#D4AF37]/40 hover:-translate-y-2">
            
            {/* CARD DECOR */}
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
               <Package size={120} />
            </div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent"></div>

            <div className="p-8 relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                 <Sparkles size={20} />
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors">{pkg.name}</h3>
              <div className="flex items-end gap-2 mb-8">
                 <span className="text-4xl font-black gold-gradient-text tracking-tighter">
                   {pkg.tokens.toLocaleString()}
                 </span>
                 <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">Tokens</span>
              </div>

              <div className="mt-auto pt-8 border-t border-white/5">
                 <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Giá Niêm Yết</span>
                    <span className="text-sm font-black text-white">{pkg.amount_vnd.toLocaleString()} VNĐ</span>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => onUpdatePackage(pkg)}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                    >
                       <Edit3 size={12} /> Sửa
                    </button>
                    <button 
                      onClick={() => onDeletePackage(pkg.id)}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                    >
                       <Trash2 size={12} /> Xóa
                    </button>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackagesTab;
