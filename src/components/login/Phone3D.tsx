'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Sparkles, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

/**
 * 3D Interactive Phone Showcase
 * Ultra-modern interactive 3D showcase featuring:
 * - High-definition Alpha Edu Hub Student Dashboard
 * - Real-time gyroscopic mouse parallax (3D tilt & translation)
 * - Multi-spectrum studio backlighting (cyan, violet, electric blue)
 * - Floating stereoscopic glass badges with independent depth axes
 * - Neon rim ground glow and soft contact shadow
 * - 4-point diamond sparkle stars
 */
export default function Phone3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Smooth mouse move tracking over the stage
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

    setCoords({ x, y });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  }, []);

  // Parallax calculations
  const rotateY = coords.x * 14; // -7 to +7 deg
  const rotateX = -coords.y * 10; // -5 to +5 deg
  const translateX = coords.x * 16;
  const translateY = coords.y * 12;

  // Foreground chips parallax (higher delta for stereoscopic depth)
  const chip1X = coords.x * 28;
  const chip1Y = coords.y * 20;
  const chip2X = -coords.x * 24;
  const chip2Y = -coords.y * 18;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full flex flex-col items-center justify-center select-none py-4 overflow-visible pointer-events-auto"
      style={{ perspective: '1200px' }}
    >
      {/* ─── LAYER 0: Ambient Studio Lighting (Multi-Spectrum Backlight) ─── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[560px] rounded-full pointer-events-none transition-transform duration-700 ease-out opacity-85"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.28) 0%, rgba(129, 140, 248, 0.22) 40%, rgba(192, 132, 252, 0.12) 65%, transparent 80%)',
          filter: 'blur(55px)',
          transform: `translate(-50%, -50%) translate(${translateX * 0.7}px, ${translateY * 0.7}px)`,
        }}
      />

      {/* ─── LAYER 1: 4-Point Diamond Sparkle Stars ─── */}
      <div
        className="absolute top-[10%] right-[12%] pointer-events-none text-sky-400/80 animate-sparkle-1 transition-transform duration-300"
        style={{
          transform: `translate(${coords.x * 22}px, ${coords.y * 20}px)`,
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6L12 0Z" />
        </svg>
      </div>

      <div
        className="absolute bottom-[18%] left-[10%] pointer-events-none text-indigo-400/70 animate-sparkle-2 transition-transform duration-300"
        style={{
          transform: `translate(${coords.x * -20}px, ${coords.y * -18}px)`,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6L12 0Z" />
        </svg>
      </div>

      {/* ─── LAYER 2: 3D Floating Assembly (Phone + Pedestal) ─── */}
      <div
        className="relative flex flex-col items-center transition-transform duration-300 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${translateX}px, ${translateY}px, 0) ${
            isHovered ? 'scale(1.03)' : 'scale(1)'
          }`,
        }}
      >
        {/* Floating Animation Wrapper */}
        <div
          className="relative animate-phone-float flex flex-col items-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Main 3D Phone & Pedestal Render */}
          <div
            className="relative w-[340px] sm:w-[380px] md:w-[410px] lg:w-[420px] xl:w-[440px] aspect-[1024/1536] drop-shadow-[0_28px_45px_rgba(15,23,42,0.22)] transition-all duration-300"
            style={{
              transform: 'translateZ(40px)',
            }}
          >
            <Image
              src="/images/login/phone-3d-showcase.webp"
              alt="Alpha Edu Hub 3D Student Dashboard"
              fill
              priority
              sizes="(max-width: 1024px) 380px, 450px"
              className="object-contain pointer-events-none select-none"
            />
          </div>

          {/* Neon Rim Pulse Glow Aura below the pedestal */}
          <div
            className="absolute -bottom-1 w-[260px] sm:w-[300px] h-[36px] rounded-full pointer-events-none animate-purple-neon"
            style={{
              background:
                'radial-gradient(ellipse at 50% 50%, rgba(147, 51, 234, 0.75) 0%, rgba(56, 189, 248, 0.65) 50%, transparent 80%)',
              transform: 'translateZ(10px)',
            }}
          />

          {/* Ground Contact Shadow on the Floor */}
          <div
            className="w-[300px] sm:w-[340px] h-[30px] mt-2 rounded-[100%] animate-pedestal-shadow pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse, rgba(15, 23, 42, 0.38) 0%, rgba(56, 189, 248, 0.12) 45%, transparent 75%)',
            }}
          />
        </div>

        {/* ─── LAYER 3: Stereoscopic Floating Glass Depth Badges ─── */}
        {/* Chip 1: Top-Right Glass Badge (Attendance Score) */}
        <div
          className="absolute -top-1 -right-4 sm:-right-8 z-30 pointer-events-none hidden sm:flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 shadow-[0_16px_32px_rgba(15,23,42,0.12)] text-slate-800 transition-transform duration-200 ease-out"
          style={{
            transform: `translate3d(${chip1X}px, ${chip1Y}px, 90px)`,
          }}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <TrendingUp className="w-4 h-4 text-blue-100" />
          </div>
          <div>
            <div className="text-[12px] font-extrabold text-slate-900 leading-tight flex items-center gap-1.5">
              <span>96.4% Attendance</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[10px] font-semibold text-blue-600">Top 5% in Class 10-A</div>
          </div>
        </div>

        {/* Chip 2: Bottom-Left Glass Badge (Live Schedule) */}
        <div
          className="absolute bottom-24 -left-4 sm:-left-8 z-30 pointer-events-none hidden sm:flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 shadow-[0_16px_32px_rgba(15,23,42,0.12)] text-slate-800 transition-transform duration-200 ease-out"
          style={{
            transform: `translate3d(${chip2X}px, ${chip2Y}px, 85px)`,
          }}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-xs">
            <Clock className="w-4 h-4 text-sky-100" />
          </div>
          <div>
            <div className="text-[12px] font-extrabold text-slate-900 leading-tight">
              Physics • Class 10-A
            </div>
            <div className="text-[10px] font-semibold text-sky-600 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>10:00 AM • Room 204</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
