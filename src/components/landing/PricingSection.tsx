'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, ArrowRight, X, Building2, Mail, Phone, User, Users, CheckCircle2, Send } from 'lucide-react';

export interface PricingPlan {
  id: string;
  name: string;
  serverTag: string;
  price: string;
  billingPeriod: string;
  description: string;
  isPopular?: boolean;
  features: string[];
  ctaLabel: string;
  ctaHref?: string;
  isCustomQuote?: boolean;
}

const defaultPlans: PricingPlan[] = [
  {
    id: 'lite',
    name: 'ALPHA EDU HUB LITE',
    serverTag: 'Alpha Edu Hub Cloud Server',
    price: 'Coming Soon',
    billingPeriod: 'Announcing Soon',
    description: 'Perfect for schools looking for a reliable and affordable ERP solution.',
    features: [
      'Online Admission',
      'Attendance Management',
      'Fee Management',
      'Examination Management',
      'Reports & Analytics',
    ],
    ctaLabel: 'Request Early Access',
    isCustomQuote: true,
  },
  {
    id: 'prime',
    name: 'ALPHA EDU HUB PRIME',
    serverTag: 'Alpha Edu Hub Cloud Server',
    price: 'Coming Soon',
    billingPeriod: 'Announcing Soon',
    description: 'Complete School ERP with web portals, notifications, and advanced automation features.',
    isPopular: true,
    features: [
      'Everything in Lite',
      'Advanced Dashboard & Analytics',
      'Student & Parent Web Portals',
      'Notifications & Alerts',
      'Advanced Reports',
      'Priority Support',
    ],
    ctaLabel: 'Request Early Access',
    isCustomQuote: true,
  },
  {
    id: 'white-label',
    name: 'WHITE LABEL',
    serverTag: 'Your Dedicated Server',
    price: 'Coming Soon',
    billingPeriod: 'Ask for Quotation',
    description: 'ERP deployed under your school’s brand name with complete ownership and customization.',
    features: [
      'Your School Branding',
      'Custom Domain',
      'Dedicated Deployment Setup',
      'Custom Configuration',
      'Dedicated Support',
    ],
    ctaLabel: 'Request a Quote',
    isCustomQuote: true,
  },
];

export interface PricingSectionProps {
  plans?: PricingPlan[];
}

export default function PricingSection({ plans: initialPlans }: PricingSectionProps = {}) {
  const activePlans = initialPlans && initialPlans.length > 0 ? initialPlans : defaultPlans;
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: '',
    contactPerson: '',
    email: '',
    phone: '',
    studentCount: '500-1000',
    notes: '',
  });

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteSubmitted(true);
    setTimeout(() => {
      // Allow user to view confirmation
    }, 500);
  };

  const resetQuoteModal = () => {
    setQuoteModalOpen(false);
    setQuoteSubmitted(false);
    setFormData({
      schoolName: '',
      contactPerson: '',
      email: '',
      phone: '',
      studentCount: '500-1000',
      notes: '',
    });
  };

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-[#f8fbff] relative overflow-hidden">
      {/* Background Soft Sky Accent Orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-100/80 text-[#1d8cfd] text-[12px] font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#1d8cfd]" />
            <span>Pricing — Coming Soon</span>
          </div>

          <h2 className="text-[30px] sm:text-[38px] lg:text-[42px] font-black text-slate-900 tracking-[-0.03em] leading-tight">
            Institutional Plans{' '}
            <span className="text-[#1d8cfd]">Launching Soon</span>
          </h2>
          <p className="mt-3.5 text-[14.5px] sm:text-[16px] text-slate-500 max-w-xl mx-auto leading-relaxed">
            Transparent per-student pricing packages and special introductory offers are coming soon. Get in touch today for early access and priority onboarding.
          </p>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-3 gap-7 lg:gap-8 items-stretch max-w-6xl mx-auto">
          {activePlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl bg-white flex flex-col justify-between transition-all duration-200 text-left ${
                plan.isPopular
                  ? 'border-2 border-[#1d8cfd] shadow-[0_12px_40px_rgba(29,140,253,0.12)] hover:shadow-[0_18px_50px_rgba(29,140,253,0.18)] hover:-translate-y-1 z-20'
                  : 'border border-slate-200/90 shadow-[0_4px_25px_rgba(15,23,42,0.04)] hover:border-slate-300 hover:shadow-[0_10px_35px_rgba(15,23,42,0.08)] hover:-translate-y-1'
              }`}
            >
              {/* Popular Top Badge for Prime */}
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#1d8cfd] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-[0_2px_8px_rgba(29,140,253,0.4)]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              {/* Card Body */}
              <div className="p-7 sm:p-8 flex-1 flex flex-col">
                {/* Header: Plan Name & Server Label */}
                <div>
                  <h3 className="text-[12.5px] font-extrabold uppercase tracking-wider text-slate-500">
                    {plan.name}
                  </h3>
                  <div className="mt-1 text-[13px] font-medium text-slate-400">
                    {plan.serverTag}
                  </div>
                </div>

                {/* Price Display */}
                <div className="mt-6 flex flex-col gap-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[30px] sm:text-[34px] font-black tracking-tight leading-none bg-gradient-to-r from-blue-600 via-[#1d8cfd] to-indigo-600 bg-clip-text text-transparent">
                      {plan.price || 'Coming Soon'}
                    </span>
                  </div>
                  <span className="text-[12.5px] font-semibold text-slate-400">
                    {plan.billingPeriod || 'Announcing Soon'}
                  </span>
                </div>

                {/* Plan Description */}
                <p className="mt-4 text-[13.5px] text-slate-600 leading-relaxed min-h-[44px]">
                  {plan.description}
                </p>

                {/* Divider */}
                <div className="w-full h-px bg-slate-100 my-6" />

                {/* Features List */}
                <div className="flex-1">
                  <div className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider mb-3.5">
                    Included Features:
                  </div>
                  <ul className="space-y-3.5" role="list">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                        <span className="text-[13.5px] font-medium text-slate-700">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer: CTA Button */}
              <div className="p-7 sm:p-8 pt-0">
                {plan.isCustomQuote ? (
                  <button
                    type="button"
                    onClick={() => setQuoteModalOpen(true)}
                    className={
                      plan.isPopular
                        ? 'w-full py-3.5 px-5 rounded-xl font-bold text-[14.5px] text-white bg-[#1d8cfd] hover:bg-blue-600 active:bg-blue-700 shadow-[0_4px_14px_rgba(29,140,253,0.35)] hover:shadow-[0_6px_20px_rgba(29,140,253,0.45)] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer'
                        : 'w-full py-3.5 px-5 rounded-xl font-semibold text-[14px] text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100 border border-slate-200/80 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer'
                    }
                  >
                    <span>{plan.ctaLabel}</span>
                    <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${plan.isPopular ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'}`} />
                  </button>
                ) : plan.isPopular ? (
                  <Link
                    href={plan.ctaHref || '/login'}
                    className="w-full py-3.5 px-5 rounded-xl font-bold text-[14.5px] text-white bg-[#1d8cfd] hover:bg-blue-600 active:bg-blue-700 shadow-[0_4px_14px_rgba(29,140,253,0.35)] hover:shadow-[0_6px_20px_rgba(29,140,253,0.45)] transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    <span>{plan.ctaLabel}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ) : (
                  <Link
                    href={plan.ctaHref || '/login'}
                    className="w-full py-3.5 px-5 rounded-xl font-semibold text-[14px] text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100 border border-slate-200/80 transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    <span>{plan.ctaLabel}</span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Value Highlights Under Pricing */}
        <div className="mt-12 pt-8 border-t border-slate-200/70 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex items-center justify-center gap-2.5 text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="text-[13px] font-medium">Zero Hidden Setup Fees</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="text-[13px] font-medium">Automatic Backups &amp; 99.9% Uptime</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="text-[13px] font-medium">Dedicated Onboarding Support</span>
          </div>
        </div>
      </div>

      {/* Interactive Quotation Request Modal */}
      {quoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 text-left"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quote-modal-title"
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-[#1d8cfd] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="quote-modal-title" className="text-[16px] font-bold text-slate-900 leading-tight">
                    Request White Label Quote
                  </h3>
                  <p className="text-[12px] text-slate-500">
                    Alpha Edu Hub Dedicated &amp; Custom Deployment
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetQuoteModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {quoteSubmitted ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-xs">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
                  </div>
                  <h4 className="text-[18px] font-bold text-slate-900">
                    Quotation Request Received!
                  </h4>
                  <p className="mt-2 text-[13.5px] text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Thank you for your interest in Alpha Edu Hub White Label. Our enterprise deployment team will reach out to you within 24 hours at <strong>{formData.email || 'your email'}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={resetQuoteModal}
                    className="mt-6 px-6 py-2.5 rounded-xl font-semibold text-[13.5px] text-white bg-[#1d8cfd] hover:bg-blue-600 shadow-xs transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleQuoteSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                      Institution / School Name *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Delhi Public School"
                        value={formData.schoolName}
                        onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-[13.5px] text-slate-900 focus:outline-none focus:border-[#1d8cfd] focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                        Contact Person *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="Your Name"
                          value={formData.contactPerson}
                          onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                          className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-[13.5px] text-slate-900 focus:outline-none focus:border-[#1d8cfd] focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                        Student Count *
                      </label>
                      <div className="relative">
                        <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <select
                          value={formData.studentCount}
                          onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })}
                          className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-[13.5px] text-slate-900 focus:outline-none focus:border-[#1d8cfd] focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                        >
                          <option value="under-500">Under 500 Students</option>
                          <option value="500-1000">500 - 1,000 Students</option>
                          <option value="1000-3000">1,000 - 3,000 Students</option>
                          <option value="3000+">3,000+ Students (Multi-Branch)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                        Official Email *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          placeholder="principal@school.edu"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-[13.5px] text-slate-900 focus:outline-none focus:border-[#1d8cfd] focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-[13.5px] text-slate-900 focus:outline-none focus:border-[#1d8cfd] focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                      Specific Requirements / Questions (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Custom domain requirements, CBSE grading scale, data migration assistance..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-[13px] text-slate-900 focus:outline-none focus:border-[#1d8cfd] focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={resetQuoteModal}
                      className="px-4 py-2.5 rounded-xl font-semibold text-[13px] text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-[13.5px] text-white bg-[#1d8cfd] hover:bg-blue-600 shadow-[0_3px_12px_rgba(29,140,253,0.3)] transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Request</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
