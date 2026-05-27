import React from 'react';
import { X, Calendar, Mail, User as UserIcon, Wallet, MessageSquare, History, Shield, Trash2, Edit3, ArrowRight } from 'lucide-react';

interface UserDetailModalProps {
  userDetail: any;
  onClose: () => void;
  onEditUser: (userId: number, field: 'full_name' | 'password', currentVal?: string) => void;
  onViewChatDetail: (log: any) => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ 
  userDetail, 
  onClose, 
  onEditUser,
  onViewChatDetail
}) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className="fixed inset-0 bg-[#0B0B0D]/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-fade">
      <div className="glass-card w-full max-w-5xl max-h-[90vh] rounded-[40px] border border-white/10 flex flex-col overflow-hidden shadow-2xl relative">
         
         {/* HEADER DECOR */}
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50"></div>

         <div className="p-10 border-b border-white/5 flex justify-between items-start shrink-0">
            <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                  {userDetail.user.picture_url && !imgError ? (
                    <img 
                      src={userDetail.user.picture_url} 
                      alt={userDetail.user.username} 
                      className="relative w-20 h-20 rounded-2xl object-cover border border-[#D4AF37]/30 shadow-2xl" 
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="relative w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center font-black text-3xl text-[#D4AF37] border border-white/10 shadow-2xl">
                        {userDetail.user.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-3xl font-cinzel font-black gold-gradient-text tracking-wide">
                        {userDetail.user.full_name || userDetail.user.username}
                      </h3>
                      {userDetail.user.is_admin && (
                         <span className="px-2 py-0.5 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-[8px] font-black uppercase tracking-widest">Quản Trị</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-gray-500 text-xs">
                       <span className="flex items-center gap-1.5 font-medium"><Mail size={12} className="text-gray-600" /> {userDetail.user.email}</span>
                       <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                       <span className="flex items-center gap-1.5 font-medium"><UserIcon size={12} className="text-gray-600" /> ID: #{userDetail.user.id}</span>
                    </div>
                </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-90"
            >
                <X size={24} />
            </button>
         </div>
         
         <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scroll">
            
            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="historical-certificate relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                       <Wallet size={64} />
                    </div>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-[3px] mb-2">Tài sản hiện hữu</p>
                    <div className="flex items-end gap-2">
                       <p className="text-4xl font-black gold-gradient-text tracking-tighter">
                          {Math.floor(userDetail.user.token_balance).toLocaleString()}
                       </p>
                       <p className="text-xs text-gray-500 font-bold uppercase mb-1.5 tracking-widest">Tokens</p>
                    </div>
                </div>

                <div className="historical-certificate relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                       <Calendar size={64} />
                    </div>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-[3px] mb-2">Ngày nhập môn</p>
                    <p className="text-2xl font-cinzel font-bold text-white tracking-wide">
                       {new Date(userDetail.user.created_at).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>

                <div className="historical-certificate relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                       <Edit3 size={64} />
                    </div>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-[3px] mb-2">Định danh thực tế</p>
                    <div className="flex items-center justify-between">
                        <p className="text-xl font-bold text-white tracking-wide">
                           {userDetail.user.full_name || 'Vô danh'}
                        </p>
                        <button 
                          onClick={() => onEditUser(userDetail.user.id, 'full_name', userDetail.user.full_name)}
                          className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] text-[9px] font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all"
                        >
                           Sửa
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                 <button 
                   onClick={() => onEditUser(userDetail.user.id, 'password')}
                   className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-white hover:border-white/20 transition-all flex items-center gap-2"
                 >
                    <Shield size={12} /> Tái lập mật mã bảo mật
                 </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* TOKEN HISTORY */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                           <History size={16} />
                        </div>
                        <h4 className="text-sm font-black uppercase text-white tracking-[2px]">Lịch sử giao dịch cổ vật</h4>
                    </div>
                    <div className="space-y-3">
                        {userDetail.token_history.length === 0 ? (
                            <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.01] text-center">
                               <p className="text-xs text-gray-600 font-serif italic">Chưa phát sinh giao dịch nào trong kho lưu trữ.</p>
                            </div>
                        ) : userDetail.token_history.slice(0, 8).map((h: any, i: number) => (
                            <div key={i} className="flex justify-between items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${h.type === 'in' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.4)]'}`}></div>
                                    <div>
                                        <p className="font-bold text-gray-300 text-xs">{h.description}</p>
                                        <p className="text-[10px] text-gray-600 mt-0.5">{new Date(h.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                                <span className={`font-black tracking-tighter ${h.type === 'in' ? 'text-green-400' : 'text-[#D4AF37]'}`}>
                                    {h.type === 'in' ? '+' : '-'}{h.amount}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CHAT LOGS */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                           <MessageSquare size={16} />
                        </div>
                        <h4 className="text-sm font-black uppercase text-white tracking-[2px]">Nhật ký đàm đạo cổ tiền</h4>
                    </div>
                    <div className="space-y-3">
                        {userDetail.chat_logs.length === 0 ? (
                             <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.01] text-center">
                               <p className="text-xs text-gray-600 font-serif italic">Thành viên chưa khởi tạo cuộc đàm thoại nào.</p>
                            </div>
                        ) : userDetail.chat_logs.slice(0, 8).map((log: any, i: number) => (
                            <div 
                              key={i} 
                              className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/[0.04] hover:border-[#D4AF37]/30 transition-all group" 
                              onClick={() => onViewChatDetail(log)}
                            >
                                <div className="flex justify-between items-start gap-4 mb-3">
                                   <p className="text-xs font-medium text-gray-400 line-clamp-2 leading-relaxed italic group-hover:text-white transition-colors">
                                      "{log.question}"
                                   </p>
                                   <ArrowRight size={14} className="text-gray-700 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all shrink-0" />
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                    <span className="text-[10px] text-gray-600 font-medium">{new Date(log.created_at).toLocaleDateString()}</span>
                                    <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Xem lời giải →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
         </div>

         <div className="p-10 border-t border-white/5 bg-white/[0.02] shrink-0">
            <button 
              onClick={onClose} 
              className="w-full btn-premium btn-gold py-5 rounded-2xl text-xs font-black tracking-[4px] uppercase"
            >
               Đóng Bản Ghi Chi Tiết
            </button>
         </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
