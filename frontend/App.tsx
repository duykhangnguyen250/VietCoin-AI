import React, { useState, useEffect } from 'react';
import { View, User } from './types';
import LandingView from './components/LandingView';
import AuthView from './components/AuthView';
import CoinView from './components/CoinView';
import PaymentView from './components/PaymentView';
import AdminView from './components/AdminView';
import ProfileView from './components/ProfileView';
import Sidebar from './components/Sidebar';
import GameZoneModal from './components/GameZoneModal';
import { api, BASE_URL } from './api';
import { Toaster, toast } from 'react-hot-toast';

// ==========================================
// PREMIUM TRANSITION SCREEN COMPONENT
// ==========================================
const TransitionScreen: React.FC<{ type: 'loading' | 'login' | 'logout' | 'register', userName?: string, isAdmin?: boolean }> = ({ type, userName, isAdmin }) => {
  const [progress, setProgress] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  
  const messages = [
    "Khởi động hệ thống AI...",
    "Nạp dữ liệu lịch sử triều đại...",
    "Kết nối với Gemini Vision...",
    "Kiểm tra phiên đăng nhập...",
    "Sẵn sàng giám định tiền cổ..."
  ];

  useEffect(() => {
    const pTimer = setInterval(() => setProgress(p => p < 95 ? p + 1 : p), 20);
    const mTimer = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 560);
    return () => { clearInterval(pTimer); clearInterval(mTimer); };
  }, []);

  const isLogout = type === 'logout';
  const isLogin = type === 'login';
  const isRegister = type === 'register';

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-1000 ${isLogout ? 'bg-[#050507]' : 'bg-[#0B0B0D]'}`}>
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {!isLogout && (
          <>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] animate-pulse ${isRegister ? 'bg-white/5' : 'bg-[#D4AF37]/10'}`}></div>
            <div className={`absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-[120px] ${isRegister ? 'bg-blue-400/3' : 'bg-[#CD7F32]/5'}`}></div>
          </>
        )}
        
        {/* WATERMARKS - INCREASED VISIBILITY */}
        <div className="absolute top-12 left-12 text-[160px] font-serif text-[#D4AF37]/15 select-none transition-all">
          {type === 'loading' ? '寶' : (isLogout ? '別' : '歡')}
        </div>
        <div className="absolute bottom-12 right-12 text-[160px] font-serif text-[#D4AF37]/15 select-none transition-all">
          {type === 'loading' ? '錢' : (isLogout ? '謝' : '禧')}
        </div>

        {/* PARTICLES */}
        {[...Array(8)].map((_, i) => (
          <div key={i} 
            className={`absolute w-1.5 h-1.5 rounded-full ${isRegister ? 'bg-white/40' : 'bg-[#D4AF37]/30'}`}
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 4) * 20}%`,
              animation: `float ${4 + i}s ease-in-out infinite alternate`
            }}
          ></div>
        ))}
      </div>

      {/* CENTRAL LOGO SYSTEM - ENLARGED */}
      <div className="relative mb-16">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* 4 ROTATING RINGS */}
          <div className="absolute inset-0 border-2 border-dashed border-[#D4AF37]/15 rounded-full animate-[spin_12s_linear_infinite]"></div>
          <div className="absolute inset-4 border border-dashed border-[#D4AF37]/25 rounded-full animate-[spin_18s_linear_infinite_reverse]"></div>
          <div className="absolute inset-[-15px] border-t-2 border-[#D4AF37] rounded-full animate-[spin_1.2s_linear_infinite]"></div>
          <div className="absolute inset-[-15px] border-b-2 border-[#CD7F32]/50 rounded-full animate-[spin_2.5s_linear_infinite_reverse]"></div>
          
          {/* ORBITING PLANETS - ENLARGED ORBITS */}
          <div className="absolute inset-[-35px] rounded-full animate-[spin_3.5s_linear_infinite]">
            <div className={`w-3 h-3 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.8)] ${isRegister ? 'bg-white' : 'bg-[#D4AF37]'}`}></div>
          </div>
          <div className="absolute inset-[-55px] rounded-full animate-[spin_6s_linear_infinite_reverse]">
            <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_15px_rgba(205,127,50,0.6)] ${isRegister ? 'bg-blue-300' : 'bg-[#CD7F32]'}`}></div>
          </div>

          <img 
            src="/assets/logo.png" 
            alt="Logo" 
            className={`w-32 h-32 rounded-full border-2 border-[#D4AF37]/40 shadow-[0_0_50px_rgba(212,175,55,0.2)] relative z-10 ${isLogout ? 'grayscale' : ''}`} 
          />
        </div>
      </div>

      {/* TEXT CONTENT - ENLARGED */}
      <div className="text-center z-10 animate-fadeUp">
        {type === 'loading' ? (
          <>
            <h2 className="text-4xl font-serif font-black gold-gradient-text tracking-[10px] mb-6">VIETCOIN AI</h2>
            <div className="flex flex-col items-center">
              <p className="text-xs text-gray-400 uppercase tracking-[5px] mb-8 h-5">{messages[msgIdx]}</p>
              
              {/* PROGRESS BAR - LARGER */}
              <div className="w-80 h-[3px] bg-white/5 rounded-full overflow-hidden relative">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] transition-all duration-300 shadow-[0_0_15px_#D4AF37]"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="mt-3 text-[10px] font-bold text-[#D4AF37] tracking-[4px]">{progress}%</p>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-[#D4AF37] uppercase tracking-[8px] font-bold">
              {isRegister ? "KHỞI TẠO HÀNH TRÌNH" : (isLogin ? (isAdmin ? "HỆ THỐNG QUẢN TRỊ" : "CHÀO MỪNG TRỞ LẠI") : "HẸN GẶP LẠI")}
            </p>
            <h2 className="text-5xl font-serif font-black text-white tracking-[3px]">
              {isRegister ? "TÂN THÀNH VIÊN" : (isLogin ? (isAdmin ? "QUẢN TRỊ VIÊN" : (userName || "KHÁCH QUÝ")) : "TẠM BIỆT")}
            </h2>
            {isRegister && <p className="text-2xl font-cinzel text-[#D4AF37] mt-2">{userName}</p>}
            <p className="text-xs text-gray-500 uppercase tracking-[5px] animate-pulse italic mt-4">
              {isRegister ? "Đang thiết lập không gian di sản cho bạn..." : (isLogin ? "Đang vào hệ thống..." : "Đang thoát an toàn...")}
            </p>
          </div>
        )}
      </div>

      <div className="absolute bottom-10 text-[9px] text-gray-700 font-bold uppercase tracking-[4px]">
        VietCoin AI • v1.0 Beta
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [siteConfig, setSiteConfig] = useState<any>(null);
  const [globalLoading, setGlobalLoading] = useState<'loading' | 'login' | 'logout' | 'register' | null>('loading');
  const [transitionUser, setTransitionUser] = useState<{ name?: string; isAdmin?: boolean } | null>(null);
  const [gameZoneOpen, setGameZoneOpen] = useState(false);

  const fetchConfig = () => {
    api.getConfig().then(data => {
      const origin = BASE_URL.replace("/api/v1", "");
      const fix = (url: string) => url?.startsWith("/") ? `${origin}${url}` : url;
      const logoUrl = fix(data.logo_url);
      const bgUrl = fix(data.background_url);
      setSiteConfig({
        ...data,
        logo_url: logoUrl,
        background_url: bgUrl,
        favicon_url: fix(data.favicon_url)
      });
      if (data.site_title) document.title = data.site_title;
      if (data.favicon_url) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = fix(data.favicon_url);
      }

      // Sync logo and background to Native Android App
      if ((window as any).AndroidBridge && (window as any).AndroidBridge.setSiteConfig) {
        (window as any).AndroidBridge.setSiteConfig(logoUrl, bgUrl);
      }
    });
  };

  useEffect(() => {
    // Initial Load Transition
    setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');

      fetchConfig();

      if (urlToken) {
        // ====== GOOGLE OAUTH FLOW ======
        // Có token từ URL → Google OAuth redirect
        localStorage.setItem('access_token', urlToken);
        window.history.replaceState({}, document.title, "/");

        // Dismiss loading, rồi show transition login giống đăng nhập thường
        setGlobalLoading(null);

        api.checkAuth()
          .then((res) => {
            if (res && res.user) {
              // Hiện transition screen "QUẢN TRỊ VIÊN" hoặc "KHÁCH QUÝ"
              setTransitionUser({ name: res.user.full_name, isAdmin: res.user.is_admin });
              setGlobalLoading('login');
              setTimeout(() => {
                setUser(res.user);
                setCurrentView(res.user.is_admin ? 'admin' : 'coin');
                setGlobalLoading(null);
                setTransitionUser(null);
              }, 2200);
            }
          })
          .catch(() => {
            localStorage.removeItem('access_token');
            setCurrentView('landing');
          });
        return;
      }

      // ====== NORMAL FLOW (token đã có sẵn trong localStorage) ======
      const token = localStorage.getItem('access_token');
      if (token) {
        api.checkAuth()
          .then((res) => {
            if (res && res.user) {
              setUser(res.user);
              // Admin luôn vào trang quản trị, user thường vào trang coin
              setCurrentView(res.user.is_admin ? 'admin' : 'coin');
            }
          })
          .catch(() => {
            localStorage.removeItem('access_token');
            setCurrentView('landing');
          });
      }
      setGlobalLoading(null);
    }, 2800);

    const handleConfigUpdate = () => fetchConfig();
    const handleUserUpdate = () => {
      api.checkAuth().then(res => {
        if (res && res.user) setUser(res.user);
      });
    };

    window.addEventListener("update_config", handleConfigUpdate);
    window.addEventListener("update_user", handleUserUpdate);

    // Global switch view for Mobile/Native bridge
    (window as any).switchView = (view: View) => {
      setCurrentView(view);
    };

    // Global logout trigger for Mobile/Native bridge
    (window as any).handleLogoutMobile = () => {
      handleLogout();
    };

    return () => {
      window.removeEventListener("update_config", handleConfigUpdate);
      window.removeEventListener("update_user", handleUserUpdate);
      delete (window as any).switchView;
      delete (window as any).handleLogoutMobile;
    };
  }, []);

  // Sync state with Native Android App
  useEffect(() => {
    if ((window as any).AndroidBridge) {
      const origin = BASE_URL.replace("/api/v1", "");
      const fix = (url: string) => url?.startsWith("/") ? `${origin}${url}` : url;
      (window as any).AndroidBridge.setLoginState(
        !!user,
        user?.full_name || "",
        user?.token_balance?.toString() || "0",
        !!user?.is_admin,
        user?.picture_url ? fix(user.picture_url) : ""
      );
    }
  }, [user]);

  const handleLoginSuccess = (loggedInUser: User, token: string, isNewUser?: boolean) => {
    setTransitionUser({ name: loggedInUser.full_name, isAdmin: !!loggedInUser.is_admin });
    setGlobalLoading(isNewUser ? 'register' : 'login');
    setTimeout(() => {
      localStorage.setItem('access_token', token);
      setUser(loggedInUser);
      setCurrentView(loggedInUser.is_admin ? 'admin' : 'coin');
      setGlobalLoading(null);
      setTransitionUser(null);
    }, isNewUser ? 3000 : 2200);
  };

  const handleLogout = () => {
    setGlobalLoading('logout');
    setTimeout(() => {
      localStorage.removeItem('access_token');
      setUser(null);
      setCurrentView('landing');
      setGlobalLoading(null);
    }, 2000);
  };

  const renderView = () => {
    switch (currentView) {
      case 'landing': return (
        <LandingView 
          onGetStarted={() => setCurrentView('auth')} 
          onOpenGameZone={() => {
            if (user) {
              setGameZoneOpen(true);
            } else {
              toast.error("Vui lòng đăng nhập để tham gia Không gian trò chơi và nhận thưởng Tokens! 🔑");
              setCurrentView('auth');
            }
          }}
        />
      );
      case 'auth': return <AuthView siteConfig={siteConfig} onSuccess={handleLoginSuccess} onClose={() => setCurrentView('landing')} />;
      case 'coin': return user ? <CoinView /> : <AuthView onSuccess={handleLoginSuccess} />;
      case 'payment': return user ? <PaymentView onBalanceUpdate={(b) => setUser(u => u ? {...u, token_balance: b} : null)} /> : <AuthView onSuccess={handleLoginSuccess} />;
      case 'admin': return user?.is_admin ? <AdminView /> : <CoinView />;
      case 'profile': return user ? <ProfileView user={user} onUpdateUser={setUser} onViewChange={setCurrentView} /> : <AuthView onSuccess={handleLoginSuccess} />;
      default: return (
        <LandingView 
          onGetStarted={() => setCurrentView('auth')} 
          onOpenGameZone={() => {
            if (user) {
              setGameZoneOpen(true);
            } else {
              toast.error("Vui lòng đăng nhập để tham gia Không gian trò chơi và nhận thưởng Tokens! 🔑");
              setCurrentView('auth');
            }
          }}
        />
      );
    }
  };

  return (
    <div className="min-h-screen text-gray-200 font-sans selection:bg-[#D4AF37]/30 selection:text-white relative">
      {globalLoading && <TransitionScreen type={globalLoading} userName={transitionUser?.name || user?.full_name} isAdmin={transitionUser?.isAdmin ?? !!user?.is_admin} />}

      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-40 bg-center bg-no-repeat bg-cover" 
          style={{ backgroundImage: `url('${siteConfig?.background_url || "/assets/bg.png"}')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0B0D]/40 to-[#0B0B0D]"></div>
      </div>

      <Toaster position="top-center" toastOptions={{
        style: {
          background: 'rgba(20, 20, 24, 0.9)',
          color: '#fff',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
        }
      }} />
      
      {user && currentView !== 'landing' && currentView !== 'auth' && (
        <Sidebar 
          currentView={currentView} 
          onViewChange={setCurrentView} 
          onLogout={handleLogout}
          onOpenGameZone={() => setGameZoneOpen(true)}
          user={user}
          siteConfig={siteConfig}
        />
      )}
      
      <main className={`relative z-10 ${user && currentView !== 'landing' && currentView !== 'auth' ? 'md:pl-20 lg:pl-64' : ''} transition-all duration-300`}>
        {renderView()}
      </main>

      <GameZoneModal
        isOpen={gameZoneOpen}
        onClose={() => setGameZoneOpen(false)}
        user={user}
        onBalanceUpdate={(newBalance) => setUser(u => u ? { ...u, token_balance: newBalance } : null)}
      />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp { animation: fadeUp 0.8s ease-out forwards; }
        @keyframes float {
          from { transform: translateY(0px); opacity: 0.2; }
          to { transform: translateY(-20px); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default App;

