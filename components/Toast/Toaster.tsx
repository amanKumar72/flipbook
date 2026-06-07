"use client";

import React from "react";
import { useToastStore } from "@/store/useToastStore";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none select-none">
      {toasts.map((toast) => {
        let bgColor = "bg-stone-950/95 border-amber-500/20";
        let icon = <Info className="text-amber-400 shrink-0" size={16} />;
        
        if (toast.type === "success") {
          bgColor = "bg-stone-950/95 border-emerald-500/30";
          icon = <CheckCircle className="text-emerald-400 shrink-0" size={16} />;
        } else if (toast.type === "error") {
          bgColor = "bg-stone-950/95 border-rose-500/30";
          icon = <AlertCircle className="text-rose-400 shrink-0" size={16} />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg border backdrop-blur-md shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${bgColor}`}
            style={{
              boxShadow: "0 20px 40px -15px rgba(0,0,0,0.8)",
            }}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span className="font-serif text-[11px] font-medium tracking-wide text-stone-200">
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-500 hover:text-stone-300 p-0.5 transition-colors shrink-0 cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
