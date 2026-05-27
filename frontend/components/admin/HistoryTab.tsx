import React from 'react';
import { History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface HistoryTabProps {
  history: any[];
}

const HistoryTab: React.FC<HistoryTabProps> = ({ history }) => {
  return (
    <div className="glass-card rounded-[32px] border border-white/5 overflow-hidden animate-fade">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[3px] text-gray-500">Bản Ghi Thời Gian</th>
              <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[3px] text-gray-500">Thành Viên</th>
              <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-[3px] text-gray-500">Luồng Tài Sản</th>
              <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[3px] text-gray-500">Định Lượng</th>
              <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[3px] text-gray-500">Lý Do Biên Chép</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {history.length === 0 ? (
               <tr>
                <td colSpan={5} className="text-center py-24">
                  <div className="flex flex-col items-center gap-4 opacity-30">
                    <History size={48} className="text-gray-500" />
                    <p className="text-gray-500 font-serif italic tracking-widest uppercase text-xs">Chưa có bản ghi biến động tài sản.</p>
                  </div>
                </td>
              </tr>
            ) : history.map((h: any, i: number) => (
              <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                <td className="px-8 py-5">
                   <p className="text-gray-300 font-medium text-xs whitespace-nowrap">{new Date(h.created_at).toLocaleString()}</p>
                </td>
                <td className="px-8 py-5">
                   <p className="font-bold text-white group-hover:text-[#D4AF37] transition-colors">{h.username}</p>
                   <p className="text-[10px] text-gray-500">{h.email}</p>
                </td>
                <td className="px-8 py-5 text-center">
                   <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                     h.type === 'in' ? 'bg-green-500/10 text-green-400' : 'bg-[#D4AF37]/10 text-[#D4AF37]'
                   }`}>
                      {h.type === 'in' ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                      {h.type === 'in' ? 'Cộng Điểm' : 'Chi Tiêu'}
                   </div>
                </td>
                <td className={`px-8 py-5 text-right font-black tracking-tighter text-lg ${
                  h.type === 'in' ? 'text-green-400' : 'gold-gradient-text'
                }`}>
                   {h.type === 'in' ? '+' : '-'}{h.amount}
                </td>
                <td className="px-8 py-5">
                   <p className="text-gray-400 text-xs italic font-serif leading-relaxed line-clamp-1 group-hover:line-clamp-none transition-all">
                      "{h.description}"
                   </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTab;
