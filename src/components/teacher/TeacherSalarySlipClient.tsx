'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Printer,
  Download,
  Calendar,
  Building2,
  CheckCircle2,
  CreditCard,
  User,
  ShieldCheck,
  ArrowLeft,
  ChevronRight,
  FileText,
  BadgeCheck,
  TrendingUp,
  Receipt,
} from 'lucide-react';
import AdminCard from '@/components/admin/ui/AdminCard';
import AdminButton from '@/components/admin/ui/AdminButton';

export interface SalaryMonthData {
  month: string;
  year: number;
  label: string;
  payDate: string;
  utrRef: string;
  daysInMonth: number;
  paidDays: number;
  lopDays: number;
  basic: number;
  da: number;
  hra: number;
  specialAllowance: number;
  conveyance: number;
  medical: number;
  gross: number;
  epf: number;
  tds: number;
  pt: number;
  welfare: number;
  insurance: number;
  totalDeductions: number;
  netPay: number;
  netPayWords: string;
  status: 'PAID' | 'PROCESSING';
}

interface TeacherSalarySlipClientProps {
  teacher: {
    name: string;
    employeeId: string;
    department: string;
    designation: string;
    email: string;
    phone?: string | null;
    avatarUrl?: string | null;
    bankName: string;
    accountMasked: string;
    ifsc: string;
    pan: string;
    uan: string;
    joiningDate?: string;
  };
  school: {
    name: string;
    tagline?: string;
    affiliationNo: string;
    address: string;
    city: string;
  };
}

const MONTHS_DATA: SalaryMonthData[] = [
  {
    month: 'October',
    year: 2026,
    label: 'October 2026',
    payDate: 'October 31, 2026',
    utrRef: 'CMS202610319821SBIN',
    daysInMonth: 31,
    paidDays: 31,
    lopDays: 0,
    basic: 48000,
    da: 22080,
    hra: 12960,
    specialAllowance: 6500,
    conveyance: 3600,
    medical: 1800,
    gross: 94940,
    epf: 5760,
    tds: 4500,
    pt: 200,
    welfare: 200,
    insurance: 280,
    totalDeductions: 10940,
    netPay: 84000,
    netPayWords: 'Eighty-Four Thousand Rupees Only',
    status: 'PAID',
  },
  {
    month: 'September',
    year: 2026,
    label: 'September 2026',
    payDate: 'September 30, 2026',
    utrRef: 'CMS202609307714SBIN',
    daysInMonth: 30,
    paidDays: 30,
    lopDays: 0,
    basic: 48000,
    da: 22080,
    hra: 12960,
    specialAllowance: 6500,
    conveyance: 3600,
    medical: 1800,
    gross: 94940,
    epf: 5760,
    tds: 4500,
    pt: 200,
    welfare: 200,
    insurance: 280,
    totalDeductions: 10940,
    netPay: 84000,
    netPayWords: 'Eighty-Four Thousand Rupees Only',
    status: 'PAID',
  },
  {
    month: 'August',
    year: 2026,
    label: 'August 2026',
    payDate: 'August 31, 2026',
    utrRef: 'CMS202608316492SBIN',
    daysInMonth: 31,
    paidDays: 31,
    lopDays: 0,
    basic: 48000,
    da: 22080,
    hra: 12960,
    specialAllowance: 6500,
    conveyance: 3600,
    medical: 1800,
    gross: 94940,
    epf: 5760,
    tds: 4500,
    pt: 200,
    welfare: 200,
    insurance: 280,
    totalDeductions: 10940,
    netPay: 84000,
    netPayWords: 'Eighty-Four Thousand Rupees Only',
    status: 'PAID',
  },
  {
    month: 'July',
    year: 2026,
    label: 'July 2026',
    payDate: 'July 31, 2026',
    utrRef: 'CMS202607314102SBIN',
    daysInMonth: 31,
    paidDays: 31,
    lopDays: 0,
    basic: 48000,
    da: 22080,
    hra: 12960,
    specialAllowance: 6500,
    conveyance: 3600,
    medical: 1800,
    gross: 94940,
    epf: 5760,
    tds: 4500,
    pt: 200,
    welfare: 200,
    insurance: 280,
    totalDeductions: 10940,
    netPay: 84000,
    netPayWords: 'Eighty-Four Thousand Rupees Only',
    status: 'PAID',
  },
  {
    month: 'June',
    year: 2026,
    label: 'June 2026',
    payDate: 'June 30, 2026',
    utrRef: 'CMS202606301980SBIN',
    daysInMonth: 30,
    paidDays: 30,
    lopDays: 0,
    basic: 48000,
    da: 22080,
    hra: 12960,
    specialAllowance: 6500,
    conveyance: 3600,
    medical: 1800,
    gross: 94940,
    epf: 5760,
    tds: 4500,
    pt: 200,
    welfare: 200,
    insurance: 280,
    totalDeductions: 10940,
    netPay: 84000,
    netPayWords: 'Eighty-Four Thousand Rupees Only',
    status: 'PAID',
  },
];

export default function TeacherSalarySlipClient({
  teacher,
  school,
}: TeacherSalarySlipClientProps) {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const currentPay = MONTHS_DATA[selectedMonthIndex] || MONTHS_DATA[0];

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* 1. Breadcrumbs & Header Actions (Hidden in Print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1 font-medium">
            <Link href="/teacher" className="hover:text-[#0B72E7] transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-600 font-semibold">Salary &amp; Pay Slip</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Monthly Salary Statement &amp; Pay Slip
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View, verify, print, or download your official institutional compensation slips.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Slip</span>
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B72E7] hover:bg-[#095ec2] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Month Selector Strip (Hidden in Print) */}
      <div className="print:hidden flex items-center justify-between gap-3 overflow-x-auto pb-1">
        <div className="flex items-center gap-2">
          {MONTHS_DATA.map((item, idx) => (
            <button
              key={item.label}
              onClick={() => setSelectedMonthIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedMonthIndex === idx
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 font-medium shrink-0 hidden sm:inline">
          Financial Year 2026-27
        </span>
      </div>

      {/* 3. Official Institutional Pay Slip Document (Printable) */}
      <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(15,45,95,0.06)] border border-slate-200/90 overflow-hidden print:border-none print:shadow-none print:rounded-none">
        {/* Document Header */}
        <div className="p-6 sm:p-8 border-b border-slate-200 bg-gradient-to-br from-slate-50/60 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-2 shadow-xs shrink-0 overflow-hidden">
                <Image
                  src="/images/dashboard/logo_crest.png"
                  alt="Alpha Edu Hub"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {school.name}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Affiliation No: {school.affiliationNo} • {school.address}, {school.city}
                </p>
                <p className="text-[11px] font-semibold text-[#0B72E7] uppercase tracking-wider mt-1">
                  PAYSLIP FOR {currentPay.month.toUpperCase()} {currentPay.year}
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>SALARY DISBURSED</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Date: {currentPay.payDate}
              </p>
            </div>
          </div>
        </div>

        {/* Employee & Payroll Details Grid */}
        <div className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50/40">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 text-xs">
            <div>
              <span className="text-[10.5px] uppercase font-bold text-slate-400 tracking-wider block">
                Employee Name
              </span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                {teacher.name}
              </span>
            </div>

            <div>
              <span className="text-[10.5px] uppercase font-bold text-slate-400 tracking-wider block">
                Staff ID / Code
              </span>
              <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">
                {teacher.employeeId}
              </span>
            </div>

            <div>
              <span className="text-[10.5px] uppercase font-bold text-slate-400 tracking-wider block">
                Department
              </span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {teacher.department}
              </span>
            </div>

            <div>
              <span className="text-[10.5px] uppercase font-bold text-slate-400 tracking-wider block">
                Designation
              </span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {teacher.designation}
              </span>
            </div>

            <div>
              <span className="text-[10.5px] uppercase font-bold text-slate-400 tracking-wider block">
                Bank &amp; Account
              </span>
              <span className="font-medium text-slate-800 mt-0.5 block">
                {teacher.bankName} • {teacher.accountMasked}
              </span>
            </div>

            <div>
              <span className="text-[10.5px] uppercase font-bold text-slate-400 tracking-wider block">
                IFSC Code
              </span>
              <span className="font-mono text-slate-800 mt-0.5 block">
                {teacher.ifsc}
              </span>
            </div>

            <div>
              <span className="text-[10.5px] uppercase font-bold text-slate-400 tracking-wider block">
                PAN / UAN (EPF)
              </span>
              <span className="font-mono text-slate-800 mt-0.5 block">
                {teacher.pan} / {teacher.uan}
              </span>
            </div>

            <div>
              <span className="text-[10.5px] uppercase font-bold text-slate-400 tracking-wider block">
                Attendance Days
              </span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {currentPay.paidDays} Paid / {currentPay.daysInMonth} Days (LOP: {currentPay.lopDays})
              </span>
            </div>
          </div>
        </div>

        {/* Earnings & Deductions Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Column 1: Earnings */}
          <div className="p-6 sm:p-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-4 flex items-center justify-between">
              <span>Earnings</span>
              <span>Amount (₹)</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Basic Pay</span>
                <span className="font-mono font-bold text-slate-800">₹{currentPay.basic.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Dearness Allowance (DA @ 46%)</span>
                <span className="font-mono font-bold text-slate-800">₹{currentPay.da.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">House Rent Allowance (HRA @ 27%)</span>
                <span className="font-mono font-bold text-slate-800">₹{currentPay.hra.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Special Academic Allowance</span>
                <span className="font-mono font-bold text-slate-800">₹{currentPay.specialAllowance.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Conveyance Allowance</span>
                <span className="font-mono font-bold text-slate-800">₹{currentPay.conveyance.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Medical Allowance</span>
                <span className="font-mono font-bold text-slate-800">₹{currentPay.medical.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between font-bold text-sm">
              <span className="text-slate-900">Total Gross Earnings</span>
              <span className="font-mono text-emerald-600">₹{currentPay.gross.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Column 2: Deductions */}
          <div className="p-6 sm:p-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-4 flex items-center justify-between">
              <span>Deductions</span>
              <span>Amount (₹)</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Employees' Provident Fund (EPF)</span>
                <span className="font-mono font-bold text-slate-800">₹{currentPay.epf.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Income Tax (TDS)</span>
                <span className="font-mono font-bold text-slate-800">₹{currentPay.tds.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Professional Tax (PT)</span>
                <span className="font-mono font-bold text-slate-800">₹{currentPay.pt.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Staff Welfare Fund</span>
                <span className="font-mono font-bold text-slate-800">₹{currentPay.welfare.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Group Term Insurance (GIS)</span>
                <span className="font-mono font-bold text-slate-800">₹{currentPay.insurance.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between font-bold text-sm">
              <span className="text-slate-900">Total Deductions</span>
              <span className="font-mono text-rose-600">₹{currentPay.totalDeductions.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Net Salary Highlight Strip */}
        <div className="p-6 sm:p-8 bg-blue-50/70 border-t border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-blue-900 block">
              Net Payable Salary (Transferred to Bank Account)
            </span>
            <span className="text-xs font-medium text-slate-600 mt-1 block">
              In Words: <strong>{currentPay.netPayWords}</strong>
            </span>
            <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
              UTR Ref: {currentPay.utrRef}
            </span>
          </div>

          <div className="sm:text-right">
            <span className="text-2xl sm:text-3xl font-black text-[#0B72E7] font-mono block">
              ₹{currentPay.netPay.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100/80 px-2.5 py-0.5 rounded-full inline-block mt-1">
              ✓ Credited Successfully
            </span>
          </div>
        </div>

        {/* Authorized Signature & Disclaimer */}
        <div className="p-6 sm:p-8 border-t border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-6 text-xs text-slate-400">
          <div>
            <p className="font-medium text-slate-500">Note: This is a system-generated electronic pay slip.</p>
            <p className="text-[11px] mt-0.5">Alpha Edu Hub ERP • Institutional Payroll Governance Engine</p>
          </div>

          <div className="text-right sm:text-right">
            <div className="w-36 h-10 border-b border-slate-300 mx-auto sm:ml-auto flex items-end justify-center pb-1">
              <span className="font-serif italic text-slate-600 font-bold text-xs">Accounts Officer</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 mt-1 block">
              Authorized Signatory
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
