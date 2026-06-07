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
  fullBleed?: boolean;
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
      <div className={`w-full h-full relative flex flex-col justify-between ${props.fullBleed ? "p-0" : "p-6"}`}>
        {props.children}
      </div>

      {/* Decorative center page binding shadow */}
      <div className="absolute top-0 bottom-0 w-[15px] bg-gradient-to-r from-black/40 to-transparent left-0 pointer-events-none" />
      <div className="absolute top-0 bottom-0 w-[15px] bg-gradient-to-l from-black/40 to-transparent right-0 pointer-events-none" />
    </div>
  );
});
BookPage.displayName = "BookPage";

interface HTMLBookProps {
  spreads?: Array<{
    leftImage: string;
    rightImage: string;
    title: string;
    subtitle: string;
  }>;
}

// 2. Main HTML Book Component
export default function HTMLBook({ spreads = albumData }: HTMLBookProps) {
  const currentPage = useBookStore((state) => state.currentPage);
  const totalPages = useBookStore((state) => state.totalPages);
  const isAnimating = useBookStore((state) => state.isAnimating);
  const setPage = useBookStore((state) => state.setPage);
  const setTotalPages = useBookStore((state) => state.setTotalPages);
  const setAnimating = useBookStore((state) => state.setAnimating);

  const flipBookRef = useRef<any>(null);
  const M = spreads.length;

  const [scale, setScale] = useState(1);

  // Synchronize total pages with dynamic spreads length and reset page index on load
  useEffect(() => {
    setTotalPages(M + 1);
    setPage(0);
  }, [M, setTotalPages, setPage]);

  // Responsive layout: Scale down the landscape book container to fit the viewport width or height
  useEffect(() => {
    const handleResize = () => {
      const bookWidth = 1240;
      const bookHeight = 460;
      const paddingX = 40;
      const paddingY = 145; // Space for headers, toolbars, and footers
      
      const scaleX = (window.innerWidth - paddingX) / bookWidth;
      const scaleY = (window.innerHeight - paddingY) / bookHeight;
      
      const minScale = Math.min(scaleX, scaleY);
      setScale(Math.min(1, minScale));
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
        className="relative w-[1240px] h-[460px] flex justify-center items-center overflow-visible select-none origin-center transition-transform duration-150 shrink-0"
        style={{ transform: `scale(${scale})` }}
      >
        <HTMLPageFlip
          width={620}
          height={460}
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
                  {spreads.map((spread, idx) => {
                    const pageNum = (idx + 1).toString().padStart(2, "0");
                    const isPanoramic = spread.leftImage === spread.rightImage;

                    return [
                      // LEFT PAGE (Spread idx, Left side image)
                      <BookPage key={`left-${idx}`} pageNumber={`${pageNum}a`} fullBleed={true}>
                        <div className="w-full h-full relative overflow-hidden">
                          {isPanoramic ? (
                            <div className="w-[200%] h-full absolute top-0 left-0">
                              <img
                                src={spread.leftImage}
                                alt="Left Page Spread"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <img
                              src={spread.leftImage}
                              alt="Left Page Spread"
                              className="w-full h-full object-cover"
                            />
                          )}
                          {/* Inner page shadow gradient to blend left/right */}
                          <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-transparent pointer-events-none z-10" />
                          <div className="absolute inset-0 border border-[#daaf37]/5 pointer-events-none z-10" />
                          
                          {/* Page Number Overlay (Left) */}
                          <div className="absolute bottom-4 left-4 font-serif text-[10px] text-amber-500/60 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm select-none border border-amber-500/10 z-10">
                            {pageNum}a
                          </div>
                        </div>
                      </BookPage>,

                      // RIGHT PAGE (Spread idx, Right side image)
                      <BookPage key={`right-${idx}`} pageNumber={`${pageNum}b`} fullBleed={true}>
                        <div className="w-full h-full relative overflow-hidden">
                          {isPanoramic ? (
                            <div className="w-[200%] h-full absolute top-0 right-0">
                              <img
                                src={spread.rightImage}
                                alt="Right Page Spread"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <img
                              src={spread.rightImage}
                              alt="Right Page Spread"
                              className="w-full h-full object-cover"
                            />
                          )}
                          {/* Inner page shadow gradient to blend left/right */}
                          <div className="absolute inset-0 bg-gradient-to-l from-black/15 via-transparent to-transparent pointer-events-none z-10" />
                          <div className="absolute inset-0 border border-[#daaf37]/5 pointer-events-none z-10" />
                          
                          {/* Page Number Overlay (Right) */}
                          <div className="absolute bottom-4 right-4 font-serif text-[10px] text-amber-500/60 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm select-none border border-amber-500/10 z-10">
                            {pageNum}b
                          </div>
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
