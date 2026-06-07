"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div
      className="relative w-screen h-screen bg-[#070504] overflow-hidden flex items-center justify-center font-sans"
      style={{
        backgroundImage: "radial-gradient(circle at center, #18120e 0%, #060504 100%)",
      }}
    >
      {/* Background Gold Sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-amber-400/20 rounded-full blur-[1px] animate-pulse"
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

      {/* Styled SignUp container */}
      <div className="z-10 shadow-2xl rounded-xl border border-amber-500/20 bg-black/55 backdrop-blur-xl p-1.5 animate-in fade-in zoom-in-95 duration-500">
        <SignUp
          appearance={{
            variables: {
              colorPrimary: "#d97706", // warm amber/gold
              colorBackground: "#120f0d", // deep luxury dark
              colorText: "#f5f5f4", // warm off-white
              colorTextSecondary: "#a8a29e", // muted warm gray
              colorInputBackground: "#1c1917", // warm dark input
              colorInputText: "#f5f5f4",
              colorBorder: "rgba(217, 119, 6, 0.15)",
            },
            elements: {
              card: "border-none shadow-none bg-transparent",
              headerTitle: "font-serif text-amber-100 tracking-wide text-2xl font-bold uppercase",
              headerSubtitle: "text-stone-400 text-sm italic",
              socialButtonsBlockButton: "border-amber-500/10 hover:border-amber-500/30 hover:bg-amber-500/5 text-stone-200",
              formButtonPrimary: "bg-amber-600 hover:bg-amber-500 text-black font-semibold tracking-wider transition-all duration-300",
              footerActionLink: "text-amber-500 hover:text-amber-400 font-medium",
            },
          }}
        />
      </div>
    </div>
  );
}
