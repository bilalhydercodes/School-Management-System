import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const productLinks = [
    { label: 'Platform Features', href: '/features' },
    { label: 'Why Alpha Edu Hub', href: '/why-us' },
    { label: 'Role Modules', href: '/modules' },
    { label: 'Pricing Plans', href: '/pricing' },
    { label: 'School Testimonials', href: '/testimonials' },
    { label: 'Frequently Asked Questions', href: '/faq' },
  ];

  const moduleLinks = [
    { label: 'Student Management', href: '/modules' },
    { label: 'Attendance Tracking', href: '/features' },
    { label: 'Fee Management & Invoices', href: '/features' },
    { label: 'Exams & Report Cards', href: '/features' },
    { label: 'Timetable & Substitutions', href: '/features' },
    { label: 'Student & Parent Portals', href: '/modules' },
  ];

  const companyLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Contact Support & Sales', href: '/contact' },
    { label: 'Request White Label Quote', href: '/pricing' },
    { label: 'Teacher Workspace', href: '/login' },
    { label: 'Admin ERP Portal', href: '/login' },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund & Cancellation Policy', href: '/refund-policy' },
    { label: 'Data Security & Compliance', href: '/privacy-policy' },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 selection:bg-blue-600 selection:text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand Col: Span 4 */}
          <div className="lg:col-span-4 space-y-5 text-left">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center p-1.5 group-hover:scale-105 transition-transform duration-200 shadow-xs shrink-0 overflow-hidden">
                <Image
                  src="/images/dashboard/logo_transparent_bg.png"
                  alt="Alpha Edu Hub Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[17px] font-bold text-white tracking-tight leading-tight group-hover:text-blue-400 transition-colors">
                  Alpha Edu Hub
                </span>
                <span className="text-[11.5px] font-medium text-slate-400 tracking-wide">
                  Next-Gen School ERP Platform
                </span>
              </div>
            </Link>

            <p className="text-[13.5px] text-slate-400 leading-relaxed max-w-sm">
              All-in-one multi-tenant school operating system designed for modern K-12 institutions, CBSE, ICSE, and State Board schools across India.
            </p>

            {/* Trust and Compliance Badges */}
            <div className="pt-2 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-semibold text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>256-Bit SSL Encryption</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-semibold text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>99.9% Uptime SLA</span>
              </span>
            </div>

            {/* Direct Contact Support Email */}
            <div className="pt-2">
              <div className="text-[11.5px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Official Support:
              </div>
              <a
                href="mailto:support@alphaeduhub.in"
                className="inline-flex items-center gap-2 text-[13.5px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>support@alphaeduhub.in</span>
              </a>
            </div>
          </div>

          {/* Col 2: Navigation (Span 2) */}
          <div className="lg:col-span-2 text-left">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5" role="list">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13.5px] text-slate-400 hover:text-white transition-colors block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Modules (Span 2) */}
          <div className="lg:col-span-2 text-left">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-white mb-4">
              ERP Modules
            </h3>
            <ul className="space-y-2.5" role="list">
              {moduleLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13.5px] text-slate-400 hover:text-white transition-colors block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Company (Span 2) */}
          <div className="lg:col-span-2 text-left">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-white mb-4">
              Company
            </h3>
            <ul className="space-y-2.5" role="list">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13.5px] text-slate-400 hover:text-white transition-colors block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Legal & Policies (Span 2) */}
          <div className="lg:col-span-2 text-left">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-white mb-4">
              Legal &amp; Trust
            </h3>
            <ul className="space-y-2.5" role="list">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13.5px] text-slate-400 hover:text-white transition-colors block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span>&copy; {currentYear} Alpha Edu Hub. All rights reserved.</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="text-slate-400">Enterprise K-12 School Management System</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
