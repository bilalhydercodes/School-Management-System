'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import GetStartedButton from './GetStartedButton';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'Modules', href: '/#modules' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Testimonials', href: '/#testimonials' },
    { label: 'FAQ', href: '/#faq' },
  ];

  return (
    <header
      suppressHydrationWarning
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen
          ? 'bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
          : 'bg-transparent border-b border-transparent shadow-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo Brand: Sleek single horizontal lockup */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <span className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/70 flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-200 shadow-2xs shrink-0 overflow-hidden">
              <Image
                src="/images/dashboard/logo_crest.png"
                alt="Alpha Edu Hub Logo"
                width={26}
                height={26}
                className="w-full h-full object-contain"
                priority
              />
            </span>
            <span className="text-[15px] font-black text-[#0A1344] tracking-tight leading-none group-hover:text-[#0B72E7] transition-colors">
              Alpha Edu Hub
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 xl:gap-8" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[13px] font-medium text-slate-600 hover:text-[#0B72E7] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action CTA Buttons: Sleek Login + Pill Get Started */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-3 py-1.5 text-[13px] font-semibold text-slate-700 hover:text-[#0B72E7] transition-colors"
            >
              Login
            </Link>
            <GetStartedButton className="inline-flex items-center justify-center px-4.5 py-1.5 rounded-full text-[13px] font-bold text-white bg-[#0B72E7] hover:bg-blue-600 active:bg-blue-700 shadow-xs hover:shadow-sm transition-all cursor-pointer">
              Get Started
            </GetStartedButton>
          </div>

          {/* Mobile: Login link + Menu Button */}
          <div className="flex md:hidden items-center gap-1.5">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold text-[#0B72E7] hover:bg-blue-50/80 rounded-lg transition-colors"
            >
              Login
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 pt-2.5 pb-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-[13px] font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0B72E7] transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 space-y-1.5 border-t border-slate-100">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Login
            </Link>
            <GetStartedButton
              className="block w-full text-center px-4 py-2 text-xs font-bold text-white bg-[#0B72E7] hover:bg-blue-600 rounded-full shadow-xs cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </GetStartedButton>
          </div>
        </div>
      )}
    </header>
  );
}
