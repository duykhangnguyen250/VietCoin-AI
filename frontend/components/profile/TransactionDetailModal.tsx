import React from 'react';
import { X, Calendar, Activity, Info, ShieldCheck } from 'lucide-react';

interface TransactionDetailModalProps {
  tx: any;
  onClose: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ tx, onClose }) => {
  return (
    <div className="fixed inset-0 bg-[#0B0B0D]/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-fade">
      <div className="glass-card w-full max-w-md rounded-[32px] border border-white/10 flex flex-col overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50"></div>
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-xl font-cinzel font-bold gold-gradient-text">Chi tiết giao dịch</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <X size={16} />
            </button>
        </div>
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Mã Giao Dịch</span>
                <span className="text-sm font-mono text-gray-300">#{tx.id || Math.floor(Math.random() * 10000)}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Loại giao dịch</span>
                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${tx.type === 'in' ? 'bg-green-500/10 text-green-400' : 'bg-[#D4AF37]/10 text-[#D4AF37]'}`}>
                    {tx.type === 'in' ? 'Cộng Điểm' : 'Chi Tiêu'}
                </span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Thời gian</span>
                <span className="text-sm text-gray-300">{new Date(tx.created_at).toLocaleString('vi-VN')}</span>
            </div>
            <div className="space-y-2">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Chi tiết / Lý do</span>
                <div className="text-sm text-gray-300 italic whitespace-pre-line bg-white/5 p-4 rounded-xl border border-white/5 leading-relaxed">
                    {tx.description}
                </div>
            </div>
            <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Số lượng</span>
                <span className={`text-2xl font-black ${tx.type === 'in' ? 'text-green-400' : 'text-[#D4AF37]'}`}>
                    {tx.type === 'in' ? '+' : '-'}{tx.amount} Tokens
                </span>
            </div>
        </div>
        <div className="p-6 border-t border-white/5 bg-white/[0.02]">
            <button onClick={onClose} className="w-full py-4 rounded-xl btn-premium btn-gold text-xs font-black uppercase tracking-[3px]">
                Đóng
            </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;