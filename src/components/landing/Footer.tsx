import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail,
  Phone,
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const featureLinks = [
    { label: 'Student Management', href: '/modules' },
    { label: 'Attendance Tracking', href: '/features' },
    { label: 'Fee Management & Invoices', href: '/features' },
    { label: 'Exams & Report Cards', href: '/features' },
    { label: 'Timetable & Substitutions', href: '/features' },
    { label: 'Student & Parent Portals', href: '/modules' },
    { label: 'Platform Role Modules', href: '/modules' },
    { label: 'Teacher & Admin ERP Login', href: '/login' },
  ];

  const guideLinks = [
    { label: 'What is a School ERP?', href: '/guides/what-is-a-school-management-system' },
    { label: 'Benefits of School Software', href: '/guides/benefits-of-school-erp-software' },
    { label: 'Digital Attendance Guide', href: '/guides/digital-attendance-management' },
    { label: 'Fee Management Guide', href: '/guides/school-fee-management-software' },
    { label: 'How Schools Simplify Admin', href: '/guides/how-schools-can-simplify-administration' },
    { label: 'All Educational Guides', href: '/guides' },
    { label: 'Frequently Asked Questions', href: '/faq' },
  ];

  const companyLinks = [
    { label: 'Why Alpha Edu Hub', href: '/why-us' },
    { label: 'Pricing Plans & Quote', href: '/pricing' },
    { label: 'School Testimonials', href: '/testimonials' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact Support & Sales', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund & Cancellation', href: '/refund-policy' },
  ];

  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://instagram.com',
      hoverBorder: 'group-hover:border-pink-500/60 group-hover:bg-pink-500/10',
      icon: (
        <svg className="w-4 h-4 fill-slate-300 group-hover:fill-[#E4405F] transition-colors" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: 'X',
      href: 'https://x.com',
      hoverBorder: 'group-hover:border-slate-500 group-hover:bg-slate-800',
      icon: (
        <svg className="w-3.5 h-3.5 fill-slate-300 group-hover:fill-white transition-colors" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com',
      hoverBorder: 'group-hover:border-red-500/60 group-hover:bg-red-500/10',
      icon: (
        <svg className="w-4 h-4 fill-slate-300 group-hover:fill-[#FF0000] transition-colors" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/company/143961171/',
      hoverBorder: 'group-hover:border-blue-500/60 group-hover:bg-blue-500/10',
      icon: (
        <svg className="w-3.5 h-3.5 fill-slate-300 group-hover:fill-[#0A66C2] transition-colors" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.65 1.65 0 1 0 .01 3.3 1.65 1.65 0 0 0 0-3.3z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="relative bg-[#070a11] text-slate-300 overflow-hidden border-t border-slate-800/80 selection:bg-pink-500 selection:text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>

      {/* Top subtle gradient ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-pink-500/5 blur-3xl pointer-events-none" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Brand Col: Span 3 */}
          <div className="lg:col-span-3 space-y-5 text-left">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5 group-hover:border-blue-500/50 transition-colors duration-200 shadow-sm shrink-0 overflow-hidden">
                <Image
                  src="/images/dashboard/logo_transparent_bg.png"
                  alt="Alpha Edu Hub Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-black text-white tracking-tight leading-none group-hover:text-blue-400 transition-colors">
                  AlphaEduHub
                </span>
              </div>
            </Link>

            <p className="text-[13.5px] text-slate-400 leading-relaxed max-w-sm font-normal">
              India&apos;s all-in-one multi-tenant school operating system designed for modern K-12 institutions, CBSE, ICSE, and State Board schools.
            </p>

            {/* Direct Contact Support Email & Phone */}
            <div className="pt-2 flex flex-col space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                Official Support &amp; Enquiries:
              </div>
              <div className="flex flex-col space-y-1.5 text-[13px] text-slate-400">
                <a
                  href="tel:+918277300451"
                  className="group inline-flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300 shrink-0 transition-colors" />
                  <span className="group-hover:text-blue-400 transition-colors">+91 82773 00451</span>
                </a>
                <a
                  href="tel:+919845488621"
                  className="group inline-flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300 shrink-0 transition-colors" />
                  <span className="group-hover:text-blue-400 transition-colors">+91 98454 88621</span>
                </a>
                <a
                  href="mailto:support@alphaeduhub.in"
                  className="group inline-flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300 shrink-0 transition-colors" />
                  <span className="group-hover:text-blue-400 transition-colors">support@alphaeduhub.in</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Features & Modules (Span 3) */}
          <div className="lg:col-span-3 text-left">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-4">
              FEATURES &amp; MODULES
            </h3>
            <ul className="space-y-2" role="list">
              {featureLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-slate-300 hover:text-white transition-colors block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Guides & Resources (Span 2) */}
          <div className="lg:col-span-2 text-left">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-4">
              GUIDES &amp; SEO
            </h3>
            <ul className="space-y-2" role="list">
              {guideLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-slate-300 hover:text-white transition-colors block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Company (Span 2) */}
          <div className="lg:col-span-2 text-left">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-4">
              COMPANY
            </h3>
            <ul className="space-y-2" role="list">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-slate-300 hover:text-white transition-colors block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Follow Us (Span 2) */}
          <div className="lg:col-span-2 text-left">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-4">
              FOLLOW US
            </h3>
            <ul className="space-y-2.5" role="list">
              {socialLinks.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 text-[13.5px] text-slate-300 hover:text-white transition-all py-0.5"
                  >
                    <span className={`w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center transition-all duration-200 ${social.hoverBorder}`}>
                      {social.icon}
                    </span>
                    <span className="font-medium text-[13px]">{social.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Giant Outlined Typography Watermark */}
      <div className="relative w-full overflow-hidden select-none pointer-events-none border-t border-slate-900/60 pt-4 pb-2 sm:pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-baseline justify-center sm:justify-start">
          <span
            className="text-[14vw] sm:text-[13.5vw] font-black tracking-tighter leading-none whitespace-nowrap text-transparent"
            style={{
              WebkitTextStroke: '1.2px rgba(255, 255, 255, 0.12)',
            }}
          >
            AlphaEduHub
          </span>
        </div>
      </div>

      {/* Copyright Sub-bar */}
      <div className="border-t border-slate-900/80 bg-[#05070c] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center sm:justify-start text-xs text-slate-500">
          <div>
            &copy; {currentYear} Alpha Edu Hub. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}



