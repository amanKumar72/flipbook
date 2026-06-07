"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useBookStore } from "@/store/useBookStore";
import { albumData } from "@/data/album";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Share2,
  Star,
  Info,
  Maximize2,
  Minimize2,
  Phone,
  MapPin,
  Music,
  Home,
} from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

// Dynamically import the HTML Flipbook with SSR disabled
const HTMLBook = dynamic(() => import("@/components/Book/HTMLBook"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="w-12 h-12 rounded-full border-2 border-t-amber-500 border-amber-500/20 animate-spin" />
      <span className="font-serif italic text-sm text-amber-200/60">Opening wedding album...</span>
    </div>
  ),
});

// Floating gold sparkles component for background ambiance
function GoldParticles() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    const items = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10,
    }));
    setParticles(items);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute bg-amber-400/30 rounded-full blur-[1px] animate-pulse"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function DemoPage() {
  const addToast = useToastStore((state) => state.addToast);
  const currentPage = useBookStore((state) => state.currentPage);
  const totalPages = useBookStore((state) => state.totalPages);
  const isAnimating = useBookStore((state) => state.isAnimating);
  const nextPage = useBookStore((state) => state.nextPage);
  const prevPage = useBookStore((state) => state.prevPage);
  const setPage = useBookStore((state) => state.setPage);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Background Music State
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Swipe Gestures
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isAnimating) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    // Swipe threshold: 50px horizontal movement, less than 80px vertical drift
    if (Math.abs(diffX) > 50 && Math.abs(diffY) < 80) {
      if (diffX > 0) {
        prevPage();
      } else {
        nextPage();
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating) return;
      if (e.key === "ArrowRight" || e.key === " ") {
        nextPage();
      } else if (e.key === "ArrowLeft") {
        prevPage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextPage, prevPage, isAnimating]);

  // Slideshow (Auto-Play) loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (!isAnimating) {
        if (currentPage < totalPages) {
          nextPage();
        } else {
          setPage(0);
        }
      }
    }, 3800);

    return () => clearInterval(interval);
  }, [isPlaying, currentPage, totalPages, isAnimating, nextPage, setPage]);

  // Toggle Fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Audio Playback handler
  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsMusicPlaying(true);
      }).catch((err) => {
        console.error("Audio playback blocked:", err);
      });
    }
  };

  // Human-readable page display string
  const getPageLabel = () => {
    if (currentPage === 0) return "Cover (Front)";
    if (currentPage === totalPages) return "Cover (Back)";
    const prevPageNum = (currentPage - 1) * 2 + 1;
    const nextPageNum = (currentPage - 1) * 2 + 2;
    return `Pages ${prevPageNum.toString().padStart(2, "0")} - ${nextPageNum.toString().padStart(2, "0")} / ${albumData.length * 2}`;
  };

  return (
    <main
      className="relative w-screen h-screen bg-[#070504] overflow-hidden flex flex-col font-sans select-none text-white transition-all duration-500"
      style={{
        backgroundImage: "radial-gradient(circle at center, #18120e 0%, #060504 100%)",
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Gold Sparkles */}
      <GoldParticles />

      {/* Hidden Audio Tag playing beautiful piano instrumental */}
      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-200.mp3"
        loop
      />

      {/* 1. TOP STATUS BAR */}
      <header className="relative w-full px-6 py-4 border-b border-amber-500/10 flex justify-between items-center bg-black/40 backdrop-blur-md z-10 select-none">
        {/* Left: laurel wreath + Title */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="w-9 h-9 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif text-lg font-bold shadow-md shadow-amber-500/5 hover:bg-amber-500/10 transition-colors"
          >
            ❦
          </a>
          <div>
            <h1 className="font-serif text-base tracking-wider text-amber-100 font-semibold uppercase">
              FlipiX Showcase Demo
            </h1>
            <p className="text-[10px] text-amber-500/60 font-mono tracking-widest uppercase">
              Premium digital Wedding Album
            </p>
          </div>
        </div>

        {/* Center: Live Date/Demo */}
        <div className="hidden md:flex flex-col items-center">
          <span className="text-[10px] font-mono tracking-widest text-amber-500/70 uppercase">
            Interactive Presentation
          </span>
          <span className="text-xs font-serif text-amber-200/90 font-medium">
            Demo Thursday 05/09/2026
          </span>
        </div>

        {/* Right: Studio details & Back Home */}
        <div className="flex items-center gap-4 text-right text-xs">
          <div className="hidden sm:flex flex-col gap-0.5 text-stone-400">
            <span className="flex items-center gap-1.5 justify-end">
              <Phone size={12} className="text-amber-500/60" />
              +91 91620 72838
            </span>
          </div>
          <a
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-800 hover:bg-stone-900 rounded text-stone-300 hover:text-white transition-all"
            title="Go Home"
          >
            <Home size={14} className="text-amber-500/60" />
            <span className="hidden sm:inline">Home</span>
          </a>
        </div>
      </header>

      {/* 2. MAIN 3D SHOWROOM CANVAS AREA */}
      <div className="relative flex-grow min-h-0 w-full z-0 flex items-center justify-center">
        <HTMLBook />

        {/* Floating Side Info Panel */}
        {showInfo && (
          <div className="absolute top-6 left-6 p-5 w-72 rounded-lg border border-amber-500/20 bg-black/85 backdrop-blur-md z-30 animate-in fade-in slide-in-from-left-4 duration-300">
            <h3 className="font-serif text-amber-400 font-semibold text-lg border-b border-amber-500/20 pb-2 mb-3">
              Album Controls
            </h3>
            <ul className="text-xs text-stone-300 space-y-2.5">
              <li className="flex justify-between">
                <span className="font-medium text-amber-200/70">Left/Right Click:</span>
                <span>Click page sides to flip</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium text-amber-200/70">Corner Drag:</span>
                <span>Pull corners to flip pages</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium text-amber-200/70">Arrow Keys:</span>
                <span>Keyboard pagination</span>
              </li>
              <li className="flex justify-between border-t border-amber-500/10 pt-2.5 mt-2">
                <span className="font-medium text-amber-200/70">Auto-Play:</span>
                <span>Slideshow triggers flips</span>
              </li>
            </ul>
            <button
              onClick={() => setShowInfo(false)}
              className="mt-4 w-full py-1.5 rounded border border-amber-500/30 text-xs tracking-wider uppercase font-semibold text-amber-400 bg-amber-500/5 hover:bg-amber-500/15 active:scale-95 transition-all"
            >
              Close Guide
            </button>
          </div>
        )}

        {/* LEFT DECAL: Vertically Rotated Brand Label */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4 pointer-events-none select-none">
          <div className="h-16 w-[1px] bg-gradient-to-b from-transparent to-amber-500/30" />
          <span className="text-[10px] tracking-[0.6em] font-bold text-amber-500/40 uppercase [writing-mode:vertical-lr] rotate-180">
            FLIPIX SHOWROOM
          </span>
          <div className="h-16 w-[1px] bg-gradient-to-t from-transparent to-amber-500/30" />
        </div>

        {/* RIGHT DECAL: Vertical Toolbar Panel (FlipiX Style) */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3.5 p-2 rounded-full border border-amber-500/10 bg-black/60 backdrop-blur-md z-20 shadow-xl shadow-black/40">
          {/* Glowing Music Button */}
          <button
            onClick={toggleMusic}
            title={isMusicPlaying ? "Mute Music" : "Play Wedding Music"}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 relative ${
              isMusicPlaying
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/40 border border-amber-400"
                : "text-amber-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Music size={16} className={isMusicPlaying ? "animate-bounce" : ""} />
            {isMusicPlaying && (
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
              </span>
            )}
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title="Auto Play Slideshow"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
              isPlaying
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                : "text-amber-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <button
            onClick={() => setIsFavorited(!isFavorited)}
            title="Favorite Album"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isFavorited ? "text-red-500 scale-110" : "text-amber-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Star size={16} fill={isFavorited ? "currentColor" : "none"} />
          </button>

          <button
            onClick={() => setShowInfo(!showInfo)}
            title="Show Guide"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              showInfo ? "bg-amber-500/10 text-white" : "text-amber-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Info size={16} />
          </button>

          <button
            onClick={() => {
              const origin = window.location.origin;
              navigator.clipboard.writeText(`${origin}/demo`);
              addToast("Showroom demo link copied to clipboard!", "success");
            }}
            title="Share Presentation"
            className="w-9 h-9 rounded-full text-amber-400 hover:bg-white/10 hover:text-white flex items-center justify-center transition-all"
          >
            <Share2 size={16} />
          </button>

          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="w-9 h-9 rounded-full text-amber-400 hover:bg-white/10 hover:text-white flex items-center justify-center transition-all"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
    </main>
  );
}
