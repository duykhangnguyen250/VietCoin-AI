import React, { useState } from 'react';
import { User } from '../../types';
import { Camera, Edit3, Shield, Wallet } from 'lucide-react';

interface ProfileInfoCardProps {
  user: User;
  onUpdateFullName: () => void;
  onUpdateAvatar: () => void;
  onChangePassword: () => void;
  onChargeClick: () => void;
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ user, onUpdateFullName, onUpdateAvatar, onChangePassword, onChargeClick }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="glass-card rounded-[32px] border border-white/10 p-8 space-y-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/5 blur-3xl rounded-full group-hover:bg-[#D4AF37]/10 transition-colors duration-700"></div>
        <div className="flex flex-col items-center text-center relative z-10">
            <div className="relative mb-6">
                <div className="absolute -inset-2 bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                {user.picture_url && !imgError ? (
                    <img src={user.picture_url} onError={() => setImgError(true)} alt={user.username} className="relative w-28 h-28 rounded-full object-cover border border-[#D4AF37]/30 shadow-2xl" />
                ) : (
                    <div className="relative w-28 h-28 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-4xl font-black text-[#D4AF37] shadow-2xl">
                        {user.username[0].toUpperCase()}
                    </div>
                )}
                <button onClick={onUpdateAvatar} className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#1A1A20] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors shadow-lg">
                    <Camera size={14} />
                </button>
            </div>
            
            <h3 className="text-2xl font-cinzel font-black gold-gradient-text tracking-wide mb-1 flex items-center gap-2 justify-center">
                {user.full_name || user.username}
                <button onClick={onUpdateFullName} className="text-gray-500 hover:text-[#D4AF37] transition-colors"><Edit3 size={14} /></button>
            </h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-4">{user.email}</p>
            {user.is_admin === 1 && (
                <span className="px-3 py-1 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-[9px] font-black uppercase tracking-widest">
                    Chưởng Quản Môn Phái
                </span>
            )}
        </div>

        <div className="pt-6 border-t border-white/5 space-y-4">
            <div className="historical-certificate p-5 rounded-2xl relative overflow-hidden group/balance">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/balance:opacity-20 transition-opacity"><Wallet size={48} /></div>
                <p className="text-[10px] text-gray-500 uppercase tracking-[2px] font-black mb-2">Tài sản hiện hữu</p>
                <p className="text-3xl font-black gold-gradient-text tracking-tighter mb-4">
                    {Number.isInteger(user.token_balance ?? 0)
                        ? (user.token_balance ?? 0).toLocaleString()
                        : (user.token_balance ?? 0).toFixed(1).replace(/\.0$/, '')
                    } <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Tokens</span>
                </p>
                <button onClick={onChargeClick} className="w-full btn-premium btn-gold py-3 rounded-xl text-[10px] font-black uppercase tracking-[2px]">
                    Nạp thêm Token
                </button>
            </div>

            <button onClick={onChangePassword} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                <Shield size={14} /> Đổi mật mã bảo mật
            </button>
        </div>
    </div>
  );
};

export default ProfileInfoCard;