'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Briefcase,
  GraduationCap,
  BookOpen,
  KeyRound,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Building,
  Mail,
  Eye,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react';
import AdminModal from './ui/AdminModal';
import AdminButton from './ui/AdminButton';
import { createTeacherAction, getTeacherFormDataAction } from '@/actions/admin/teachers';
import type { CreateTeacherInput, QualificationRecord, TeachingAssignment } from '@/lib/validations/teacher';

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const STEPS = [
  { id: 1, title: 'Personal', icon: User, description: 'Identity & demographics' },
  { id: 2, title: 'Contact', icon: Phone, description: 'Reach & residence' },
  { id: 3, title: 'Employment', icon: Briefcase, description: 'Designation & department' },
  { id: 4, title: 'Qualifications', icon: GraduationCap, description: 'Degrees & experience' },
  { id: 5, title: 'Assignments', icon: BookOpen, description: 'Class & subjects' },
  { id: 6, title: 'Access', icon: KeyRound, description: 'Portal credentials' },
];

export default function AddTeacherModal({ isOpen, onClose, onSuccess }: AddTeacherModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    employeeId: string;
    phone: string;
    email: string;
    tempPassword: string;
    role: string;
  } | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  // Options from server
  const [departments, setDepartments] = useState<string[]>([]);
  const [sections, setSections] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string; code: string }[]>([]);

  // Form State
  const [formData, setFormData] = useState<CreateTeacherInput>({
    // Step 1
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE',
    avatarUrl: '',
    // Step 2
    email: '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    // Step 3
    employeeId: '',
    joiningDate: new Date().toISOString().split('T')[0],
    department: 'Science & Technology',
    designation: 'Senior Faculty',
    employmentType: 'FULL_TIME',
    // Step 4
    qualifications: [
      {
        qualification: 'Bachelor of Education (B.Ed)',
        specialization: '',
        institution: '',
        graduationYear: '2020',
        experience: '3 Years',
      },
    ],
    // Step 5
    assignments: [],
    // Step 6
    loginEmail: '',
    temporaryPassword: '',
    sendInvitation: true,
  });

  // Load select options when opened
  useEffect(() => {
    if (isOpen) {
      getTeacherFormDataAction().then((res) => {
        if (res.success) {
          if (res.departments.length > 0) setDepartments(res.departments);
          if (res.sections.length > 0) setSections(res.sections);
          if (res.subjects.length > 0) setSubjects(res.subjects);
        }
      });
      // Suggest employee id and password
      const randNum = Math.floor(100 + Math.random() * 900);
      const generatedTempPass = `Teach@${Math.floor(1000 + Math.random() * 9000)}!`;
      setFormData((prev) => ({
        ...prev,
        employeeId: prev.employeeId || `FAC-2026-${randNum}`,
        temporaryPassword: prev.temporaryPassword || generatedTempPass,
      }));
    }
  }, [isOpen]);

  // Keep login email in sync with contact email if not manually changed
  const handleEmailChange = (val: string) => {
    setFormData((prev) => {
      const shouldSync = prev.loginEmail === '' || prev.loginEmail === prev.email;
      return {
        ...prev,
        email: val,
        loginEmail: shouldSync ? val : prev.loginEmail,
      };
    });
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let result = 'Teach@';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result += '!';
    setFormData((prev) => ({ ...prev, temporaryPassword: result }));
  };

  // Qualifications helpers
  const addQualification = () => {
    setFormData((prev) => ({
      ...prev,
      qualifications: [
        ...prev.qualifications,
        {
          qualification: '',
          specialization: '',
          institution: '',
          graduationYear: new Date().getFullYear().toString(),
          experience: '',
        },
      ],
    }));
  };

  const removeQualification = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== idx),
    }));
  };

  const updateQualification = (idx: number, field: keyof QualificationRecord, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.qualifications];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, qualifications: updated };
    });
  };

  // Assignments helpers
  const addAssignment = () => {
    const defaultSec = sections[0]?.id || '';
    const defaultSub = subjects[0]?.id || '';
    setFormData((prev) => ({
      ...prev,
      assignments: [...prev.assignments, { sectionId: defaultSec, subjectId: defaultSub }],
    }));
  };

  const removeAssignment = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((_, i) => i !== idx),
    }));
  };

  const updateAssignment = (idx: number, field: keyof TeachingAssignment, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.assignments];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, assignments: updated };
    });
  };

  // Step Validation
  const validateCurrentStep = (): boolean => {
    setErrorMessage(null);
    if (currentStep === 1) {
      if (!formData.firstName.trim()) {
        setErrorMessage('First Name is required');
        return false;
      }
      if (!formData.lastName.trim()) {
        setErrorMessage('Last Name is required');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setErrorMessage('Valid Contact Email is required');
        return false;
      }
      if (!formData.phone.trim() || formData.phone.length < 7) {
        setErrorMessage('Valid Contact Phone is required');
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.employeeId.trim()) {
        setErrorMessage('Employee ID is required');
        return false;
      }
      if (!formData.joiningDate) {
        setErrorMessage('Joining Date is required');
        return false;
      }
      if (!formData.department.trim()) {
        setErrorMessage('Department is required');
        return false;
      }
      if (!formData.designation.trim()) {
        setErrorMessage('Designation is required');
        return false;
      }
    } else if (currentStep === 4) {
      for (let i = 0; i < formData.qualifications.length; i++) {
        const q = formData.qualifications[i];
        if (!q.qualification.trim() || !q.institution.trim()) {
          setErrorMessage(`Qualification record #${i + 1} requires degree and institution`);
          return false;
        }
      }
    } else if (currentStep === 5) {
      // Assignments can be empty if teacher is not yet assigned, but if added must be valid
      for (let i = 0; i < formData.assignments.length; i++) {
        const a = formData.assignments[i];
        if (!a.sectionId || !a.subjectId) {
          setErrorMessage(`Assignment record #${i + 1} requires both Section and Subject`);
          return false;
        }
      }
    } else if (currentStep === 6) {
      if (!formData.loginEmail.trim() || !formData.loginEmail.includes('@')) {
        // Fallback to contact email or phone handle
        if (formData.email.trim() && formData.email.includes('@')) {
          setFormData((prev) => ({ ...prev, loginEmail: prev.email.trim() }));
        } else {
          setErrorMessage('Valid Contact/Login Email is required');
          return false;
        }
      }
      if (!formData.temporaryPassword || formData.temporaryPassword.length < 6) {
        generatePassword();
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCopyAll = () => {
    if (!createdCredentials) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://alphaeduhub.in';
    const text = `Alpha Edu Hub — Teacher Portal Credentials
Name: ${createdCredentials.name}
Role: ${createdCredentials.role}
Employee ID: ${createdCredentials.employeeId}
Login Mobile Number: ${createdCredentials.phone}
Login Email: ${createdCredentials.email}
Temporary Password: ${createdCredentials.tempPassword}
Login Portal: ${origin}/login`;
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleCopyPass = () => {
    if (!createdCredentials) return;
    navigator.clipboard.writeText(createdCredentials.tempPassword);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2500);
  };

  const handleFinish = () => {
    setCreatedCredentials(null);
    onClose();
    if (onSuccess) onSuccess();
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await createTeacherAction(formData);
      if (res.success) {
        if (res.credentials) {
          setCreatedCredentials(res.credentials);
        } else {
          setSuccessMessage(res.message || 'Teacher successfully registered.');
          setTimeout(() => {
            handleFinish();
          }, 1200);
        }
      } else {
        setErrorMessage(res.error || 'Failed to create teacher');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unexpected network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={createdCredentials ? handleFinish : onClose}
      title={createdCredentials ? 'Faculty Account Created & Credentials Generated' : 'Add New Faculty Member'}
      description={
        createdCredentials
          ? 'Secure temporary credentials have been generated. The teacher can log in immediately using their Mobile Number.'
          : 'Register complete teacher profile, assign academic subjects, and provision secure portal login.'
      }
      maxWidth="4xl"
      footer={
        createdCredentials ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-500 font-medium">
              Copy credentials to share with the faculty member via SMS/WhatsApp.
            </span>
            <div className="flex items-center gap-2.5">
              <AdminButton
                variant="secondary"
                onClick={handleCopyAll}
                icon={copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copiedAll ? 'Credentials Copied!' : 'Copy Credentials'}
              </AdminButton>
              <AdminButton
                variant="primary"
                onClick={handleFinish}
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Done
              </AdminButton>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div>
              {currentStep > 1 && (
                <AdminButton
                  variant="secondary"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  icon={<ArrowLeft className="w-3.5 h-3.5" />}
                >
                  Back
                </AdminButton>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <AdminButton variant="secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </AdminButton>
              {currentStep < 6 ? (
                <AdminButton
                  variant="primary"
                  onClick={handleNext}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Continue
                </AdminButton>
              ) : (
                <AdminButton
                  variant="primary"
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Create Teacher Account
                </AdminButton>
              )}
            </div>
          </div>
        )
      }
    >
      {createdCredentials ? (
        <div className="py-4 space-y-5 animate-in fade-in duration-200">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Faculty Account Successfully Registered</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Account credentials have been created with automated password generation. The teacher can log in immediately using their registered mobile number.
            </p>
          </div>

          <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-4.5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Faculty Member</span>
                <p className="text-sm font-bold text-slate-900">{createdCredentials.name}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#0B72E7] border border-blue-200/60">
                Role: TEACHER
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">
                  Mobile Number (Primary Login ID)
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {createdCredentials.phone}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">
                  Employee ID
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {createdCredentials.employeeId}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">
                  Login Email
                </span>
                <span className="font-medium text-slate-700 truncate block">
                  {createdCredentials.email}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-blue-200 bg-blue-50/20">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] font-bold text-[#0B72E7] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Auto-Generated Password
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPass}
                    className="text-[11px] font-semibold text-[#0B72E7] hover:underline flex items-center gap-1"
                  >
                    {copiedPass ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copiedPass ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <span className="font-mono font-bold text-slate-900 text-sm select-all">
                  {createdCredentials.tempPassword}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                The faculty member will be required to change this temporary password upon their first login to Alpha Edu Hub.
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
        {/* Step Progress Indicators */}
        <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-3">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isActive = currentStep === s.id;
              const isPassed = currentStep > s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (s.id < currentStep) {
                      setCurrentStep(s.id);
                    } else if (validateCurrentStep()) {
                      setCurrentStep(s.id);
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all ${
                    isActive
                      ? 'bg-white shadow-xs border border-blue-200 text-[#0B72E7]'
                      : isPassed
                      ? 'bg-blue-50/60 text-blue-700'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0B72E7]' : isPassed ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="text-[11px] font-bold">Step {s.id}</span>
                  </div>
                  <span className="text-[11px] font-semibold truncate max-w-full">{s.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STEP 1: PERSONAL INFORMATION */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B72E7]">
                Step 1: Personal Information
              </h4>
              <p className="text-xs text-slate-500">Legal name, demographics, and identification.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Ramesh"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Sharma"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender || 'MALE'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Profile Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.avatarUrl || ''}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/... or cloud avatar link"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CONTACT DETAILS */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B72E7]">
                Step 2: Contact Information
              </h4>
              <p className="text-xs text-slate-500">Official communication address and emergency contacts.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="faculty@school.edu.in"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  value={formData.alternatePhone || ''}
                  onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                  placeholder="+91 11 2345 6789"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential Street Address
                </label>
                <textarea
                  rows={2}
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Apartment, Street name, Landmark"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. New Delhi"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g. Delhi NCR"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  value={formData.pinCode || ''}
                  onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                  placeholder="e.g. 110001"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: EMPLOYMENT */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B72E7]">
                Step 3: Employment Details
              </h4>
              <p className="text-xs text-slate-500">Employee ID, joining tenure, department, and designation.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })}
                  placeholder="FAC-2026-101"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono font-bold focus:bg-white focus:border-[#0B72E7] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Joining Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <input
                  list="departments-list"
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Select or enter department"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                />
                <datalist id="departments-list">
                  {departments.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Head of Department, Senior Teacher"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Employment Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { val: 'FULL_TIME', label: 'Full Time' },
                    { val: 'PART_TIME', label: 'Part Time' },
                    { val: 'CONTRACT', label: 'Contract' },
                    { val: 'VISITING_FACULTY', label: 'Visiting Faculty' },
                  ].map((item) => (
                    <label
                      key={item.val}
                      className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                        formData.employmentType === item.val
                          ? 'bg-blue-50/70 border-[#0B72E7] text-[#0B72E7]'
                          : 'bg-[#F8FAFC] border-slate-200 text-slate-600 hover:bg-slate-100/60'
                      }`}
                    >
                      <input
                        type="radio"
                        name="employmentType"
                        value={item.val}
                        checked={formData.employmentType === item.val}
                        onChange={() => setFormData({ ...formData, employmentType: item.val as any })}
                        className="sr-only"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: QUALIFICATIONS */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B72E7]">
                  Step 4: Academic Qualifications & Experience
                </h4>
                <p className="text-xs text-slate-500">Record degrees, certifications, and teaching tenure.</p>
              </div>
              <button
                type="button"
                onClick={addQualification}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-[#0B72E7] hover:bg-blue-100 font-bold text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Qualification
              </button>
            </div>

            {formData.qualifications.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl p-4">
                <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">No qualification records added yet</p>
                <button
                  type="button"
                  onClick={addQualification}
                  className="mt-2 text-xs font-bold text-[#0B72E7] hover:underline"
                >
                  + Add First Degree / Credential
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {formData.qualifications.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-[#F8FAFC] relative space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Record #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeQualification(idx)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors"
                        title="Remove record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Qualification / Degree <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={q.qualification}
                          onChange={(e) => updateQualification(idx, 'qualification', e.target.value)}
                          placeholder="e.g. M.Sc, B.Ed, Ph.D"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-[#0B72E7]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Specialization
                        </label>
                        <input
                          type="text"
                          value={q.specialization || ''}
                          onChange={(e) => updateQualification(idx, 'specialization', e.target.value)}
                          placeholder="e.g. Pure Mathematics"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-[#0B72E7]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Institution / University <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={q.institution}
                          onChange={(e) => updateQualification(idx, 'institution', e.target.value)}
                          placeholder="e.g. University of Delhi"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-[#0B72E7]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Graduation Year
                        </label>
                        <input
                          type="text"
                          value={q.graduationYear}
                          onChange={(e) => updateQualification(idx, 'graduationYear', e.target.value)}
                          placeholder="2018"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-[#0B72E7]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Prior Experience
                        </label>
                        <input
                          type="text"
                          value={q.experience || ''}
                          onChange={(e) => updateQualification(idx, 'experience', e.target.value)}
                          placeholder="e.g. 5 Years Senior Faculty at DPS"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-[#0B72E7]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 5: TEACHING ASSIGNMENTS */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B72E7]">
                  Step 5: Teaching Assignments
                </h4>
                <p className="text-xs text-slate-500">Allocate subjects to specific classes and sections.</p>
              </div>
              <button
                type="button"
                onClick={addAssignment}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-[#0B72E7] hover:bg-blue-100 font-bold text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Assignment
              </button>
            </div>

            {formData.assignments.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl p-4">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">No active teaching assignments added yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  You can assign classes now or configure them later in Timetable & Substitution.
                </p>
                <button
                  type="button"
                  onClick={addAssignment}
                  className="mt-3 text-xs font-bold text-[#0B72E7] hover:underline"
                >
                  + Assign First Subject & Class
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {formData.assignments.map((assign, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-[#F8FAFC] flex flex-col sm:flex-row items-center gap-3"
                  >
                    <div className="flex-1 w-full sm:w-auto">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Class & Section <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={assign.sectionId}
                        onChange={(e) => updateAssignment(idx, 'sectionId', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-[#0B72E7]"
                      >
                        {sections.length === 0 ? (
                          <option value="">No sections available</option>
                        ) : (
                          sections.map((sec) => (
                            <option key={sec.id} value={sec.id}>
                              {sec.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="flex-1 w-full sm:w-auto">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={assign.subjectId}
                        onChange={(e) => updateAssignment(idx, 'subjectId', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-[#0B72E7]"
                      >
                        {subjects.length === 0 ? (
                          <option value="">No subjects available</option>
                        ) : (
                          subjects.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.name} ({sub.code})
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAssignment(idx)}
                      className="text-slate-400 hover:text-red-600 p-2 rounded-lg transition-colors mt-4 sm:mt-0"
                      title="Remove assignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 6: ACCOUNT ACCESS & AUTOMATED CREDENTIALS */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B72E7]">
                Step 6: Account Access & Credentials
              </h4>
              <p className="text-xs text-slate-500">
                Password is automatically generated. The teacher can log in directly using their Mobile Number.
              </p>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950">
                <span className="font-bold">Automated Credentials Provisioning</span>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Faculty login is automatically enabled with their Mobile Number (<strong>{formData.phone || 'Entered in Step 2'}</strong>) and the secure password generated below.
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Login Email / Handle
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={formData.loginEmail}
                    onChange={(e) => setFormData({ ...formData, loginEmail: e.target.value })}
                    placeholder="teacher.login@school.edu.in"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Faculty can log in using either this Email or their Mobile Number ({formData.phone || 'Phone'}).
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#0B72E7]" />
                    Auto-Generated Temporary Password
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-[11px] font-bold text-[#0B72E7] hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Regenerate Password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.temporaryPassword}
                    onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-3 pr-10 py-2.5 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  This password will be displayed with a 1-click copy button upon saving and will be required to change on first login.
                </p>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.sendInvitation}
                    onChange={(e) => setFormData({ ...formData, sendInvitation: e.target.checked })}
                    className="w-4 h-4 rounded-md border-slate-300 text-[#0B72E7] focus:ring-[#0B72E7]"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Send invitation & temporary credentials via email/SMS notification
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </AdminModal>
  );
}
