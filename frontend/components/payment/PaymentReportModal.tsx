import React, { useState } from 'react';
import { api } from '../../api';
import toast from 'react-hot-toast';

interface PaymentReportModalProps {
    onClose: () => void;
    initialPaymentId?: string;
}

const PaymentReportModal: React.FC<PaymentReportModalProps> = ({ onClose, initialPaymentId = '' }) => {
    const [reportNote, setReportNote] = useState('');
    const [reportPaymentId, setReportPaymentId] = useState(initialPaymentId);

    const handleSubmit = async () => {
        if (!reportPaymentId || !reportNote.trim()) {
            toast.error('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        const loadingToast = toast.loading('Đang gửi tâm nguyện...');
        try {
            await api.createPaymentReport(parseInt(reportPaymentId), reportNote);
            toast.success('Gửi thành công! Admin sẽ kiểm tra sớm.');
            onClose();
        } catch (err: any) {
            toast.error(err.message || 'Không thể gửi báo cáo');
        } finally {
            toast.dismiss(loadingToast);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
            <div className="bg-[#121217] border border-white/10 rounded-[32px] p-8 max-w-md w-full relative animate-in zoom-in duration-300 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-500 hover:text-white transition-transform hover:rotate-90"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h3 className="text-2xl font-bold text-white mb-2">Báo Cáo Sự Cố</h3>
                <p className="text-gray-400 text-[10px] uppercase tracking-widest font-black mb-8 px-1">Chúng tôi sẽ giải quyết yêu cầu của bạn sớm nhất</p>

                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-purple-400 block mb-2 px-1">Mã đơn hàng (ID)</label>
                        <input
                            type="number"
                            placeholder="Ví dụ: 7"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
                            value={reportPaymentId}
                            onChange={(e) => setReportPaymentId(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-purple-400 block mb-2 px-1">Mô tả chi tiết</label>
                        <textarea
                            rows={4}
                            placeholder="Mô tả sự cố bạn gặp phải..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition resize-none"
                            value={reportNote}
                            onChange={(e) => setReportNote(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all active:scale-95"
                    >
                        Gửi Báo Cáo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentReportModal;
