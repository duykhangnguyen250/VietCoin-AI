import React from "react";
import { User, View } from "../types";
import { API_ROOT } from "../api";
import {
    Sparkles,
    DollarSign,
    Shield,
    User as UserIcon,
    Gamepad2,
} from "lucide-react";
 
interface SidebarProps {
    user: User | null;
    currentView: View;
    onViewChange: (view: View) => void;
    onLogout: () => void;
    onOpenGameZone: () => void;
    siteConfig?: { logo_url: string; site_title: string };
}
 
const Sidebar: React.FC<SidebarProps> = ({
    user,
    currentView,
    onViewChange,
    onLogout,
    onOpenGameZone,
    siteConfig,
}) => {
    const [imgError, setImgError] = React.useState(false);

    const handleLogout = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 1.0);
                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 1.0);
            }
        } catch (err) {}
        onLogout();
    };

    const navItems = [
        { id: "coin" as View, label: "Nhận diện coin", icon: Sparkles },
        { id: "payment" as View, label: "Nạp điểm", icon: DollarSign },
        { id: "game" as any, label: "Trò chơi di sản", icon: Gamepad2, isGame: true },
        ...(user?.is_admin
            ? [
                {
                    id: "admin" as View,
                    label: "Hệ thống Quản trị",
                    icon: Shield,
                },
            ]
            : []),
        { id: "profile" as View, label: "Hồ sơ cá nhân", icon: UserIcon },
    ];

    return (
        <aside className="hidden md:flex w-[280px] bg-[#0b0b0d] border-r border-white/5 flex-col h-screen fixed left-0 top-0 z-50 shadow-2xl">

            {/* ================= HEADER ================= */}
            <div className="flex flex-col items-center gap-3 px-6 py-10 border-b border-white/5">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <img
                        src={siteConfig?.logo_url || "/assets/logo.png"}
                        className="relative w-20 h-20 rounded-full border border-[#D4AF37]/30 shadow-2xl object-cover"
                    />
                </div>

                <div className="text-center mt-2">
                    <h1 className="text-lg font-cinzel font-bold gold-gradient-text tracking-[2px] uppercase">
                        {siteConfig?.site_title || "VietCoin AI"}
                    </h1>
                    <p className="text-[9px] text-gray-500 uppercase tracking-[3px] mt-1 font-medium">
                        Giám Định Tiền Cổ Việt Nam
                    </p>
                </div>
            </div>

            {/* ================= MAIN ================= */}
            <div className="flex flex-col flex-1 px-4 py-8 overflow-y-auto custom-scroll">
                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isGame = (item as any).isGame;
                        const isActive = isGame ? false : currentView === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={isGame ? onOpenGameZone : () => onViewChange(item.id)}
                                className={`flex items-center gap-4 w-full px-4 py-3.5 text-sm rounded-xl transition-all duration-300 relative group ${isActive
                                    ? "bg-white/5 text-white border border-white/10 shadow-lg"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#D4AF37] rounded-full"></div>
                                )}
                                <Icon size={18} className={isActive ? "text-[#D4AF37]" : "group-hover:text-[#D4AF37] transition-colors"} />
                                <span className={`font-medium tracking-wide ${isActive ? "gold-text" : "group-hover:text-[#D4AF37] transition-colors"}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* ================= FOOTER ================= */}
            <div className="mt-auto p-6 bg-black/20 border-t border-white/5">
                {user ? (
                    <div className="space-y-4">
                        <div
                            onClick={() => onViewChange("profile")}
                            className="flex items-center gap-3 cursor-pointer group"
                        >
                            <div className="relative">
                                {user.picture_url && !imgError ? (
                                    <img
                                        src={user.picture_url}
                                        className="w-10 h-10 rounded-xl border border-white/10 group-hover:border-[#D4AF37]/50 transition-colors"
                                        onError={() => setImgError(true)}
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#2D2D35] to-[#1A1A20] rounded-xl flex items-center justify-center text-sm font-bold border border-white/10 text-[#D4AF37]">
                                        {(user.username || "U")[0].toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#0b0b0d] rounded-full"></div>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-semibold text-white truncate group-hover:text-[#D4AF37] transition-colors">
                                    {user.full_name || user.username}
                                </p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                                    <span className={user.is_admin ? "text-[#D4AF37]" : "text-gray-400"}>
                                        {!!user.is_admin && "👑 "}
                                        {Number.isInteger(user.token_balance ?? 0)
                                            ? (user.token_balance ?? 0).toLocaleString()
                                            : (user.token_balance ?? 0).toFixed(1).replace(/\.0$/, '')
                                        } Tokens
                                        {!!user.is_admin && " (Admin)"}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full py-2.5 rounded-lg border border-red-900/30 text-[10px] font-bold text-red-500 uppercase tracking-widest hover:bg-red-900/20 transition-all"
                        >
                            Đăng xuất hệ thống
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => onViewChange("profile")}
                        className="w-full btn-premium btn-gold py-3 rounded-xl text-sm"
                    >
                        Bắt đầu khám phá
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;