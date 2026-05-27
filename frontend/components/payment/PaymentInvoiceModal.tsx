import React from 'react';
import { PaymentInvoice } from '../../types';
import { api } from '../../api';
import toast from 'react-hot-toast';

interface PaymentInvoiceModalProps {
  invoice: PaymentInvoice;
  onClose: () => void;
  onSuccess: (tokens: number) => void;
  statusMsg?: string;
}

const PaymentInvoiceModal: React.FC<PaymentInvoiceModalProps> = ({
  invoice,
  onClose,
  onSuccess,
  statusMsg
}) => {
  const [timeLeft, setTimeLeft] = React.useState(60); // 1 minute countdown
  const [isExpired, setIsExpired] = React.useState(false);
  const hasExpiredRef = React.useRef(false); // prevent double execution of expiration logic

  const handleExpire = async () => {
    if (hasExpiredRef.current) return;
    hasExpiredRef.current = true;
    setIsExpired(true);
    try {
      await api.markPaymentFailed(invoice.payment_id);
      toast.error('Giao dịch đã hết hạn! Vui lòng tạo hóa đơn mới.', { duration: 5000 });
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái hết hạn:', err);
    }
  };

  const handleClose = async () => {
    if (!isExpired) {
      const loadingToast = toast.loading('Đang hủy giao dịch...');
      try {
        await api.markPaymentFailed(invoice.payment_id);
        toast.error('Giao dịch đã bị hủy bỏ.');
      } catch (err) {
        console.error('Lỗi khi hủy giao dịch:', err);
      } finally {
        toast.dismiss(loadingToast);
      }
    }
    onClose();
  };

  React.useEffect(() => {
    if (timeLeft <= 0) {
      handleExpire();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleCheck = async () => {
    if (isExpired) {
      toast.error('Hóa đơn này đã hết hạn. Vui lòng tạo đơn mới.');
      return;
    }
    const loadingToast = toast.loading('Đang kiểm tra giao dịch...');
    try {
      const res = await api.getPaymentStatus(invoice.payment_id);
      if (res.status === 'completed') {
        toast.success('Hệ thống đã ghi nhận token!');
        onSuccess(res.tokens);
      } else if (res.status === 'failed') {
        setIsExpired(true);
        hasExpiredRef.current = true;
        toast.error('Giao dịch này đã thất bại hoặc quá hạn.');
      } else {
        toast.error('Giao dịch chưa được tìm thấy hoặc đang xử lý.', { icon: '⏳' });
      }
    } catch (err) {
      toast.error('Lỗi khi kiểm tra thanh toán');
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      {/* Backdrop click also cancels payment */}
      <div className="absolute inset-0" onClick={handleClose}></div>
      
      <div className="bg-[#121217] border border-white/10 rounded-[32px] p-8 max-w-sm w-full text-center relative z-10 animate-in zoom-in-95 duration-300 shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-white transition-transform hover:rotate-90 cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Thanh Toán</h3>
        
        {/* Countdown Timer UI */}
        <div className="my-4 flex flex-col items-center">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Thời gian thanh toán còn lại</span>
          {isExpired ? (
            <span className="text-sm font-black text-red-500 uppercase tracking-widest mt-1.5">
              Đơn hàng đã hết hạn
            </span>
          ) : (
            <span className="text-2xl font-black text-amber-500 font-mono tracking-wider mt-1 animate-pulse">
              {formatTime(timeLeft)}
            </span>
          )}
        </div>

        <div className="bg-white p-4 rounded-2xl mb-6 inline-block shadow-lg relative group">
          <img 
            src={invoice.qr_url} 
            alt="QR Code" 
            className={`w-48 h-48 rounded-lg transition-all duration-300 ${isExpired ? 'filter grayscale blur-[2px] opacity-40' : ''}`} 
          />
          {isExpired && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-red-600/90 text-white font-black uppercase text-[10px] tracking-widest px-3 py-1.5 rounded-lg shadow-lg">
                Vô hiệu lực
              </span>
            </div>
          )}
        </div>

        <div className="text-left space-y-2 mb-6 text-sm bg-white/5 p-4 rounded-2xl border border-white/5">
          <div className="flex justify-between">
            <span className="text-gray-400">Mã đơn hàng:</span>
            <span className="font-bold text-white">#{invoice.payment_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Số tiền:</span>
            <span className="font-bold text-white">{invoice.amount_vnd.toLocaleString('vi-VN')} VNĐ</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Nội dung:</span>
            <span className="font-bold text-amber-400">{invoice.note}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleCheck}
            disabled={isExpired}
            className={`w-full font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer ${
              isExpired 
                ? 'bg-gray-800/40 text-gray-600 border border-white/5 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white shadow-purple-500/20'
            }`}
          >
            {isExpired ? 'Hóa đơn đã hết hạn' : 'Kiểm tra thanh toán'}
          </button>

          <button
            onClick={() => {
              handleClose();
              (window as any).openReportModal?.(invoice.payment_id.toString());
            }}
            className="w-full py-2 text-xs text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
          >
            Gặp sự cố? Báo cáo ngay
          </button>
        </div>

        {statusMsg && (
          <div className="mt-4 p-3 bg-green-500/10 text-green-400 text-sm font-medium rounded-xl border border-green-500/20">
            {statusMsg}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentInvoiceModal;
