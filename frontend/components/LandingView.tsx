import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Shield, Database, ArrowRight, Zap, ChevronDown, Award, Star, Users, Clock, Gamepad2 } from 'lucide-react';
 
interface LandingViewProps {
   onGetStarted: () => void;
   onOpenGameZone: () => void;
}

// ====== Animated Counter Hook ======
function useCounter(target: number, duration = 2000, start = false) {
   const [count, setCount] = useState(0);
   useEffect(() => {
      if (!start) return;
      let startTime: number;
      const step = (timestamp: number) => {
         if (!startTime) startTime = timestamp;
         const progress = Math.min((timestamp - startTime) / duration, 1);
         setCount(Math.floor(progress * target));
         if (progress < 1) requestAnimationFrame(step);
         else setCount(target);
      };
      requestAnimationFrame(step);
   }, [start, target, duration]);
   return count;
}

const DYNASTIES = [
   { name: 'Nhà Đinh', year: '968–980', han: '丁', color: '#D4AF37' },
   { name: 'Tiền Lê', year: '980–1009', han: '黎', color: '#CD7F32' },
   { name: 'Nhà Lý', year: '1009–1225', han: '李', color: '#D4AF37' },
   { name: 'Nhà Trần', year: '1225–1400', han: '陳', color: '#CD7F32' },
   { name: 'Nhà Hồ', year: '1400–1407', han: '胡', color: '#D4AF37' },
   { name: 'Lê Sơ', year: '1428–1527', han: '黎初', color: '#CD7F32' },
   { name: 'Nhà Mạc', year: '1527–1677', han: '莫', color: '#D4AF37' },
   { name: 'Tây Sơn', year: '1778–1802', han: '西', color: '#CD7F32' },
   { name: 'Lê Trung Hưng', year: '1533–1789', han: '景興', color: '#D4AF37' },
   { name: 'Nhà Nguyễn', year: '1802–1945', han: '阮', color: '#CD7F32' },
];

const LandingView: React.FC<LandingViewProps> = ({ onGetStarted, onOpenGameZone }) => {
   const statsRef = useRef<HTMLDivElement>(null);
   const [statsVisible, setStatsVisible] = useState(false);
   const [modal, setModal] = useState<'terms' | 'privacy' | 'contact' | null>(null);

   const c1 = useCounter(10000, 2000, statsVisible);
   const c2 = useCounter(10, 1500, statsVisible);
   const c3 = useCounter(95, 1800, statsVisible);

   const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
   const cursorRef = useRef<HTMLDivElement>(null);
   const trailRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let trailX = mouseX;
      let trailY = mouseY;
      let animationFrameId: number;

      const handleMouseMove = (e: MouseEvent) => {
         mouseX = e.clientX;
         mouseY = e.clientY;
         setMousePos({
            x: (e.clientX / window.innerWidth - 0.5) * 20,
            y: (e.clientY / window.innerHeight - 0.5) * 20
         });
         if (cursorRef.current) {
            cursorRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
         }
      };

      const renderTrail = () => {
         trailX += (mouseX - trailX) * 0.15;
         trailY += (mouseY - trailY) * 0.15;
         if (trailRef.current) {
            trailRef.current.style.transform = `translate(${trailX}px, ${trailY}px) translate(-50%, -50%)`;
         }
         animationFrameId = requestAnimationFrame(renderTrail);
      };

      window.addEventListener('mousemove', handleMouseMove);
      renderTrail();

      const observer = new IntersectionObserver(
         (entries) => {
            entries.forEach(entry => {
               if (entry.isIntersecting) {
                  entry.target.classList.add('active');
                  if (entry.target.id === 'features') setStatsVisible(true);
               }
            });
         },
         { threshold: 0.1 }
      );
      
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
      if (statsRef.current) observer.observe(statsRef.current);

      return () => {
         window.removeEventListener('mousemove', handleMouseMove);
         cancelAnimationFrame(animationFrameId);
         observer.disconnect();
      };
   }, []);

   const handleGlobalClick = (e: React.MouseEvent) => {
      // 1. Ripple Effect
      const ripple = document.createElement('div');
      ripple.className = 'fixed rounded-full border border-[#D4AF37]/50 pointer-events-none animate-ripple z-[9999]';
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      ripple.style.transform = 'translate(-50%, -50%)';
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 1000);

      // 2. Start Cinematic Ambient Drone
      if (!(window as any).ambientStarted) {
         (window as any).ambientStarted = true;
         try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
               const ctx = new AudioContext();
               const drone = ctx.createOscillator();
               drone.type = 'sine';
               drone.frequency.value = 55; // Deep bass
               const lfo = ctx.createOscillator();
               lfo.frequency.value = 0.1;
               const lfoGain = ctx.createGain();
               lfoGain.gain.value = 5;
               lfo.connect(lfoGain);
               lfoGain.connect(drone.frequency);
               const droneGain = ctx.createGain();
               droneGain.gain.value = 0;
               droneGain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 5);
               drone.connect(droneGain);
               droneGain.connect(ctx.destination);
               drone.start();
               lfo.start();
            }
         } catch (err) {}
      }
   };

   const handleGetStarted = (e: React.MouseEvent) => {
      e.stopPropagation();
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
      handleGlobalClick(e);
      onGetStarted();
   };

   return (
      <div className="relative min-h-screen text-white overflow-x-hidden cursor-default" onClick={handleGlobalClick}>
         
         {/* Custom VIP Cursor Aura */}
         <div ref={cursorRef} className="fixed top-0 left-0 w-1.5 h-1.5 bg-[#D4AF37] rounded-full pointer-events-none z-[9999] shadow-[0_0_10px_#D4AF37] hidden md:block transition-transform duration-0"></div>
         <div ref={trailRef} className="fixed top-0 left-0 w-10 h-10 border border-[#D4AF37]/40 bg-[#D4AF37]/5 rounded-full pointer-events-none z-[9998] backdrop-blur-[1px] hidden md:flex items-center justify-center transition-transform duration-0"></div>

         {/* ===== HERO ===== */}
         <section id="top" className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
            {/* Animated background glow orbs */}
            <div className="absolute inset-0 z-0 transition-transform duration-300 ease-out" style={{ transform: `translate(${mousePos.x * -2}px, ${mousePos.y * -2}px)` }}>
               <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/6 rounded-full blur-[120px] animate-pulse"></div>
               <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#CD7F32]/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/3 rounded-full blur-[160px]"></div>
            </div>

            {/* Floating Han characters */}
            {['寶', '錢', '幣', '通', '古', '史'].map((char, i) => (
               <div key={i} className="absolute font-serif text-[#D4AF37]/5 select-none pointer-events-none text-8xl"
                  style={{
                     left: `${5 + i * 16}%`, top: `${10 + (i % 3) * 25}%`,
                     animation: `float ${3 + i * 0.5}s ease-in-out infinite alternate`,
                     animationDelay: `${i * 0.4}s`, fontSize: `${60 + (i % 3) * 30}px`
                  }}>
                  {char}
               </div>
            ))}

            {/* Grid lines background */}
            <div className="absolute inset-0 z-0 opacity-[0.03] transition-transform duration-300 ease-out"
               style={{ 
                  backgroundImage: 'linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)', 
                  backgroundSize: '60px 60px',
                  transform: `translate(${mousePos.x}px, ${mousePos.y}px)` 
               }}>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 text-center max-w-6xl">
               {/* Badge */}
               <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-[#D4AF37]/8 border border-[#D4AF37]/20 rounded-full mb-10 backdrop-blur-md">
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse shadow-[0_0_8px_#D4AF37]"></div>
                  <span className="text-[10px] font-black uppercase tracking-[4px] text-[#D4AF37]">AI Nhận Diện Tiền Cổ • Thế Hệ Mới 2026</span>
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse shadow-[0_0_8px_#D4AF37]"></div>
               </div>

               <h1 className="text-4xl md:text-7xl lg:text-8xl hero-title-fix font-black mb-6 leading-[1.3] md:leading-[1.5] py-4 relative group cursor-default">
                  <span className="gold-gradient-text relative inline-block pb-2 pt-4">
                     Giải Mã Bí Ẩn
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12"></div>
                  </span>
                  <br />
                  <span className="text-white/90 drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">TRIỀU ĐẠI VIỆT</span>
               </h1>

               <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#D4AF37]/50"></div>
                  <span className="text-4xl font-serif text-[#D4AF37]/60">寶</span>
                  <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#D4AF37]/50"></div>
               </div>

               <p className="text-base md:text-lg text-gray-400 font-serif italic max-w-2xl mx-auto mb-14 leading-relaxed">
                  "Mỗi đồng tiền cổ là một mảnh ghép của lịch sử, VietCoin AI giúp bạn nhìn thấu dòng chảy thời gian qua từng vết hằn ngàn năm."
               </p>

               <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                  <button
                     onClick={handleGetStarted}
                     className="group relative btn-premium btn-gold px-12 py-5 rounded-2xl text-sm font-black uppercase tracking-[4px] shadow-[0_0_60px_rgba(212,175,55,0.25)] flex items-center gap-4 active:scale-95 transition-all overflow-hidden"
                  >
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                     <Sparkles size={16} />
                     Khám Phá Ngay
                     <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </button>

                  <button
                     onClick={(e) => { e.stopPropagation(); onOpenGameZone(); }}
                     className="group relative px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold uppercase tracking-[2px] hover:bg-white/8 hover:border-[#D4AF37]/40 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] flex items-center gap-3 active:scale-95 transition-all"
                  >
                     <Gamepad2 size={16} className="text-[#D4AF37] group-hover:animate-bounce" />
                     Không Gian Game
                  </button>

                  <button
                     onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                     className="px-8 py-5 text-xs font-bold uppercase tracking-[2px] text-gray-500 hover:text-white transition-colors"
                  >
                     Tìm hiểu thêm ↓
                  </button>
               </div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce opacity-20">
               <ChevronDown size={32} />
            </div>
         </section>

         {/* ===== STATS ===== */}
         <section id="features" ref={statsRef} className="py-20 px-6 border-y border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/3 via-transparent to-[#D4AF37]/3"></div>
            <div className="max-w-5xl mx-auto grid grid-cols-3 gap-8 relative z-10">
               {[
                  { value: c1, suffix: '+', label: 'Mẫu vật đã học', icon: Database },
                  { value: c2, suffix: ' triều đại', label: 'Được hỗ trợ nhận diện', icon: Award },
                  { value: c3, suffix: '%', label: 'Độ chính xác trung bình', icon: Shield },
               ].map((stat, i) => (
                  <div key={i} className="text-center group">
                     <p className="text-4xl md:text-5xl font-serif font-black gold-gradient-text mb-2">
                        {stat.value.toLocaleString()}{stat.suffix}
                     </p>
                     <p className="text-[10px] text-gray-500 uppercase tracking-[3px]">{stat.label}</p>
                  </div>
               ))}
            </div>
         </section>

         {/* ===== DYNASTY TIMELINE ===== */}
         <section id="dynasties" className="py-32 px-6 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
               <header className="text-center mb-20">
                  <p className="text-[10px] text-[#D4AF37] uppercase tracking-[5px] mb-4 font-black">Danh Mục Nhận Diện</p>
                  <h2 className="text-4xl font-sans font-black gold-gradient-text tracking-[2px] mb-4 leading-relaxed pt-2">TRIỀU ĐẠI ĐƯỢC HỖ TRỢ</h2>
                  <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mx-auto"></div>
               </header>

               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
                  {DYNASTIES.map((d, i) => (
                     <div key={i} className="group glass-card p-6 rounded-2xl border border-white/5 hover:border-[#D4AF37]/40 transition-all text-center cursor-default hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden reveal" style={{ transitionDelay: `${i * 50}ms` }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="text-4xl font-serif text-[#D4AF37]/40 group-hover:text-[#D4AF37] group-hover:scale-110 transition-all mb-3">{d.han}</div>
                        <p className="text-[12px] font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-tight uppercase tracking-wider">{d.name}</p>
                        <p className="text-[10px] text-gray-600 mt-2 tracking-widest">{d.year}</p>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* ===== FEATURES ===== */}
         <section className="py-20 px-6 relative">
            <div className="max-w-7xl mx-auto">
               <header className="text-center mb-20">
                  <p className="text-[10px] text-[#D4AF37] uppercase tracking-[5px] mb-4 font-black">Công Nghệ Cốt Lõi</p>
                  <h2 className="text-4xl font-sans font-black gold-gradient-text tracking-[2px] leading-relaxed pt-2">SỨC MẠNH AI</h2>
               </header>

               <div className="grid md:grid-cols-3 gap-8">
                  {[
                     { icon: Zap, color: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/8', border: 'hover:border-[#D4AF37]/40', title: 'Giám Định Thần Tốc', desc: 'Deep Learning tiên tiến nhận diện chính xác triều đại trong dưới 10 giây từ một tấm hình duy nhất.', tag: '< 10s' },
                     { icon: Database, color: 'text-blue-400', bg: 'bg-blue-500/8', border: 'hover:border-blue-400/40', title: 'Kho Sử Liệu Đồ Sộ', desc: 'Hàng chục nghìn mẫu tiền cổ từ Đinh, Lý, Trần, Lê đến nhà Nguyễn cuối cùng của lịch sử Việt.', tag: '10.000+ mẫu' },
                     { icon: Shield, color: 'text-green-400', bg: 'bg-green-500/8', border: 'hover:border-green-400/40', title: 'Hệ Thống Đồng Thuận', desc: 'Kiến trúc 4 lớp: ResNet34, PaddleOCR, Gemini Vision và Google Search đối chiếu chéo kết quả.', tag: '4-Layer AI' },
                  ].map((f, i) => (
                     <div key={i} className={`glass-card p-10 rounded-[32px] border border-white/5 ${f.border} transition-all group relative overflow-hidden reveal`} style={{ transitionDelay: `${i * 100}ms` }}>
                        <div className="absolute top-0 right-0 px-3 py-1 m-4 rounded-full bg-white/5 text-[9px] uppercase tracking-widest text-gray-500 font-bold">{f.tag}</div>
                        <div className={`w-16 h-16 ${f.bg} rounded-2xl flex items-center justify-center ${f.color} mb-8 group-hover:scale-110 transition-transform`}>
                           <f.icon size={28} />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-white">{f.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed italic font-serif">{f.desc}</p>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* ===== HOW IT WORKS ===== */}
         <section className="py-32 px-6 relative">
            <div className="max-w-4xl mx-auto">
               <header className="text-center mb-20">
                  <p className="text-[10px] text-[#D4AF37] uppercase tracking-[5px] mb-4 font-black">Quy Trình</p>
                  <h2 className="text-4xl font-sans font-black gold-gradient-text tracking-[2px] leading-relaxed pt-2">CÁCH HOẠT ĐỘNG</h2>
               </header>

               <div className="space-y-6">
                  {[
                     { step: '01', title: 'Chụp ảnh đồng xu', desc: 'Tải lên ảnh đồng xu cổ từ điện thoại hoặc máy tính. Hỗ trợ JPG, PNG, WEBP.', icon: '📸' },
                     { step: '02', title: 'AI phân tích đa tầng', desc: 'Hệ thống 4 lớp (ResNet, OCR, Gemini, Search) phân tích và xác thực chéo kết quả trong vài giây.', icon: '🤖' },
                     { step: '03', title: 'Nhận kết quả chi tiết', desc: 'Triều đại, chữ Hán, độ tin cậy, ghi chú lịch sử — tất cả trong một báo cáo đầy đủ.', icon: '📜' },
                  ].map((s, i) => (
                     <div key={i} className="flex items-start gap-8 glass-card p-8 rounded-3xl border border-white/5 hover:border-[#D4AF37]/20 transition-all group">
                        <div className="text-4xl">{s.icon}</div>
                        <div className="flex-1">
                           <div className="flex items-center gap-4 mb-2">
                              <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[4px]">Bước {s.step}</span>
                              <div className="h-[1px] flex-1 bg-white/5"></div>
                           </div>
                           <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#D4AF37] transition-colors">{s.title}</h3>
                           <p className="text-gray-500 text-sm font-serif italic">{s.desc}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* ===== CTA ===== */}
         <section id="cta" className="py-16 md:py-40 px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center relative">
               <div className="absolute inset-0 bg-[#D4AF37]/5 rounded-[24px] md:rounded-[40px] blur-3xl"></div>
               <div className="historical-certificate p-6 md:p-24 rounded-[24px] md:rounded-[40px] relative overflow-hidden border border-[#D4AF37]/15">
                  <div className="absolute top-4 left-4 md:top-6 md:left-6 text-4xl md:text-6xl font-serif text-[#D4AF37]/8 select-none">寶</div>
                  <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 text-4xl md:text-6xl font-serif text-[#D4AF37]/8 select-none">錢</div>

                  <div className="flex justify-center mb-6 md:mb-8">
                     {[Star, Star, Star, Star, Star].map((S, i) => <S key={i} size={14} className="text-[#D4AF37]" fill="#D4AF37" />)}
                  </div>

                  <h2 className="text-2xl md:text-5xl font-sans font-black tracking-[2px] md:tracking-[3px] mb-4 md:mb-6 flex flex-col gap-1 md:gap-2">
                     <span className="gold-gradient-text pt-2 md:pt-4 pb-1 md:pb-2">BẮT ĐẦU HÀNH TRÌNH</span>
                     <span className="gold-gradient-text pt-1 md:pt-4 pb-1 md:pb-2">KHẢO CỔ SỐ</span>
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 font-serif italic mb-6 md:mb-12 max-w-xl mx-auto px-2">
                     Tham gia cộng đồng nhà sưu tầm và đam mê lịch sử để giải mã những đồng tiền cổ Việt Nam ngay hôm nay.
                  </p>
                  <button
                     onClick={handleGetStarted}
                     className="group btn-premium btn-gold px-8 md:px-16 py-4 md:py-6 rounded-xl md:rounded-2xl text-xs md:text-sm font-black uppercase tracking-[2px] md:tracking-[4px] shadow-2xl active:scale-95 transition-all flex items-center gap-2 md:gap-4 mx-auto overflow-hidden relative"
                  >
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                     <Sparkles size={14} />
                     Khởi Hành Ngay
                     <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                  </button>
               </div>
            </div>
         </section>

         {/* ===== FOOTER ===== */}
         <footer className="relative border-t border-white/5 px-6 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"></div>
            <div className="absolute right-12 top-1/2 -translate-y-1/2 text-[120px] font-serif text-[#D4AF37]/3 select-none pointer-events-none">史</div>
            <div className="max-w-7xl mx-auto py-16">
               <div className="grid md:grid-cols-3 gap-12 mb-12">
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <img src="/assets/logo.png" alt="VietCoin AI Logo" className="w-10 h-10 rounded-full border border-[#D4AF37]/30" />
                        <div>
                           <h4 className="text-lg font-sans font-black gold-gradient-text tracking-[2px]">VIETCOIN AI</h4>
                           <p className="text-[9px] text-gray-600 uppercase tracking-[3px]">The Heritage Sentinel</p>
                        </div>
                     </div>
                     <p className="text-xs text-gray-600 leading-relaxed font-serif italic max-w-xs">
                        Nền tảng giám định tiền cổ Việt Nam bằng trí tuệ nhân tạo — kết nối di sản ngàn năm với thế hệ hiện đại.
                     </p>
                     <div className="flex items-center gap-2 pt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_6px_#22c55e]"></div>
                        <span className="text-[10px] text-gray-600 uppercase tracking-widest">Hệ thống đang hoạt động</span>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <p className="text-[10px] text-[#D4AF37] uppercase tracking-[4px] font-black mb-5">Điều hướng</p>
                     <div className="space-y-3">
                        {[
                           { label: 'Về đầu trang', id: 'top' },
                           { label: 'Thống kê AI', id: 'features' },
                           { label: 'Triều đại hỗ trợ', id: 'dynasties' },
                           { label: 'Bắt đầu ngay', id: 'onGetStarted' },
                        ].map((link, i) => (
                           <button
                              key={i}
                              onClick={(e) => {
                                 if (link.id === 'onGetStarted') {
                                    handleGetStarted(e);
                                 } else {
                                    document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
                                 }
                              }}
                              className="block text-[11px] text-gray-500 hover:text-[#D4AF37] transition-colors uppercase tracking-wider font-medium text-left"
                           >
                              → {link.label}
                           </button>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-4">
                     <p className="text-[10px] text-[#D4AF37] uppercase tracking-[4px] font-black mb-5">Thông tin</p>
                     <div className="space-y-4">
                        <div className="flex items-start gap-3">
                           <span className="text-[#D4AF37]/50 text-xs mt-0.5">🤖</span>
                           <p className="text-[11px] text-gray-500">ResNet34 + OCR + Gemini + Search<br />4-Layer Consensus Architecture</p>
                        </div>
                        <div className="flex items-start gap-3">
                           <span className="text-[#D4AF37]/50 text-xs mt-0.5">🏛️</span>
                           <p className="text-[11px] text-gray-500">10 triều đại • 10.000+ mẫu<br />Độ chính xác ~95%</p>
                        </div>
                        <div className="flex items-start gap-3">
                           <span className="text-[#D4AF37]/50 text-xs mt-0.5">📅</span>
                           <p className="text-[11px] text-gray-500">Phiên bản 1.0 Beta • 2026</p>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-[10px] text-gray-700">© 2026 VietCoin AI Team. Tất cả quyền lợi được bảo lưu.</p>
                  <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[2px] text-gray-600">
                     <button onClick={() => setModal('terms')} className="hover:text-[#D4AF37] transition-colors">Điều khoản</button>
                     <button onClick={() => setModal('privacy')} className="hover:text-[#D4AF37] transition-colors">Bảo mật</button>
                     <button onClick={() => setModal('contact')} className="hover:text-[#D4AF37] transition-colors">Liên hệ</button>
                  </div>
               </div>
            </div>
         </footer>

         {/* ===== MODALS ===== */}
         {modal && (
            <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setModal(null)}>
               <div className="bg-[#111114] border border-white/10 rounded-[32px] p-10 max-w-lg w-full relative shadow-2xl" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setModal(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors text-xl">✕</button>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent"></div>

                  {modal === 'terms' && (
                     <>
                        <h3 className="text-xl font-serif font-black gold-gradient-text tracking-[2px] mb-6">ĐIỀU KHOẢN SỬ DỤNG</h3>
                        <div className="space-y-4 text-sm text-gray-400 font-serif italic leading-relaxed">
                           <p>1. <strong className="text-white not-italic">Chấp nhận điều khoản:</strong> Khi sử dụng VietCoin AI, bạn đồng ý tuân theo các điều khoản này.</p>
                           <p>2. <strong className="text-white not-italic">Mục đích sử dụng:</strong> Dịch vụ chỉ dùng cho mục đích nghiên cứu, sưu tầm và học thuật về tiền cổ Việt Nam.</p>
                           <p>3. <strong className="text-white not-italic">Tokens:</strong> Tokens được nạp vào tài khoản không hoàn lại. Mỗi lần nhận diện tiêu tốn 0.2 tokens.</p>
                           <p>4. <strong className="text-white not-italic">Giới hạn trách nhiệm:</strong> Kết quả AI chỉ mang tính tham khảo, không thay thế cho ý kiến chuyên gia khảo cổ.</p>
                           <p>5. <strong className="text-white not-italic">Sở hữu trí tuệ:</strong> Toàn bộ nội dung, mô hình AI và dữ liệu thuộc sở hữu của VietCoin AI Team.</p>
                        </div>
                     </>
                  )}

                  {modal === 'privacy' && (
                     <>
                        <h3 className="text-xl font-serif font-black gold-gradient-text tracking-[2px] mb-6">CHÍNH SÁCH BẢO MẬT</h3>
                        <div className="space-y-4 text-sm text-gray-400 font-serif italic leading-relaxed">
                           <p>1. <strong className="text-white not-italic">Thu thập dữ liệu:</strong> Chúng tôi lưu trữ email, tên đăng nhập và ảnh bạn tải lên để phục vụ nhận diện.</p>
                           <p>2. <strong className="text-white not-italic">Sử dụng dữ liệu:</strong> Ảnh được gửi đến Gemini Vision API để phân tích, không lưu trữ vĩnh viễn.</p>
                           <p>3. <strong className="text-white not-italic">Bảo mật:</strong> Mật khẩu được mã hóa bằng bcrypt. Token JWT có hiệu lực 24 giờ.</p>
                           <p>4. <strong className="text-white not-italic">Chia sẻ:</strong> Chúng tôi không bán hoặc chia sẻ dữ liệu cá nhân cho bên thứ ba.</p>
                           <p>5. <strong className="text-white not-italic">Quyền người dùng:</strong> Bạn có quyền yêu cầu xóa tài khoản và toàn bộ dữ liệu liên quan bất kỳ lúc nào.</p>
                        </div>
                     </>
                  )}

                  {modal === 'contact' && (
                     <>
                        <h3 className="text-xl font-serif font-black gold-gradient-text tracking-[2px] mb-6">LIÊN HỆ</h3>
                        <div className="space-y-5 text-sm text-gray-400">
                           <div className="flex items-start gap-4 p-4 bg-white/3 rounded-2xl border border-white/5">
                              <span className="text-2xl">📧</span>
                              <div>
                                 <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest mb-1 font-bold">Email hỗ trợ</p>
                                 <p className="font-serif italic">support@vietcoin.ai</p>
                              </div>
                           </div>
                           <div className="flex items-start gap-4 p-4 bg-white/3 rounded-2xl border border-white/5">
                              <span className="text-2xl">🏛️</span>
                              <div>
                                 <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest mb-1 font-bold">Đơn vị phát triển</p>
                                 <p className="font-serif italic">VietCoin AI Team • Dự án nghiên cứu bảo tồn di sản tiền cổ Việt Nam</p>
                              </div>
                           </div>
                           <div className="flex items-start gap-4 p-4 bg-white/3 rounded-2xl border border-white/5">
                              <span className="text-2xl">⏰</span>
                              <div>
                                 <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest mb-1 font-bold">Thời gian phản hồi</p>
                                 <p className="font-serif italic">Trong vòng 24–48 giờ làm việc</p>
                              </div>
                           </div>
                        </div>
                     </>
                  )}
               </div>
            </div>
         )}

         <style>{`
            @keyframes float {
               from { transform: translateY(0px) rotate(0deg); opacity: 0.03; }
               to { transform: translateY(-20px) rotate(5deg); opacity: 0.07; }
            }
            @keyframes ripple {
               0% { width: 0; height: 0; opacity: 1; border-width: 2px; }
               100% { width: 150px; height: 150px; opacity: 0; border-width: 0px; }
            }
         `}</style>
      </div>
   );
};

export default LandingView;
