'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Search,
  BookOpen,
  ChevronDown,
  Mail,
  Phone,
  Clock,
  Send,
  CheckCircle2,
  FileText,
  Download,
  ShieldCheck,
  Server,
  Database,
  Cpu,
  Layers,
  Terminal,
  Activity,
  AlertTriangle,
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const SUPERADMIN_FAQS: FaqItem[] = [
  {
    id: 's1',
    category: 'Tenant Provisioning',
    question: 'How do I provision a new school tenant on Alpha Edu Hub?',
    answer:
      'Go to "Schools / Tenants" in the sidebar and click "Provision New School". Provide the institution name, board (CBSE, ICSE, State), subscription tier (Lite or Prime), and administrative contact. The platform automatically provisions schema partitions, tenant keys, and sends welcome onboarding credentials.',
  },
  {
    id: 's2',
    category: 'Tenant Provisioning',
    question: 'How do custom custom subdomains and SSL certificates work?',
    answer:
      'Each school is provisioned with a default slug (e.g., dps.alphaeduhub.in). For custom apex domains, configure a CNAME record pointing to proxy.alphaeduhub.in. Automated Let\'s Encrypt SSL certificates are issued within 60 seconds of DNS validation.',
  },
  {
    id: 's3',
    category: 'Database & Security',
    question: 'How is tenant data isolated across PostgreSQL databases?',
    answer:
      'Alpha Edu Hub implements strict tenant isolation using row-level security and tenantId query scoping enforced via Prisma middleware. Every query executed in the context of an institution is mathematically bound to its tenantId, preventing cross-tenant leakage.',
  },
  {
    id: 's4',
    category: 'Database & Security',
    question: 'What happens during automated daily backups and disaster recovery?',
    answer:
      'Automated point-in-time recovery (PITR) is active across all databases with continuous WAL archiving. Complete logical dumps are encrypted using AES-256 and replicated across two secondary disaster recovery regions nightly at 02:00 AM UTC.',
  },
  {
    id: 's5',
    category: 'Billing & Subscriptions',
    question: 'How do subscription plan upgrades and student cap limits work?',
    answer:
      'Under "Subscriptions", you can adjust plan quotas (e.g. 1,000 to 5,000 active students). If a tenant exceeds their plan limits, the system triggers automated advisory notices without locking out existing student or parent sessions.',
  },
];

const CATEGORIES = ['All', 'Tenant Provisioning', 'Database & Security', 'Billing & Subscriptions'];

export default function SuperAdminHelpClient() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>('s1');

  const filteredFaqs = SUPERADMIN_FAQS.filter((faq) => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="rounded-[24px] bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(88,28,135,0.25)] border border-purple-800/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold backdrop-blur-md mb-3 border border-purple-500/30">
            <Cpu className="w-3.5 h-3.5" />
            <span>Platform Infrastructure & Multi-Tenant Support</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Super Admin Platform Operations & Support
          </h1>
          <p className="text-sm text-purple-200/80 mt-2 leading-relaxed">
            Infrastructure engineering documentation, tenant lifecycle management, database replication controls, and DevOps escalation hotlines.
          </p>

          {/* Search bar inside banner */}
          <div className="mt-5 relative max-w-lg">
            <Search className="w-4 h-4 text-purple-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search platform architecture, tenant provisioning, backups..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 text-white placeholder:text-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-400 border border-purple-500/30 text-sm backdrop-blur-md transition-all"
            />
          </div>
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: FAQs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 rounded-[22px] border border-slate-800 shadow-xl p-6 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-400" />
                <h2 className="text-base font-bold text-white">Platform Operational Guides</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {filteredFaqs.length} {filteredFaqs.length === 1 ? 'guide' : 'guides'}
              </span>
            </div>

            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="border border-slate-800 rounded-xl overflow-hidden transition-all bg-slate-950/60"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-slate-800/50 transition-colors"
                    >
                      <span className="text-xs sm:text-[13px] font-bold text-slate-200 leading-snug">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-purple-400 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180 text-purple-300' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="p-4 bg-slate-900/90 text-xs sm:text-[13px] text-slate-300 leading-relaxed border-t border-slate-800">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Technical Architecture Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <Activity className="w-4 h-4" />
                <span>API Health: 99.98%</span>
              </div>
              <p className="text-[11px] text-slate-400">Zero active incidents across tenant pods</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-1">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                <Database className="w-4 h-4" />
                <span>Connection Pool</span>
              </div>
              <p className="text-[11px] text-slate-400">PgBouncer active with 100 max pool size</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-1">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>OWASP ASVS</span>
              </div>
              <p className="text-[11px] text-slate-400">Level 2 verified authentication security</p>
            </div>
          </div>
        </div>

        {/* Right Column: DevOps Escalation & Contacts (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-[22px] border border-slate-800 shadow-xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">DevOps & Cloud Escalation</h3>
              </div>
              <span className="text-[11px] font-semibold text-purple-400 bg-purple-950/60 border border-purple-800/50 px-2 py-0.5 rounded-full">
                Tier-3 Support
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">DevOps Engineering Email</p>
                  <a href="mailto:devops@alphaeduhub.in" className="font-semibold text-purple-300 hover:underline">
                    devops@alphaeduhub.in
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">Emergency Infrastructure Line</p>
                  <p className="font-semibold text-slate-200">+91 11 2345 6780 (Ext: 911)</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">Response Time Commitment</p>
                  <p className="font-semibold text-slate-200">Critical incidents: &lt; 15 mins</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
