'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  School,
  GraduationCap,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
  Globe,
  Users,
  ShieldCheck,
  Sparkles,
  Lock,
  Copy,
  Check,
  X,
  FileCheck2,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  submitInstitutionRegistrationAction,
  type InstitutionRegistrationInput,
} from '@/actions/institution-registration';

const DRAFT_KEY = 'alpha_institution_draft_v3';

interface ModernFlowProps {
  onClose?: () => void;
}

const INSTITUTION_TYPES = [
  {
    id: 'School' as const,
    title: 'K-12 School',
    subtitle: 'Primary, Secondary, CBSE, ICSE, State Boards & IB',
    icon: School,
    accent: 'from-blue-500 to-indigo-600',
    borderActive: 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40',
    defaultLevels: ['Primary (1st - 5th)', 'Middle School (6th - 8th)', 'Secondary (9th - 10th)'],
  },
  {
    id: 'College' as const,
    title: 'College / University',
    subtitle: 'Undergraduate, Postgraduate, Technical & Degree Colleges',
    icon: GraduationCap,
    accent: 'from-violet-500 to-purple-600',
    borderActive: 'border-purple-600 ring-2 ring-purple-500/20 bg-purple-50/40',
    defaultLevels: ['Undergraduate (UG)', 'Postgraduate (PG)'],
  },
  {
    id: 'Other Educational Institution' as const,
    title: 'Academy / Institute',
    subtitle: 'Coaching centers, skill institutes & vocational academies',
    icon: Building2,
    accent: 'from-emerald-500 to-teal-600',
    borderActive: 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/40',
    defaultLevels: ['Competitive / Test Prep', 'Skill Training & Certification'],
  },
];

const LEVEL_PRESETS: Record<string, string[]> = {
  School: [
    'Pre-Primary / Nursery',
    'Primary (1st - 5th)',
    'Middle School (6th - 8th)',
    'Secondary (9th - 10th)',
    'Senior Secondary (11th - 12th)',
  ],
  College: [
    'Junior College / Diploma',
    'Undergraduate (UG)',
    'Postgraduate (PG)',
    'Doctoral / Research',
    'Vocational / Professional',
  ],
  'Other Educational Institution': [
    'Foundation & High School Coaching',
    'Competitive / Test Prep (JEE/NEET/UPSC)',
    'Skill Training & Certification',
    'Language & Professional Development',
  ],
};

const STUDENT_SIZE_PRESETS = [
  { label: '< 500', value: 350 },
  { label: '500 – 1,500', value: 1000 },
  { label: '1,500 – 3,000', value: 2200 },
  { label: '3,000+', value: 4500 },
];

const DESIGNATIONS = [
  'Principal',
  'Director',
  'Management',
  'Administrator',
  'Other',
] as const;

export default function ModernInstitutionRegistrationFlow({ onClose }: ModernFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [copiedContact, setCopiedContact] = useState(false);

  const [formData, setFormData] = useState<InstitutionRegistrationInput>({
    institutionType: 'School',
    institutionName: '',
    officialEmail: '',
    officialPhone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    studentCount: 1000,
    teacherCount: 45,
    staffCount: 15,
    campusCount: 1,
    academicLevels: ['Primary (1st - 5th)', 'Middle School (6th - 8th)', 'Secondary (9th - 10th)'],
    administratorName: '',
    administratorDesignation: 'Principal',
    administratorEmail: '',
    administratorPhone: '',
    authorizedConfirmation: true,
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save draft whenever formData changes
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    } catch {
      // ignore
    }
  }, [formData]);

  // Dynamic subdomain generation
  const slug = formData.institutionName
    ? formData.institutionName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 24)
    : 'your-school';

  const updateField = <K extends keyof InstitutionRegistrationInput>(
    key: K,
    value: InstitutionRegistrationInput[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    setServerError(null);
  };

  const handleSelectType = (type: 'School' | 'College' | 'Other Educational Institution') => {
    const selected = INSTITUTION_TYPES.find((t) => t.id === type);
    setFormData((prev) => ({
      ...prev,
      institutionType: type,
      academicLevels: selected?.defaultLevels || [],
    }));
  };

  const toggleLevel = (lvl: string) => {
    const current = formData.academicLevels || [];
    const next = current.includes(lvl)
      ? current.filter((l) => l !== lvl)
      : [...current, lvl];
    updateField('academicLevels', next);
  };

  const copyOfficialContactToAdmin = () => {
    setFormData((prev) => ({
      ...prev,
      administratorEmail: prev.officialEmail,
      administratorPhone: prev.officialPhone,
    }));
    setCopiedContact(true);
    setTimeout(() => setCopiedContact(false), 2000);
  };

  // Step Validations
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.institutionName.trim() || formData.institutionName.trim().length < 3) {
      errors.institutionName = 'Please enter your institution name (at least 3 characters).';
    }
    if (
      !formData.officialEmail.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.officialEmail.trim())
    ) {
      errors.officialEmail = 'Enter a valid official email address.';
    }
    if (
      !formData.officialPhone.trim() ||
      formData.officialPhone.trim().replace(/\D/g, '').length < 8
    ) {
      errors.officialPhone = 'Please enter a valid phone number (at least 8 digits).';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.city.trim() || formData.city.trim().length < 2) {
      errors.city = 'Enter city name.';
    }
    if (!formData.state.trim() || formData.state.trim().length < 2) {
      errors.state = 'Enter state name.';
    }
    if (!formData.postalCode.trim() || formData.postalCode.trim().length < 4) {
      errors.postalCode = 'Enter a valid PIN / postal code.';
    }
    if (!formData.address.trim()) {
      // Default a quick campus address if omitted
      formData.address = `${formData.city}, ${formData.state}`;
    }
    if (!formData.academicLevels || formData.academicLevels.length === 0) {
      errors.academicLevels = 'Select at least one academic level.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.administratorName.trim() || formData.administratorName.trim().length < 2) {
      errors.administratorName = 'Enter administrator full name.';
    }
    if (
      !formData.administratorEmail.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.administratorEmail.trim())
    ) {
      errors.administratorEmail = 'Enter a valid administrator email.';
    }
    if (
      !formData.administratorPhone.trim() ||
      formData.administratorPhone.trim().replace(/\D/g, '').length < 8
    ) {
      errors.administratorPhone = 'Enter a valid phone number.';
    }
    if (!formData.authorizedConfirmation) {
      errors.authorizedConfirmation = 'Please confirm authorization.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateStep3()) return;

    setServerError(null);
    startTransition(async () => {
      const result = await submitInstitutionRegistrationAction(formData);
      if (result.success && result.applicationId) {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          // ignore
        }
        router.push(`/register/institution/status/${result.applicationId}`);
      } else {
        setServerError(result.error || 'Failed to submit application. Please review errors.');
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    });
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col my-2">
      {/* ── TOP HEADER / PROGRESS BAR ── */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-xs">
            α
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                Alpha Edu Hub
              </span>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                Fast Setup
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
              Multi-Tenant Institution Onboarding • Takes ~2 minutes
            </p>
          </div>
        </div>

        {/* 3-Step Pill Tracker */}
        <div className="flex items-center gap-2 sm:gap-3">
          {[
            { num: 1, label: 'Identity' },
            { num: 2, label: 'Scope' },
            { num: 3, label: 'Administrator' },
          ].map((s) => {
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <div
                key={s.num}
                onClick={() => {
                  if (s.num < step) setStep(s.num as 1 | 2 | 3);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-700 cursor-pointer border border-emerald-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <span>{s.num}.</span>
                )}
                <span className="hidden md:inline">{s.label}</span>
              </div>
            );
          })}

          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              title="Close and save draft"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-100 h-1">
        <motion.div
          className="h-1 bg-gradient-to-r from-indigo-500 to-indigo-600"
          initial={{ width: '33.33%' }}
          animate={{
            width: step === 1 ? '33.33%' : step === 2 ? '66.66%' : '100%',
          }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>

      {/* ── MAIN BODY: SPLIT VIEW (LIVE CARD ON LEFT + FORM ON RIGHT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* ── LEFT COLUMN: LIVE CAMPUS PREVIEW CARD (TACTILE REWARD) ── */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-[#1e1b4b] text-white p-6 sm:p-8 flex flex-col justify-between border-r border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-indigo-200 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Live Campus Console Preview</span>
            </div>

            {/* Glowing Live Digital Badge */}
            <div className="relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/15 p-6 shadow-xl space-y-5">
              {/* Header inside card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-600/30">
                    {formData.institutionName ? formData.institutionName.charAt(0).toUpperCase() : 'α'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-snug line-clamp-1">
                      {formData.institutionName || 'Your Institution Name'}
                    </h4>
                    <span className="text-[11px] font-medium text-slate-400 capitalize">
                      {formData.institutionType}
                    </span>
                  </div>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  Active Setup
                </div>
              </div>

              {/* Subdomain Pill */}
              <div className="bg-slate-950/60 rounded-xl p-3 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-indigo-300">
                  <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{slug}.alphaeduhub.in</span>
                </div>
                <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                  Reserved
                </span>
              </div>

              {/* Live Meta Tags */}
              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                  <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Location</span>
                  <p className="font-bold text-slate-200 truncate">
                    {formData.city && formData.state ? `${formData.city}, ${formData.state}` : 'City, State'}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                  <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Student Body</span>
                  <p className="font-bold text-slate-200">
                    ~{formData.studentCount?.toLocaleString() || '1,000'} Students
                  </p>
                </div>
              </div>

              {/* Scope Pills */}
              <div className="pt-1">
                <span className="text-[10px] font-semibold text-slate-400 block mb-1.5">Configured Scope</span>
                <div className="flex flex-wrap gap-1.5">
                  {(formData.academicLevels || []).slice(0, 3).map((lvl) => (
                    <span
                      key={lvl}
                      className="px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[10px] font-medium"
                    >
                      {lvl}
                    </span>
                  ))}
                  {(formData.academicLevels || []).length > 3 && (
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300 text-[10px]">
                      +{formData.academicLevels.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Value Props at the bottom of the left panel */}
          <div className="mt-8 pt-6 border-t border-white/10 space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>Zero Setup Fees</strong>: Full white-glove migration included.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>Pre-Configured Boards</strong>: CBSE, ICSE, and State Boards ready.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>Multi-Tenant Isolation</strong>: Dedicated secure institutional database.</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: FAST & ENGAGING STEP FORM ── */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
          {serverError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Please correct the following:</p>
                <p className="text-xs mt-0.5">{serverError}</p>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* STEP 1: INSTITUTION IDENTITY & CONTACT                          */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                    Step 1 of 3
                  </span>
                  <h3 className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
                    Institution Identity
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Select your educational classification and enter your official organization details.
                  </p>
                </div>

                {/* Institution Category Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {INSTITUTION_TYPES.map((type) => {
                    const isSelected = formData.institutionType === type.id;
                    const Icon = type.icon;
                    return (
                      <div
                        key={type.id}
                        onClick={() => handleSelectType(type.id)}
                        className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
                          isSelected
                            ? type.borderActive
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                        }`}
                      >
                        <div>
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                            isSelected ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                            {type.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {type.subtitle}
                          </p>
                        </div>
                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className={`text-[10px] font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-400'}`}>
                            {isSelected ? '✓ Selected' : 'Choose'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Form Fields */}
                <div className="space-y-4 pt-2">
                  {/* Institution Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Official Institution Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Green Valley Senior Secondary School"
                      value={formData.institutionName}
                      onChange={(e) => updateField('institutionName', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                        fieldErrors.institutionName
                          ? 'border-red-400 bg-red-50/30'
                          : 'border-slate-300 hover:border-slate-400 focus:border-indigo-600'
                      }`}
                    />
                    {fieldErrors.institutionName && (
                      <p className="text-xs text-red-600 mt-1 font-semibold">
                        {fieldErrors.institutionName}
                      </p>
                    )}
                  </div>

                  {/* Official Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Official Institutional Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                        <input
                          type="email"
                          placeholder="admin@school.edu.in"
                          value={formData.officialEmail}
                          onChange={(e) => updateField('officialEmail', e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                            fieldErrors.officialEmail
                              ? 'border-red-400 bg-red-50/30'
                              : 'border-slate-300 hover:border-slate-400 focus:border-indigo-600'
                          }`}
                        />
                      </div>
                      {fieldErrors.officialEmail && (
                        <p className="text-xs text-red-600 mt-1 font-semibold">
                          {fieldErrors.officialEmail}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Official Contact Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={formData.officialPhone}
                          onChange={(e) => updateField('officialPhone', e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                            fieldErrors.officialPhone
                              ? 'border-red-400 bg-red-50/30'
                              : 'border-slate-300 hover:border-slate-400 focus:border-indigo-600'
                          }`}
                        />
                      </div>
                      {fieldErrors.officialPhone && (
                        <p className="text-xs text-red-600 mt-1 font-semibold">
                          {fieldErrors.officialPhone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* STEP 2: LOCATION, SCALE & ACADEMIC SCOPE                        */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                    Step 2 of 3
                  </span>
                  <h3 className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
                    Campus Location & Academic Scope
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Tell us where your campus is located and select the programs your institution operates.
                  </p>
                </div>

                {/* City, State, PIN */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-indigo-600"
                    />
                    {fieldErrors.city && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Karnataka"
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-indigo-600"
                    />
                    {fieldErrors.state && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.state}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      PIN Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 560038"
                      value={formData.postalCode}
                      onChange={(e) => updateField('postalCode', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-indigo-600"
                    />
                    {fieldErrors.postalCode && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.postalCode}</p>
                    )}
                  </div>
                </div>

                {/* Academic Levels Selection Chips */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Academic Scope / Programs Offered <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">Click to toggle</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(LEVEL_PRESETS[formData.institutionType] || LEVEL_PRESETS.School).map((level) => {
                      const isSelected = (formData.academicLevels || []).includes(level);
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => toggleLevel(level)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                          <span>{level}</span>
                        </button>
                      );
                    })}
                  </div>
                  {fieldErrors.academicLevels && (
                    <p className="text-xs text-red-600 mt-1.5 font-semibold">
                      {fieldErrors.academicLevels}
                    </p>
                  )}
                </div>

                {/* Student Count Presets */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Approximate Student Strength
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {STUDENT_SIZE_PRESETS.map((preset) => {
                      const isSelected = formData.studentCount === preset.value;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => updateField('studentCount', preset.value)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Website */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Official Website <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="url"
                      placeholder="https://yourschool.edu.in"
                      value={formData.website || ''}
                      onChange={(e) => updateField('website', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* STEP 3: ADMINISTRATOR DETAILS & 1-CLICK LAUNCH                  */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                    Step 3 of 3
                  </span>
                  <h3 className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
                    Administrator Setup & Launch
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Designate your primary authorized administrator for institutional governance and root access.
                  </p>
                </div>

                {/* Administrator Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Administrator Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Ramesh Sharma"
                    value={formData.administratorName}
                    onChange={(e) => updateField('administratorName', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-indigo-600"
                  />
                  {fieldErrors.administratorName && (
                    <p className="text-xs text-red-600 mt-1 font-semibold">
                      {fieldErrors.administratorName}
                    </p>
                  )}
                </div>

                {/* Designation Pills */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Official Designation <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DESIGNATIONS.map((desig) => {
                      const isSelected = formData.administratorDesignation === desig;
                      return (
                        <button
                          key={desig}
                          type="button"
                          onClick={() => updateField('administratorDesignation', desig)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {desig}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 1-Click Copy Contact Button */}
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Direct Admin Contact</span>
                  <button
                    type="button"
                    onClick={copyOfficialContactToAdmin}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {copiedContact ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedContact ? 'Contact Copied!' : 'Same as Official Contact'}</span>
                  </button>
                </div>

                {/* Direct Admin Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Administrator Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="principal@school.edu.in"
                      value={formData.administratorEmail}
                      onChange={(e) => updateField('administratorEmail', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-indigo-600"
                    />
                    {fieldErrors.administratorEmail && (
                      <p className="text-xs text-red-600 mt-1 font-semibold">
                        {fieldErrors.administratorEmail}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Administrator Direct Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.administratorPhone}
                      onChange={(e) => updateField('administratorPhone', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-indigo-600"
                    />
                    {fieldErrors.administratorPhone && (
                      <p className="text-xs text-red-600 mt-1 font-semibold">
                        {fieldErrors.administratorPhone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Authorization Checkbox */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.authorizedConfirmation}
                      onChange={(e) => updateField('authorizedConfirmation', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed font-medium">
                      I confirm that I am an authorized representative of <strong>{formData.institutionName || 'this institution'}</strong> and have the authority to establish this institutional workspace on Alpha Edu Hub.
                    </span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── BOTTOM CONTROLS & NAVIGATION ── */}
          <div className="pt-8 mt-6 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Step 1 of 3</span>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white px-6 py-3 rounded-full font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isPending}
                onClick={handleSubmit}
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-7 py-3 rounded-full font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Provisioning Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Deploy School Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
