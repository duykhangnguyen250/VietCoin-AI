import React from 'react';
import { History, ArrowUpRight, ArrowDownLeft, Eye } from 'lucide-react';

interface ProfileHistoryTableProps {
  history: any[];
  isLoading: boolean;
  onViewTx: (tx: any) => void;
}

const ProfileHistoryTable: React.FC<ProfileHistoryTableProps> = ({ history, isLoading, onViewTx }) => {
  return (
    <div className="glass-card rounded-[32px] border border-white/10 overflow-hidden h-full flex flex-col">
        <div className="p-8 border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-xl font-cinzel font-black text-white flex items-center gap-3 tracking-wide">
                <History className="text-[#D4AF37]" /> Lịch sử biến động tài sản
            </h3>
        </div>
        
        <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-white/[0.01] border-b border-white/5">
                        <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[3px] text-gray-500">Thời điểm</th>
                        <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[3px] text-gray-500">Loại</th>
                        <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[3px] text-gray-500">Lý do</th>
                        <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[3px] text-gray-500">Số lượng</th>
                        <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-[3px] text-gray-500">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                        <tr>
                            <td colSpan={5} className="text-center py-20">
                                <div className="flex flex-col items-center justify-center text-gray-500 gap-4 opacity-50">
                                    <svg className="animate-spin h-8 w-8 text-[#D4AF37]" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <p className="text-[10px] uppercase tracking-[3px] font-bold">Đang lục tìm bút tích...</p>
                                </div>
                            </td>
                        </tr>
                    ) : history.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center py-20">
                                <div className="flex flex-col items-center justify-center text-gray-500 gap-4 opacity-50">
                                    <History size={48} />
                                    <p className="text-xs font-serif italic">Chưa có giao dịch nào được ghi lại trong kim loại</p>
                                </div>
                            </td>
                        </tr>
                    ) : history.map((tx: any, i: number) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-8 py-5 whitespace-nowrap">
                                <p className="text-gray-400 font-medium text-xs">{new Date(tx.created_at).toLocaleDateString('vi-VN')}</p>
                                <p className="text-[10px] text-gray-600">{new Date(tx.created_at).toLocaleTimeString('vi-VN')}</p>
                            </td>
                            <td className="px-8 py-5">
                                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${tx.type === 'in' ? 'bg-green-500/10 text-green-400' : 'bg-[#D4AF37]/10 text-[#D4AF37]'}`}>
                                    {tx.type === 'in' ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                                    {tx.type === 'in' ? 'Cộng' : 'Trừ'}
                                </div>
                            </td>
                            <td className="px-8 py-5">
                                <p className="text-gray-300 text-xs italic font-serif line-clamp-1 group-hover:line-clamp-none transition-all">"{tx.description}"</p>
                            </td>
                            <td className={`px-8 py-5 text-right font-black tracking-tighter text-lg ${tx.type === 'in' ? 'text-green-400' : 'text-[#D4AF37]'}`}>
                                {tx.type === 'in' ? '+' : '-'}{tx.amount}
                            </td>
                            <td className="px-8 py-5 text-center">
                                <button onClick={() => onViewTx(tx)} className="w-8 h-8 mx-auto rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#D4AF37] hover:text-black transition-colors shadow-sm">
                                    <Eye size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default ProfileHistoryTable;