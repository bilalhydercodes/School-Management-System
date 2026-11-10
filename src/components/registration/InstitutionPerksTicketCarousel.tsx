'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

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
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-xl">
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
          <ellipse cx="60" cy="104" rx="42" ry="10" fill="rgba(15, 23, 42, 0.16)" />
          {/* Box Left Side */}
          <polygon points="26,50 60,70 60,100 26,80" fill="url(#boxLeft)" />
          {/* Box Right Side */}
          <polygon points="60,70 94,50 94,80 60,100" fill="url(#boxRight)" />
          {/* Box Top */}
          <polygon points="60,24 94,50 60,70 26,50" fill="url(#boxTop)" />
          {/* Packaging Tape Center */}
          <polygon points="54,28 66,28 66,66 54,66" fill="url(#tapeGrad)" opacity="0.9" />
          <polygon points="54,66 66,66 66,97 54,97" fill="url(#tapeGrad)" opacity="0.8" />
          {/* Small Shipping Label */}
          <rect x="34" y="68" width="14" height="10" rx="1.5" fill="#ffffff" opacity="0.92" />
          <line x1="36" y1="71" x2="44" y2="71" stroke="#b36932" strokeWidth="1" />
          <line x1="36" y1="74" x2="42" y2="74" stroke="#b36932" strokeWidth="1" />
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
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-xl">
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
          <ellipse cx="60" cy="102" rx="40" ry="9" fill="rgba(15, 23, 42, 0.15)" />
          {/* Parchment Sheet */}
          <path
            d="M34,26 C34,22 40,20 60,20 C80,20 86,22 86,26 L86,88 C86,94 78,98 60,98 C42,98 34,94 34,88 Z"
            fill="url(#parchment)"
          />
          {/* Document Lines */}
          <line x1="44" y1="36" x2="76" y2="36" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <line x1="44" y1="46" x2="76" y2="46" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <line x1="44" y1="54" x2="68" y2="54" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <line x1="44" y1="62" x2="72" y2="62" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          {/* Golden Seal */}
          <circle cx="60" cy="80" r="11" fill="url(#goldMedal)" />
          <circle cx="60" cy="80" r="8" fill="none" stroke="#713f12" strokeWidth="1" strokeDasharray="2 2" />
          {/* Red Ribbon Tails */}
          <polygon points="56,88 52,102 60,98 64,102 60,88" fill="url(#ribbonGrad)" />
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
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-xl">
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
          <ellipse cx="62" cy="100" rx="36" ry="8" fill="rgba(15, 23, 42, 0.15)" />
          {/* Cone body */}
          <polygon points="36,88 78,54 52,38" fill="url(#popperCone)" />
          {/* Cone rim */}
          <ellipse cx="65" cy="46" rx="16" ry="10" transform="rotate(-35 65 46)" fill="#fbbf24" />
          {/* Cone stripe */}
          <path d="M44,72 L62,58 L54,52 L39,66 Z" fill="url(#popperStripe)" />
          {/* Floating Confetti ribbons & spheres */}
          <circle cx="86" cy="30" r="4.5" fill="#ec4899" />
          <circle cx="72" cy="22" r="3.5" fill="#3b82f6" />
          <circle cx="94" cy="44" r="3" fill="#10b981" />
          <circle cx="80" cy="14" r="2.5" fill="#f59e0b" />
          {/* Curled streamer */}
          <path
            d="M78,34 Q90,20 98,28 Q106,36 94,48"
            fill="none"
            stroke="#6366f1"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M62,18 Q70,8 78,16"
            fill="none"
            stroke="#ec4899"
            strokeWidth="3"
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
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-xl">
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
          <ellipse cx="60" cy="102" rx="38" ry="8" fill="rgba(15, 23, 42, 0.16)" />
          {/* Outer Shield */}
          <path
            d="M60,20 C82,24 92,30 92,54 C92,76 76,92 60,98 C44,92 28,76 28,54 C28,30 38,24 60,20 Z"
            fill="url(#shieldGrad)"
          />
          {/* Inner Shield */}
          <path
            d="M60,26 C78,30 86,34 86,54 C86,72 72,86 60,92 C48,86 34,72 34,54 C34,34 42,30 60,26 Z"
            fill="url(#shieldInner)"
          />
          {/* Golden Checkmark / Key */}
          <path
            d="M48,54 L56,62 L74,44"
            fill="none"
            stroke="#fef08a"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Top Star */}
          <polygon points="60,34 62,39 67,40 63,43 64,48 60,45 56,48 57,43 53,40 58,39" fill="#fef08a" />
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
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-xl">
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
          <ellipse cx="60" cy="104" rx="42" ry="9" fill="rgba(15, 23, 42, 0.16)" />
          {/* Pouch Bag */}
          <path
            d="M38,46 C44,38 76,38 82,46 C94,62 96,86 86,96 C76,104 44,104 34,96 C24,86 26,62 38,46 Z"
            fill="url(#pouchGrad)"
          />
          {/* Pouch Neck */}
          <polygon points="50,38 70,38 74,44 46,44" fill="#c2410c" />
          {/* Pouch Tie String */}
          <ellipse cx="60" cy="44" rx="14" ry="3" fill="#fef08a" />
          {/* Pouch Top Frill */}
          <path d="M46,44 C42,34 50,30 60,30 C70,30 78,34 74,44 Z" fill="#ea580c" />
          {/* Indian Rupee ₹ Symbol */}
          <text
            x="60"
            y="82"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="32"
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(scrollLeft / maxScroll);
    }
  };

  const scrollByAmount = (offset: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative z-20 bg-[#0B0F19] text-white py-24 sm:py-32 px-6 sm:px-8 overflow-hidden select-none">
      {/* ── TECHNICAL DOT MATRIX BACKGROUND GRID ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.22) 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Subtle ambient colored orbs in dark background */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* ── LEFT COLUMN: TITLE & CTA ── */}
          <div className="lg:col-span-4 flex flex-col items-start justify-between min-h-[460px] pt-4">
            <div>
              {/* Category Pill */}
              <div className="text-[11px] font-mono font-bold tracking-[0.2em] text-indigo-400 uppercase mb-4">
                PERKS &amp; PRIVILEGES
              </div>

              {/* Massive Bold Heading matching reference */}
              <h2 className="text-5xl sm:text-6xl font-black text-white tracking-[-0.03em] leading-[1.05]">
                Exclusive
                <br />
                Partner
                <br />
                Perks
              </h2>

              <p className="mt-6 text-base text-slate-400 max-w-sm leading-relaxed">
                5 premium institutional privileges reserved for verified school and college leaders joining Alpha Edu Hub.
              </p>

              {/* Apply Now Pill CTA */}
              <div className="mt-8">
                <button
                  onClick={onApplyClick}
                  className="group inline-flex items-center gap-3.5 bg-white hover:bg-slate-100 text-slate-950 pl-6 pr-3.5 py-3 rounded-full text-sm sm:text-base font-bold shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  <span>Apply Now</span>
                  <span className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-xs transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>
            </div>

            {/* Keep Scrolling hint & arrows */}
            <div className="mt-12 flex items-center justify-between w-full max-w-xs">
              <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-slate-400">
                <span>KEEP SCROLLING</span>
                <ArrowRight className="w-4 h-4 animate-pulse text-indigo-400" />
              </div>

              {/* Navigation arrows for desktop */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollByAmount(-340)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                  aria-label="Previous perk"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollByAmount(340)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                  aria-label="Next perk"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: HORIZONTAL SCROLLING TICKET CARDS ── */}
          <div className="lg:col-span-8 overflow-hidden">
            <div
              ref={scrollRef}
              className="flex items-center gap-6 overflow-x-auto pb-8 pt-2 scroll-smooth no-scrollbar cursor-grab active:cursor-grabbing"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {PERKS.map((perk, index) => (
                <motion.div
                  key={perk.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="shrink-0 w-[290px] sm:w-[320px] h-[450px] sm:h-[470px] rounded-[28px] overflow-hidden flex flex-col shadow-2xl relative select-none hover:-translate-y-1.5 transition-transform duration-300"
                >
                  {/* ── TOP HALF OF TICKET (PASTEL HEADER & 3D ASSET) ── */}
                  <div
                    className="relative h-[220px] sm:h-[230px] p-6 flex flex-col justify-between"
                    style={{ backgroundColor: perk.themeBg }}
                  >
                    {/* Top Row: Number & Admit One Badge */}
                    <div className="flex items-center justify-between z-10">
                      <span className="text-[11px] font-mono font-black tracking-wider text-slate-900">
                        {perk.number}
                      </span>
                      <span className="border border-slate-900 rounded-full px-2.5 py-0.5 text-[9px] font-black tracking-widest text-slate-900 uppercase">
                        {perk.themeTag}
                      </span>
                    </div>

                    {/* Centered 3D Graphic */}
                    <div className="my-auto flex items-center justify-center z-10">
                      {perk.renderIllustration()}
                    </div>
                  </div>

                  {/* ── TICKET NOTCH & PERFORATION DIVIDER ── */}
                  <div className="relative h-0 z-20 flex items-center justify-between">
                    {/* Left circular notch cutout matching background */}
                    <div className="w-6 h-6 rounded-full bg-[#0B0F19] -ml-3 shadow-inner" />
                    {/* Dashed perforated coupon tear line */}
                    <div className="flex-1 border-b-2 border-dashed border-slate-300/80 mx-1" />
                    {/* Right circular notch cutout matching background */}
                    <div className="w-6 h-6 rounded-full bg-[#0B0F19] -mr-3 shadow-inner" />
                  </div>

                  {/* ── BOTTOM HALF OF TICKET (WHITE CARD WITH COPY) ── */}
                  <div className="flex-1 bg-white p-6 sm:p-7 flex flex-col justify-start text-left">
                    <h3 className="text-base sm:text-[17px] font-black text-slate-950 tracking-tight leading-snug">
                      {perk.title}
                    </h3>
                    <p className="mt-3 text-xs sm:text-[13px] text-slate-600 font-medium leading-relaxed">
                      {perk.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── BOTTOM PROGRESS BAR TRACK ── */}
            <div className="mt-6 flex items-center justify-center">
              <div className="w-56 h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full"
                  style={{
                    width: `${Math.max(25, scrollProgress * 100)}%`,
                  }}
                  transition={{ ease: 'easeOut', duration: 0.1 }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
