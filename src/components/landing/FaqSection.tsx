'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Minus, HelpCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const leftFaqs: FAQ[] = [
  {
    id: 'faq-1',
    question: 'How fast can our school get onboarded with Alpha Edu Hub?',
    answer:
      'Most schools can be completely onboarded within 24 to 48 hours. Our automated CSV/Excel migration engine imports all your student profiles, faculty records, grade sections, and existing fee balances in minutes.',
  },
  {
    id: 'faq-2',
    question: 'Can we migrate historical grades and past fee records?',
    answer:
      'Yes! We provide dedicated bulk migration tools and guided onboarding assistance to seamlessly transfer student historical data, past fee receipts, attendance archives, and library inventories from your legacy software or spreadsheets.',
  },
  {
    id: 'faq-3',
    question: 'Is student data isolated and protected against data leaks?',
    answer:
      'Security is our highest priority. All data is protected with bank-grade 256-bit encryption in transit and at rest, strict multi-tenant database isolation, automated daily off-site backups, and fine-grained role-based access control.',
  },
];

const rightFaqs: FAQ[] = [
  {
    id: 'faq-4',
    question: 'Can parents access real-time notifications and payment receipts?',
    answer:
      'Yes! Parents receive secure credentials to access their student’s attendance status, homework assignments, exam report cards, and digital fee receipts with instant Razorpay/UPI integration and SMS confirmations.',
  },
  {
    id: 'faq-5',
    question: 'What level of support and training do you provide to teachers?',
    answer:
      'We provide dedicated 24/7 technical assistance, virtual and on-campus onboarding workshops for staff, interactive video walkthroughs, and responsive live chat support.',
  },
  {
    id: 'faq-6',
    question: 'Does Alpha Edu Hub support custom board grading (CBSE / ICSE / State)?',
    answer:
      'Yes! The grading and report engine supports CBSE CCE guidelines, ICSE percentile rubrics, state board marks distributions, and custom GPA scales with automated scorecard generation.',
  },
];

export default function FaqSection() {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({ 'faq-1': true });

  const toggleFaq = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderFaqItem = (faq: FAQ, idx: number) => {
    const isOpen = !!openIds[faq.id];
    return (
      <motion.div
        key={faq.id}
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.4, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
        className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 shadow-2xs ${
          isOpen ? 'border-blue-300 ring-2 ring-blue-50' : 'border-slate-200/90 hover:border-slate-300'
        }`}
      >
        <button
          type="button"
          onClick={() => toggleFaq(faq.id)}
          className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left gap-4 transition-colors cursor-pointer"
          aria-expanded={isOpen}
        >
          <span className="text-[14.5px] sm:text-[15.5px] font-bold text-[#0A1344] leading-snug">
            {faq.question}
          </span>
          <span
            className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
              isOpen ? 'bg-[#0B72E7] text-white' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {isOpen ? (
              <Minus className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <Plus className="w-4 h-4 stroke-[2.5]" />
            )}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="px-5 sm:px-6 pb-5 pt-1 text-[13.5px] sm:text-[14px] text-slate-600 leading-relaxed border-t border-slate-100"
            >
              {faq.answer}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <section id="faq" className="relative py-16 sm:py-20 lg:py-24 bg-white overflow-hidden" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with "View All FAQs" Button with Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 border-b border-slate-100 pb-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[12px] font-bold text-[#0B72E7] mb-3 shadow-2xs">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FREQUENT QUESTIONS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0A1344] tracking-tight leading-tight">
              Frequently <span className="text-[#0B72E7]">Asked Questions</span>
            </h2>
            <p className="mt-2 text-base text-slate-600 max-w-lg leading-relaxed">
              Everything principals and administrative teams need to know about Alpha Edu Hub ERP.
            </p>
          </div>
          <div>
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-[14px] font-bold text-[#0B72E7] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors shadow-2xs"
            >
              <span>View Knowledge Base</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* 2-Column FAQ Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {/* Left Column */}
          <div className="space-y-4">{leftFaqs.map((faq, idx) => renderFaqItem(faq, idx))}</div>

          {/* Right Column */}
          <div className="space-y-4">{rightFaqs.map((faq, idx) => renderFaqItem(faq, idx + 3))}</div>
        </div>
      </div>
    </section>
  );
}