'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Star, CheckCircle2, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  institution: string;
  affiliation: string;
  statsHighlight: string;
  gradientBg: string;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    id: 'sharma',
    quote:
      'Transitioning 2,400 students to Alpha Edu Hub reduced our monthly fee reconciliation time from two weeks to under 4 hours. The automated SMS alerts to parents eliminated late fee delays completely.',
    name: 'Dr. Ramesh Sharma',
    role: 'Executive Principal',
    institution: 'Green Valley Senior Academy',
    affiliation: 'CBSE #213009',
    statsHighlight: '98.4% On-time Fee Collection',
    gradientBg: 'from-blue-600 via-indigo-600 to-sky-500',
    initials: 'RS',
  },
  {
    id: 'mehta',
    quote:
      'Our teachers used to spend the first 20 minutes of every period manually logging attendance. With the 1-click roster and timetable sync, we saved over 120 instructional hours across the term.',
    name: 'Priya Mehta',
    role: 'Vice Principal & Academic Dean',
    institution: 'Bright Future World School',
    affiliation: 'ICSE Board #KA042',
    statsHighlight: '120+ Hours Saved / Term',
    gradientBg: 'from-emerald-600 via-teal-600 to-cyan-500',
    initials: 'PM',
  },
  {
    id: 'kumar',
    quote:
      'As an administrator managing three campuses, having unified multi-tenant visibility into staff attendance, admissions, and exam scorecards in real-time has made Alpha Edu Hub indispensable.',
    name: 'Rakesh Kumar',
    role: 'Administrative Director',
    institution: 'Delhi Public School Franchisee',
    affiliation: 'Multi-Campus Network',
    statsHighlight: '3 Campuses Unified',
    gradientBg: 'from-purple-600 via-indigo-600 to-blue-500',
    initials: 'RK',
  },
  {
    id: 'mary',
    quote:
      'The automated report card engine aligned perfectly with our state grading criteria. What previously took our staff two full weekends was generated, validated, and signed digitally in under 15 minutes.',
    name: 'Sister Mary Thomas',
    role: 'Headmistress',
    institution: "St. Joseph's Convent High School",
    affiliation: 'State Board Karnataka',
    statsHighlight: '15-Minute Report Cards',
    gradientBg: 'from-amber-600 via-orange-600 to-rose-500',
    initials: 'SM',
  },
  {
    id: 'kulkarni',
    quote:
      'Transparency with parents has skyrocketed. Fee collections via UPI QR codes now happen within 48 hours of invoice generation, and incoming parent fee queries dropped by 65%.',
    name: 'Anand Kulkarni',
    role: 'Managing Trustee',
    institution: 'Apex Global International School',
    affiliation: 'CBSE Affiliated',
    statsHighlight: '65% Fewer Parent Inquiries',
    gradientBg: 'from-cyan-600 via-blue-600 to-indigo-600',
    initials: 'AK',
  },
];

export default function TestimonialsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScrollability = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const cardWidth = 580;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(index, 0), testimonials.length - 1));
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScrollability();
    el.addEventListener('scroll', checkScrollability, { passive: true });
    window.addEventListener('resize', checkScrollability);
    return () => {
      el.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = Math.min(el.clientWidth * 0.75, 580);
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const scrollToCard = (index: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const target = el.children[index] as HTMLElement;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  return (
    <section
      id="testimonials"
      suppressHydrationWarning
      className="relative min-h-[calc(100vh-56px)] flex flex-col justify-between py-10 sm:py-14 lg:py-16 bg-gradient-to-b from-[#f8fbff] via-white to-[#f8fbff] overflow-hidden"
    >
      {/* Background Gamma-style subtle glow rings */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-r from-blue-200/25 via-cyan-200/20 to-indigo-200/25 blur-3xl rounded-full pointer-events-none -z-10" />

      {/* ─── 1. TOP HEADER (SHRINK-0) ─── */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 shrink-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end pb-4 sm:pb-6"
        >
          {/* Left Column: Big Bold Title */}
          <div className="lg:col-span-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-bold text-[#0B72E7] mb-2.5 shadow-2xs">
              <Award className="w-3.5 h-3.5" />
              <span>VERIFIED INSTITUTIONAL REVIEWS</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[#0A1344] tracking-tight leading-[1.15]">
              Join our community of{' '}
              <span className="text-[#0B72E7]">10,000+ school leaders</span>
            </h2>
          </div>

          {/* Right Column: Narrative Subtitle */}
          <div className="lg:col-span-6 text-left lg:text-left">
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-xl">
              Alpha Edu Hub is transforming how educational institutions operate across India.
              Hear how principals, academic deans, and trustees have automated their campuses.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ─── 2. CENTER CAROUSEL (FLEX-1 EXPANDED IN VIEWPORT) ─── */}
      <div className="relative w-full my-auto flex-1 flex flex-col justify-center py-4">
        {/* Left & Right Edge Gradient Fade Masks */}
        <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#f8fbff] to-transparent pointer-events-none z-10" />
        <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#f8fbff] to-transparent pointer-events-none z-10" />

        {/* Scrollable Track with Calibrated Card Proportions */}
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-5 sm:gap-6 overflow-x-auto scrollbar-none px-4 sm:px-12 lg:px-20 py-2 snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              className="snap-center shrink-0 w-[88vw] sm:w-[560px] lg:w-[600px] min-h-[220px] sm:min-h-[240px] bg-[#f0f5fc] hover:bg-[#eaf2fc] border border-blue-100/90 rounded-3xl p-6 sm:p-8 transition-all duration-300 shadow-[0_6px_24px_rgba(11,114,231,0.05)] hover:shadow-[0_16px_36px_rgba(11,114,231,0.1)] flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 text-left group"
            >
              {/* Gamma-style Circular Avatar Halo on Left */}
              <div className="shrink-0 relative">
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr ${t.gradientBg} p-1 shadow-md flex items-center justify-center`}
                >
                  <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center border-2 border-white/60 text-white font-black text-xl sm:text-2xl font-mono tracking-tight">
                    {t.initials}
                  </div>
                </div>
                {/* Verified Check Badge */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-xs border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-white stroke-[2]" />
                </div>
              </div>

              {/* Right Side: Quote Text & Author Signature */}
              <div className="flex-1 min-w-0">
                {/* Stars + Impact Tag */}
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10.5px] font-bold text-[#0B72E7] bg-white px-2 py-0.5 rounded-full border border-blue-100 shadow-2xs">
                    {t.statsHighlight}
                  </span>
                </div>

                {/* Quote Text */}
                <p className="text-[14px] sm:text-[15px] font-bold text-[#0A1344] leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author Signature */}
                <div className="mt-3.5 pt-2.5 border-t border-blue-200/50 flex flex-wrap items-baseline gap-1.5 text-xs text-slate-600">
                  <span className="font-extrabold text-[#0A1344] text-[13px]">{t.name}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-[#0B72E7] font-semibold">{t.role}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 truncate">{t.institution} ({t.affiliation})</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── 3. BOTTOM CAROUSEL NAVIGATION CONTROLS (SHRINK-0) ─── */}
      <div className="shrink-0 pt-2 pb-2 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => handleScroll('left')}
          disabled={!canScrollLeft}
          aria-label="Previous testimonial"
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-xs ${
            canScrollLeft
              ? 'bg-white border-slate-200 text-slate-700 hover:text-[#0B72E7] hover:border-blue-300 hover:bg-blue-50/50 active:scale-95'
              : 'bg-slate-100/70 border-slate-200/50 text-slate-300 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Dots Indicator */}
        <div className="flex items-center gap-1.5 px-2">
          {testimonials.map((t, idx) => (
            <button
              key={t.id}
              type="button"
              onClick={() => scrollToCard(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-200 cursor-pointer rounded-full ${
                activeIndex === idx
                  ? 'w-6 h-2 bg-[#0B72E7]'
                  : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => handleScroll('right')}
          disabled={!canScrollRight}
          aria-label="Next testimonial"
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-xs ${
            canScrollRight
              ? 'bg-white border-slate-200 text-slate-700 hover:text-[#0B72E7] hover:border-blue-300 hover:bg-blue-50/50 active:scale-95'
              : 'bg-slate-100/70 border-slate-200/50 text-slate-300 cursor-not-allowed'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}