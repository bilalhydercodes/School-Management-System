import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Mail, Phone, MapPin, Clock, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Alpha Edu Hub — School ERP Support & Enterprise Inquiries',
  description:
    'Get in touch with the Alpha Edu Hub team for school onboarding, ERP implementation support, demo requests, and white-label custom deployments.',
  alternates: {
    canonical: 'https://alphaeduhub.in/contact',
  },
  openGraph: {
    title: 'Contact Alpha Edu Hub — School ERP Support & Sales',
    description:
      'Contact our dedicated education technology team for institution onboarding, live demonstrations, and technical support.',
    url: 'https://alphaeduhub.in/contact',
    siteName: 'Alpha Edu Hub',
    images: ['/images/dashboard/open_graph_image.png'],
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16 bg-[#f8fbff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#1d8cfd] text-xs font-bold uppercase tracking-wider mb-3">
              <Mail className="w-3.5 h-3.5" />
              <span>We Are Here to Help</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Get in Touch with <span className="text-[#1d8cfd]">Alpha Edu Hub</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-500 leading-relaxed">
              Have questions about deploying Alpha Edu Hub for your school, college, or multi-branch educational trust? Reach out to our dedicated team.
            </p>
          </div>

          {/* 2-Column Contact Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
            {/* Left Column: Contact Cards & Info */}
            <div className="lg:col-span-5 space-y-5 text-left">
              {/* Card 1: Official Phone & Support */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:border-blue-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-[#1d8cfd] flex items-center justify-center mb-4">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Direct Phone Support</h3>
                <p className="text-xs text-slate-500 mt-1">Speak directly with our onboarding and technical support specialists.</p>
                <div className="mt-3 flex flex-col space-y-1.5">
                  <a
                    href="tel:+918277300451"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#1d8cfd] hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>+91 82773 00451</span>
                  </a>
                  <a
                    href="tel:+919845488621"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#1d8cfd] hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>+91 98454 88621</span>
                  </a>
                </div>
              </div>

              {/* Card 2: Official Email */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:border-blue-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Official Support Email</h3>
                <p className="text-xs text-slate-500 mt-1">Our technical assistance team replies within 24 hours.</p>
                <a
                  href="mailto:support@alphaeduhub.in"
                  className="mt-3 inline-block text-sm font-semibold text-[#1d8cfd] hover:underline"
                >
                  support@alphaeduhub.in
                </a>
              </div>

              {/* Card 3: Enterprise & White Label */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:border-blue-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">White Label &amp; Custom Deployments</h3>
                <p className="text-xs text-slate-500 mt-1">Inquire about custom domains, dedicated servers, and custom board grading scales.</p>
                <a
                  href="mailto:contact@alphaeduhub.in"
                  className="mt-3 inline-block text-sm font-semibold text-[#1d8cfd] hover:underline"
                >
                  contact@alphaeduhub.in
                </a>
              </div>

              {/* Card 4: Support Hours */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Operating Hours</h3>
                <p className="text-xs text-slate-600 mt-1">Monday – Saturday: 9:00 AM – 7:00 PM IST</p>
                <p className="text-xs text-slate-400 mt-0.5">Critical 24/7 server monitoring &amp; automated disaster recovery active at all times.</p>
              </div>
            </div>

            {/* Right Column: Interactive Contact / Inquiry Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-7 sm:p-10 border border-slate-200/90 shadow-[0_8px_30px_rgba(15,23,42,0.04)] text-left">
              <h2 className="text-xl font-bold text-slate-900">Send an Inquiry</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-6">
                Fill out the form below and an Alpha Edu Hub representative will assist you.
              </p>

              <form action="mailto:support@alphaeduhub.in" method="GET" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Principal / Administrator Name"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#1d8cfd] focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      School / Institution Name *
                    </label>
                    <input
                      type="text"
                      name="school"
                      required
                      placeholder="e.g. Green Valley School"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#1d8cfd] focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Official Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="principal@school.edu"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#1d8cfd] focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+91 98765 43210"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#1d8cfd] focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    How Can We Help? *
                  </label>
                  <textarea
                    rows={4}
                    name="message"
                    required
                    placeholder="Tell us about your school size, current challenges, migration requirements, or questions..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#1d8cfd] focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#1d8cfd] hover:bg-blue-600 active:bg-blue-700 shadow-[0_4px_16px_rgba(29,140,253,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
