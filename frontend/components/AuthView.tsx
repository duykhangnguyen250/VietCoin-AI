import React, { useState, useEffect } from "react";
import { api } from "../api";
import { User } from "../types";
import { ShieldCheck, Mail, User as UserIcon, Lock, Sparkles } from "lucide-react";

interface AuthViewProps {
  onSuccess: (user: User, token: string, isNewUser?: boolean) => void;
  onClose?: () => void;
  siteConfig?: any;
}

const AuthView: React.FC<AuthViewProps> = ({ onSuccess, onClose, siteConfig }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Token handling moved to App.tsx for global detection
  useEffect(() => {
    // Left empty or removed to avoid conflict
  }, []);

  const playAuthSound = () => {
      try {
         const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
         if (AudioContext) {
            const ctx = new AudioContext();
            const freqs = [880, 1046.50, 1318.51, 1975.53];
            freqs.forEach((f, i) => {
               const osc = ctx.createOscillator();
               const gain = ctx.createGain();
               osc.type = 'sine';
               osc.frequency.setValueAtTime(f, ctx.currentTime);
               gain.gain.setValueAtTime(0, ctx.currentTime);
               gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.05 + i * 0.03);
               gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);
               osc.connect(gain);
               gain.connect(ctx.destination);
               osc.start();
               osc.stop(ctx.currentTime + 2.0);
            });
         }
      } catch (err) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
      playAuthSound();
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const data = new FormData();
    data.append("username", formData.username);
    data.append("password", formData.password);

    if (!isLogin) {
      if (!formData.email) {
        setError("Email không được để trống");
        setIsLoading(false);
        return;
      }
      data.append("email", formData.email);
    }

    try {
      if (isLogin) {
        const res = await api.login(data);
        onSuccess(res.user, res.access_token, false); // login
      } else {
        await api.register(data);
        const loginRes = await api.login(data);
        onSuccess(loginRes.user, loginRes.access_token, true); // register (new user)
      }
    } catch (err: any) {
      try {
        const errorMsg = await err.response?.json?.();
        setError(errorMsg?.detail || err.message);
      } catch {
        setError(err.message || "Xác thực thất bại");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    playAuthSound();
    try {
      const url = await api.getGoogleLoginUrl();
      if (!url) throw new Error("URL Google không hợp lệ");
      window.location.href = url;
    } catch (err: any) {
      setError(err.message || "Không thể kết nối với Google");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* BACKGROUND BACKGROUND BACKGROUND */}
      <div className="app-bg-overlay" style={{ backgroundImage: `url('${siteConfig?.background_url || "/assets/bg.png"}')` }}></div>
      <div className="app-bg-gradient"></div>

      <div className="glass-card w-full max-w-[440px] p-12 rounded-[40px] border border-white/10 shadow-2xl relative animate-fade z-10">
        
        {/* LOGO DECOR */}
        <div className="flex flex-col items-center mb-10">
           <div className="relative group mb-4">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <img src="/assets/logo.png" className="relative w-20 h-20 rounded-full border border-[#D4AF37]/30 shadow-2xl" />
           </div>
           <h2 className="text-3xl hero-title-fix font-black gold-gradient-text text-center">
              {isLogin ? "Đăng Nhập" : "Đăng Ký"}
           </h2>
           <p className="text-[10px] text-gray-500 uppercase tracking-[2px] mt-3 font-bold italic">
              Cổng Truy Cập VietCoin AI • Tiền Cổ Việt Nam
           </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-shake">
             <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
             <p className="text-red-400 text-xs font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={12} /> Địa chỉ Email
               </label>
               <input
                 type="email"
                 required
                 value={formData.email}
                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                 className="w-full premium-input h-14"
                 placeholder="dia-chi@email.com"
               />
            </div>
          )}

          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <UserIcon size={12} /> Tên đăng nhập
             </label>
             <input
               type="text"
               required
               value={formData.username}
               onChange={(e) => setFormData({ ...formData, username: e.target.value })}
               className="w-full premium-input h-14"
               placeholder="tên đăng nhập"
             />
          </div>

          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Lock size={12} /> Mật mã
             </label>
             <input
               type="password"
               required
               value={formData.password}
               onChange={(e) => setFormData({ ...formData, password: e.target.value })}
               className="w-full premium-input h-14"
               placeholder="••••••••"
             />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-premium btn-gold py-4 rounded-2xl text-sm font-black tracking-widest mt-4 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
               <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ĐANG XÁC THỰC...
               </span>
            ) : (
               isLogin ? "TIẾP TỤC HÀNH TRÌNH" : "KHỞI TẠO TÀI KHOẢN"
            )}
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
           <div className="flex-1 h-px bg-white/5"></div>
           <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Hoặc</span>
           <div className="flex-1 h-px bg-white/5"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full h-14 rounded-2xl border border-white/10 hover:border-[#D4AF37]/30 transition-all flex items-center justify-center gap-3 group"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 11.01V13h6.32a5.42 5.42 0 0 1-2.32 3.53l3.65 2.82A11.96 11.96 0 0 0 24 12c0-.68-.07-1.36-.2-2.01H12z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.97-2.91L16.32 18.27A7.14 7.14 0 0 1 12 19.5c-3.13 0-5.83-2.12-6.78-4.97L1.44 17.5A11.94 11.94 0 0 0 12 24z"/>
            <path fill="#4285F4" d="M5.22 14.53A7.14 7.14 0 0 1 4.5 12c0-.88.16-1.72.44-2.5l-3.71-2.88A11.93 11.93 0 0 0 0 12c0 2.45.74 4.73 2.01 6.63l3.21-2.1z"/>
            <path fill="#FBBC05" d="M12 4.5c1.76 0 3.34.6 4.58 1.78l3.43-3.43A11.95 11.95 0 0 0 12 0 11.94 11.94 0 0 0 1.44 6.62l3.78 2.91c.95-2.85 3.65-4.97 6.78-4.97z"/>
          </svg>
          <span className="text-[10px] font-black uppercase tracking-[2px] text-gray-400 group-hover:text-white">Tiếp tục bằng Google</span>
        </button>

        <p className="text-center mt-10 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          {isLogin ? "BẠN CHƯA CÓ TÀI KHOẢN?" : "BẠN ĐÃ CÓ TÀI KHOẢN?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-[#D4AF37] hover:underline"
          >
            {isLogin ? "ĐĂNG KÝ NGAY" : "ĐĂNG NHẬP"}
          </button>
        </p>

      </div>
    </div>
  );
};

export default AuthView;
