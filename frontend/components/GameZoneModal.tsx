import React, { useState, useEffect, useRef } from 'react';
import { X, Trophy, Gamepad2, Sparkles, Coins, RotateCw, Play, Award, CheckCircle } from 'lucide-react';
import { api } from '../api';
import toast from 'react-hot-toast';

interface GameZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onBalanceUpdate: (newBalance: number) => void;
}

const DRUM_SECTIONS = [
  { label: '0.2 TOKENS', value: 0.2, grad: 'url(#grad-gold)', desc: 'Lộc nhỏ đầu xuân', textColor: 'text-white' },
  { label: 'MAY MẮN 🍀', value: 0, grad: 'url(#grad-charcoal)', desc: 'Chúc may mắn lần sau', textColor: 'text-gray-400' },
  { label: 'QUAY TIẾP 🌀', value: -1, grad: 'url(#grad-bronze)', desc: 'Nhận thêm 1 lượt', textColor: 'text-white' },
  { label: '0.2 TOKENS', value: 0.2, grad: 'url(#grad-gold)', desc: 'Lộc nhỏ đầu xuân', textColor: 'text-white' },
  { label: 'MAY MẮN 🍀', value: 0, grad: 'url(#grad-charcoal)', desc: 'Chúc may mắn lần sau', textColor: 'text-gray-400' },
  { label: 'TẶNG 2 LƯỢT', value: -2, grad: 'url(#grad-crimson)', desc: 'Tặng ngay 2 lượt quay!', textColor: 'text-[#FFD700]' },
  { label: '0.2 TOKENS', value: 0.2, grad: 'url(#grad-gold)', desc: 'Lộc nhỏ đầu xuân', textColor: 'text-white' },
  { label: 'MAY MẮN 🍀', value: 0, grad: 'url(#grad-charcoal)', desc: 'Chúc may mắn lần sau', textColor: 'text-gray-400' },
  { label: '1.0 TOKEN 👑', value: 1.0, grad: 'url(#grad-gold)', desc: 'Đại Hùng Bảo', textColor: 'text-[#FFD700]' },
  { label: '0.2 TOKENS', value: 0.2, grad: 'url(#grad-gold)', desc: 'Lộc nhỏ đầu xuân', textColor: 'text-white' },
  { label: 'MAY MẮN 🍀', value: 0, grad: 'url(#grad-charcoal)', desc: 'Chúc may mắn lần sau', textColor: 'text-gray-400' },
  { label: 'QUAY TIẾP 🌀', value: -1, grad: 'url(#grad-bronze)', desc: 'Nhận thêm 1 lượt', textColor: 'text-white' },
];

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const MEMORY_CARDS_POOL = [
  { id: '1a', type: 'coin', label: 'Đồng Thái Bình Hưng Bảo', han: '太平興寶', matchId: '1' },
  { id: '1b', type: 'dynasty', label: 'Triều Nhà Đinh (968)', han: '丁', matchId: '1' },
  { id: '2a', type: 'coin', label: 'Đồng Thiên Hưng Thông Bảo', han: '天興通寶', matchId: '2' },
  { id: '2b', type: 'dynasty', label: 'Triều Nhà Lê Sơ (1428)', han: '黎', matchId: '2' },
  { id: '3a', type: 'coin', label: 'Đồng Cảnh Hưng Thông Bảo', han: '景興通寶', matchId: '3' },
  { id: '3b', type: 'dynasty', label: 'Triều Lê Trung Hưng (1533)', han: '黎', matchId: '3' },
  { id: '4a', type: 'coin', label: 'Đồng Minh Mạng Thông Bảo', han: '明命通寶', matchId: '4' },
  { id: '4b', type: 'dynasty', label: 'Triều Nhà Nguyễn (1802)', han: '阮', matchId: '4' },
  { id: '5a', type: 'coin', label: 'Đồng Quang Trung Thông Bảo', han: '光中通寶', matchId: '5' },
  { id: '5b', type: 'dynasty', label: 'Triều Nhà Tây Sơn (1778)', han: '西山', matchId: '5' },
  { id: '6a', type: 'coin', label: 'Đồng Đại Định Thông Bảo', han: '大定通寶', matchId: '6' },
  { id: '6b', type: 'dynasty', label: 'Triều Nhà Lý (1009)', han: '李', matchId: '6' },
];

const GameZoneModal: React.FC<GameZoneModalProps> = ({ isOpen, onClose, user, onBalanceUpdate }) => {
  const [activeTab, setActiveTab] = useState<'spin' | 'memory'>('spin');
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<any>(null);
  const [rotation, setRotation] = useState(0);
  const [hasSpunToday, setHasSpunToday] = useState(false);
  const [remainingSpins, setRemainingSpins] = useState(1);
  
  // Memory Game State
  const [cards, setCards] = useState<any[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryFailedMoves, setMemoryFailedMoves] = useState(0);
  const [memoryTime, setMemoryTime] = useState(0);
  const [isMemoryPlaying, setIsMemoryPlaying] = useState(false);
  const [hasWonMemory, setHasWonMemory] = useState(false);
  const [hasWonMemoryToday, setHasWonMemoryToday] = useState(false);
  const [hasLostMemoryToday, setHasLostMemoryToday] = useState(false);
  const [memoryClaimed, setMemoryClaimed] = useState(false);

  const memoryTimerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    // Check Daily Limits from LocalStorage
    const today = new Date().toDateString();
    const lastSpin = localStorage.getItem(`last_spin_${user?.id}`);
    const lastMemory = localStorage.getItem(`last_memory_${user?.id}`);
    const lastMemoryLost = localStorage.getItem(`last_memory_lost_${user?.id}`);
    const storedExtra = parseInt(localStorage.getItem(`extra_spins_${user?.id}`) || "0", 10);
    
    setHasWonMemoryToday(lastMemory === today);
    setHasLostMemoryToday(lastMemoryLost === today);
    
    const baseSpins = lastSpin === today ? 0 : 1;
    setRemainingSpins(baseSpins + storedExtra);
    setHasSpunToday(lastSpin === today && storedExtra <= 0);
    
    // Initialize Memory cards
    resetMemoryGame();

    return () => {
      if (memoryTimerRef.current) clearInterval(memoryTimerRef.current);
    };
  }, [isOpen, user]);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = (): AudioContext | null => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtxClass) return null;
        audioCtxRef.current = new AudioCtxClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      return ctx;
    } catch (e) {
      return null;
    }
  };

  if (!isOpen) return null;

  // Premium Custom Web Audio Synth for ticking/winning sound
  const playSound = (type: 'tick' | 'win' | 'flip' | 'lose' | 'match' | 'mismatch') => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      
      if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'flip') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(250, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'match') {
        const notes = [1046.50, 1318.51];
        notes.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08);
          gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
          gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + i * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.08 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + i * 0.08 + 0.3);
        });
      } else if (type === 'mismatch') {
        const notes = [150, 120];
        notes.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.12);
          gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
          gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + i * 0.12 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.12 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.12);
          osc.stop(ctx.currentTime + i * 0.12 + 0.2);
        });
      } else if (type === 'win') {
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08);
          gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
          gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + i * 0.08 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.08 + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + i * 0.08 + 0.6);
        });
      } else if (type === 'lose') {
        const notes = [261.63, 220.00, 174.61, 130.81];
        notes.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.15);
          gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
          gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + i * 0.15 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.15 + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.15);
          osc.stop(ctx.currentTime + i * 0.15 + 0.6);
        });
      }
    } catch (e) {}
  };

  // ================= DAILY SPIN LOGIC =================
  const handleSpin = async () => {
    if (isSpinning || remainingSpins <= 0) return;

    if (!user) {
      toast.error("Vui lòng đăng nhập để lưu kết quả game 🔑");
      return;
    }

    setIsSpinning(true);
    setSpinResult(null);
    
    // Decrement spins in state immediately
    const nextSpins = remainingSpins - 1;
    setRemainingSpins(nextSpins);

    // Dynamic rotation math
    const totalSlices = DRUM_SECTIONS.length;
    const randomIndex = Math.floor(Math.random() * totalSlices);
    const sliceAngle = 360 / totalSlices;
    
    // Target angle points to the center of selected slice, aligning it under the 12 o'clock pointer (270 degrees)
    const targetAngle = (270 - (randomIndex * sliceAngle) - (sliceAngle / 2) + 360) % 360;
    // Spin 8 full rounds, then stop exactly at the target slice
    const finalRot = rotation + (360 * 8) + targetAngle - (rotation % 360);
    
    setRotation(finalRot);

    // Web Audio ticking sounds during rotation
    let duration = 4000;
    let ticks = 24;
    for (let i = 0; i < ticks; i++) {
      const easeVal = Math.pow(i / ticks, 2);
      setTimeout(() => playSound('tick'), easeVal * duration);
    }

    setTimeout(async () => {
      setIsSpinning(false);
      const wonSlice = DRUM_SECTIONS[randomIndex];
      setSpinResult(wonSlice);
      playSound('win');

      const today = new Date().toDateString();

      if (wonSlice.value > 0) {
        try {
          const res = await api.claimGameTokens({
            game_type: 'spin',
            reward_amount: wonSlice.value,
            description: `Trúng giải ${wonSlice.label} từ Vòng quay Đông Sơn`
          });
          
          if (res && res.new_balance !== undefined) {
            onBalanceUpdate(res.new_balance);
            toast.success(`Chúc mừng! Bạn đã trúng ${wonSlice.value} Tokens! 🎁`);
          }
        } catch (e) {
          toast.error("Không thể ghi nhận thưởng.");
        }
      }

      // Handle extra spins or normal outcomes
      let finalSpins = nextSpins;
      if (wonSlice.value === -1) {
        // Tặng 1 lượt quay (Quay tiếp)
        finalSpins = nextSpins + 1;
        setRemainingSpins(finalSpins);
        toast.success("Tuyệt vời! Bạn nhận thêm 1 lượt quay miễn phí nữa! 🌀");
      } else if (wonSlice.value === -2) {
        // Tặng 2 lượt quay
        finalSpins = nextSpins + 2;
        setRemainingSpins(finalSpins);
        toast.success("Đại cát! Bạn được tặng thêm 2 lượt quay may mắn! 🌀🌀");
      } else if (wonSlice.value === 0) {
        toast.error("Chúc may mắn lần sau nhé! 🍀");
      }

      // Save persistence
      if (finalSpins > 0) {
        // Still has spins left today (either because of extra spins won, or had leftover extra spins)
        localStorage.setItem(`extra_spins_${user?.id}`, finalSpins.toString());
        setHasSpunToday(false);
      } else {
        // 0 spins left
        localStorage.setItem(`last_spin_${user?.id}`, today);
        localStorage.setItem(`extra_spins_${user?.id}`, "0");
        setHasSpunToday(true);
      }
    }, duration);
  };

  // ================= MEMORY GAME LOGIC =================
  const resetMemoryGame = () => {
    const shuffled = [...MEMORY_CARDS_POOL]
      .sort(() => Math.random() - 0.5)
      .map((c, i) => ({ ...c, index: i, isFlipped: false, isMatched: false }));
    setCards(shuffled);
    setSelectedCards([]);
    setMatchedPairs([]);
    setMemoryMoves(0);
    setMemoryFailedMoves(0);
    setMemoryTime(0);
    setIsMemoryPlaying(false);
    setHasWonMemory(false);
    setMemoryClaimed(false);
    if (memoryTimerRef.current) clearInterval(memoryTimerRef.current);
  };

  const startMemoryGame = () => {
    if (hasLostMemoryToday) {
      toast.error("Trò chơi kết thúc, hẹn quý khách ngày hôm sau! ❌");
      return;
    }
    resetMemoryGame();
    setIsMemoryPlaying(true);
    memoryTimerRef.current = setInterval(() => {
      setMemoryTime(t => t + 1);
    }, 1000);
  };

  const handleMemoryLoss = () => {
    setIsMemoryPlaying(false);
    if (memoryTimerRef.current) clearInterval(memoryTimerRef.current);
    playSound('lose');
    
    const today = new Date().toDateString();
    localStorage.setItem(`last_memory_lost_${user?.id}`, today);
    setHasLostMemoryToday(true);
    toast.error("Trò chơi kết thúc, hẹn quý khách ngày hôm sau! ❌");
  };

  const handleCardClick = (idx: number) => {
    if (!isMemoryPlaying || cards[idx].isFlipped || cards[idx].isMatched || selectedCards.length >= 2) return;

    playSound('flip');
    const updated = [...cards];
    updated[idx].isFlipped = true;
    setCards(updated);

    const nextSelected = [...selectedCards, idx];
    setSelectedCards(nextSelected);

    if (nextSelected.length === 2) {
      setMemoryMoves(m => m + 1);
      const [firstIdx, secondIdx] = nextSelected;
      
      if (cards[firstIdx].matchId === cards[secondIdx].matchId) {
        // MATCHED!
        setTimeout(() => {
          const matched = [...cards];
          matched[firstIdx].isMatched = true;
          matched[secondIdx].isMatched = true;
          setCards(matched);
          setSelectedCards([]);
          playSound('match');

          const newPairs = [...matchedPairs, cards[firstIdx].matchId];
          setMatchedPairs(newPairs);

          // WIN CHECK
          if (newPairs.length === MEMORY_CARDS_POOL.length / 2) {
            handleMemoryWin();
          }
        }, 500);
      } else {
        // NO MATCH -> FLIP BACK
        const newFailed = memoryFailedMoves + 1;
        setMemoryFailedMoves(newFailed);

        if (newFailed >= 10) {
          setTimeout(() => {
            handleMemoryLoss();
          }, 800);
        } else {
          playSound('mismatch');
          setTimeout(() => {
            const reset = [...cards];
            reset[firstIdx].isFlipped = false;
            reset[secondIdx].isFlipped = false;
            setCards(reset);
            setSelectedCards([]);
          }, 1200);
        }
      }
    }
  };

  const handleMemoryWin = async () => {
    setIsMemoryPlaying(false);
    if (memoryTimerRef.current) clearInterval(memoryTimerRef.current);
    setHasWonMemory(true);
    playSound('win');

    if (hasWonMemoryToday) {
      toast.success("Bản lĩnh khảo cổ đáng nể! Tuy nhiên hôm nay bạn đã nhận thưởng rồi nhé.");
      return;
    }

    try {
      setMemoryClaimed(true);
      const res = await api.claimGameTokens({
        game_type: 'memory',
        reward_amount: 0.5,
        description: `Hoàn thành Thẻ bài di sản trong ${memoryTime}s với ${memoryMoves} lượt`
      });
 
      if (res && res.new_balance !== undefined) {
        onBalanceUpdate(res.new_balance);
        const today = new Date().toDateString();
        localStorage.setItem(`last_memory_${user?.id}`, today);
        setHasWonMemoryToday(true);
        toast.success("Chúc mừng bạn được cộng 0.5 Tokens vào ví! 💰");
      }
    } catch (e) {
      toast.error("Không thể ghi nhận thưởng.");
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0B0B0D]/90 backdrop-blur-xl z-[999] flex justify-center p-4 overflow-y-auto animate-fade">
      <div className="glass-card w-full max-w-5xl rounded-[40px] border border-white/10 flex flex-col overflow-hidden shadow-2xl relative my-auto">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50"></div>
        
        {/* HEADER */}
        <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                <Gamepad2 size={22} />
             </div>
             <div>
                <h3 className="text-xl font-cinzel font-black gold-gradient-text">Không Gian Trò Chơi Di Sản</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Thử thách khảo cổ học và may mắn hoàng gia</p>
             </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5 gap-2">
              <button
                onClick={() => setActiveTab('spin')}
                className={`flex items-center gap-2 py-2 px-4 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'spin'
                    ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30"
                    : "text-gray-500 hover:text-gray-300 border border-transparent"
                }`}
              >
                <RotateCw size={14} /> VÒNG QUAY ĐÔNG SƠN
              </button>
              <button
                onClick={() => setActiveTab('memory')}
                className={`flex items-center gap-2 py-2 px-4 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'memory'
                    ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30"
                    : "text-gray-500 hover:text-gray-300 border border-transparent"
                }`}
              >
                <Trophy size={14} /> THẺ BÀI DI SẢN
              </button>
            </div>

            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors" aria-label="Close modal">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 md:p-10 flex-1 flex flex-col items-center justify-center min-h-[380px] sm:min-h-[480px]">
          
          {/* TAB 1: DAILY SPIN */}
          {activeTab === 'spin' && (
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-12 max-w-4xl">
              
              {/* DRUM WHEEL CONTAINER */}
              <div className="relative w-80 h-80 md:w-[400px] md:h-[400px] flex items-center justify-center">
                {/* Pin pointer */}
                <div className="absolute top-[-22px] left-1/2 -translate-x-1/2 w-8 h-12 z-30 drop-shadow-[0_0_15px_rgba(212,175,55,0.75)] pointer-events-none">
                  <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[36px] border-t-[#FFD700] drop-shadow-[0_4px_5px_rgba(0,0,0,0.5)]"></div>
                  <div className="w-4 h-4 bg-white rounded-full absolute top-[-6px] left-1/2 -translate-x-1/2 border-2 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/50"></div>
                </div>

                {/* Rotating Drum */}
                <div 
                  className="w-full h-full rounded-full border-[6px] border-[#D4AF37] shadow-[0_0_35px_rgba(212,175,55,0.4)] relative overflow-hidden transition-transform duration-[4000ms] ease-out bg-[#121216]"
                  style={{ 
                    transform: `rotate(${rotation}deg)`,
                  }}
                >
                  <svg viewBox="0 0 400 400" className="w-full h-full">
                    <defs>
                      <linearGradient id="grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFF099" />
                        <stop offset="35%" stopColor="#D4AF37" />
                        <stop offset="70%" stopColor="#AA7C11" />
                        <stop offset="100%" stopColor="#604207" />
                      </linearGradient>
                      <linearGradient id="grad-charcoal" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3A3A4A" />
                        <stop offset="50%" stopColor="#1C1C24" />
                        <stop offset="100%" stopColor="#0E0E12" />
                      </linearGradient>
                      <linearGradient id="grad-bronze" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#E2A76F" />
                        <stop offset="50%" stopColor="#CD7F32" />
                        <stop offset="100%" stopColor="#5C2B05" />
                      </linearGradient>
                      <linearGradient id="grad-crimson" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF4D4D" />
                        <stop offset="50%" stopColor="#9B1C1C" />
                        <stop offset="100%" stopColor="#5F0A0A" />
                      </linearGradient>
                    </defs>

                    {DRUM_SECTIONS.map((slice, i) => {
                      const totalSlices = DRUM_SECTIONS.length;
                      const sliceAngle = 360 / totalSlices;
                      const startAngle = i * sliceAngle;
                      const endAngle = (i + 1) * sliceAngle;
                      const middleAngle = startAngle + sliceAngle / 2;

                      // Assign gradient directly from slice definition
                      const fillGrad = slice.grad || "url(#grad-charcoal)";

                      // Calculate SVG Arc coordinates
                      const start = polarToCartesian(200, 200, 200, endAngle);
                      const end = polarToCartesian(200, 200, 200, startAngle);
                      
                      const pathData = [
                        'M', 200, 200,
                        'L', start.x, start.y,
                        'A', 200, 200, 0, 0, 0, end.x, end.y,
                        'Z'
                      ].join(' ');

                      return (
                        <g key={i}>
                          {/* Sector slice path */}
                          <path 
                            d={pathData} 
                            fill={fillGrad} 
                            stroke="#D4AF37" 
                            strokeWidth="3.5"
                          />
                          
                          {/* Rotated text element */}
                          <g transform={`rotate(${middleAngle}, 200, 200)`}>
                            <text 
                              x="200" 
                              y="52" 
                              textAnchor="middle" 
                              fill={slice.textColor === 'text-[#FFD700]' ? '#FFD700' : '#FFFFFF'} 
                              fontWeight="900" 
                              fontSize="8" 
                              letterSpacing="0.2"
                              className="font-sans select-none tracking-wider font-extrabold"
                              style={{ 
                                textShadow: '0 2px 4px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.85)'
                              }}
                            >
                              {slice.label}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Central star overlay for authentic drum aesthetics */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-2 border-[#D4AF37] bg-[#16161c] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-[#D4AF37]/30 flex items-center justify-center star-dongson animate-pulse bg-gradient-to-br from-black to-[#1A1A22]">
                        <Coins size={24} className="text-[#D4AF37] drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* INFORMATION & ACTIONS */}
              <div className="flex-1 flex flex-col justify-center space-y-6 max-w-sm text-center md:text-left">
                <div className="inline-flex items-center justify-center md:justify-start gap-2 text-xs text-[#D4AF37] font-bold tracking-widest uppercase">
                  <Sparkles size={14} className="animate-spin" /> Vòng Quay Hoàng Tộc
                </div>
                <h4 className="text-3xl font-cinzel font-black text-white">Xoay Kim Lộc Đông Sơn</h4>
                <p className="text-sm text-gray-400 font-serif italic leading-relaxed">
                  Thiết kế lấy cảm hứng từ cấu trúc trống đồng Đông Sơn. Thử vận may mỗi ngày để tích lũy xu di sản đúc bằng AI.
                </p>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-center text-xs text-gray-500 uppercase tracking-widest font-black">
                    <span>Lượt quay còn lại</span>
                    <span className={remainingSpins > 0 ? "text-green-400 font-bold animate-pulse" : "text-red-400 font-bold"}>
                      {remainingSpins > 0 ? `${remainingSpins} lượt sẵn sàng` : "Đã hết lượt hôm nay"}
                    </span>
                  </div>
                  <div className="h-[1px] bg-white/5"></div>
                  <div className="flex justify-between items-center text-xs text-gray-500 uppercase tracking-widest font-black">
                    <span>Tài khoản ví</span>
                    <span className="text-white font-bold">{user?.token_balance} Tokens</span>
                  </div>
                </div>

                <button
                  disabled={isSpinning || remainingSpins <= 0}
                  onClick={handleSpin}
                  className="group relative w-full py-5 rounded-2xl btn-premium btn-gold text-sm font-black uppercase tracking-[3px] shadow-lg disabled:opacity-30 disabled:scale-100 transition-all flex items-center justify-center gap-3 overflow-hidden"
                >
                  <RotateCw size={16} className={isSpinning ? "animate-spin" : ""} />
                  {isSpinning ? "Đang đúc tài lộc..." : remainingSpins > 0 ? `Khai Kim Quay Thưởng (${remainingSpins})` : "Hẹn Ngày Mai 👋"}
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: HERITAGE MEMORY */}
          {activeTab === 'memory' && (
            <div className="w-full flex flex-col items-center justify-center space-y-6">
              
              {/* GAME CONTROL AND PANEL */}
              <div className="w-full max-w-3xl flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-6">
                  <div className="text-xs text-gray-500 uppercase font-black tracking-widest">
                    Thời gian: <span className="text-white font-mono text-sm">{memoryTime}s</span>
                  </div>
                  <div className="text-xs text-gray-500 uppercase font-black tracking-widest">
                    Lật trượt: <span className={`font-mono text-sm font-black px-2 py-0.5 rounded transition-all ${memoryFailedMoves >= 8 ? 'bg-red-500/20 text-red-500 animate-pulse border border-red-500/30' : 'text-[#D4AF37]'}`}>{memoryFailedMoves}/10</span>
                  </div>
                  <div className="text-xs text-gray-500 uppercase font-black tracking-widest">
                    Ghép khớp: <span className="text-white font-mono text-sm">{matchedPairs.length}/6</span>
                  </div>
                </div>

                {isMemoryPlaying && (
                  <button
                    onClick={resetMemoryGame}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 py-2 px-5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-all animate-fade"
                  >
                    Chơi lại
                  </button>
                )}
              </div>

              {/* GAME GRID */}
              <div className="w-full max-w-3xl min-h-[380px] flex items-center justify-center">
                {!isMemoryPlaying && !hasWonMemory ? (
                  <div className="text-center py-6 max-w-2xl space-y-6 animate-fade">
                    {hasLostMemoryToday ? (
                      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto shadow-[0_0_20px_rgba(239,68,68,0.25)] animate-pulse">
                        <X size={28} />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#CD7F32]/10 flex items-center justify-center text-[#D4AF37] mx-auto shadow-[0_0_20px_rgba(212,175,55,0.25)]">
                        <Trophy size={28} className="animate-bounce" />
                      </div>
                    )}
                    
                    <h4 className="text-2xl font-cinzel font-black gold-gradient-text tracking-wider">
                      {hasLostMemoryToday ? "TRÒ CHƠI KẾT THÚC" : "Thử Tài Khảo Cổ Thẻ Bài"}
                    </h4>
                    
                    {hasLostMemoryToday ? (
                      <div className="bg-[#121215]/90 border border-red-500/20 rounded-3xl p-8 text-center space-y-4 shadow-2xl relative overflow-hidden max-w-md mx-auto">
                        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent"></div>
                        <p className="text-sm font-serif text-red-400 font-extrabold tracking-widest uppercase">
                          ⚠️ ĐÃ HẾT LƯỢT CHƠI HÔM NAY ⚠️
                        </p>
                        <p className="text-gray-300 text-xs font-serif leading-relaxed">
                          Quý khách đã lật trượt quá 10 lần trong ngày hôm nay. Trò chơi kết thúc, hẹn quý khách ngày hôm sau quay lại thử tài!
                        </p>
                        <div className="pt-2">
                          <span className="inline-block bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse">
                            Hẹn gặp lại quý khách ngày mai! 🏛️
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#121215]/90 border border-[#D4AF37]/15 rounded-3xl p-6 text-left space-y-4 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37]/45 to-transparent"></div>
                        <p className="text-xs text-[#D4AF37] uppercase tracking-[4px] font-black text-center mb-2">📜 HƯỚNG DẪN LUẬT CHƠI CHI TIẾT</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="flex gap-3 items-start p-3.5 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                            <span className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold flex items-center justify-center shrink-0">1</span>
                            <p className="text-gray-400 font-serif leading-relaxed">
                              Nhấn nút <strong className="text-white">Bắt đầu cuộc viễn chinh</strong> phía dưới để xáo và úp các thẻ bài di sản cổ.
                            </p>
                          </div>
                          
                          <div className="flex gap-3 items-start p-3.5 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                            <span className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold flex items-center justify-center shrink-0">2</span>
                            <p className="text-gray-400 font-serif leading-relaxed">
                              Lật mở từng thẻ bài để xem tên <strong className="text-[#D4AF37]">Đồng tiền cổ</strong> hoặc <strong className="text-blue-400">Triều đại trị vì</strong>.
                            </p>
                          </div>
                          
                          <div className="flex gap-3 items-start p-3.5 bg-white/[0.02] border border-[#D4AF37]/20 rounded-xl hover:border-[#D4AF37]/40 transition-colors">
                            <span className="w-6 h-6 rounded-full bg-[#D4AF37]/30 text-[#D4AF37] font-bold flex items-center justify-center shrink-0">3</span>
                            <p className="text-gray-300 font-serif leading-relaxed">
                              Ghép đúng cặp đồng tiền cổ với triều đại của nó. Ví dụ: <strong className="text-white font-sans">Đồng Thái Bình Hưng Bảo</strong> ghép với <strong className="text-[#D4AF37] font-sans">Triều Nhà Đinh (968)</strong>.
                            </p>
                          </div>
                          
                          <div className="flex gap-3 items-start p-3.5 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                            <span className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold flex items-center justify-center shrink-0">4</span>
                            <p className="text-gray-400 font-serif leading-relaxed">
                              Hoàn thành ghép khớp toàn bộ <strong className="text-white">6 cặp thẻ</strong> để nhận ngay <strong className="text-green-400 font-bold">0.5 Tokens</strong> thưởng (Thưởng 1 lần/ngày).
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!hasLostMemoryToday && (
                      <div className="p-3 bg-white/5 border border-white/5 rounded-2xl max-w-sm mx-auto flex justify-between items-center px-6">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">PHẦN THƯỞNG:</span>
                        <span className={hasWonMemoryToday ? "text-[#D4AF37] font-black text-xs uppercase" : "text-green-400 font-black text-xs uppercase animate-pulse"}>
                          {hasWonMemoryToday ? "ĐÃ NHẬN HÔM NAY" : "🎁 +0.5 TOKENS HÀNG NGÀY"}
                        </span>
                      </div>
                    )}

                    {!hasLostMemoryToday && (
                      <button
                        onClick={startMemoryGame}
                        disabled={hasWonMemoryToday}
                        className="group relative btn-premium btn-gold py-4 px-12 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg overflow-hidden active:scale-95 transition-all inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <Play size={14} className="animate-pulse" /> Bắt đầu cuộc viễn chinh
                      </button>
                    )}
                  </div>
                ) : hasWonMemory ? (
                  <div className="text-center py-12 max-w-md space-y-4 animate-fade-in-up">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 mx-auto animate-bounce">
                      <CheckCircle size={32} />
                    </div>
                    <h4 className="text-2xl font-cinzel font-black text-white">CHIẾN THẮNG TRẠNG NGUYÊN!</h4>
                    <p className="text-xs text-gray-400 font-serif italic">
                      Bạn đã hoàn thành trò chơi trong <strong className="text-white">{memoryTime} giây</strong> với <strong className="text-white">{memoryMoves} lượt lật</strong>.
                    </p>
                    
                    {hasWonMemoryToday && memoryClaimed ? (
                      <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl p-4 text-[10px] font-black uppercase tracking-widest">
                         +0.5 Tokens Đã Được Ghi Nhận Thành Công! ✅
                      </div>
                    ) : (
                      <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-[10px] text-gray-500 uppercase tracking-widest">
                        Nhận thưởng hôm nay đã được hoàn thành. Chúc mừng tài năng học thuật của bạn!
                      </div>
                    )}

                    <button
                      onClick={startMemoryGame}
                      className="btn-premium btn-gold py-4 px-8 rounded-xl text-xs font-black uppercase tracking-widest"
                    >
                      Chơi Lại Trải Nghiệm
                    </button>
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-6 items-center">
                    {/* Active Gameplay Tip Banner */}
                    <div className="w-full bg-[#D4AF37]/5 border border-[#D4AF37]/25 p-3 rounded-2xl text-center text-xs text-gray-400 font-serif italic shadow-inner animate-fade flex items-center justify-center gap-2">
                      <span>💡</span>
                      <span><strong className="text-[#D4AF37]">Mẹo Khảo Cổ:</strong> Lật và ghép cặp đồng xu với triều đại đúc tương ứng (Ví dụ: <strong className="text-white">Đồng Thái Bình Hưng Bảo</strong> ⇄ <strong className="text-[#D4AF37]">Triều Nhà Đinh</strong>).</span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 w-full justify-items-center items-center">
                      {cards.map((card, idx) => (
                        <div 
                          key={card.id} 
                          onClick={() => handleCardClick(idx)}
                          className="rounded-full cursor-pointer relative preserve-3d transition-transform duration-500 hover:scale-105 active:scale-95 group mx-auto justify-self-center flex-shrink-0"
                          style={{
                            width: '96px',
                            height: '96px',
                            transform: card.isFlipped || card.isMatched ? "rotateY(180deg)" : "rotateY(0deg)"
                          }}
                        >
                          {/* FRONT FACE (REVEALED) */}
                          <div 
                            className={`absolute inset-0 border-2 rounded-full flex items-center justify-center backface-hidden rotate-y-180 ${
                              card.isMatched 
                                ? "border-green-500 bg-[#16161c] shadow-[0_0_20px_rgba(34,197,94,0.35)]" 
                                : card.type === 'coin'
                                  ? "border-[#D4AF37]/60 bg-gradient-to-br from-[#3D2C1A] via-[#1C120C] to-[#0A0604] shadow-[inset_0_0_15px_rgba(212,175,55,0.2)]"
                                  : "border-red-600/70 bg-gradient-to-br from-[#4A1515] via-[#2A0808] to-[#120303] shadow-[inset_0_0_15px_rgba(239,68,68,0.25)]"
                            }`}
                            style={{ width: '96px', height: '96px' }}
                          >
                            {card.type === 'coin' ? (
                              <div className="relative w-full h-full rounded-full flex items-center justify-center">
                                {/* Coin square hole */}
                                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#D4AF37]/50 bg-[#16161c]"></div>
                                {/* Four Han characters around it */}
                                <span className="absolute top-1.5 sm:top-2.5 text-base sm:text-lg font-serif text-[#D4AF37] font-black leading-none">{card.han[0]}</span>
                                <span className="absolute bottom-1.5 sm:bottom-2.5 text-base sm:text-lg font-serif text-[#D4AF37] font-black leading-none">{card.han[1]}</span>
                                <span className="absolute left-1.5 sm:left-2.5 text-base sm:text-lg font-serif text-[#D4AF37] font-black leading-none">{card.han[2]}</span>
                                <span className="absolute right-1.5 sm:right-2.5 text-base sm:text-lg font-serif text-[#D4AF37] font-black leading-none">{card.han[3]}</span>
                              </div>
                            ) : (
                              <div className="relative w-full h-full rounded-full flex items-center justify-center">
                                {/* Red square seal in the center */}
                                <div className="w-10 h-10 sm:w-12 sm:h-12 border border-red-600/80 bg-red-950/40 rounded flex items-center justify-center shadow-[0_0_10px_rgba(220,38,38,0.3)] relative">
                                  <div className="absolute inset-0.5 border border-dashed border-red-600/40 rounded-sm pointer-events-none"></div>
                                  <span className={`font-serif text-red-500 font-extrabold leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${
                                    card.han.length > 1 ? 'text-xs sm:text-sm' : 'text-lg sm:text-2xl'
                                  }`}>
                                    {card.han}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* BACK FACE (HIDDEN) */}
                          <div 
                            className="absolute inset-0 bg-gradient-to-br from-[#1e1e24] via-[#121215] to-[#2D1F10] border-2 border-[#D4AF37]/35 group-hover:border-[#D4AF37] rounded-full flex items-center justify-center backface-hidden bg-royal-pattern transition-colors duration-300 shadow-[inset_0_0_20px_rgba(212,175,55,0.15)] group-hover:shadow-[inset_0_0_30px_rgba(212,175,55,0.3)]"
                            style={{ width: '96px', height: '96px' }}
                          >
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#D4AF37]/35 bg-gradient-to-br from-[#D4AF37]/15 to-transparent flex items-center justify-center text-lg sm:text-xl font-serif text-[#D4AF37] font-black shadow-[0_0_15px_rgba(212,175,55,0.25)] animate-pulse">
                               寶
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>

      <style>{`
        .bg-radial-pattern {
          background-image: radial-gradient(circle, rgba(20,20,24,1) 0%, rgba(10,10,12,1) 100%);
        }
        .star-dongson {
          box-shadow: 0 0 15px rgba(212,175,55,0.15);
        }
        .bg-royal-pattern {
          background: radial-gradient(circle at center, #1b1b22 0%, #111114 100%);
          position: relative;
        }
        .bg-royal-pattern::before {
          content: "";
          position: absolute;
          inset: 4px;
          border: 1px dashed rgba(212,175,55,0.25);
          border-radius: 50%;
          pointer-events: none;
        }
        .preserve-3d {
          -webkit-transform-style: preserve-3d;
          transform-style: preserve-3d;
        }
        .backface-hidden {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          -webkit-transform: rotateY(180deg);
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default GameZoneModal;
