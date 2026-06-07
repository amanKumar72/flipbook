"use client";

import React, { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { BookList } from "@/components/Dashboard/BookList";
import { BookCreator } from "@/components/Dashboard/BookCreator";
import { BookOpen, PlusCircle, LogOut } from "lucide-react";

// Floating gold sparkles component for background ambiance
function GoldParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={i}
          className="absolute bg-amber-400/10 rounded-full blur-[1px] animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 10 + 10}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  return (
    <main
      className="relative min-h-screen bg-[#070504] text-stone-200 overflow-x-hidden flex flex-col font-sans select-none"
      style={{
        backgroundImage: "radial-gradient(circle at center, #18120e 0%, #060504 100%)",
      }}
    >
      <GoldParticles />

      {/* HEADER BAR */}
      <header className="relative w-full px-6 py-4 border-b border-amber-500/15 flex justify-between items-center bg-black/55 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif text-lg font-bold shadow-md shadow-amber-500/5 bg-amber-500/5">
            ❦
          </div>
          <div>
            <h1 className="font-serif text-base tracking-wider text-amber-100 font-semibold uppercase">
              FlipiX Studio
            </h1>
            <p className="text-[10px] text-amber-500/60 font-mono tracking-widest uppercase">
              Creator Dashboard
            </p>
          </div>
        </div>

        {/* User profile / logout controls */}
        {isLoaded && user && (
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
        )}
      </header>

      {/* DASHBOARD BODY */}
      <section className="flex-grow max-w-6xl w-full mx-auto px-6 py-10 z-10 space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-amber-500/10 pb-4 gap-4">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold tracking-wide text-amber-100">
              {activeTab === "list"
                ? "My Collections"
                : editingBookId
                ? "Modify Album"
                : "Craft New Album"}
            </h2>
            <p className="text-xs text-stone-500 italic font-serif">
              {activeTab === "list"
                ? "Manage your published premium wedding albums"
                : editingBookId
                ? "Modify your cover pages, music tracks, and page spreads"
                : "Pair up high-definition spreads and design your story"}
            </p>
          </div>

          <div className="flex bg-stone-950/80 p-1 border border-amber-500/10 rounded-lg shadow-lg self-stretch sm:self-auto">
            <button
              onClick={() => {
                setEditingBookId(null);
                setActiveTab("list");
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-md transition-all ${
                activeTab === "list"
                  ? "bg-amber-600 text-black shadow-md shadow-amber-500/10"
                  : "text-stone-400 hover:text-amber-400 hover:bg-white/5"
              }`}
            >
              <BookOpen size={14} />
              My Albums
            </button>
            <button
              onClick={() => {
                setEditingBookId(null);
                setActiveTab("create");
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-md transition-all ${
                activeTab === "create"
                  ? "bg-amber-600 text-black shadow-md shadow-amber-500/10"
                  : "text-stone-400 hover:text-amber-400 hover:bg-white/5"
              }`}
            >
              <PlusCircle size={14} />
              {editingBookId ? "Modify Album" : "Create Album"}
            </button>
          </div>
        </div>

        {/* Tab Content Router */}
        <div className="animate-in fade-in duration-300">
          {activeTab === "list" ? (
            <BookList
              onSelectTab={setActiveTab}
              onEditBook={(id) => {
                setEditingBookId(id);
                setActiveTab("create");
              }}
            />
          ) : (
            <BookCreator
              editBookId={editingBookId}
              onSuccess={() => {
                setEditingBookId(null);
                setActiveTab("list");
              }}
              onCancel={() => {
                setEditingBookId(null);
                setActiveTab("list");
              }}
            />
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative w-full py-6 border-t border-amber-500/10 bg-black/20 text-center text-[10px] text-amber-500/40 font-mono tracking-widest uppercase z-10 mt-auto">
        ✦ Powered by FlipiX Luxury Publishing ✦
      </footer>
    </main>
  );
}
