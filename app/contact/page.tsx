"use client";

import React, { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useToastStore } from "@/store/useToastStore";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowLeft,
  Send,
  Loader,
  Home,
} from "lucide-react";

// Floating gold sparkles component for background ambiance
function GoldParticles() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    const items = Array.from({ length: 30 }).map((_, i) => ({
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

export default function ContactPage() {
  const { user, isLoaded } = useUser();
  const addToast = useToastStore((state) => state.addToast);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      addToast("Please fill in all required fields.", "error");
      return;
    }

    setSending(true);

    // Mock sending message (simulating 1.5s network delay)
    setTimeout(() => {
      addToast("Your message has been sent successfully!", "success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setSending(false);
    }, 1500);
  };

  const phoneNo = process.env.NEXT_PUBLIC_CREATOR_PHONE || "+91 91620 72838";

  return (
    <main
      className="relative min-h-screen bg-[#070504] text-stone-250 overflow-x-hidden flex flex-col font-sans select-none"
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
          >
            ❦
          </a>
          <div>
            <h1 className="font-serif text-base tracking-wider text-amber-100 font-semibold uppercase">
              Flippy Layflat
            </h1>
            <p className="text-[10px] text-amber-500/60 font-mono tracking-widest uppercase">
              Premium Digital Keepsakes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isLoaded && (
            user ? (
              <>
                <a
                  href="/dashboard"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-black text-xs font-semibold uppercase tracking-wider rounded transition-all shadow-md shadow-amber-500/5"
                >
                  Studio
                </a>
                <UserButton />
              </>
            ) : (
              <>
                <a
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-800 hover:bg-stone-900 rounded text-stone-300 hover:text-white text-xs transition-all"
                  title="Log In"
                >
                  Log In
                </a>
                <a
                  href="/dashboard"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-black text-xs font-semibold uppercase tracking-wider rounded transition-all shadow-md shadow-amber-500/5"
                >
                  Studio
                </a>
              </>
            )
          )}
        </div>
      </header>

      {/* BODY CONTAINER */}
      <section className="relative flex-grow max-w-5xl w-full mx-auto px-6 py-16 z-10 flex flex-col gap-12 animate-in fade-in duration-500">
        
        {/* Title Heading */}
        <div className="text-center space-y-3">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide text-amber-100 uppercase">
            Connect With Our Studio
          </h2>
          <p className="font-serif italic text-stone-400 text-sm max-w-md mx-auto leading-relaxed">
            Have questions about custom features, pricing, or premium layouts? Send us a message below.
          </p>
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#daaf37]/45 to-transparent mx-auto pt-2" />
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          
          {/* Left Side: Contact Info Cards (2/5 width) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Phone Card */}
            <div className="bg-gradient-to-br from-[#191310] to-[#0c0908] border border-amber-500/10 rounded-xl p-5 flex items-start gap-4 shadow-lg">
              <div className="w-9 h-9 rounded-lg border border-amber-500/20 flex items-center justify-center text-amber-400 bg-amber-500/5 shrink-0">
                <Phone size={16} />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-mono tracking-wider text-amber-500/40">Give us a call</span>
                <p className="text-sm font-serif font-semibold text-stone-200 tracking-wider">
                  {phoneNo}
                </p>
                <p className="text-[10px] text-stone-500">Support Hours: 10AM - 7PM IST</p>
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-gradient-to-br from-[#191310] to-[#0c0908] border border-amber-500/10 rounded-xl p-5 flex items-start gap-4 shadow-lg">
              <div className="w-9 h-9 rounded-lg border border-amber-500/20 flex items-center justify-center text-amber-400 bg-amber-500/5 shrink-0">
                <Mail size={16} />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-mono tracking-wider text-amber-500/40">Send an email</span>
                <p className="text-sm font-serif font-semibold text-stone-200 tracking-wider">
                  studio@flippylayflat.com
                </p>
                <p className="text-[10px] text-stone-500">Inquiries answered within 24 hours</p>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-gradient-to-br from-[#191310] to-[#0c0908] border border-amber-500/10 rounded-xl p-5 flex items-start gap-4 shadow-lg">
              <div className="w-9 h-9 rounded-lg border border-amber-500/20 flex items-center justify-center text-amber-400 bg-amber-500/5 shrink-0">
                <MapPin size={16} />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-mono tracking-wider text-amber-500/40">Studio Location</span>
                <p className="text-sm font-serif font-semibold text-stone-200 tracking-wider">
                  Connaught Place, New Delhi
                </p>
                <p className="text-[10px] text-stone-500">Delhi NCR, DL 110001, India</p>
              </div>
            </div>
          </div>

          {/* Right Side: Form (3/5 width) */}
          <div className="lg:col-span-3 bg-gradient-to-br from-[#16100d] to-[#0c0908] border border-amber-500/10 rounded-xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-mono tracking-wider text-amber-500/50">Your Name</label>
                  <input
                    type="text"
                    placeholder="Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-stone-200 text-xs bg-stone-900 border border-amber-500/10 rounded focus:border-amber-500/40 focus:outline-none transition-all placeholder:text-stone-700"
                    required
                    disabled={sending}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-mono tracking-wider text-amber-500/50">Email Address</label>
                  <input
                    type="email"
                    placeholder="rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-stone-200 text-xs bg-stone-900 border border-amber-500/10 rounded focus:border-amber-500/40 focus:outline-none transition-all placeholder:text-stone-700"
                    required
                    disabled={sending}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-mono tracking-wider text-amber-500/50">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Custom Domain Inquiry"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-stone-200 text-xs bg-stone-900 border border-amber-500/10 rounded focus:border-amber-500/40 focus:outline-none transition-all placeholder:text-stone-700"
                  disabled={sending}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-mono tracking-wider text-amber-500/50">Message</label>
                <textarea
                  placeholder="Tell us what you need help with..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 text-stone-200 text-xs bg-stone-900 border border-amber-500/10 rounded focus:border-amber-500/40 focus:outline-none transition-all placeholder:text-stone-700"
                  required
                  disabled={sending}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-55 disabled:pointer-events-none text-black text-xs font-semibold uppercase tracking-wider flex items-center gap-2 active:scale-95 transition-all shadow-md shadow-amber-500/5 cursor-pointer"
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <Loader className="animate-spin" size={14} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative w-full py-8 border-t border-amber-500/10 bg-black/40 text-center text-[10px] text-amber-500/30 font-mono tracking-widest uppercase z-10 mt-auto flex flex-col gap-2">
        <div className="flex justify-center gap-6 mb-2 text-stone-500 lowercase font-serif italic text-xs normal-case tracking-normal">
          <a href="/" className="hover:text-amber-400 transition-colors">Home</a>
          <a href="/demo" className="hover:text-amber-400 transition-colors">Live Demo</a>
          <a href="/contact" className="hover:text-amber-400 transition-colors text-amber-400">Contact Us</a>
          <a href="/dashboard" className="hover:text-amber-400 transition-colors">Studio</a>
        </div>
        <span>✦ Powered by Flippy Luxury Publishing ✦</span>
        <span className="text-[8px] text-stone-650">All rights reserved © 2026. Built with elegant layflat engineering.</span>
      </footer>
    </main>
  );
}
