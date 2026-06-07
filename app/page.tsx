"use client";

import React, { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import {
  BookOpen,
  Music,
  Mail,
  Zap,
  Volume2,
  Sparkles,
  ArrowRight,
  Shield,
  Upload,
  Heart,
  Eye,
  Play,
} from "lucide-react";

// Floating gold sparkles component for background ambiance
function GoldParticles() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    const items = Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 12 + 8,
    }));
    setParticles(items);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute bg-amber-400/10 rounded-full blur-[1px] animate-pulse"
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

export default function LandingPage() {
  const { user, isLoaded } = useUser();
  return (
    <main
      className="relative min-h-screen bg-[#070504] text-stone-200 overflow-x-hidden flex flex-col font-sans select-none"
      style={{
        backgroundImage: "radial-gradient(circle at center, #1b130f 0%, #060504 100%)",
      }}
    >
      <GoldParticles />

      {/* HEADER BAR */}
      <header className="relative w-full px-6 py-4 border-b border-amber-500/10 flex justify-between items-center bg-black/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="w-9 h-9 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif text-lg font-bold shadow-md bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
            title="Go to Homepage"
          >
            ❦
          </a>
          <div>
            <h1 className="font-serif text-base tracking-wider text-amber-100 font-semibold uppercase">
              Flippy Layflat
            </h1>
            <p className="text-[10px] text-amber-500/60 font-mono tracking-widest uppercase">
              Digital Wedding Albums
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs uppercase font-mono tracking-wider text-stone-400">
          <a href="#features" className="hover:text-amber-400 transition-colors">Features</a>
          <a href="/demo" className="hover:text-amber-400 transition-colors">Live Demo</a>
          <a href="/contact" className="hover:text-amber-400 transition-colors">Contact Us</a>
        </nav>

        <div className="flex items-center gap-4">
          {isLoaded && user ? (
            <>
              <a
                href="/dashboard"
                className="text-stone-300 hover:text-white text-xs uppercase font-mono tracking-wider transition-all"
              >
                Studio
              </a>
              <div className="flex items-center gap-3 bg-stone-900/50 border border-amber-500/10 rounded-full px-4 py-1.5 shadow-inner">
                <div className="flex flex-col text-right hidden sm:flex">
                  <span className="text-xs font-serif font-medium text-amber-200/90 leading-tight">
                    {user.fullName || user.primaryEmailAddress?.emailAddress}
                  </span>
                  <span className="text-[9px] font-mono text-stone-500 tracking-wider">
                    Wedding Creator
                  </span>
                </div>
                <UserButton />
              </div>
            </>
          ) : (
            isLoaded && (
              <>
                <a
                  href="/dashboard"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-black text-xs font-semibold uppercase tracking-wider rounded transition-all shadow-md shadow-amber-500/5"
                >
                  Log In
                </a>
              </>
            )
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative max-w-6xl w-full mx-auto px-6 pt-20 pb-16 flex flex-col items-center text-center z-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/15 bg-amber-500/5 text-amber-400 text-[10px] uppercase font-mono tracking-widest animate-pulse">
          <Sparkles size={12} />
          <span>Next-Generation Wedding Keepsakes</span>
        </div>

        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-wide text-amber-100 max-w-4xl leading-tight">
          Preserve Your Eternal Love Story in <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">Layflat Panoramic</span> Majesty
        </h2>

        <p className="font-serif italic text-stone-400 text-base sm:text-lg max-w-2xl leading-relaxed">
          Create immersive, seamless digital wedding albums. Spanning across pages with no seam gaps, custom gold-embossed cover overlays, and romantic background melodies.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <a
            href="/dashboard"
            className="px-8 py-3.5 bg-amber-600 hover:bg-amber-500 text-black font-semibold text-sm tracking-wider uppercase rounded flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start Crafting Your Album</span>
            <ArrowRight size={16} />
          </a>
          <a
            href="/demo"
            className="px-8 py-3.5 border border-stone-800 hover:border-amber-500/40 hover:bg-white/5 rounded text-stone-300 hover:text-white font-semibold text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Eye size={16} className="text-amber-500" />
            <span>Interactive Demo</span>
          </a>
        </div>

        {/* HERO ALBUM MOCKUP (STYLIZED SPREAD PREVIEW) */}
        <div className="w-full max-w-4xl aspect-[16/9] pt-12 pb-6 relative group select-none">
          <div className="absolute inset-0 bg-gradient-to-t from-[#070504] via-transparent to-transparent z-10 pointer-events-none" />
          
          <div className="w-full h-full rounded-2xl border border-amber-500/10 bg-[#16100d] p-4 sm:p-6 shadow-2xl relative flex gap-3 overflow-hidden"
               style={{
                 boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9), inset 0 0 100px rgba(0, 0, 0, 0.6)",
               }}>
            
            {/* Left Page Mockup */}
            <div className="flex-1 rounded-lg bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-500/5 overflow-hidden relative shadow-inner">
              <div className="absolute inset-0 bg-cover bg-center opacity-40 blur-[1px] hover:opacity-50 transition-opacity"
                   style={{ backgroundImage: `url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/20" />
              <div className="absolute bottom-6 left-6 space-y-1 z-10 text-left">
                <span className="text-[8px] font-mono text-amber-500/70 tracking-widest uppercase">Chapter I</span>
                <h4 className="font-serif text-sm sm:text-base font-semibold text-amber-100 uppercase">THE SACRED UNION</h4>
              </div>
            </div>

            {/* Book Center Binding */}
            <div className="w-[4px] h-full bg-gradient-to-r from-black/80 via-amber-950/20 to-black/80 z-20 self-stretch shrink-0" />

            {/* Right Page Mockup */}
            <div className="flex-1 rounded-lg bg-gradient-to-bl from-stone-900 to-stone-950 border border-amber-500/5 overflow-hidden relative shadow-inner">
              <div className="absolute inset-0 bg-cover bg-center opacity-40 blur-[1px] hover:opacity-50 transition-opacity"
                   style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/50 via-transparent to-black/20" />
              <div className="absolute bottom-6 right-6 space-y-1 z-10 text-right">
                <span className="text-[8px] font-mono text-amber-500/70 tracking-widest uppercase text-right">Page 02</span>
                <p className="font-serif text-[10px] italic text-amber-300/60 font-medium">Under the canopy of stars, we promised forever...</p>
              </div>
            </div>

            {/* Absolute Play Overlay button */}
            <a href="/demo" className="absolute inset-0 flex items-center justify-center bg-black/35 hover:bg-black/20 transition-all z-35 group/btn">
              <div className="w-16 h-16 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-400 bg-black/60 backdrop-blur-sm group-hover/btn:scale-110 group-hover/btn:border-amber-400 group-hover/btn:text-white transition-all shadow-lg">
                <Play size={20} fill="currentColor" className="ml-1" />
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* CORE FEATURES LIST SECTION */}
      <section id="features" className="max-w-6xl w-full mx-auto px-6 py-20 z-10 space-y-16 border-t border-amber-500/5">
        <div className="text-center space-y-2">
          <h3 className="font-serif text-3xl font-bold tracking-wide text-amber-100">
            Crafted for Unmatched Splendor
          </h3>
          <p className="text-xs text-stone-500 uppercase tracking-widest font-mono">
            Every detail tailored to deliver a premium digital gallery experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1: Seamless Layflat Spreads */}
          <div className="bg-gradient-to-br from-[#191310] to-[#0c0908] border border-amber-500/10 rounded-xl p-6 space-y-4 hover:border-amber-500/30 hover:scale-[1.01] transition-all shadow-lg">
            <div className="w-10 h-10 rounded-lg border border-amber-500/20 flex items-center justify-center text-amber-400 bg-amber-500/5">
              <BookOpen size={18} />
            </div>
            <h4 className="font-serif text-lg font-semibold text-amber-200 uppercase tracking-wide">
              Layflat Panoramic Spreads
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Upload a single wide image per spread. Our engine splits and aligns the left and right pages down the middle, creating a continuous panoramic display with zero seam gaps.
            </p>
          </div>

          {/* Feature 2: High Limit Uploads */}
          <div className="bg-gradient-to-br from-[#191310] to-[#0c0908] border border-amber-500/10 rounded-xl p-6 space-y-4 hover:border-amber-500/30 hover:scale-[1.01] transition-all shadow-lg">
            <div className="w-10 h-10 rounded-lg border border-amber-500/20 flex items-center justify-center text-amber-400 bg-amber-500/5">
              <Upload size={18} />
            </div>
            <h4 className="font-serif text-lg font-semibold text-amber-200 uppercase tracking-wide">
              Up to 25MB File Uploads
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Upload ultra-high-resolution wedding photos up to 25MB. Our client-side compression automatically downscales larger files securely, preserving crisp, gorgeous details.
            </p>
          </div>

          {/* Feature 3: Custom Front & Back Covers */}
          <div className="bg-gradient-to-br from-[#191310] to-[#0c0908] border border-amber-500/10 rounded-xl p-6 space-y-4 hover:border-amber-500/30 hover:scale-[1.01] transition-all shadow-lg">
            <div className="w-10 h-10 rounded-lg border border-amber-500/20 flex items-center justify-center text-amber-400 bg-amber-500/5">
              <Heart size={18} />
            </div>
            <h4 className="font-serif text-lg font-semibold text-amber-200 uppercase tracking-wide">
              Front & Back Cover Customization
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Personalize the entrance to your album. Upload custom front and back cover images or let our system fall back to beautiful, gold-embossed faux leather covers.
            </p>
          </div>

          {/* Feature 4: Immersive soundtracks */}
          <div className="bg-gradient-to-br from-[#191310] to-[#0c0908] border border-amber-500/10 rounded-xl p-6 space-y-4 hover:border-amber-500/30 hover:scale-[1.01] transition-all shadow-lg">
            <div className="w-10 h-10 rounded-lg border border-amber-500/20 flex items-center justify-center text-amber-400 bg-amber-500/5">
              <Music size={18} />
            </div>
            <h4 className="font-serif text-lg font-semibold text-amber-200 uppercase tracking-wide">
              Romantic Background Music
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Add a romantic soundtrack to play in the background. Select from classical/acoustic presets or link a custom audio track. Displays with a sleek, glowing music player.
            </p>
          </div>

          {/* Feature 5: Fast Email sharing */}
          <div className="bg-gradient-to-br from-[#191310] to-[#0c0908] border border-amber-500/10 rounded-xl p-6 space-y-4 hover:border-amber-500/30 hover:scale-[1.01] transition-all shadow-lg">
            <div className="w-10 h-10 rounded-lg border border-amber-500/20 flex items-center justify-center text-amber-400 bg-amber-500/5">
              <Mail size={18} />
            </div>
            <h4 className="font-serif text-lg font-semibold text-amber-200 uppercase tracking-wide">
              Instant SMTP Invitations
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Invite your family and friends to view your album. Send clean, golden HTML invitation emails using our SMTP mailer directly from your creator dashboard with a single click.
            </p>
          </div>

          {/* Feature 6: Interactive Flipping Engine */}
          <div className="bg-gradient-to-br from-[#191310] to-[#0c0908] border border-amber-500/10 rounded-xl p-6 space-y-4 hover:border-amber-500/30 hover:scale-[1.01] transition-all shadow-lg">
            <div className="w-10 h-10 rounded-lg border border-amber-500/20 flex items-center justify-center text-amber-400 bg-amber-500/5">
              <Zap size={18} />
            </div>
            <h4 className="font-serif text-lg font-semibold text-amber-200 uppercase tracking-wide">
              Interactive Page Flip Engine
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Simulate the tactile feeling of flipping pages in a real book. Pages react dynamically to clicks, corner-pull drags, swipes, and support keyboard and automatic slideshow navigation.
            </p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION DUST */}
      <section className="relative w-full py-24 border-t border-amber-500/5 flex flex-col items-center justify-center text-center px-6 z-10 bg-black/10">
        <div className="space-y-4 max-w-xl">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-amber-100 uppercase">
            Begin Saving Your Memories Today
          </h3>
          <p className="text-xs text-stone-400 leading-relaxed font-serif italic">
            Publish private shared view links for guests and create unlimited layouts for your ceremonies.
          </p>
          <div className="pt-6">
            <a
              href="/dashboard"
              className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-black font-semibold text-sm tracking-wider uppercase rounded transition-all shadow-md shadow-amber-500/5 inline-flex items-center gap-2"
            >
              <span>Go to Creator Studio</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative w-full py-8 border-t border-amber-500/10 bg-black/40 text-center text-[10px] text-amber-500/30 font-mono tracking-widest uppercase z-10 mt-auto flex flex-col gap-2">
        <div className="flex justify-center gap-6 mb-2 text-stone-500 lowercase font-serif italic text-xs normal-case tracking-normal">
          <a href="/" className="hover:text-amber-400 transition-colors">Home</a>
          <a href="/demo" className="hover:text-amber-400 transition-colors">Live Demo</a>
          <a href="/contact" className="hover:text-amber-400 transition-colors">Contact Us</a>
          <a href="/dashboard" className="hover:text-amber-400 transition-colors">Studio</a>
        </div>
        <span>✦ Powered by Flippy Luxury Publishing ✦</span>
        <span className="text-[8px] text-stone-650">All rights reserved © 2026. Built with elegant layflat engineering.</span>
      </footer>
    </main>
  );
}
