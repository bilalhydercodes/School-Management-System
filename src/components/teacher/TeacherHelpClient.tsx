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
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  ExternalLink,
  Copy,
  Printer,
  X,
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const TEACHER_FAQS: FaqItem[] = [
  {
    id: 'f1',
    category: 'Attendance & Schedule',
    question: 'How do I take student attendance for my assigned class?',
    answer:
      'Go to "Class Attendance" in the sidebar or click "Take Attendance" from your dashboard. Select your class and section, mark absent/leave students by clicking their status badge, and click "Save & Submit Attendance". Notifications will automatically dispatch to parents of absent students.',
  },
  {
    id: 'f2',
    category: 'Attendance & Schedule',
    question: 'Where can I check today\'s timetable and classroom assignments?',
    answer:
      'Visit "Today\'s Schedule" or "Timetable" in the navigation. The schedule displays your assigned periods, rooms, subject codes, and indicates if any period has been re-assigned to a substitute teacher.',
  },
  {
    id: 'f3',
    category: 'Marks & Gradebook',
    question: 'How do I enter marks for periodic tests and term exams?',
    answer:
      'Navigate to "Exam Marks Entry" from the sidebar. Choose the Exam Term, Class, Section, and Subject. You can either enter marks row-by-row with automatic validation against max marks, or use "Bulk Marks Import" to upload a pre-filled Excel spreadsheet.',
  },
  {
    id: 'f4',
    category: 'Marks & Gradebook',
    question: 'What should I do if a student was absent on exam day?',
    answer:
      'In the marks entry table, check the "Absent" checkbox for that student. The system will record their status as AB and compute grade averages according to CBSE evaluation guidelines without skewing their scholastic aggregate.',
  },
  {
    id: 'f5',
    category: 'Leave & Salary',
    question: 'How do I submit an application for Casual or Medical Leave?',
    answer:
      'Click "Apply Leave" under the Quick Actions or in the sidebar. Select your Leave Type (Casual, Medical, Earned, Duty Leave), specify the start and end dates, provide the reason, and assign an optional substitute teacher. Once submitted, the Principal or Academic Coordinator will review and approve it.',
  },
  {
    id: 'f6',
    category: 'Leave & Salary',
    question: 'Where can I view and download my official monthly salary slip?',
    answer:
      'Click "Salary & Pay Slip" in the sidebar navigation or select "View Pay Slip" on your main dashboard. You can switch between any previous months, review basic pay, DA, HRA, EPF deductions, bank UTR reference, and click "Print Slip" or "Download PDF".',
  },
  {
    id: 'f7',
    category: 'Remarks & Communication',
    question: 'How do I send remarks or feedback regarding a student\'s performance?',
    answer:
      'Go to "Student Remarks" in the sidebar. Select the student, choose the category (Scholastic, Behavioral, Appreciation, Improvement Needed), and write your note. Verified remarks appear on the Student & Parent Portal with timestamp and teacher signature.',
  },
];

const CATEGORIES = ['All', 'Attendance & Schedule', 'Marks & Gradebook', 'Leave & Salary', 'Remarks & Communication'];

type TeacherDocType = 'manual' | 'grading' | null;

export default function TeacherHelpClient() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>('f1');

  // Support ticket form state
  const [ticketCategory, setTicketCategory] = useState('Class Attendance & Timetable');
  const [ticketPriority, setTicketPriority] = useState('NORMAL');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState<string | null>(null);
  const [copiedTicket, setCopiedTicket] = useState(false);

  // SOP Modal Viewer
  const [activeDoc, setActiveDoc] = useState<TeacherDocType>(null);

  const filteredFaqs = TEACHER_FAQS.filter((faq) => {
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
      const generatedRef = `TKT-FAC-${Math.floor(10000 + Math.random() * 90000)}`;
      setIsSubmitting(false);
      setTicketSubmitted(generatedRef);
      setTicketSubject('');
      setTicketDescription('');
    }, 600);
  };

  const copyTicketRef = () => {
    if (!ticketSubmitted) return;
    navigator.clipboard.writeText(ticketSubmitted);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="rounded-[24px] bg-gradient-to-r from-[#1E40AF] via-[#2563EB] to-[#3B82F6] text-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(37,99,235,0.18)] relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-md mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Faculty Assistance & Technical Help Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Teacher Help & Support Center
          </h1>
          <p className="text-sm text-blue-100 mt-2 leading-relaxed">
            Find immediate answers to common portal tasks, review academic operational manuals, or submit a direct ticket to the school IT and administrative cell.
          </p>

          {/* Search bar inside banner */}
          <div className="mt-5 relative max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search faculty questions, attendance, marks, leaves..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/80 shadow-md transition-all"
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
                ? 'bg-[#2563EB] text-white shadow-sm ring-2 ring-[#2563EB]/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: FAQs & Manuals (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(30,100,200,0.04)] p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#2563EB]" />
                <h2 className="text-base font-bold text-[#102A56]">Frequently Asked Questions</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'}
              </span>
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                No matching answers found. Try a different query or submit a support ticket.
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
                        <span className="text-xs sm:text-[13px] font-bold text-[#102A56] leading-snug">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                            isOpen ? 'rotate-180 text-[#2563EB]' : ''
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

          {/* Quick Faculty Manuals & SOPs */}
          <div className="bg-white rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(30,100,200,0.04)] p-6 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#102A56]">Faculty Manuals & SOPs</h3>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Click to view / print</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setActiveDoc('manual')}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/30 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#102A56] group-hover:text-blue-600 transition-colors">
                      Teacher ERP Manual
                    </p>
                    <p className="text-[10px] text-slate-400">Complete Guide • Printable</p>
                  </div>
                </div>
                <span className="p-1.5 rounded-lg text-slate-400 group-hover:text-blue-600 hover:bg-blue-100/60 transition-colors">
                  <BookOpen className="w-4 h-4" />
                </span>
              </div>

              <div
                onClick={() => setActiveDoc('grading')}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-emerald-200 bg-slate-50/50 hover:bg-emerald-50/30 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#102A56] group-hover:text-emerald-600 transition-colors">
                      CBSE Grading SOP
                    </p>
                    <p className="text-[10px] text-slate-400">Evaluation Rules • Printable</p>
                  </div>
                </div>
                <span className="p-1.5 rounded-lg text-slate-400 group-hover:text-emerald-600 hover:bg-emerald-100/60 transition-colors">
                  <BookOpen className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Submission & Contacts (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Submit a Ticket Card */}
          <div className="bg-white rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(30,100,200,0.04)] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#102A56]">Submit Support Ticket</h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                SLA: &lt; 2 Hrs
              </span>
            </div>

            {ticketSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-100 text-center space-y-3">
                <CheckCircle2 className="w-9 h-9 text-emerald-600 mx-auto" />
                <div>
                  <p className="text-xs font-bold text-emerald-950">
                    Ticket Submitted Successfully!
                  </p>
                  <p className="text-[11px] text-emerald-800 mt-1">
                    Your reference tracking ID is:
                  </p>
                  <div className="inline-flex items-center gap-2 mt-1.5 px-3 py-1 rounded-lg bg-white border border-emerald-200 shadow-2xs">
                    <span className="font-mono text-xs font-bold text-emerald-900">{ticketSubmitted}</span>
                    <button
                      type="button"
                      onClick={copyTicketRef}
                      title="Copy Reference"
                      className="text-emerald-600 hover:text-emerald-800 transition-colors"
                    >
                      {copiedTicket ? (
                        <span className="text-[10px] font-semibold text-emerald-700">Copied!</span>
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={`https://wa.me/918277300451?text=Hello%20AlphaEduHub%20Support,%20I%20have%20submitted%20Teacher%20Support%20Ticket:%20${ticketSubmitted}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Follow Up on WhatsApp</span>
                  </a>

                  <a
                    href={`mailto:alphaeduhub360@gmail.com?subject=Teacher%20Support%20[${ticketSubmitted}]&body=Hello%20Academic%20IT%20Team,%0A%0AReference%20ID:%20${ticketSubmitted}%0A%0A`}
                    className="w-full py-2 px-3 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send via Direct Email</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setTicketSubmitted(null)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer pt-1"
                >
                  Submit Another Ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Issue Category
                  </label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Class Attendance & Timetable">Class Attendance & Timetable</option>
                    <option value="Marks Entry & Gradebook">Marks Entry & Gradebook</option>
                    <option value="Leave Application Approval">Leave Application Approval</option>
                    <option value="Salary Slip & Payroll Correction">Salary Slip & Payroll Correction</option>
                    <option value="Account Login or Security">Account Login or Security</option>
                    <option value="General Query">General Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Priority
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['NORMAL', 'HIGH', 'URGENT'].map((priority) => (
                      <button
                        type="button"
                        key={priority}
                        onClick={() => setTicketPriority(priority)}
                        className={`py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                          ticketPriority === priority
                            ? priority === 'URGENT'
                              ? 'bg-rose-500 text-white'
                              : priority === 'HIGH'
                              ? 'bg-amber-500 text-white'
                              : 'bg-blue-600 text-white'
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
                    placeholder="e.g. Need correction in Class 8-B Science marks entry"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    placeholder="Detail the issue, affected class, or payroll month..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Support Ticket'}</span>
                </button>
              </form>
            )}
          </div>

          {/* School Helpdesk Contacts */}
          <div className="bg-white rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(30,100,200,0.04)] p-6 space-y-3">
            <h3 className="text-sm font-bold text-[#102A56] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#2563EB]" />
              <span>Official Institutional Contacts</span>
            </h3>

            <div className="space-y-2.5 text-xs text-slate-700 pt-1">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-semibold">IT Cell & Technical Support</p>
                  <a
                    href="mailto:alphaeduhub360@gmail.com"
                    className="font-semibold text-blue-600 hover:underline truncate block"
                  >
                    alphaeduhub360@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-semibold">Academic Coordinator Helpline</p>
                  <div className="flex items-center gap-2">
                    <a
                      href="tel:+918277300451"
                      className="font-semibold text-slate-800 hover:text-blue-600 transition-colors"
                    >
                      +91 82773 00451
                    </a>
                    <span className="text-slate-300">|</span>
                    <a
                      href="tel:+919845488621"
                      className="font-semibold text-slate-800 hover:text-blue-600 transition-colors"
                    >
                      +91 98454 88621
                    </a>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Support */}
              <a
                href="https://wa.me/918277300451?text=Hello%20AlphaEduHub%20Teacher%20Support"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80 transition-colors border border-emerald-200/60 font-semibold"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Direct WhatsApp Faculty Desk</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              </a>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-semibold">Helpdesk Availability</p>
                  <p className="font-semibold text-slate-800">Monday – Saturday: 08:00 AM – 04:30 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Faculty SOP / Manual Viewer Modal */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-[24px] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {activeDoc === 'manual' ? 'Teacher ERP Operations Manual' : 'CBSE Scholastic & Grading SOP'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Official Alpha Edu Hub Faculty Guide</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveDoc(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
              {activeDoc === 'manual' ? (
                <>
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="font-bold text-blue-900">1. Daily Class Attendance Protocols</p>
                    <p className="text-blue-800 mt-1">
                      Faculty members must submit homeroom roll-call by 09:15 AM each morning. Unmarked students default to Present; toggle to Absent or Medical Leave as reported by parents.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900">2. Examination Marks & Periodic Test Entry</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Select your assigned class and subject code from the Exam Marks Entry directory.</li>
                      <li>Max marks are locked by the CBSE Examination Controller; scores above max marks are automatically rejected.</li>
                      <li>Use the Bulk Import feature to upload CSV marks rosters for large classes (30+ students).</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900">3. Leave Applications & Substitution Mapping</h4>
                    <p>
                      Apply for Casual or Medical leave at least 24 hours in advance. When submitting your application, nominate an available substitute teacher from your department to avoid period disruptions.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900">4. Monthly Salary Slips & EPF Records</h4>
                    <p>
                      Official salary slips are generated on the 1st of every calendar month following bank disbursement. You can print or download PDF statements directly from the "Salary & Pay Slip" module.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
                    <p className="font-bold text-emerald-900">CBSE Scholastic Evaluation & Grading Guidelines</p>
                    <p className="text-emerald-800 mt-1">
                      Applicable to Classes 1 through 10 under the Continuous & Comprehensive Evaluation framework.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900">1. Eight-Point Scholastic Grading Scale</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">A1: 91 – 100%</div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">A2: 81 – 90%</div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">B1: 71 – 80%</div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">B2: 61 – 70%</div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">C1: 51 – 60%</div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">C2: 41 – 50%</div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">D: 33 – 40%</div>
                      <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">E: &lt; 33% (Needs Help)</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900">2. Absentee Protocol (AB)</h4>
                    <p>
                      Students on authorized medical leave during exam week are marked as <span className="font-mono font-bold text-blue-600">AB</span>. Retests can be scheduled via the Academic Coordinator before the final report card lock.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                Faculty Support: <a href="mailto:alphaeduhub360@gmail.com" className="text-blue-600 font-semibold">alphaeduhub360@gmail.com</a>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print SOP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDoc(null)}
                  className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1d4ed8] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
