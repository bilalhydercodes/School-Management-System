'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  School,
  GraduationCap,
  Building,
  CheckCircle2,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
  Globe,
  Users,
  Shield,
  ShieldCheck,
  Edit2,
  FileCheck,
  Lock,
} from 'lucide-react';
import {
  submitInstitutionRegistrationAction,
  type InstitutionRegistrationInput,
} from '@/actions/institution-registration';

const DRAFT_KEY = 'alpha_institution_draft_v2';

interface StepMeta {
  id: number;
  title: string;
  shortTitle: string;
  description: string;
}

const STEPS: StepMeta[] = [
  {
    id: 1,
    title: 'Institution Type',
    shortTitle: 'Type',
    description: 'Select your institutional classification',
  },
  {
    id: 2,
    title: 'Institution Information',
    shortTitle: 'Information',
    description: 'Official organization identity and contacts',
  },
  {
    id: 3,
    title: 'Campus & Location',
    shortTitle: 'Location',
    description: 'Physical campus address and postal details',
  },
  {
    id: 4,
    title: 'Scale & Academic Scope',
    shortTitle: 'Scope',
    description: 'Estimated community size and academic levels',
  },
  {
    id: 5,
    title: 'Administrator',
    shortTitle: 'Administrator',
    description: 'Primary authorized administrator and contact',
  },
  {
    id: 6,
    title: 'Review & Submit',
    shortTitle: 'Review',
    description: 'Verify details and submit registration request',
  },
];

const SCHOOL_LEVELS = [
  'Pre-Primary',
  'Primary',
  'Middle School',
  'Secondary (10th)',
  'Higher Secondary (12th)',
];

const COLLEGE_LEVELS = [
  'Diploma',
  'Undergraduate (UG)',
  'Postgraduate (PG)',
  'Doctoral / Ph.D',
  'Vocational / Technical',
];

const OTHER_LEVELS = [
  'Certification',
  'Skill Training',
  'Test Preparation',
  'Special Education',
];

export default function InstitutionRegistrationWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isDraftSaved, setIsDraftSaved] = useState(false);

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
    studentCount: null,
    teacherCount: null,
    staffCount: null,
    campusCount: 1,
    academicLevels: ['Primary', 'Secondary (10th)'],
    administratorName: '',
    administratorDesignation: 'Principal',
    administratorEmail: '',
    administratorPhone: '',
    authorizedConfirmation: false,
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setFormData((prev) => ({
            ...prev,
            ...parsed,
            // Keep confirmation unchecked until review
            authorizedConfirmation: false,
          }));
          setIsDraftSaved(true);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Autosave draft on form changes
  useEffect(() => {
    try {
      const toPersist = { ...formData, authorizedConfirmation: false };
      if (toPersist.institutionName || toPersist.officialEmail) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(toPersist));
        setIsDraftSaved(true);
      }
    } catch {
      // Ignore storage errors
    }
  }, [formData]);

  const updateField = <K extends keyof InstitutionRegistrationInput>(
    field: K,
    value: InstitutionRegistrationInput[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    setServerError(null);
  };

  const handleSelectType = (type: 'School' | 'College' | 'Other Educational Institution') => {
    let defaultLevels: string[] = [];
    if (type === 'School') {
      defaultLevels = ['Primary', 'Secondary (10th)'];
    } else if (type === 'College') {
      defaultLevels = ['Undergraduate (UG)'];
    } else {
      defaultLevels = ['Skill Training'];
    }

    setFormData((prev) => ({
      ...prev,
      institutionType: type,
      academicLevels: defaultLevels,
    }));
    if (fieldErrors.institutionType) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.institutionType;
        return next;
      });
    }
    setServerError(null);
  };

  const toggleAcademicLevel = (level: string) => {
    setFormData((prev) => {
      const exists = prev.academicLevels.includes(level);
      const nextLevels = exists
        ? prev.academicLevels.filter((l) => l !== level)
        : [...prev.academicLevels, level];
      return {
        ...prev,
        academicLevels: nextLevels,
      };
    });
    if (fieldErrors.academicLevels) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.academicLevels;
        return next;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.institutionType) {
        errors.institutionType = 'Please select an institution category.';
      }
    } else if (step === 2) {
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
      if (formData.website && formData.website.trim().length > 0) {
        try {
          const urlStr = formData.website.startsWith('http')
            ? formData.website
            : `https://${formData.website}`;
          new URL(urlStr);
        } catch {
          errors.website = 'Enter a valid website URL (e.g. https://yourschool.edu.in).';
        }
      }
    } else if (step === 3) {
      if (!formData.address.trim() || formData.address.trim().length < 3) {
        errors.address = 'Please enter your campus street address.';
      }
      if (!formData.city.trim() || formData.city.trim().length < 2) {
        errors.city = 'Please enter the city.';
      }
      if (!formData.state.trim() || formData.state.trim().length < 2) {
        errors.state = 'Please enter the state or province.';
      }
      if (!formData.postalCode.trim() || formData.postalCode.trim().length < 4) {
        errors.postalCode = 'Please enter a valid postal / PIN code.';
      }
    } else if (step === 4) {
      if (!formData.academicLevels || formData.academicLevels.length === 0) {
        errors.academicLevels = 'Please select at least one academic level or program.';
      }
    } else if (step === 5) {
      if (
        !formData.administratorName.trim() ||
        formData.administratorName.trim().length < 2
      ) {
        errors.administratorName = 'Please enter the primary administrator full name.';
      }
      if (
        !formData.administratorEmail.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.administratorEmail.trim())
      ) {
        errors.administratorEmail = 'Enter a valid administrator email address.';
      }
      if (
        !formData.administratorPhone.trim() ||
        formData.administratorPhone.trim().replace(/\D/g, '').length < 8
      ) {
        errors.administratorPhone = 'Please enter a valid administrator phone number.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (stepId: number) => {
    // Allow clicking only on completed steps to review/edit
    if (stepId < currentStep) {
      setCurrentStep(stepId);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.authorizedConfirmation) {
      setServerError('Please confirm that you are authorized to register this institution.');
      return;
    }

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
        setServerError(result.error || 'Failed to submit application. Please check the form.');
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    });
  };

  const currentLevels =
    formData.institutionType === 'College'
      ? COLLEGE_LEVELS
      : formData.institutionType === 'Other Educational Institution'
      ? OTHER_LEVELS
      : SCHOOL_LEVELS;

  return (
    <div className="min-h-screen md:h-[100dvh] md:max-h-[100dvh] flex flex-col bg-[#F8FAFC] text-slate-800 antialiased overflow-x-hidden md:overflow-hidden">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* COMPACT APPLICATION HEADER                                */}
      {/* ─────────────────────────────────────────────────────────── */}
      <header className="h-16 shrink-0 bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between z-20 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-2xl bg-[#EEF6FF] border border-blue-100 flex items-center justify-center p-0.5 shadow-2xs group-hover:bg-blue-100/70 transition-colors overflow-hidden">
              <Image
                src="/images/dashboard/logo_transparent_bg.png"
                alt="Alpha Edu Hub"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm sm:text-base leading-none group-hover:text-blue-600 transition-colors">
                  Alpha Edu Hub
                </span>
                <span className="hidden sm:inline-block text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md leading-normal">
                  Institution Onboarding
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs text-slate-500 hidden md:flex items-center gap-1.5">
            <span>Already registered?</span>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
          >
            <span>Sign in</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MOBILE STEP PROGRESS BAR (Visible only on < md)            */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2.5 shrink-0">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-bold text-blue-600 uppercase tracking-wider text-[11px]">
            Step {currentStep} of {STEPS.length}
          </span>
          <span className="font-semibold text-slate-700 text-xs">
            {STEPS[currentStep - 1].title}
          </span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* WORKSPACE BODY (Left Stepper + Right Content)              */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* ────────────── LEFT STEP PANEL (Desktop) ────────────── */}
        <aside className="hidden md:flex md:w-[300px] lg:w-[325px] shrink-0 border-r border-slate-200/90 bg-white flex-col justify-between p-6 overflow-y-auto">
          <div>
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                INSTITUTION SETUP
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Application Steps
              </h2>
            </div>

            {/* Stepper items with progress connector */}
            <nav className="space-y-1 relative" aria-label="Onboarding Steps">
              {STEPS.map((step, idx) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                const isUpcoming = currentStep < step.id;
                const isLast = idx === STEPS.length - 1;

                return (
                  <div key={step.id} className="relative">
                    {/* Vertical Connector Line */}
                    {!isLast && (
                      <div
                        className={`absolute left-[15px] top-[28px] w-0.5 h-[calc(100%-8px)] transition-colors duration-300 z-0 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      />
                    )}

                    <div
                      onClick={() => handleStepClick(step.id)}
                      className={`group relative z-10 flex items-start gap-3.5 p-2 rounded-xl transition-all ${
                        isCompleted
                          ? 'cursor-pointer hover:bg-slate-50'
                          : isCurrent
                          ? 'bg-blue-50/70 border border-blue-100 shadow-2xs'
                          : 'cursor-default opacity-85'
                      }`}
                    >
                      {/* Step Indicator Node */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 transition-all ${
                          isCompleted
                            ? 'bg-emerald-500 text-white shadow-2xs'
                            : isCurrent
                            ? 'bg-blue-600 text-white font-bold ring-4 ring-blue-100 shadow-2xs'
                            : 'border border-slate-300 bg-white text-slate-400 font-medium'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                          <span>{step.id}</span>
                        )}
                      </div>

                      {/* Step Title & Subtitle */}
                      <div className="min-w-0 pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <p
                            className={`text-xs font-semibold leading-tight truncate ${
                              isCurrent
                                ? 'text-blue-700 font-bold'
                                : isCompleted
                                ? 'text-slate-800 group-hover:text-blue-600'
                                : 'text-slate-500'
                            }`}
                          >
                            {step.title}
                          </p>
                          {isCompleted && (
                            <span className="text-[10px] text-emerald-600 font-medium hidden lg:inline">
                              (Edit)
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[11px] truncate mt-0.5 ${
                            isCurrent
                              ? 'text-blue-600/80 font-medium'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.shortTitle}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Left Panel Trust Section */}
          <div className="pt-6 border-t border-slate-100 mt-6">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  SECURE APPLICATION
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Your institution information is securely submitted for review.
              </p>
              <p className="text-[10px] text-slate-500 leading-normal">
                Reviewed by the Alpha Edu Hub team before workspace activation.
              </p>
            </div>
          </div>
        </aside>

        {/* ────────────── RIGHT MAIN CONTENT AREA ────────────── */}
        <main className="flex-1 flex flex-col justify-between overflow-y-auto md:overflow-hidden bg-[#F8FAFC]">
          {/* Scrollable Form Viewport */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-5 sm:py-6 flex flex-col justify-start md:justify-center items-center">
            <div className="w-full max-w-[780px] my-auto">
              {/* Step Header Eyebrow & Title */}
              <div className="mb-4 sm:mb-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                    Step {currentStep} of {STEPS.length}
                  </span>
                  {isDraftSaved && (
                    <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Draft saved
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
                  {STEPS[currentStep - 1].title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {currentStep === 1 &&
                    'Choose the educational category that best represents your institution.'}
                  {currentStep === 2 &&
                    'Provide the official details used to create your institution profile.'}
                  {currentStep === 3 &&
                    'Specify the physical location and postal details of your primary campus.'}
                  {currentStep === 4 &&
                    'Help us provision the optimal workspace capacity and academic modules.'}
                  {currentStep === 5 &&
                    'Specify the authorized representative who will activate and manage this institution.'}
                  {currentStep === 6 &&
                    'Review the registration summary carefully before submitting for verification.'}
                </p>
              </div>

              {/* Server Error Alert */}
              {serverError && (
                <div
                  role="alert"
                  className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-800 text-xs animate-in fade-in"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-semibold text-red-900">Submission Notice</p>
                    <p className="mt-0.5 text-red-700 leading-snug">{serverError}</p>
                  </div>
                </div>
              )}

              {/* Form Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-7">
                {/* ═══════════════════════════════════════════════════ */}
                {/* STEP 1: INSTITUTION TYPE                           */}
                {/* ═══════════════════════════════════════════════════ */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      {[
                        {
                          type: 'School' as const,
                          icon: School,
                          title: 'School / K-12',
                          desc: 'Primary, Secondary, CBSE, ICSE, State Boards & International curricula',
                        },
                        {
                          type: 'College' as const,
                          icon: GraduationCap,
                          title: 'College / University',
                          desc: 'Undergraduate, Postgraduate degree programs & professional faculties',
                        },
                        {
                          type: 'Other Educational Institution' as const,
                          icon: Building,
                          title: 'Training / Academy',
                          desc: 'Vocational institutes, polytechnics, coaching & skill academies',
                        },
                      ].map((item) => {
                        const isSelected = formData.institutionType === item.type;
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.type}
                            onClick={() => handleSelectType(item.type)}
                            className={`p-4 sm:p-4.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/40 shadow-2xs'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                            }`}
                          >
                            <div>
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                                  isSelected
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              <h3 className="font-bold text-slate-900 text-sm leading-tight">
                                {item.title}
                              </h3>
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                {item.desc}
                              </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                              <span
                                className={`text-[11px] font-semibold ${
                                  isSelected ? 'text-blue-700' : 'text-slate-500'
                                }`}
                              >
                                {isSelected ? 'Selected' : 'Select'}
                              </span>
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2">
                      <p className="text-xs text-slate-500 bg-slate-50/80 border border-slate-200/70 rounded-xl px-3.5 py-2.5">
                        <span className="font-semibold text-slate-700">Note:</span> You can
                        configure additional academic settings, grading schemes, and multi-campus
                        structures later in your institution console.
                      </p>
                    </div>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════ */}
                {/* STEP 2: INSTITUTION INFORMATION                   */}
                {/* ═══════════════════════════════════════════════════ */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-blue-900 leading-snug">
                      Use official institution contact information where possible. Verification
                      notifications will be delivered to this official address.
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Official Institution Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Delhi Public School or St. Xavier's College"
                        value={formData.institutionName}
                        onChange={(e) => updateField('institutionName', e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                          fieldErrors.institutionName
                            ? 'border-red-400 bg-red-50/20'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                      />
                      {fieldErrors.institutionName && (
                        <p className="text-xs text-red-600 mt-1 font-medium">
                          {fieldErrors.institutionName}
                        </p>
                      )}
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Official Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="email"
                            required
                            placeholder="contact@school.edu.in"
                            value={formData.officialEmail}
                            onChange={(e) => updateField('officialEmail', e.target.value)}
                            className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                              fieldErrors.officialEmail
                                ? 'border-red-400 bg-red-50/20'
                                : 'border-slate-300 hover:border-slate-400'
                            }`}
                          />
                        </div>
                        {fieldErrors.officialEmail && (
                          <p className="text-xs text-red-600 mt-1 font-medium">
                            {fieldErrors.officialEmail}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Official Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="tel"
                            required
                            placeholder="e.g. +91 9876543210 or 011-2345678"
                            value={formData.officialPhone}
                            onChange={(e) => updateField('officialPhone', e.target.value)}
                            className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                              fieldErrors.officialPhone
                                ? 'border-red-400 bg-red-50/20'
                                : 'border-slate-300 hover:border-slate-400'
                            }`}
                          />
                        </div>
                        {fieldErrors.officialPhone && (
                          <p className="text-xs text-red-600 mt-1 font-medium">
                            {fieldErrors.officialPhone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Institution Website{' '}
                        <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="https://www.yourschool.edu.in"
                          value={formData.website || ''}
                          onChange={(e) => updateField('website', e.target.value)}
                          className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                            fieldErrors.website
                              ? 'border-red-400 bg-red-50/20'
                              : 'border-slate-300 hover:border-slate-400'
                          }`}
                        />
                      </div>
                      {fieldErrors.website && (
                        <p className="text-xs text-red-600 mt-1 font-medium">
                          {fieldErrors.website}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════ */}
                {/* STEP 3: CAMPUS & LOCATION                          */}
                {/* ═══════════════════════════════════════════════════ */}
                {currentStep === 3 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Campus Street Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        <textarea
                          rows={2}
                          required
                          placeholder="Plot No. 12, Sector 4, Institutional Area, Road Name"
                          value={formData.address}
                          onChange={(e) => updateField('address', e.target.value)}
                          className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                            fieldErrors.address
                              ? 'border-red-400 bg-red-50/20'
                              : 'border-slate-300 hover:border-slate-400'
                          }`}
                        />
                      </div>
                      {fieldErrors.address && (
                        <p className="text-xs text-red-600 mt-1 font-medium">
                          {fieldErrors.address}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Bangalore or New Delhi"
                          value={formData.city}
                          onChange={(e) => updateField('city', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                            fieldErrors.city
                              ? 'border-red-400 bg-red-50/20'
                              : 'border-slate-300 hover:border-slate-400'
                          }`}
                        />
                        {fieldErrors.city && (
                          <p className="text-xs text-red-600 mt-1 font-medium">
                            {fieldErrors.city}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          State / Province <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Karnataka or Maharashtra"
                          value={formData.state}
                          onChange={(e) => updateField('state', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                            fieldErrors.state
                              ? 'border-red-400 bg-red-50/20'
                              : 'border-slate-300 hover:border-slate-400'
                          }`}
                        />
                        {fieldErrors.state && (
                          <p className="text-xs text-red-600 mt-1 font-medium">
                            {fieldErrors.state}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Country
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.country}
                          onChange={(e) => updateField('country', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Postal / PIN Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 560001 or 110001"
                          value={formData.postalCode}
                          onChange={(e) => updateField('postalCode', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                            fieldErrors.postalCode
                              ? 'border-red-400 bg-red-50/20'
                              : 'border-slate-300 hover:border-slate-400'
                          }`}
                        />
                        {fieldErrors.postalCode && (
                          <p className="text-xs text-red-600 mt-1 font-medium">
                            {fieldErrors.postalCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════ */}
                {/* STEP 4: SCALE & ACADEMIC SCOPE                    */}
                {/* ═══════════════════════════════════════════════════ */}
                {currentStep === 4 && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block mb-2">
                        Estimated Community Scale
                      </span>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Est. Students
                          </label>
                          <input
                            type="number"
                            min="1"
                            placeholder="1200"
                            value={formData.studentCount ?? ''}
                            onChange={(e) =>
                              updateField(
                                'studentCount',
                                e.target.value ? parseInt(e.target.value, 10) : null
                              )
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>

                        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Est. Teachers
                          </label>
                          <input
                            type="number"
                            min="1"
                            placeholder="75"
                            value={formData.teacherCount ?? ''}
                            onChange={(e) =>
                              updateField(
                                'teacherCount',
                                e.target.value ? parseInt(e.target.value, 10) : null
                              )
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>

                        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Est. Staff
                          </label>
                          <input
                            type="number"
                            min="1"
                            placeholder="30"
                            value={formData.staffCount ?? ''}
                            onChange={(e) =>
                              updateField(
                                'staffCount',
                                e.target.value ? parseInt(e.target.value, 10) : null
                              )
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold text-slate-700">
                          Academic Levels / Programs Offered <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[11px] text-slate-400">
                          Select all that apply
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {currentLevels.map((lvl) => {
                          const active = formData.academicLevels.includes(lvl);
                          return (
                            <button
                              type="button"
                              key={lvl}
                              onClick={() => toggleAcademicLevel(lvl)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                active
                                  ? 'bg-blue-600 text-white shadow-2xs ring-2 ring-blue-600/30'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60'
                              }`}
                            >
                              <span>{lvl}</span>
                              {active && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                            </button>
                          );
                        })}
                      </div>

                      {fieldErrors.academicLevels && (
                        <p className="text-xs text-red-600 mt-2 font-medium">
                          {fieldErrors.academicLevels}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════ */}
                {/* STEP 5: PRIMARY ADMINISTRATOR                      */}
                {/* ═══════════════════════════════════════════════════ */}
                {currentStep === 5 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* Contextual Panel */}
                    <div className="p-3.5 rounded-xl border border-blue-200/70 bg-blue-50/40 flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 text-xs">
                        <p className="font-bold text-blue-950 uppercase tracking-wider text-[11px]">
                          Primary Administrator Contact
                        </p>
                        <p className="text-blue-900/90 mt-0.5 leading-snug">
                          This person will become the primary institution contact. If approved,
                          an activation invitation will be dispatched to this email address to set
                          credentials and access the workspace.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Administrator Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dr. Rajesh Sharma"
                          value={formData.administratorName}
                          onChange={(e) => updateField('administratorName', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                            fieldErrors.administratorName
                              ? 'border-red-400 bg-red-50/20'
                              : 'border-slate-300 hover:border-slate-400'
                          }`}
                        />
                        {fieldErrors.administratorName && (
                          <p className="text-xs text-red-600 mt-1 font-medium">
                            {fieldErrors.administratorName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Official Designation <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.administratorDesignation}
                          onChange={(e) =>
                            updateField('administratorDesignation', e.target.value as any)
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                        >
                          <option value="Principal">Principal</option>
                          <option value="Administrator">Administrator / COO</option>
                          <option value="Director">Director / Trustee</option>
                          <option value="Management">Management Committee</option>
                          <option value="Other">Other Authorized Officer</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Administrator Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="email"
                            required
                            placeholder="rajesh.sharma@school.edu.in"
                            value={formData.administratorEmail}
                            onChange={(e) => updateField('administratorEmail', e.target.value)}
                            className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                              fieldErrors.administratorEmail
                                ? 'border-red-400 bg-red-50/20'
                                : 'border-slate-300 hover:border-slate-400'
                            }`}
                          />
                        </div>
                        {fieldErrors.administratorEmail && (
                          <p className="text-xs text-red-600 mt-1 font-medium">
                            {fieldErrors.administratorEmail}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Administrator Mobile Phone <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="tel"
                            required
                            placeholder="+91 9876543210"
                            value={formData.administratorPhone}
                            onChange={(e) => updateField('administratorPhone', e.target.value)}
                            className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                              fieldErrors.administratorPhone
                                ? 'border-red-400 bg-red-50/20'
                                : 'border-slate-300 hover:border-slate-400'
                            }`}
                          />
                        </div>
                        {fieldErrors.administratorPhone && (
                          <p className="text-xs text-red-600 mt-1 font-medium">
                            {fieldErrors.administratorPhone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-1">
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span>
                          Account password will be securely established via activation email link
                          upon approval.
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════ */}
                {/* STEP 6: REVIEW & SUBMIT                            */}
                {/* ═══════════════════════════════════════════════════ */}
                {currentStep === 6 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* 2-column summary cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* 1. Institution */}
                      <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                              <School className="w-3.5 h-3.5 text-blue-600" />
                              Institution
                            </span>
                            <button
                              type="button"
                              onClick={() => setCurrentStep(2)}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                          </div>
                          <div className="space-y-1 text-xs">
                            <p className="font-bold text-slate-900 truncate">
                              {formData.institutionName || '—'}
                            </p>
                            <p className="text-slate-500 text-[11px]">
                              Type: <strong className="text-slate-700">{formData.institutionType}</strong>
                            </p>
                            <p className="text-slate-500 text-[11px] truncate">
                              Email: <strong className="text-slate-700">{formData.officialEmail}</strong>
                            </p>
                            <p className="text-slate-500 text-[11px]">
                              Phone: <strong className="text-slate-700">{formData.officialPhone}</strong>
                            </p>
                            {formData.website && (
                              <p className="text-slate-500 text-[11px] truncate">
                                Web: <strong className="text-slate-700">{formData.website}</strong>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 2. Location */}
                      <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-blue-600" />
                              Location
                            </span>
                            <button
                              type="button"
                              onClick={() => setCurrentStep(3)}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                          </div>
                          <div className="space-y-1 text-xs text-slate-700 leading-snug">
                            <p className="font-medium text-slate-900">{formData.address}</p>
                            <p className="text-[11px] text-slate-500">
                              {formData.city}, {formData.state} - {formData.postalCode}
                            </p>
                            <p className="text-[11px] text-slate-500">{formData.country}</p>
                          </div>
                        </div>
                      </div>

                      {/* 3. Scale & Academic Scope */}
                      <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-blue-600" />
                              Scale & Scope
                            </span>
                            <button
                              type="button"
                              onClick={() => setCurrentStep(4)}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 text-center text-xs mb-2">
                            <div className="p-1 rounded bg-white border border-slate-200/60">
                              <span className="text-[10px] text-slate-400 block">Students</span>
                              <strong className="text-slate-800 text-[11px]">
                                {formData.studentCount ?? '—'}
                              </strong>
                            </div>
                            <div className="p-1 rounded bg-white border border-slate-200/60">
                              <span className="text-[10px] text-slate-400 block">Teachers</span>
                              <strong className="text-slate-800 text-[11px]">
                                {formData.teacherCount ?? '—'}
                              </strong>
                            </div>
                            <div className="p-1 rounded bg-white border border-slate-200/60">
                              <span className="text-[10px] text-slate-400 block">Staff</span>
                              <strong className="text-slate-800 text-[11px]">
                                {formData.staffCount ?? '—'}
                              </strong>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {formData.academicLevels.map((lvl) => (
                              <span
                                key={lvl}
                                className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-semibold"
                              >
                                {lvl}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 4. Administrator */}
                      <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-blue-600" />
                              Administrator
                            </span>
                            <button
                              type="button"
                              onClick={() => setCurrentStep(5)}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                          </div>
                          <div className="space-y-1 text-xs">
                            <p className="font-bold text-slate-900 truncate">
                              {formData.administratorName}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Role: <strong className="text-slate-700">{formData.administratorDesignation}</strong>
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              Email: <strong className="text-slate-700">{formData.administratorEmail}</strong>
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Phone: <strong className="text-slate-700">{formData.administratorPhone}</strong>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Authorization Checkbox */}
                    <div className="pt-2">
                      <label className="flex items-start gap-3 p-3.5 rounded-xl border border-blue-200 bg-blue-50/30 cursor-pointer hover:bg-blue-50/60 transition-colors">
                        <input
                          type="checkbox"
                          required
                          checked={formData.authorizedConfirmation}
                          onChange={(e) => updateField('authorizedConfirmation', e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs text-slate-700 leading-snug select-none">
                          I confirm that I am authorized to register this institution and that the
                          information provided is accurate.
                        </span>
                      </label>
                    </div>

                    {/* Trust Footnote */}
                    <p className="text-center text-[11px] text-slate-500 pt-1">
                      Your application will be reviewed by the Alpha Edu Hub team before your
                      institution workspace is activated.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* ANCHORED ACTION FOOTER (Consistent on all steps)            */}
          {/* ─────────────────────────────────────────────────────────── */}
          <footer className="shrink-0 border-t border-slate-200/90 bg-white/95 backdrop-blur-xs px-4 sm:px-8 lg:px-12 py-3.5 sm:py-4 z-10 shadow-2xs">
            <div className="max-w-[780px] mx-auto w-full flex items-center justify-between gap-3">
              {/* Back Button */}
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div className="text-xs text-slate-400 font-medium pl-1">
                  Step 1 of {STEPS.length}
                </div>
              )}

              {/* Progress Summary in Footer */}
              <div className="hidden sm:flex items-center gap-2">
                {STEPS.map((step) => (
                  <div
                    key={step.id}
                    className={`h-1.5 rounded-full transition-all ${
                      currentStep === step.id
                        ? 'w-6 bg-blue-600'
                        : currentStep > step.id
                        ? 'w-3 bg-emerald-500'
                        : 'w-2 bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {/* Continue / Submit Button */}
              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={isPending || !formData.authorizedConfirmation}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Submit Registration Request</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
