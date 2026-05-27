import React from 'react';
import { AlertCircle, CheckCircle, Slash } from 'lucide-react';

interface ReportsTabProps {
    reports: any[];
    onUpdateStatus: (id: number, status: string) => void;
}

const ReportsTab: React.FC<ReportsTabProps> = ({ reports, onUpdateStatus }) => {
    return (
        <div className="glass-card rounded-[32px] border border-white/5 overflow-hidden animate-fade">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-white/[0.02] border-b border-white/5">
                            <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[3px] text-gray-500">Khởi Tạo</th>
                            <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[3px] text-gray-500">Người Gửi</th>
                            <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[3px] text-gray-500">Mã Giao Dịch</th>
                            <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[3px] text-gray-500">Vấn Đề Báo Cáo</th>
                            <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-[3px] text-gray-500">Hiện Trạng</th>
                            <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[3px] text-gray-500">Phê Duyệt</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {reports.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-24">
                                    <div className="flex flex-col items-center gap-4 opacity-30">
                                        <CheckCircle size={48} className="text-gray-500" />
                                        <p className="text-gray-500 font-serif italic tracking-widest uppercase text-xs">Không có báo cáo sự cố nào tồn đọng.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : reports.map((rep: any) => (
                            <tr key={rep.id} className="hover:bg-white/[0.01] transition-colors group">
                                <td className="px-8 py-5 whitespace-nowrap">
                                    <p className="text-gray-400 font-medium text-xs">{new Date(rep.created_at).toLocaleString()}</p>
                                </td>
                                <td className="px-8 py-5">
                                    <p className="font-bold text-white group-hover:text-[#D4AF37] transition-colors">{rep.username}</p>
                                    <p className="text-[10px] text-gray-500">{rep.email}</p>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="font-mono text-gray-400 text-xs bg-white/5 px-2 py-1 rounded border border-white/5">#{rep.payment_id}</span>
                                </td>
                                <td className="px-8 py-5">
                                    <p className="text-gray-300 text-xs italic font-serif leading-relaxed line-clamp-1 group-hover:line-clamp-none transition-all">
                                        "{rep.description}"
                                    </p>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${rep.status === 'resolved' ? 'bg-green-500/10 text-green-400' :
                                        rep.status === 'ignored' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
                                        }`}>
                                        {rep.status === 'resolved' ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                                        {rep.status === 'resolved' ? 'Đã Giải Quyết' : rep.status === 'ignored' ? 'Bỏ Qua' : 'Chờ Xử Lý'}
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => onUpdateStatus(rep.id, 'resolved')}
                                            className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-500/5"
                                        >
                                            Phê Duyệt
                                        </button>
                                        <button
                                            onClick={() => onUpdateStatus(rep.id, 'ignored')}
                                            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
                                        >
                                            Bỏ Qua
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportsTab;
