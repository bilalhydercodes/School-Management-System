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
  Building2,
  Users,
  CreditCard,
  FileSpreadsheet,
  Headphones,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const ADMIN_FAQS: FaqItem[] = [
  {
    id: 'a1',
    category: 'Student & Staff Onboarding',
    question: 'How do I onboard a new batch of students or import CSV data?',
    answer:
      'Go to "Student Directory" under Student Lifecycle in the sidebar. Click the blue "Add Student" button for individual enrollment, or choose "Bulk Student Import" to upload your standard Excel/CSV roster with columns for Full Name, Admission Number, Class, Section, and Guardian details.',
  },
  {
    id: 'a2',
    category: 'Student & Staff Onboarding',
    question: 'How do I invite and generate credentials for new faculty members?',
    answer:
      'Navigate to "Teacher Directory" in the sidebar. Click "Add Teacher" and specify their Full Name, Login Email, Department, Designation, and Staff ID. An onboarding email with temporary credentials and password-reset instructions will automatically dispatch to their address.',
  },
  {
    id: 'a3',
    category: 'Fee Management & Gateways',
    question: 'How do I configure term installments and online Razorpay gateway?',
    answer:
      'Visit "Fee Management" > "Fee Structure" to define academic term schedules (Tuition, Laboratory, Library, Transport). For online collections, configure your Razorpay Key ID and Secret Key in Admin Settings > Integrations. Payments reconcile in real-time with automatic digital receipt generation.',
  },
  {
    id: 'a4',
    category: 'Fee Management & Gateways',
    question: 'How do I record offline cash or cheque payments at the counter?',
    answer:
      'In "Collect Fees", search for the student by name or admission number. Select the outstanding fee component, choose payment method (Cash, Demand Draft, POS Card), enter the instrument reference, and click "Record & Print Official Receipt".',
  },
  {
    id: 'a5',
    category: 'Exams & CBSE Board Compliance',
    question: 'How do I publish Term Report Cards and lock grade submissions?',
    answer:
      'Go to "Examinations" > "Exam Terms". Once all teachers have completed marks entry, toggle the term status to "Review Completed" and click "Lock Marks". You can then batch-generate CBSE compliant Report Cards with scholastic grades, co-scholastic ratings, and digital principal signature stamps.',
  },
  {
    id: 'a6',
    category: 'Roles & School Settings',
    question: 'How do I manage multi-role permissions (e.g. Accountant, Principal, Clerk)?',
    answer:
      'Open "Admin Settings" > "Roles & Permissions". You can assign granular access levels: Administrators have full operational control, Accountants are restricted to fee collections and ledger exports, and Receptionists manage visitor desks and student leave approvals.',
  },
  {
    id: 'a7',
    category: 'Roles & School Settings',
    question: 'How do I trigger school-wide circulars and SMS/WhatsApp emergency alerts?',
    answer:
      'Navigate to "Circulars & Notices" under Institution Management. Create a new notice, select the target audience (All Students, Parents, Faculty, or specific Classes), set priority (Standard or Urgent Flash Notice), and dispatch.',
  },
];

const CATEGORIES = ['All', 'Student & Staff Onboarding', 'Fee Management & Gateways', 'Exams & CBSE Board Compliance', 'Roles & School Settings'];

export default function AdminHelpClient() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>('a1');

  // Priority Support Form state
  const [ticketCategory, setTicketCategory] = useState('Fee & Payment Reconciliation');
  const [ticketPriority, setTicketPriority] = useState('HIGH');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState<string | null>(null);

  const filteredFaqs = ADMIN_FAQS.filter((faq) => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const generatedRef = `TKT-ADM-${Math.floor(10000 + Math.random() * 90000)}`;
      setIsSubmitting(false);
      setTicketSubmitted(generatedRef);
      setTicketSubject('');
      setTicketDescription('');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="rounded-[24px] bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#334155] text-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(15,23,42,0.2)] relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold backdrop-blur-md mb-3 border border-blue-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>School Administration & ERP Help Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrator Help & Operational Support
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Standard operating procedures, board compliance documentation, and dedicated enterprise support for school principals, directors, and administrative heads.
          </p>

          {/* Search bar inside banner */}
          <div className="mt-5 relative max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search admin procedures, fee configuration, onboarding..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/80 border border-white/20 text-sm backdrop-blur-md transition-all"
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
                ? 'bg-[#0B72E7] text-white shadow-sm ring-2 ring-[#0B72E7]/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: FAQs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#0B72E7]" />
                <h2 className="text-base font-bold text-slate-900">Administrative Operational Guides</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {filteredFaqs.length} {filteredFaqs.length === 1 ? 'guide' : 'guides'}
              </span>
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                No matching operational procedures found. Try a different query or submit an escalation ticket.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="border border-slate-100 rounded-xl overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                        className="w-full text-left p-4 flex items-center justify-between gap-3 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                            isOpen ? 'rotate-180 text-[#0B72E7]' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="p-4 bg-white text-xs sm:text-[13px] text-slate-600 leading-relaxed border-t border-slate-100">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Standard Operational Procedures (SOPs) Downloads */}
          <div className="bg-white rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-[#0B72E7]" />
              <h3 className="text-sm font-bold text-slate-900">Compliance Documents & Deployment SOPs</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/30 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Admin Deployment Guide</p>
                    <p className="text-[10px] text-slate-400">PDF • 3.8 MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => window.open('/assets/admin-deployment-guide.pdf', '_blank')}
                  className="p-1.5 rounded-lg text-slate-400 group-hover:text-blue-600 hover:bg-blue-100/60 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/30 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">CBSE Affiliation Checklist</p>
                    <p className="text-[10px] text-slate-400">PDF • 1.6 MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => window.open('/assets/cbse-compliance.pdf', '_blank')}
                  className="p-1.5 rounded-lg text-slate-400 group-hover:text-purple-600 hover:bg-purple-100/60 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Priority Ticket & Dedicated Hotline (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Priority Admin Escalation Form */}
          <div className="bg-white rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-[#0B72E7]" />
                <h3 className="text-sm font-bold text-slate-900">Priority Admin Escalation</h3>
              </div>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                SLA: &lt; 1 Hr
              </span>
            </div>

            {ticketSubmitted ? (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-blue-600 mx-auto" />
                <p className="text-xs font-bold text-blue-900">
                  Escalation Logged Successfully!
                </p>
                <p className="text-[11px] text-blue-700">
                  Your tracking ID is <span className="font-mono font-bold">{ticketSubmitted}</span>. Your Dedicated Account Engineer has been paged.
                </p>
                <button
                  type="button"
                  onClick={() => setTicketSubmitted(null)}
                  className="mt-2 text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                >
                  Submit Another Escalation
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    System Component
                  </label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Fee & Payment Reconciliation">Fee & Payment Reconciliation</option>
                    <option value="Bulk Student / Teacher Import">Bulk Student / Teacher Import</option>
                    <option value="CBSE Report Card Generation">CBSE Report Card Generation</option>
                    <option value="Payment Gateway (Razorpay/UPI)">Payment Gateway (Razorpay/UPI)</option>
                    <option value="Domain & Custom Branding">Domain & Custom Branding</option>
                    <option value="Critical Bug / Data Security">Critical Bug / Data Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Severity Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['NORMAL', 'HIGH', 'EMERGENCY'].map((priority) => (
                      <button
                        type="button"
                        key={priority}
                        onClick={() => setTicketPriority(priority)}
                        className={`py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                          ticketPriority === priority
                            ? priority === 'EMERGENCY'
                              ? 'bg-rose-600 text-white'
                              : priority === 'HIGH'
                              ? 'bg-amber-600 text-white'
                              : 'bg-[#0B72E7] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                        }`}
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Razorpay webhook reconciliation delay for Term 2"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Incident Details
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    placeholder="Provide affected student IDs, payment reference or export error details..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-[#0B72E7] hover:bg-[#095ec0] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Logging Escalation...' : 'Dispatch to Enterprise Support'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Dedicated VIP Hotline Card */}
          <div className="bg-white rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0B72E7]" />
              <span>Dedicated Enterprise Hotlines</span>
            </h3>

            <div className="space-y-2.5 text-xs text-slate-700 pt-1">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-semibold">Priority Email Escalation</p>
                  <a href="mailto:support@alphaeduhub.in" className="font-semibold text-blue-600 hover:underline truncate block">
                    support@alphaeduhub.in
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-semibold">Enterprise Phone Hotline</p>
                  <p className="font-semibold text-slate-800">+91 11 2345 6780</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-semibold">Operational Window</p>
                  <p className="font-semibold text-slate-800">24/7 Monitoring • Live Agents: 08:00 AM – 08:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
