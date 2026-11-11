'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Sparkles, CheckCircle2, TrendingUp, ShieldCheck } from 'lucide-react';

/**
 * 3D Interactive Phone Showcase
 * Uses the ultra-high-definition 3D render of Alpha Edu Hub Student Dashboard
 * with real-time multi-layer gyroscopic parallax, floating physics, ambient studio
 * spotlighting, neon reflection aura, and stereoscopic foreground depth chips.
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
  const rotateY = coords.x * 16; // -8 to +8 deg
  const rotateX = -coords.y * 12; // -6 to +6 deg
  const translateX = coords.x * 18; // -9 to +9 px
  const translateY = coords.y * 14; // -7 to +7 px

  // Foreground chips parallax (higher delta for depth sensation)
  const chip1X = coords.x * 32;
  const chip1Y = coords.y * 24;
  const chip2X = -coords.x * 26;
  const chip2Y = -coords.y * 20;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full flex flex-col items-center justify-center select-none cursor-pointer py-6 overflow-visible"
      style={{ perspective: '1100px' }}
    >
      {/* ─── LAYER 0: Ambient Studio Lighting (Backlight) ─── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[480px] rounded-full pointer-events-none transition-transform duration-500 ease-out opacity-75"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.22) 0%, rgba(56, 189, 248, 0.18) 45%, transparent 70%)',
          filter: 'blur(45px)',
          transform: `translate(-50%, -50%) translate(${translateX * 0.6}px, ${translateY * 0.6}px)`,
        }}
      />

      {/* ─── LAYER 1: 4-Point Diamond Sparkle Stars (Reference Image 2) ─── */}
      <div
        className="absolute top-[12%] right-[10%] pointer-events-none text-slate-400 animate-sparkle-1 transition-transform duration-300"
        style={{
          transform: `translate(${coords.x * 20}px, ${coords.y * 18}px)`,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6L12 0Z" />
        </svg>
      </div>

      <div
        className="absolute bottom-[20%] left-[8%] pointer-events-none text-slate-400 animate-sparkle-2 transition-transform duration-300"
        style={{
          transform: `translate(${coords.x * -18}px, ${coords.y * -16}px)`,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6L12 0Z" />
        </svg>
      </div>

      {/* ─── LAYER 2: 3D Floating Assembly (Phone + Pedestal) ─── */}
      <div
        className="relative flex flex-col items-center transition-transform duration-300 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${translateX}px, ${translateY}px, 0) ${
            isHovered ? 'scale(1.025)' : 'scale(1)'
          }`,
        }}
      >
        {/* Floating Animation Wrapper */}
        <div className="relative animate-phone-float flex flex-col items-center" style={{ transformStyle: 'preserve-3d' }}>
          {/* Main 3D Phone & Pedestal PNG */}
          <div
            className="relative w-[320px] sm:w-[350px] md:w-[380px] lg:w-[390px] xl:w-[410px] aspect-[1024/1536] drop-shadow-[0_25px_35px_rgba(15,23,42,0.25)] transition-all duration-300"
            style={{
              transform: 'translateZ(40px)',
            }}
          >
            <Image
              src="/images/login/phone-3d-showcase.png"
              alt="Alpha Edu Hub 3D Student Dashboard"
              fill
              priority
              sizes="(max-width: 1024px) 350px, 420px"
              className="object-contain pointer-events-none select-none"
            />
          </div>

          {/* Neon Rim Pulse Glow Aura below the pedestal (Matching the purple/cyan neon rim in the image) */}
          <div
            className="absolute -bottom-2 w-[240px] sm:w-[280px] h-[34px] rounded-full pointer-events-none animate-purple-neon"
            style={{
              background:
                'radial-gradient(ellipse at 50% 50%, rgba(168, 85, 247, 0.75) 0%, rgba(56, 189, 248, 0.6) 50%, transparent 80%)',
              transform: 'translateZ(10px)',
            }}
          />

          {/* Ground Contact Shadow on the Floor */}
          <div
            className="w-[280px] sm:w-[330px] h-[28px] mt-2 rounded-[100%] animate-pedestal-shadow pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse, rgba(15, 23, 42, 0.42) 0%, rgba(56, 189, 248, 0.12) 45%, transparent 75%)',
            }}
          />
        </div>

        {/* ─── LAYER 3: Stereoscopic Floating Glass Depth Badges ─── */}
        {/* Chip 1: Top-Right Glass Badge (Attendance Verified) */}
        <div
          className="absolute -top-3 -right-4 sm:-right-8 z-30 pointer-events-none animate-badge-float-1 transition-transform duration-200 ease-out hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_12px_28px_rgba(15,23,42,0.12)] text-slate-800"
          style={{
            transform: `translate3d(${chip1X}px, ${chip1Y}px, 90px)`,
          }}
        >
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-100" />
          </div>
          <div>
            <div className="text-[11px] font-extrabold text-slate-900 leading-tight flex items-center gap-1">
              96.4% Attendance
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-[9.5px] font-semibold text-purple-600">Top 5% in Class 10-A</div>
          </div>
        </div>

        {/* Chip 2: Bottom-Left Glass Badge (Live Cloud Sync) */}
        <div
          className="absolute bottom-20 -left-4 sm:-left-8 z-30 pointer-events-none animate-badge-float-2 transition-transform duration-200 ease-out hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_12px_28px_rgba(15,23,42,0.12)] text-slate-800"
          style={{
            transform: `translate3d(${chip2X}px, ${chip2Y}px, 85px)`,
          }}
        >
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-xs">
            <TrendingUp className="w-3.5 h-3.5 text-sky-100" />
          </div>
          <div>
            <div className="text-[11px] font-extrabold text-slate-900 leading-tight">Physics • Class 10-A</div>
            <div className="text-[9.5px] font-semibold text-sky-600 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
              10:00 AM in Room 204
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
