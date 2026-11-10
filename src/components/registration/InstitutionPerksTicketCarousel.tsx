'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowUpRight, ArrowRight, Sparkles } from 'lucide-react';

interface PerkTicket {
  id: string;
  number: string;
  badge: string;
  title: string;
  description: string;
  themeBg: string;
  themeTag: string;
  renderIllustration: () => React.ReactNode;
}

const PERKS: PerkTicket[] = [
  {
    id: 'perk-1',
    number: 'PERK 01',
    badge: 'FREE SETUP',
    title: 'ZERO-COST DATA MIGRATION',
    description:
      'Our dedicated migration team migrates your existing student rosters, faculty profiles, and past fee ledgers free of charge within 48 hours.',
    themeBg: '#D5DCFA', // pastel periwinkle
    themeTag: 'ADMIT ONE',
    renderIllustration: () => (
      /* 3D Isometric Delivery Parcel Box */
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id="boxTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f6caa1" />
              <stop offset="100%" stopColor="#e3a772" />
            </linearGradient>
            <linearGradient id="boxLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#cd864a" />
              <stop offset="100%" stopColor="#b36932" />
            </linearGradient>
            <linearGradient id="boxRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ba763c" />
              <stop offset="100%" stopColor="#965422" />
            </linearGradient>
            <linearGradient id="tapeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f3ddbe" />
              <stop offset="100%" stopColor="#dfbd93" />
            </linearGradient>
          </defs>
          {/* Shadow */}
          <ellipse cx="60" cy="104" rx="44" ry="11" fill="rgba(15, 23, 42, 0.18)" />
          {/* Box Left Side */}
          <polygon points="24,48 60,70 60,102 24,80" fill="url(#boxLeft)" />
          {/* Box Right Side */}
          <polygon points="60,70 96,48 96,80 60,102" fill="url(#boxRight)" />
          {/* Box Top */}
          <polygon points="60,22 96,48 60,70 24,48" fill="url(#boxTop)" />
          {/* Packaging Tape Center */}
          <polygon points="53,26 67,26 67,66 53,66" fill="url(#tapeGrad)" opacity="0.9" />
          <polygon points="53,66 67,66 67,99 53,99" fill="url(#tapeGrad)" opacity="0.8" />
          {/* Shipping Label */}
          <rect x="32" y="68" width="16" height="12" rx="2" fill="#ffffff" opacity="0.95" />
          <line x1="35" y1="71" x2="44" y2="71" stroke="#b36932" strokeWidth="1.2" />
          <line x1="35" y1="75" x2="42" y2="75" stroke="#b36932" strokeWidth="1.2" />
        </svg>
      </div>
    ),
  },
  {
    id: 'perk-2',
    number: 'PERK 02',
    badge: 'ACCREDITED',
    title: 'CBSE & STATE BOARD READY',
    description:
      'Pre-configured CCE report card templates, automated GPA calculations, UDISE+/APAAR code tracking, and digital transfer certificates out of the box.',
    themeBg: '#FFE4B5', // soft warm peach/amber
    themeTag: 'CERTIFIED',
    renderIllustration: () => (
      /* 3D Graduation Diploma / Official Certificate Scroll */
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id="parchment" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff7ed" />
              <stop offset="100%" stopColor="#fed7aa" />
            </linearGradient>
            <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
            <linearGradient id="goldMedal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
          {/* Shadow */}
          <ellipse cx="60" cy="102" rx="42" ry="10" fill="rgba(15, 23, 42, 0.16)" />
          {/* Parchment Sheet */}
          <path
            d="M32,24 C32,20 40,18 60,18 C80,18 88,20 88,24 L88,88 C88,94 80,98 60,98 C40,98 32,94 32,88 Z"
            fill="url(#parchment)"
          />
          {/* Document Lines */}
          <line x1="42" y1="34" x2="78" y2="34" stroke="#ea580c" strokeWidth="2.8" strokeLinecap="round" opacity="0.65" />
          <line x1="42" y1="44" x2="78" y2="44" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
          <line x1="42" y1="52" x2="70" y2="52" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
          <line x1="42" y1="60" x2="74" y2="60" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
          {/* Golden Seal */}
          <circle cx="60" cy="79" r="12" fill="url(#goldMedal)" />
          <circle cx="60" cy="79" r="9" fill="none" stroke="#713f12" strokeWidth="1.2" strokeDasharray="2.5 2.5" />
          {/* Red Ribbon Tails */}
          <polygon points="55,87 50,103 60,98 65,103 61,87" fill="url(#ribbonGrad)" />
        </svg>
      </div>
    ),
  },
  {
    id: 'perk-3',
    number: 'PERK 03',
    badge: 'AUTOMATED',
    title: 'AUTOMATED WHATSAPP SUITE',
    description:
      'Instant period-absence notifications, monthly fee payment reminders with UPI QR links, and urgent circulars sent directly to parents on WhatsApp.',
    themeBg: '#C7F9D4', // soft pastel mint green
    themeTag: 'INSTANT ALERTS',
    renderIllustration: () => (
      /* 3D Party Popper / Mega Broadcast Horn with Confetti */
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id="popperCone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="popperStripe" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
          </defs>
          {/* Shadow */}
          <ellipse cx="62" cy="100" rx="38" ry="9" fill="rgba(15, 23, 42, 0.16)" />
          {/* Cone body */}
          <polygon points="34,90 80,52 52,34" fill="url(#popperCone)" />
          {/* Cone rim */}
          <ellipse cx="66" cy="43" rx="17" ry="11" transform="rotate(-35 66 43)" fill="#fbbf24" />
          {/* Cone stripe */}
          <path d="M43,73 L63,57 L54,50 L38,66 Z" fill="url(#popperStripe)" />
          {/* Floating Confetti ribbons & spheres */}
          <circle cx="88" cy="28" r="5" fill="#ec4899" />
          <circle cx="73" cy="19" r="4" fill="#3b82f6" />
          <circle cx="97" cy="43" r="3.5" fill="#10b981" />
          <circle cx="82" cy="11" r="3" fill="#f59e0b" />
          {/* Curled streamer */}
          <path
            d="M80,32 Q93,18 101,26 Q110,34 97,47"
            fill="none"
            stroke="#6366f1"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M63,16 Q72,5 81,14"
            fill="none"
            stroke="#ec4899"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
  },
  {
    id: 'perk-4',
    number: 'PERK 04',
    badge: 'PRIORITY VIP',
    title: 'DEDICATED ACCOUNT ARCHITECT',
    description:
      'Direct priority phone and WhatsApp channel with an assigned educational ERP specialist to guide teacher onboarding and timetable setup.',
    themeBg: '#BAE6FD', // soft sky periwinkle
    themeTag: 'VIP CONCIERGE',
    renderIllustration: () => (
      /* 3D Security Shield & Dedicated Architect Crown */
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="shieldInner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#0c4a6e" />
            </linearGradient>
          </defs>
          {/* Shadow */}
          <ellipse cx="60" cy="103" rx="40" ry="9" fill="rgba(15, 23, 42, 0.17)" />
          {/* Outer Shield */}
          <path
            d="M60,18 C84,22 94,28 94,54 C94,78 77,94 60,100 C43,94 26,78 26,54 C26,28 36,22 60,18 Z"
            fill="url(#shieldGrad)"
          />
          {/* Inner Shield */}
          <path
            d="M60,24 C80,28 88,33 88,54 C88,74 73,88 60,94 C47,88 32,74 32,54 C32,33 40,28 60,24 Z"
            fill="url(#shieldInner)"
          />
          {/* Golden Checkmark / Key */}
          <path
            d="M47,54 L56,63 L75,44"
            fill="none"
            stroke="#fef08a"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Top Star */}
          <polygon points="60,32 62,38 68,39 64,43 65,49 60,45 55,49 56,43 52,39 58,38" fill="#fef08a" />
        </svg>
      </div>
    ),
  },
  {
    id: 'perk-5',
    number: 'PERK 05',
    badge: 'LIFETIME',
    title: 'LIFETIME CLOUD & SUBDOMAIN',
    description:
      'Free custom institution domain (yourschool.alphaeduhub.in), bank-grade automated daily backups, and unlimited server bandwidth with zero cloud surcharges.',
    themeBg: '#FECDD3', // soft pastel rose
    themeTag: 'GUARANTEED',
    renderIllustration: () => (
      /* 3D Golden Treasure Pouch / Rupee Sack */
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id="pouchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="goldCoin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
          {/* Shadow */}
          <ellipse cx="60" cy="105" rx="44" ry="10" fill="rgba(15, 23, 42, 0.17)" />
          {/* Pouch Bag */}
          <path
            d="M36,44 C42,36 78,36 84,44 C96,62 98,88 88,98 C78,106 42,106 32,98 C22,88 24,62 36,44 Z"
            fill="url(#pouchGrad)"
          />
          {/* Pouch Neck */}
          <polygon points="48,36 72,36 76,42 44,42" fill="#c2410c" />
          {/* Pouch Tie String */}
          <ellipse cx="60" cy="42" rx="15" ry="3.5" fill="#fef08a" />
          {/* Pouch Top Frill */}
          <path d="M44,42 C40,32 50,28 60,28 C70,28 80,32 76,42 Z" fill="#ea580c" />
          {/* Indian Rupee ₹ Symbol */}
          <text
            x="60"
            y="84"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="34"
            fontWeight="900"
            fontFamily="sans-serif"
            className="select-none"
          >
            ₹
          </text>
        </svg>
      </div>
    ),
  },
];

interface CarouselProps {
  onApplyClick: () => void;
}

export default function InstitutionPerksTicketCarousel({ onApplyClick }: CarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxScroll, setMaxScroll] = useState<number>(1800);

  // Measure total horizontal track width relative to viewport width
  useEffect(() => {
    const calculateDistance = () => {
      if (trackRef.current) {
        const trackWidth = trackRef.current.scrollWidth;
        const windowWidth = window.innerWidth;
        // Total horizontal translation required to bring the last card comfortably into view
        const distance = Math.max(0, trackWidth - windowWidth + 80);
        setMaxScroll(distance);
      }
    };

    calculateDistance();
    window.addEventListener('resize', calculateDistance);
    return () => window.removeEventListener('resize', calculateDistance);
  }, []);

  // Track vertical scroll within this 300vh section container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Smooth out vertical-to-horizontal spring motion
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 24,
    stiffness: 110,
    mass: 0.18,
  });

  // Map vertical progress [0, 1] to horizontal X translation [0, -maxScroll]
  const x = useTransform(smoothProgress, [0, 1], [0, -maxScroll]);

  return (
    /* ── STICKY HORIZONTAL SCROLL CONTAINER (320vh height drives horizontal translation) ── */
    <div
      ref={containerRef}
      className="relative bg-[#0B0F19] text-white selection:bg-indigo-900 selection:text-white"
      style={{ height: '320vh' }}
    >
      {/* ── STICKY VIEWPORT PINNED AT TOP ── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between py-8 sm:py-10 select-none">
        
        {/* Technical dot-matrix background grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.22) 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Ambient atmospheric gradients */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[110px] pointer-events-none" />

        {/* Top subtle category pill */}
        <div className="relative z-10 px-6 sm:px-12 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-mono font-bold tracking-[0.2em] text-indigo-300 uppercase">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>PARTNER PRIVILEGES</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-slate-400">
            <span>SCROLL DOWN TO REVEAL ALL PERKS</span>
            <ArrowRight className="w-4 h-4 text-indigo-400 animate-pulse" />
          </div>
        </div>

        {/* ── HORIZONTAL SCROLLING TRACK (TRANSFORMS SIDEWAYS ON VERTICAL SCROLL) ── */}
        <div className="relative z-10 my-auto w-full overflow-hidden">
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="flex items-center gap-8 sm:gap-10 pl-6 sm:pl-16 pr-16 sm:pr-32 w-max"
          >
            {/* ── 1. TITLE & CTA PANEL (FIRST ITEM IN HORIZONTAL TRACK) ── */}
            <div className="w-[340px] sm:w-[420px] shrink-0 flex flex-col justify-between h-[520px] sm:h-[580px] p-4 sm:p-6 text-left">
              <div>
                <span className="text-xs font-mono font-extrabold tracking-[0.22em] text-indigo-400 uppercase block mb-3">
                  EXCLUSIVE PRIVILEGES
                </span>
                <h2 className="text-5xl sm:text-6xl lg:text-[68px] font-black text-white tracking-[-0.03em] leading-[1.04]">
                  Exclusive
                  <br />
                  Partner
                  <br />
                  Perks
                </h2>
                <p className="mt-6 text-sm sm:text-base text-slate-400 max-w-sm leading-relaxed">
                  5 premium institutional privileges unlocked the moment you onboard your campus to Alpha Edu Hub.
                </p>

                {/* Apply Now Pill CTA */}
                <div className="mt-8">
                  <button
                    onClick={onApplyClick}
                    className="group inline-flex items-center gap-3.5 bg-white hover:bg-slate-100 text-slate-950 pl-6 pr-3.5 py-3 rounded-full text-base font-bold shadow-2xl transition-all hover:scale-105 active:scale-95"
                  >
                    <span>Apply Now</span>
                    <span className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-xs transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </button>
                </div>
              </div>

              {/* Scroll instruction indicator */}
              <div className="pt-6 border-t border-white/10 flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-slate-400">
                <span>SCROLL DOWN</span>
                <span className="text-indigo-400 font-extrabold">──────→</span>
              </div>
            </div>

            {/* ── 2. THE 5 ENLARGED PERFORATED TICKET CARDS ── */}
            {PERKS.map((perk) => (
              <div
                key={perk.id}
                className="shrink-0 w-[340px] sm:w-[390px] lg:w-[420px] h-[520px] sm:h-[570px] lg:h-[590px] rounded-[32px] overflow-hidden flex flex-col shadow-[0_30px_70px_-15px_rgba(0,0,0,0.6)] relative select-none hover:-translate-y-2 transition-transform duration-300"
              >
                {/* ── TOP HALF OF TICKET (PASTEL HEADER & 3D ASSET) ── */}
                <div
                  className="relative h-[270px] sm:h-[295px] lg:h-[310px] p-7 sm:p-8 flex flex-col justify-between"
                  style={{ backgroundColor: perk.themeBg }}
                >
                  {/* Top Row: Number & Admit One Badge */}
                  <div className="flex items-center justify-between z-10">
                    <span className="text-xs font-mono font-black tracking-wider text-slate-900">
                      {perk.number}
                    </span>
                    <span className="border-2 border-slate-900 rounded-full px-3 py-0.5 text-[10px] font-black tracking-widest text-slate-900 uppercase">
                      {perk.themeTag}
                    </span>
                  </div>

                  {/* Centered Enlarged 3D Graphic */}
                  <div className="my-auto flex items-center justify-center z-10 py-1">
                    {perk.renderIllustration()}
                  </div>
                </div>

                {/* ── TICKET NOTCH & PERFORATION DIVIDER ── */}
                <div className="relative h-0 z-20 flex items-center justify-between">
                  {/* Left circular notch cutout matching background */}
                  <div className="w-8 h-8 rounded-full bg-[#0B0F19] -ml-4 shadow-inner" />
                  {/* Dashed perforated coupon tear line */}
                  <div className="flex-1 border-b-2 border-dashed border-slate-300/90 mx-1.5" />
                  {/* Right circular notch cutout matching background */}
                  <div className="w-8 h-8 rounded-full bg-[#0B0F19] -mr-4 shadow-inner" />
                </div>

                {/* ── BOTTOM HALF OF TICKET (WHITE CARD WITH COPY) ── */}
                <div className="flex-1 bg-white p-7 sm:p-8 flex flex-col justify-between text-left">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight leading-snug">
                      {perk.title}
                    </h3>
                    <p className="mt-3.5 text-xs sm:text-[14px] text-slate-600 font-medium leading-relaxed">
                      {perk.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span>Alpha Edu Hub Privilege</span>
                    <span className="text-indigo-600 font-extrabold">Verified ✓</span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── BOTTOM PROGRESS BAR & HINT ── */}
        <div className="relative z-10 px-6 sm:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400">PROGRESS</span>
            <div className="w-48 sm:w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full"
                style={{
                  width: useTransform(smoothProgress, [0, 1], ['18%', '100%']),
                }}
              />
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            5 of 5 Privileges • Next: Registration Form ↓
          </div>
        </div>

      </div>
    </div>
  );
}
