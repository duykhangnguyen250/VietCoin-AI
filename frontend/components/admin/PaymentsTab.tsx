import React, { useState } from 'react';
import { DollarSign, CheckCircle, Clock, XCircle, Search } from 'lucide-react';

interface PaymentsTabProps {
    payments: any[];
    paymentFilter: 'completed' | 'pending' | 'failed';
    setPaymentFilter: (filter: 'completed' | 'pending' | 'failed') => void;
}

const PaymentsTab: React.FC<PaymentsTabProps> = ({
    payments,
    paymentFilter,
    setPaymentFilter
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPayments = payments.filter((pm: any) => {
        if (pm.status !== paymentFilter) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            pm.id?.toString().includes(q) ||
            pm.email?.toLowerCase().includes(q) ||
            pm.username?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="space-y-8 animate-fade">
            <div className="flex items-center justify-between">
                <div className="flex bg-white/5 backdrop-blur-xl rounded-2xl p-1.5 border border-white/5 w-fit">
                    {(['completed', 'pending', 'failed'] as const).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setPaymentFilter(filter)}
                            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[2px] transition-all duration-300 flex items-center gap-2 ${paymentFilter === filter
                                    ? 'btn-gold shadow-lg shadow-[#D4AF37]/20 text-black'
                                    : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            {filter === 'completed' && <CheckCircle size={12} />}
                            {filter === 'pending' && <Clock size={12} />}
                            {filter === 'failed' && <XCircle size={12} />}
                            {filter === 'completed' ? 'Thành công' : filter === 'pending' ? 'Đang Chờ' : 'Thất bại'}
                        </button>
                    ))}
                </div>

                <div className="relative group">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D4AF37] transition-colors" />
                    <input
                        type="text"
                        placeholder="Tìm theo mã hoặc email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-2xl pl-11 pr-6 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]/30 transition-all w-80"
                    />
                </div>
            </div>

            <div className="glass-card rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[3px] text-gray-500">Mã Chứng Từ</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[3px] text-gray-500">Người Giao Dịch</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[3px] text-gray-500">Giá Trị Quyết Toán</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[3px] text-gray-500">Quyền Lợi Nhận Được</th>
                                <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-[3px] text-gray-500">Trạng Thái</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[3px] text-gray-500">Ngày Ghi Sổ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-24">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <DollarSign size={48} className="text-gray-500" />
                                            <p className="text-gray-500 font-serif italic tracking-widest uppercase text-xs">Không tìm thấy dữ liệu thanh toán phù hợp.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPayments.map((pm: any) => (
                                    <tr key={pm.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-8 py-5">
                                            <span className="font-mono text-gray-400 text-xs bg-white/5 px-2 py-1 rounded border border-white/5 group-hover:border-[#D4AF37]/30 transition-colors">#{pm.id}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-white group-hover:text-[#D4AF37] transition-colors">{pm.username}</p>
                                            <p className="text-[10px] text-gray-500">{pm.email}</p>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-white">{pm.amount_vnd.toLocaleString()} VNĐ</td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
                                                <span className="font-bold gold-gradient-text">+{pm.tokens.toLocaleString()} Tokens</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${pm.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                                    pm.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                {pm.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right text-gray-500 text-xs">{new Date(pm.created_at).toLocaleDateString('vi-VN')}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentsTab;
