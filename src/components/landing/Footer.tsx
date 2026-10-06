import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Instagram,
  Linkedin,
  Youtube,
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
      icon: <Instagram className="w-4 h-4 text-slate-300 group-hover:text-pink-400 transition-colors" />,
    },
    {
      name: 'X',
      href: 'https://x.com',
      icon: (
        <svg className="w-3.5 h-3.5 fill-slate-300 group-hover:fill-white transition-colors" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com',
      icon: <Youtube className="w-4 h-4 text-slate-300 group-hover:text-red-400 transition-colors" />,
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/company/143961171/',
      icon: <Linkedin className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" />,
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
          
          {/* Brand Col: Span 4 */}
          <div className="lg:col-span-4 space-y-5 text-left">
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

            {/* Trust Badges */}
            <div className="pt-2 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11.5px] font-medium text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>256-Bit SSL Encryption</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11.5px] font-medium text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>99.9% Uptime SLA</span>
              </span>
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

          {/* Col 3: Guides & Resources (Span 3) */}
          <div className="lg:col-span-3 text-left">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-4">
              GUIDES &amp; RESOURCES
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

          {/* Col 4: Company & Follow Us (Span 2) */}
          <div className="lg:col-span-2 text-left space-y-6">
            <div>
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

            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                FOLLOW US
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.name}
                    className="group inline-flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    {social.icon}
                    <span className="font-medium text-[12px]">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            &copy; {currentYear} Alpha Edu Hub. All rights reserved.
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400/90 font-medium">All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}


