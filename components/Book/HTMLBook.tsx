"use client";

import React, { forwardRef, useEffect, useRef, useState } from "react";
import HTMLPageFlip from "react-pageflip";
import { useBookStore } from "@/store/useBookStore";
import { albumData } from "@/data/album";

// 1. Individual Page Component (using forwardRef to let react-pageflip control the DOM node)
interface PageProps {
  isCover?: boolean;
  pageNumber: string;
  children: React.ReactNode;
}

const BookPage = forwardRef<HTMLDivElement, PageProps>((props, ref) => {
  return (
    <div
      ref={ref}
      className={`page w-full h-full relative select-none overflow-hidden flex flex-col ${
        props.isCover
          ? "bg-gradient-to-br from-[#241a15] via-[#16100d] to-[#0c0908] border-amber-500/20"
          : "bg-gradient-to-br from-[#191310] via-[#0e0a08] to-[#070504] border-amber-500/10"
      } border`}
      style={{
        boxShadow: "inset 0 0 100px rgba(0, 0, 0, 0.8), 0 10px 40px rgba(0, 0, 0, 0.6)",
      }}
    >
      {/* Page Content */}
      <div className="w-full h-full relative p-6 flex flex-col justify-between">
        {props.children}
      </div>

      {/* Decorative center page binding shadow */}
      <div className="absolute top-0 bottom-0 w-[15px] bg-gradient-to-r from-black/40 to-transparent left-0 pointer-events-none" />
      <div className="absolute top-0 bottom-0 w-[15px] bg-gradient-to-l from-black/40 to-transparent right-0 pointer-events-none" />
    </div>
  );
});
BookPage.displayName = "BookPage";

// 2. Main HTML Book Component
export default function HTMLBook() {
  const currentPage = useBookStore((state) => state.currentPage);
  const totalPages = useBookStore((state) => state.totalPages);
  const isAnimating = useBookStore((state) => state.isAnimating);
  const setPage = useBookStore((state) => state.setPage);
  const setAnimating = useBookStore((state) => state.setAnimating);

  const flipBookRef = useRef<any>(null);
  const M = albumData.length;

  const [scale, setScale] = useState(1);

  // Responsive layout: Statically scale down the book container to fit smaller viewport widths
  // keeping the book locked in the center without manual drag/pan movements.
  useEffect(() => {
    const handleResize = () => {
      const bookWidth = 920;
      const padding = 40; // 20px margin on each side
      const availableWidth = window.innerWidth - padding;
      if (availableWidth < bookWidth) {
        setScale(availableWidth / bookWidth);
      } else {
        setScale(1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Track two-way state updating locks to prevent loops
  const isSyncingFromStore = useRef(false);

  // Sync: Zustand Store -> react-pageflip
  useEffect(() => {
    if (!flipBookRef.current) return;
    const pageFlip = flipBookRef.current.pageFlip();
    if (!pageFlip) return;

    const currentFlipPage = pageFlip.getCurrentPageIndex();

    // Map spread state S (0 to M+1) to page Index P (0 to 2M+1)
    let targetFlipPage = 0;
    if (currentPage === 0) {
      targetFlipPage = 0;
    } else if (currentPage === totalPages) {
      targetFlipPage = 2 * M + 1;
    } else {
      targetFlipPage = 2 * currentPage - 1;
    }

    if (currentFlipPage !== targetFlipPage && !isAnimating) {
      isSyncingFromStore.current = true;
      pageFlip.turnToPage(targetFlipPage);
      setTimeout(() => {
        isSyncingFromStore.current = false;
      }, 100);
    }
  }, [currentPage, totalPages, M, isAnimating]);

  // Sync: react-pageflip -> Zustand Store
  const onFlip = (e: any) => {
    if (isSyncingFromStore.current) return;
    
    const pageIndex = e.data; // new page index (0 to 2M+1)
    
    // Map page Index P to spread state S
    let spreadIndex = 0;
    if (pageIndex === 0) {
      spreadIndex = 0;
    } else if (pageIndex >= 2 * M + 1) {
      spreadIndex = totalPages;
    } else {
      spreadIndex = Math.floor((pageIndex - 1) / 2) + 1;
    }

    setPage(spreadIndex);
  };

  const onInit = () => {
    // Optionally log completion
  };

  return (
    <div className="w-full h-full flex items-center justify-center min-h-0 select-none overflow-hidden">
      {/* 3. HTML PAGE FLIP BOOK WRAPPER WITH CSS SCALE */}
      <div
        className="relative w-[920px] h-[620px] flex justify-center items-center overflow-visible select-none origin-center transition-transform duration-150 shrink-0"
        style={{ transform: `scale(${scale})` }}
      >
        <HTMLPageFlip
          width={460}
          height={620}
          size="fixed"
          mode="double"
          showCover={true}
          mobileScrollSupport={true}
          maxShadowOpacity={0.5}
          onFlip={onFlip}
          onInit={onInit}
          ref={flipBookRef}
          className="shadow-2xl rounded-sm"
        >
                  {/* PAGE 00: FRONT COVER */}
                  <BookPage isCover={true} pageNumber="Cover">
                    {/* Golden borders */}
                    <div className="absolute inset-4 border border-[#daaf37]/35 rounded-sm pointer-events-none" />
                    <div className="absolute inset-5 border border-[#daaf37]/10 rounded-sm pointer-events-none" />
                    
                    {/* Logo Emblem */}
                    <div className="flex-grow flex flex-col justify-center items-center text-center gap-6 p-4">
                      <div className="w-24 h-24 rounded-full border border-amber-500/35 flex items-center justify-center text-amber-400 font-serif text-3xl font-bold shadow-lg shadow-amber-500/5 bg-amber-500/5 animate-pulse">
                        ❦
                      </div>
                      <div className="space-y-3">
                        <p className="text-[10px] tracking-[0.5em] font-mono text-amber-500/50 uppercase">
                          Our Eternal Journey
                        </p>
                        <h2 className="font-serif text-3xl font-bold tracking-wider text-amber-100 uppercase">
                          OUR WEDDING
                        </h2>
                        <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#daaf37]/45 to-transparent mx-auto" />
                        <p className="font-serif italic text-base text-amber-300/60">
                          A Story of Love & Devotion
                        </p>
                      </div>
                    </div>
                    
                    {/* Bottom date stamp */}
                    <div className="text-center font-mono text-[9px] tracking-widest text-amber-500/40 uppercase">
                      Est. Thursday 05/09/2026
                    </div>
                  </BookPage>

                  {/* GENERATE INNER PAGES */}
                  {albumData.map((spread, idx) => {
                    const pageNumLeft = (idx * 2 + 1).toString().padStart(2, "0");
                    const pageNumRight = (idx * 2 + 2).toString().padStart(2, "0");

                    // Alternate layouts for each spread
                    const layoutType = idx % 3;

                    return [
                      // LEFT PAGE (Spread idx, Left side image)
                      <BookPage key={`left-${idx}`} pageNumber={`${pageNumLeft}a`}>
                        <div className="absolute inset-4 border border-amber-500/10 pointer-events-none" />
                        
                        {/* Page Layout */}
                        {layoutType === 0 ? (
                          // Layout 0: Elegant centered portrait with title below
                          <div className="flex-grow flex flex-col justify-between p-2">
                            <div className="relative w-full aspect-[4/5] rounded overflow-hidden border border-amber-500/20 shadow-xl group">
                              <img
                                src={spread.leftImage}
                                alt="Wedding Photo"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                              <div className="absolute inset-0 border-[5px] border-amber-500/35 pointer-events-none" />
                            </div>
                            <div className="text-center mt-4 space-y-1">
                              <h3 className="font-serif text-lg tracking-wider text-amber-400 font-semibold">
                                {spread.title}
                              </h3>
                              <p className="font-serif italic text-stone-400 text-xs px-2 line-clamp-2">
                                {spread.subtitle}
                              </p>
                            </div>
                          </div>
                        ) : layoutType === 1 ? (
                          // Layout 1: Polaroid and Title
                          <div className="flex-grow flex flex-col justify-between p-2">
                            <div className="space-y-1 pb-4">
                              <h3 className="font-serif text-xl tracking-wider text-amber-400 font-semibold text-left">
                                {spread.title}
                              </h3>
                              <p className="font-serif italic text-stone-400 text-xs text-left">
                                {spread.subtitle}
                              </p>
                            </div>
                            <div className="relative w-[85%] aspect-square mx-auto bg-white p-3 shadow-2xl rounded-sm rotate-[-3deg] transform hover:rotate-0 transition-transform duration-300">
                              <div className="w-full aspect-square overflow-hidden bg-stone-900">
                                <img
                                  src={spread.leftImage}
                                  alt="Polaroid"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="mt-2 text-center text-[10px] text-stone-500 font-mono tracking-wider">
                                ~ Sweetest Memories ~
                              </div>
                            </div>
                            <div className="h-6" />
                          </div>
                        ) : (
                          // Layout 2: Wide portrait banner with side label
                          <div className="flex-grow flex flex-col justify-between p-2 gap-4">
                            <div className="flex-grow relative border border-amber-500/25 rounded overflow-hidden shadow-2xl">
                              <img
                                src={spread.leftImage}
                                alt="Side Bordered"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 border-[6px] border-amber-500/30 pointer-events-none" />
                            </div>
                            <div className="text-left font-serif border-l-2 border-amber-500/40 pl-4 py-1">
                              <p className="text-[9px] uppercase font-mono tracking-[0.2em] text-amber-500/60 mb-0.5">
                                Forever & Always
                              </p>
                              <h3 className="text-base text-amber-200 tracking-wide font-medium">
                                {spread.title}
                              </h3>
                            </div>
                          </div>
                        )}

                        {/* Page Number */}
                        <div className="text-left font-serif text-[10px] text-amber-500/40 mt-2 pl-2">
                          {pageNumLeft}a
                        </div>
                      </BookPage>,

                      // RIGHT PAGE (Spread idx, Right side image)
                      <BookPage key={`right-${idx}`} pageNumber={`${pageNumRight}b`}>
                        <div className="absolute inset-4 border border-amber-500/10 pointer-events-none" />
                        
                        {/* Page Layout */}
                        {layoutType === 0 ? (
                          // Layout 0: Circular masked portrait
                          <div className="flex-grow flex flex-col justify-center items-center p-2 gap-6">
                            <div className="relative w-[280px] h-[280px] rounded-full overflow-hidden border border-amber-500/35 shadow-2xl flex items-center justify-center">
                              {/* Soft watercolor faded circle */}
                              <img
                                src={spread.rightImage}
                                alt="Circular Mask"
                                className="w-full h-full object-cover scale-105"
                                style={{
                                  maskImage: "radial-gradient(circle, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
                                  WebkitMaskImage: "radial-gradient(circle, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
                                }}
                              />
                            </div>
                            <div className="text-center space-y-2 max-w-xs">
                              <span className="text-amber-500/40 text-xs tracking-widest font-mono">✦ ✦ ✦</span>
                              <h4 className="font-serif italic text-sm text-amber-200/80 leading-relaxed px-4">
                                "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine."
                              </h4>
                            </div>
                          </div>
                        ) : layoutType === 1 ? (
                          // Layout 1: Luxury frame inside double golden rectangle
                          <div className="flex-grow flex flex-col justify-center p-2">
                            <div className="relative w-full aspect-[4/3] border border-amber-500/20 shadow-2xl rounded overflow-hidden">
                              <img
                                src={spread.rightImage}
                                alt="Golden Framed"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 border-[8px] border-amber-500/40 pointer-events-none" />
                              <div className="absolute inset-2 border border-[#ffffff]/10 pointer-events-none" />
                            </div>
                            <div className="text-center mt-6">
                              <p className="text-[10px] tracking-[0.3em] font-mono text-amber-500/60 uppercase">
                                Eternal Promises
                              </p>
                              <h3 className="font-serif text-base font-medium text-amber-100 uppercase tracking-wide mt-1">
                                Together In Harmony
                              </h3>
                            </div>
                          </div>
                        ) : (
                          // Layout 2: Landscape central card layout
                          <div className="flex-grow flex flex-col justify-between p-2 gap-4">
                            <div className="text-center space-y-1 py-1">
                              <h3 className="font-serif text-lg tracking-wider text-amber-400 font-semibold">
                                {spread.title}
                              </h3>
                              <p className="font-serif italic text-stone-400 text-xs px-2 line-clamp-1">
                                {spread.subtitle}
                              </p>
                            </div>
                            <div className="flex-grow relative border border-amber-500/25 rounded overflow-hidden shadow-2xl">
                              <img
                                src={spread.rightImage}
                                alt="Luxury Landscape"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 border-[6px] border-amber-500/35 pointer-events-none" />
                            </div>
                          </div>
                        )}

                        {/* Page Number */}
                        <div className="text-right font-serif text-[10px] text-amber-500/40 mt-2 pr-2">
                          {pageNumRight}b
                        </div>
                      </BookPage>
                    ];
                  })}

                  {/* PAGE 13: BACK COVER */}
                  <BookPage isCover={true} pageNumber="Cover-Back">
                    <div className="absolute inset-4 border border-[#daaf37]/35 rounded-sm pointer-events-none" />
                    <div className="absolute inset-5 border border-[#daaf37]/10 rounded-sm pointer-events-none" />
                    
                    <div className="flex-grow flex flex-col justify-center items-center text-center">
                      <div className="text-amber-500/45 text-2xl font-serif mb-4 animate-pulse">
                        ✦
                      </div>
                      <p className="text-[9px] tracking-[0.4em] font-mono text-amber-500/40 uppercase">
                        The End
                      </p>
                      <h3 className="font-serif text-xs italic text-stone-500/80 mt-1">
                        May your love burn brighter than a thousand stars.
                    </h3>
                  </div>
                </BookPage>
              </HTMLPageFlip>
              </div>
    </div>
  );
}
