import React, { useState, useEffect } from 'react';
import { api } from '../api';
import toast from 'react-hot-toast';
import { PaymentPackage, PaymentInvoice } from '../types';
import { Sparkles, Info } from 'lucide-react';

import PackageCard from './payment/PackageCard';
import PaymentReportModal from './payment/PaymentReportModal';
import PaymentInvoiceModal from './payment/PaymentInvoiceModal';

interface PaymentViewProps {
    onBalanceUpdate: (balance: number) => void;
}

const PaymentView: React.FC<PaymentViewProps> = ({ onBalanceUpdate }) => {
    const [packages, setPackages] = useState<PaymentPackage[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<PaymentInvoice | null>(null);
    const [showReportForm, setShowReportForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const data = await api.getPackages();
                setPackages(data.packages);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPackages();
    }, []);

    // Poll for payment status
    useEffect(() => {
        let interval: any;
        if (selectedInvoice) {
            interval = setInterval(async () => {
                try {
                    const res = await api.getPaymentStatus(selectedInvoice.payment_id);
                    if (res.status === 'completed') {
                        handlePaymentSuccess(res.tokens);
                        clearInterval(interval);
                    }
                } catch (err) {
                    console.error('Status check error', err);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [selectedInvoice, onBalanceUpdate]);

    const handlePaymentSuccess = async (tokens: number) => {
        toast.success(`Nap thanh cong ${tokens} tokens! Nang luong da duoc khoi thong.`, { duration: 5000 });
        setStatusMsg(`Nap thanh cong ${tokens} tokens!`);

        try {
            const updatedUser = await api.checkAuth();
            // Cap nhat balance cho toan bo app - khong can F5
            onBalanceUpdate(updatedUser.user.token_balance);
            localStorage.setItem("user", JSON.stringify(updatedUser.user));
            // Trigger global update de Sidebar va tat ca component tu dong cap nhat
            window.dispatchEvent(new Event("update_user"));
        } catch (authErr) {
            console.error('Failed to refresh user after payment', authErr);
        }

        setTimeout(() => {
            setSelectedInvoice(null);
            setStatusMsg('');
        }, 5000);
    };

    const handleCreateInvoice = async (packageId: number) => {
        setIsProcessing(true);
        try {
            const invoice = await api.createInvoice(packageId);
            setSelectedInvoice(invoice);
        } catch (err: any) {
            toast.error(err.message || 'Lỗi tạo hóa đơn');
        } finally {
            setIsProcessing(false);
        }
    };

    const [selectedReportId, setSelectedReportId] = useState('');

    useEffect(() => {
        (window as any).openReportModal = (id: string) => {
            setSelectedReportId(id);
            setShowReportForm(true);
        };
        return () => { delete (window as any).openReportModal; };
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] text-[#D4AF37] animate-pulse">
                <Sparkles size={48} className="mb-4" />
                <p className="font-sans italic tracking-[2px] uppercase text-[10px]">Đang kết nối luồng năng lượng...</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen">
            <div className="app-bg-overlay opacity-10" style={{ backgroundImage: "url('/assets/bg.png')" }}></div>
            <div className="app-bg-gradient"></div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12 animate-fade">
                <header className="mb-10 md:mb-16 text-center">
                    <h2 className="text-3xl md:text-5xl hero-title-fix font-black gold-gradient-text mb-4 leading-relaxed md:leading-[1.5] py-4">
                        Tiếp Nạp Năng Lượng
                    </h2>
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-[1px] w-12 bg-[#D4AF37]/30"></div>
                        <p className="text-gray-400 font-sans italic text-[10px] tracking-[2px] uppercase">
                            Mở khóa sức mạnh giám định cổ vật
                        </p>
                        <div className="h-[1px] w-12 bg-[#D4AF37]/30"></div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {packages.map((pkg) => (
                        <PackageCard
                            key={pkg.id}
                            pkg={pkg}
                            onSelect={handleCreateInvoice}
                            isProcessing={isProcessing}
                        />
                    ))}
                </div>

                <div className="mt-24 pt-12 border-t border-white/5 text-center">
                    <div className="glass-card max-w-2xl mx-auto p-6 rounded-2xl border border-[#D4AF37]/10 mb-8 flex items-start gap-4 text-left">
                        <div className="p-2 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]">
                            <Info size={20} />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm mb-1">Cần hỗ trợ về thanh toán?</p>
                            <p className="text-gray-500 text-xs leading-relaxed italic font-serif">
                                Hệ thống VietCoin AI sử dụng cổng thanh toán SePay tự động. Nếu sau 5 phút bạn chưa nhận được Token, vui lòng sử dụng tính năng báo cáo sự cố để chúng tôi hỗ trợ ngay lập tức.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setSelectedReportId('');
                            setShowReportForm(true);
                        }}
                        className="group flex items-center gap-2 mx-auto text-[10px] font-black uppercase tracking-[3px] text-gray-500 hover:text-red-400 transition-all"
                    >
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Báo cáo sự cố nạp tiền
                    </button>
                </div>

                {showReportForm && (
                    <PaymentReportModal
                        onClose={() => setShowReportForm(false)}
                        initialPaymentId={selectedReportId}
                    />
                )}

                {selectedInvoice && (
                    <PaymentInvoiceModal
                        invoice={selectedInvoice}
                        onClose={() => setSelectedInvoice(null)}
                        onSuccess={handlePaymentSuccess}
                    />
                )}
            </div>
        </div>
    );
};

export default PaymentView;
