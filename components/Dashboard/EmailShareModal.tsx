"use client";

import React, { useState } from "react";
import { X, Send, Check } from "lucide-react";

interface EmailShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  defaultTitle: string;
}

export function EmailShareModal({
  isOpen,
  onClose,
  bookId,
  defaultTitle,
}: EmailShareModalProps) {
  const [email, setEmail] = useState("");
  const [coupleNames, setCoupleNames] = useState("");
  const [albumTitle, setAlbumTitle] = useState(defaultTitle);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !coupleNames || !albumTitle) {
      setMessage("Please fill out all fields.");
      return;
    }

    setStatus("sending");
    setMessage("");

    try {
      const response = await fetch("/api/share-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, bookId, coupleNames, albumTitle }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to send email invitation.");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#16100d] border border-amber-500/25 rounded-lg p-6 shadow-2xl text-stone-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white hover:bg-white/5 p-1 rounded-full transition-all"
        >
          <X size={18} />
        </button>

        {/* Heading */}
        <div className="mb-6 text-center">
          <div className="w-10 h-10 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif text-lg font-bold mx-auto mb-2 bg-amber-500/5">
            ❦
          </div>
          <h3 className="font-serif text-xl tracking-wider text-amber-100 uppercase font-semibold">
            Invite Guest via Email
          </h3>
          <p className="text-[10px] text-amber-500/50 uppercase tracking-widest font-mono mt-1">
            Send shareable digital album link
          </p>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-6 text-center gap-4 animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Check size={28} />
            </div>
            <div className="space-y-1">
              <p className="text-emerald-400 font-medium font-serif">Invitation Sent!</p>
              <p className="text-xs text-stone-400">
                A golden-themed invitation email has been sent successfully.
              </p>
            </div>
            <button
              onClick={() => {
                setStatus("idle");
                onClose();
              }}
              className="mt-4 px-6 py-2 rounded bg-amber-600 hover:bg-amber-500 text-black text-xs uppercase font-semibold tracking-wider transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Couple Names */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-amber-500/60 font-semibold">
                Couple Names
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul & Priya"
                value={coupleNames}
                onChange={(e) => setCoupleNames(e.target.value)}
                className="w-full px-3 py-2 text-stone-200 text-sm bg-stone-900 border border-amber-500/10 rounded focus:border-amber-500/50 focus:outline-none transition-all placeholder:text-stone-600"
                required
              />
            </div>

            {/* Album Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-amber-500/60 font-semibold">
                Album Title
              </label>
              <input
                type="text"
                placeholder="e.g. Forever Together"
                value={albumTitle}
                onChange={(e) => setAlbumTitle(e.target.value)}
                className="w-full px-3 py-2 text-stone-200 text-sm bg-stone-900 border border-amber-500/10 rounded focus:border-amber-500/50 focus:outline-none transition-all placeholder:text-stone-600"
                required
              />
            </div>

            {/* Guest Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-amber-500/60 font-semibold">
                Guest Email Address
              </label>
              <input
                type="email"
                placeholder="guest@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-stone-200 text-sm bg-stone-900 border border-amber-500/10 rounded focus:border-amber-500/50 focus:outline-none transition-all placeholder:text-stone-600"
                required
              />
            </div>

            {/* Error Message */}
            {message && (
              <div className="text-xs text-rose-500 bg-rose-500/5 border border-rose-500/10 px-3 py-2 rounded text-center">
                {message}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-amber-500/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-stone-700 hover:bg-stone-900 rounded text-stone-400 hover:text-white text-xs uppercase tracking-wider font-semibold active:scale-95 transition-all"
                disabled={status === "sending"}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-55 disabled:pointer-events-none text-black text-xs uppercase font-semibold tracking-wider flex items-center gap-1.5 active:scale-95 transition-all"
                disabled={status === "sending"}
              >
                {status === "sending" ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border border-t-transparent border-black animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={12} />
                    Send Invite
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
