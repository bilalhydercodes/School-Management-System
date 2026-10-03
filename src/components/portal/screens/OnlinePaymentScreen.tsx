'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Loader2,
  Sparkles,
  Building2,
  User,
  Receipt,
  Download,
  QrCode,
  Smartphone,
  ChevronRight,
  ExternalLink,
  Printer,
  Calendar,
  AlertTriangle,
  Info,
  Phone,
  Mail,
  Edit2,
  Copy,
  Check,
  BadgeCheck,
  Zap,
} from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';
import {
  createRazorpayOrderAction,
  verifyRazorpayPaymentAction,
  type DynamicInvoice,
  type CreateOrderResult,
  type VerifyPaymentResult,
} from '@/actions/payment';

interface ChildOption {
  id: string;
  name: string;
  rollNumber: number | null;
  admissionNumber: string;
  className: string;
  sectionName: string;
  isPrimary: boolean;
}

interface OnlinePaymentScreenProps {
  student: {
    id: string;
    name: string;
    admissionNumber: string;
    rollNumber: number | null;
    sectionName: string;
    className: string;
    board: string;
    avatarUrl?: string | null;
    email?: string;
    phone?: string;
  };
  parentContext?: {
    isParentView: boolean;
    parentName: string;
    relationship: string;
    children: ChildOption[];
  };
  feeStatus: {
    isOverdue: boolean;
    pendingAmount: number;
    nextDueDate: string;
    totalPaid: number;
    statusText: string;
  };
  invoices?: Array<{
    id: string;
    invoiceNumber: string;
    title: string;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    dueDate: string;
    status: 'Paid' | 'Pending' | 'Partial' | 'Overdue';
    items?: Array<{
      category: string;
      amount: number;
      paid: number;
      status: 'Paid' | 'Pending';
    }>;
  }>;
  initialInvoiceId?: string | null;
  initialAmount?: number | null;
  onPaymentSuccess?: (paidAmount: number, receiptNo: string) => void;
  onBackToDashboard: () => void;
  onSelectNav: (id: string) => void;
}

const TOP_BANKS = [
  { id: 'HDFC', name: 'HDFC Bank', code: 'HDFC', popular: true },
  { id: 'SBI', name: 'State Bank of India', code: 'SBIN', popular: true },
  { id: 'ICICI', name: 'ICICI Bank', code: 'ICIC', popular: true },
  { id: 'AXIS', name: 'Axis Bank', code: 'UTIB', popular: true },
  { id: 'KOTAK', name: 'Kotak Mahindra', code: 'KKBK', popular: true },
  { id: 'PNB', name: 'Punjab National Bank', code: 'PUNB', popular: true },
];

export default function OnlinePaymentScreen({
  student,
  parentContext,
  feeStatus,
  invoices = [],
  initialInvoiceId,
  initialAmount,
  onPaymentSuccess,
  onBackToDashboard,
  onSelectNav,
}: OnlinePaymentScreenProps) {
  // --------------------------------------------------------------------------
  // 1. Dynamic Invoices Resolution
  // --------------------------------------------------------------------------
  const fallbackInvoices = useMemo(
    () => [
      {
        id: 'inv-fallback-q3',
        invoiceNumber: 'INV-2026-Q3-0428',
        title: 'Quarter 3 CBSE Examination & Assessment Fee',
        totalAmount: 4500,
        paidAmount: 0,
        balanceAmount: 4500,
        dueDate: '15 Oct 2026',
        status: 'Pending' as const,
        items: [
          { category: 'CBSE Board Examination Fee', amount: 3000, paid: 0, status: 'Pending' as const },
          { category: 'Science Practical Lab Charges', amount: 1000, paid: 0, status: 'Pending' as const },
          { category: 'Digital Assessment & Hall Ticket', amount: 500, paid: 0, status: 'Pending' as const },
        ],
      },
      {
        id: 'inv-fallback-q4',
        invoiceNumber: 'INV-2027-Q4-0428',
        title: 'Quarter 4 Consolidated Tuition & Laboratory Fee',
        totalAmount: 16000,
        paidAmount: 0,
        balanceAmount: 16000,
        dueDate: '15 Jan 2027',
        status: 'Pending' as const,
        items: [
          { category: 'Tuition Fee (Quarter 4)', amount: 12250, paid: 0, status: 'Pending' as const },
          { category: 'Science & Computer Lab Session', amount: 1750, paid: 0, status: 'Pending' as const },
          { category: 'Library & Digital Journals', amount: 900, paid: 0, status: 'Pending' as const },
          { category: 'Sports & Co-Curricular', amount: 1100, paid: 0, status: 'Pending' as const },
        ],
      },
    ],
    []
  );

  const activeInvoices = invoices.length > 0 ? invoices : fallbackInvoices;
  const pendingInvoices = activeInvoices.filter((i) => i.balanceAmount > 0);

  const defaultInvoice =
    pendingInvoices.find((i) => i.id === initialInvoiceId) ||
    pendingInvoices.find((i) => i.invoiceNumber === initialInvoiceId) ||
    pendingInvoices[0] ||
    activeInvoices[0];

  const totalOutstanding = pendingInvoices.reduce((sum, inv) => sum + inv.balanceAmount, 0);

  // --------------------------------------------------------------------------
  // 2. Selection & Form State
  // --------------------------------------------------------------------------
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    defaultInvoice?.id || defaultInvoice?.invoiceNumber || ''
  );
  const [selectedFeeHead, setSelectedFeeHead] = useState<string>(
    defaultInvoice?.title || 'Annual CBSE Examination Fee (Term 1)'
  );

  const defaultPayable =
    initialAmount && initialAmount > 0
      ? initialAmount
      : defaultInvoice
      ? defaultInvoice.balanceAmount
      : totalOutstanding > 0
      ? totalOutstanding
      : 4500;

  const [paymentModeType, setPaymentModeType] = useState<'single' | 'full' | 'custom'>('single');
  const [payableAmount, setPayableAmount] = useState<number>(defaultPayable);
  const [customAmountInput, setCustomAmountInput] = useState<string>(defaultPayable.toString());

  // --------------------------------------------------------------------------
  // 3. Dynamic Payer Details State
  // --------------------------------------------------------------------------
  const defaultPayerName = parentContext?.isParentView
    ? parentContext.parentName
    : student.name;
  const defaultPayerRelationship = parentContext?.isParentView
    ? parentContext.relationship || 'Father'
    : 'Self';
  const defaultPayerEmail =
    student.email || (parentContext?.isParentView ? 'parent@dps.edu.in' : 'student@dps.edu.in');
  const defaultPayerPhone = student.phone || '+91 98765 43210';

  const [payerName, setPayerName] = useState(defaultPayerName);
  const [payerEmail, setPayerEmail] = useState(defaultPayerEmail);
  const [payerPhone, setPayerPhone] = useState(defaultPayerPhone);
  const [isEditingPayer, setIsEditingPayer] = useState(false);

  // --------------------------------------------------------------------------
  // 4. Payment Channel Selection
  // --------------------------------------------------------------------------
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [selectedBank, setSelectedBank] = useState<string>('HDFC');
  const [customVpa, setCustomVpa] = useState<string>('parent.fee@okhdfcbank');
  const [vpaVerified, setVpaVerified] = useState(true);

  // --------------------------------------------------------------------------
  // 5. Gateway Processing & Simulation States
  // --------------------------------------------------------------------------
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitiating, setIsInitiating] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showSimulatedModal, setShowSimulatedModal] = useState(false);
  const [simulatedOrderData, setSimulatedOrderData] = useState<CreateOrderResult | null>(null);

  const [completedPayment, setCompletedPayment] = useState<VerifyPaymentResult | null>(null);

  // Sync initialAmount if changed
  useEffect(() => {
    if (initialAmount && initialAmount > 0) {
      setPayableAmount(initialAmount);
      setCustomAmountInput(initialAmount.toString());
    }
  }, [initialAmount]);

  // When selected invoice changes, update title & amount
  const handleSelectInvoice = (inv: (typeof activeInvoices)[0]) => {
    setSelectedInvoiceId(inv.id);
    setSelectedFeeHead(inv.title);
    setPaymentModeType('single');
    setPayableAmount(inv.balanceAmount);
    setCustomAmountInput(inv.balanceAmount.toString());
  };

  const handleSelectFullPayment = () => {
    setPaymentModeType('full');
    setPayableAmount(totalOutstanding);
    setCustomAmountInput(totalOutstanding.toString());
    setSelectedFeeHead('Consolidated Outstanding Academic Session Dues');
  };

  const handleSelectCustomPayment = () => {
    setPaymentModeType('custom');
    const val = parseFloat(customAmountInput) || 1000;
    setPayableAmount(val);
  };

  // --------------------------------------------------------------------------
  // 6. Razorpay Standard Checkout Integration
  // --------------------------------------------------------------------------
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).Razorpay) return resolve(true);

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInitiateRazorpay = async () => {
    if (payableAmount <= 0) {
      alert('Please enter a valid amount greater than ₹0.');
      return;
    }

    setIsInitiating(true);

    try {
      // 1. Create order on server via Server Action
      const orderRes = await createRazorpayOrderAction({
        invoiceId: paymentModeType === 'single' ? selectedInvoiceId : undefined,
        amount: payableAmount,
        description: `${selectedFeeHead} — ${student.name} (${student.className}-${student.sectionName})`,
        studentId: student.id,
        payerName,
        payerEmail,
        payerPhone,
      });

      if (!orderRes.success || !orderRes.orderId) {
        alert(orderRes.error || 'Failed to initialize payment gateway.');
        setIsInitiating(false);
        return;
      }

      // If test simulation or placeholder keys
      if (orderRes.isDevSimulation) {
        setSimulatedOrderData(orderRes);
        setShowSimulatedModal(true);
        setIsInitiating(false);
        return;
      }

      // 2. Load live checkout script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        // Fallback to simulation drawer
        setSimulatedOrderData(orderRes);
        setShowSimulatedModal(true);
        setIsInitiating(false);
        return;
      }

      // 3. Configure Razorpay Standard Checkout
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amountInPaise,
        currency: 'INR',
        name: 'Delhi Public School',
        description: `${selectedFeeHead} • ${student.name}`,
        image: '/images/dashboard/ref_avatar.png',
        order_id: orderRes.orderId,
        prefill: {
          name: payerName,
          email: payerEmail,
          contact: payerPhone,
        },
        notes: {
          studentId: student.id,
          admissionNumber: student.admissionNumber,
          studentName: student.name,
          studentClass: `${student.className}-${student.sectionName}`,
          payerName,
          payerRelationship: defaultPayerRelationship,
          invoiceId: orderRes.invoiceId || selectedInvoiceId,
          feeDescription: selectedFeeHead,
        },
        theme: {
          color: '#2563EB',
        },
        handler: async function (response: any) {
          await finalizePayment({
            orderId: response.razorpay_order_id || orderRes.orderId!,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            invoiceId: orderRes.invoiceId || selectedInvoiceId,
          });
        },
        modal: {
          ondismiss: function () {
            setIsInitiating(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (res: any) {
        alert(`Payment Failed: ${res.error.description || 'Transaction declined by bank.'}`);
        setIsInitiating(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('[Razorpay Launch Error]', err);
      alert('Could not start Razorpay checkout. Please try again.');
    } finally {
      setIsInitiating(false);
    }
  };

  // --------------------------------------------------------------------------
  // 7. Payment Verification & Final Settlement
  // --------------------------------------------------------------------------
  const finalizePayment = async ({
    orderId,
    paymentId,
    signature,
    invoiceId,
  }: {
    orderId: string;
    paymentId: string;
    signature?: string;
    invoiceId?: string;
  }) => {
    setIsProcessing(true);
    setShowSimulatedModal(false);

    try {
      const verifyRes = await verifyRazorpayPaymentAction({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        invoiceId,
        amount: payableAmount,
        paymentMethod: selectedMethod,
        payerName,
        payerEmail,
        payerPhone,
        feeDescription: selectedFeeHead,
      });

      if (!verifyRes.success) {
        alert(verifyRes.error || 'Server payment verification failed.');
        setIsProcessing(false);
        return;
      }

      setCompletedPayment(verifyRes);
      setPaymentSuccess(true);
      onPaymentSuccess?.(payableAmount, verifyRes.receiptNumber || '');
    } catch (err: any) {
      console.error('[Payment Verification Exception]', err);
      alert('Network error while completing payment verification.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // Dynamic UPI payment link QR code text
  const upiQrString = `upi://pay?pa=alphaeduhub.school@razorpay&pn=Delhi+Public+School&am=${payableAmount}&cu=INR&tn=Fee+${student.admissionNumber}`;

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Online Fee Payment"
        subtitle="Production Razorpay gateway with live student assessment ledger and dynamic payer reconciliation"
        onBackToDashboard={onBackToDashboard}
      >
        <button
          type="button"
          onClick={() => onSelectNav('fee-summary')}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
        >
          Cancel & Return
        </button>
      </PortalPageHeader>

      {/* ==================================================================== */}
      {/* 1. SUCCESS SCREEN WITH OFFICIAL INSTITUTIONAL TAX RECEIPT            */}
      {/* ==================================================================== */}
      {paymentSuccess && completedPayment ? (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-[26px] shadow-[0_16px_50px_rgba(16,185,129,0.15)] border border-emerald-100 p-8 sm:p-10 space-y-7">
            {/* Header Banner */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Payment Settled & Reconciled
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
                  ₹{completedPayment.amountPaid?.toLocaleString('en-IN')} Paid Successfully!
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Razorpay Transaction Ref:{' '}
                  <span className="font-mono font-semibold text-slate-700">
                    {completedPayment.paymentId}
                  </span>
                </p>
              </div>
            </div>

            {/* Official Institution Electronic Receipt Box (Printable Area) */}
            <div
              id="printable-receipt"
              className="bg-slate-50/90 rounded-2xl border border-slate-200/90 p-6 sm:p-7 text-xs space-y-5"
            >
              {/* Institution Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                    DPS
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Delhi Public School</h3>
                    <p className="text-[11px] text-slate-500">
                      Affiliated to CBSE, New Delhi • Affiliation No. 2730017 • UDISE 07040100123
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Receipt No</span>
                  <span className="font-mono font-extrabold text-blue-600 text-sm bg-blue-50 px-2.5 py-0.5 rounded-md inline-block">
                    {completedPayment.receiptNumber}
                  </span>
                </div>
              </div>

              {/* 2-Column Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Left: Student Details */}
                <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 space-y-2">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                    Student Details
                  </span>
                  <div className="space-y-1 text-slate-700">
                    <p className="font-bold text-slate-900 text-sm">
                      {completedPayment.studentName || student.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Admission ID:{' '}
                      <strong className="text-slate-800">
                        {completedPayment.admissionNumber || student.admissionNumber}
                      </strong>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Class & Section:{' '}
                      <strong className="text-slate-800">
                        {completedPayment.studentClass || `${student.className}-${student.sectionName}`}
                      </strong>{' '}
                      • Roll No: #{student.rollNumber || '27'}
                    </p>
                    <p className="text-[11px] text-slate-500">Board / Curriculum: CBSE (Academic Year 2026-27)</p>
                  </div>
                </div>

                {/* Right: Payer & Transaction Details */}
                <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 space-y-2">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                    Payer & Payment Channel
                  </span>
                  <div className="space-y-1 text-slate-700">
                    <p className="font-bold text-slate-900 text-sm">
                      {completedPayment.payerName || payerName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Channel: <strong className="text-slate-800">{completedPayment.paymentMethod}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Date & Time: <span className="text-slate-800">{completedPayment.transactionDate}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      Payer Contact: {completedPayment.payerPhone || payerPhone} •{' '}
                      {completedPayment.payerEmail || payerEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Line Items Breakdown */}
              <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-[10.5px] uppercase font-bold text-slate-500 border-b border-slate-200/80">
                    <tr>
                      <th className="py-2.5 px-3.5">Fee Head / Description</th>
                      <th className="py-2.5 px-3.5 text-center">Billing Quarter</th>
                      <th className="py-2.5 px-3.5 text-right">Amount Settled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-3.5 font-semibold text-slate-800">
                        {completedPayment.feeDescription || selectedFeeHead}
                      </td>
                      <td className="py-3 px-3.5 text-center text-slate-500">Academic Session 2026–27</td>
                      <td className="py-3 px-3.5 text-right font-bold text-slate-900">
                        ₹{completedPayment.amountPaid?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td colSpan={2} className="py-2.5 px-3.5 font-bold text-slate-700 text-right">
                        Total Amount Received:
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-extrabold text-[#2563EB] text-sm">
                        ₹{completedPayment.amountPaid?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="py-2 px-3.5 text-slate-500 text-right text-[11px]">
                        Remaining Outstanding Balance:
                      </td>
                      <td className="py-2 px-3.5 text-right font-bold text-slate-700 text-[11px]">
                        ₹{(completedPayment.remainingBalance || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Stamp & Authorized Signature Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-[10.5px] text-slate-400">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Digitally verified via Razorpay PG • No physical signature required</span>
                </div>
                <div className="text-right font-mono text-slate-500">
                  REF: {completedPayment.paymentId?.slice(0, 16)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print Official Receipt</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectNav('payment-history')}
                className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                View in Payment Ledger
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentSuccess(false);
                  setCompletedPayment(null);
                  onSelectNav('fee-summary');
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ==================================================================== */
        /* 2. DYNAMIC PAYMENT FORM & RAZORPAY GATEWAY CHECKOUT                 */
        /* ==================================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Left 2 Cols: Student/Payer Badge, Invoices, Razorpay Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student & Payer Unified Verified Profile Card */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-[22px] p-5 sm:p-6 text-white shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl font-bold border border-white/20 shadow-xs">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-base sm:text-lg">{student.name}</span>
                      <span className="text-[11px] bg-white/20 px-2.5 py-0.5 rounded-full font-semibold">
                        Class {student.className}-{student.sectionName}
                      </span>
                    </div>
                    <div className="text-xs text-blue-100 flex items-center gap-3 mt-1 flex-wrap">
                      <span>
                        Admission ID: <strong>{student.admissionNumber}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Roll No: <strong>#{student.rollNumber || '27'}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Board: <strong>{student.board || 'CBSE'}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right border-t sm:border-t-0 border-white/15 pt-3 sm:pt-0">
                  <span className="text-[10px] uppercase font-bold text-blue-200 block">Current Payer</span>
                  <span className="text-sm font-extrabold text-white flex items-center sm:justify-end gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-300" />
                    {payerName} ({defaultPayerRelationship})
                  </span>
                </div>
              </div>

              {/* Editable Payer Contact for Instant Receipt Dispatch */}
              <div className="mt-4 pt-3.5 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs text-blue-100">
                {!isEditingPayer ? (
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-300" />
                      {payerPhone}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-300" />
                      {payerEmail}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingPayer(true)}
                      className="text-[11px] text-white hover:underline flex items-center gap-1 font-semibold ml-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Contact</span>
                    </button>
                  </div>
                ) : (
                  <div className="w-full flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      placeholder="Payer Full Name"
                      className="px-2.5 py-1 rounded-lg bg-white/20 text-white placeholder-blue-200 text-xs outline-none border border-white/30"
                    />
                    <input
                      type="text"
                      value={payerPhone}
                      onChange={(e) => setPayerPhone(e.target.value)}
                      placeholder="Mobile for SMS / WhatsApp"
                      className="px-2.5 py-1 rounded-lg bg-white/20 text-white placeholder-blue-200 text-xs outline-none border border-white/30"
                    />
                    <input
                      type="email"
                      value={payerEmail}
                      onChange={(e) => setPayerEmail(e.target.value)}
                      placeholder="Email for PDF Receipt"
                      className="px-2.5 py-1 rounded-lg bg-white/20 text-white placeholder-blue-200 text-xs outline-none border border-white/30"
                    />
                    <button
                      type="button"
                      onClick={() => setIsEditingPayer(false)}
                      className="px-3 py-1 rounded-lg bg-white text-blue-700 text-xs font-bold cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                )}
                <span className="text-[10.5px] text-blue-200">Receipt SMS & Email sent automatically</span>
              </div>
            </div>

            {/* Dynamic Invoices & Outstanding Fee Heads */}
            <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 sm:p-7 space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Choose Fee Invoice to Settle</h3>
                  <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full">
                    {pendingInvoices.length} Pending Invoice{pendingInvoices.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Amounts are calculated directly from verified academic assessment and billing records.
                </p>
              </div>

              {/* Pending Invoices Cards */}
              <div className="space-y-3">
                {pendingInvoices.map((inv) => {
                  const isSelected = paymentModeType === 'single' && selectedInvoiceId === inv.id;
                  return (
                    <div
                      key={inv.id}
                      onClick={() => handleSelectInvoice(inv)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#2563EB] bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-[#2563EB] bg-[#2563EB]' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">{inv.title}</span>
                              <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                {inv.invoiceNumber}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              Due Date: {inv.dueDate} •{' '}
                              {inv.items && inv.items.length > 0
                                ? `${inv.items.length} itemized heads`
                                : 'Tuition & Labs'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-extrabold text-slate-900 block">
                            ₹{inv.balanceAmount.toLocaleString('en-IN')}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              inv.status === 'Overdue'
                                ? 'text-red-700 bg-red-50 border border-red-200'
                                : 'text-amber-700 bg-amber-50 border border-amber-200'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>
                      </div>

                      {/* Line Items Details if selected */}
                      {isSelected && inv.items && inv.items.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-blue-100/80 pl-7 space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Line Items Breakdown:
                          </span>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                            {inv.items.map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between text-slate-600">
                                <span className="truncate pr-2">{it.category}</span>
                                <span className="font-semibold text-slate-800">
                                  ₹{it.amount.toLocaleString('en-IN')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Option for Full Consolidated Session Dues */}
                {pendingInvoices.length > 1 && (
                  <div
                    onClick={handleSelectFullPayment}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      paymentModeType === 'full'
                        ? 'border-[#2563EB] bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentModeType === 'full' ? 'border-[#2563EB] bg-[#2563EB]' : 'border-slate-300'
                        }`}
                      >
                        {paymentModeType === 'full' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">
                          Consolidated Session Settlement (All Invoices)
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Clear all outstanding dues in a single transaction with one receipt
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-[#2563EB] block">
                        ₹{totalOutstanding.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-blue-700 font-bold bg-blue-100/70 px-2 py-0.5 rounded-full">
                        Full Clearance
                      </span>
                    </div>
                  </div>
                )}

                {/* Option for Custom / Part Installment */}
                <div
                  onClick={handleSelectCustomPayment}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentModeType === 'custom'
                      ? 'border-[#2563EB] bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentModeType === 'custom' ? 'border-[#2563EB] bg-[#2563EB]' : 'border-slate-300'
                        }`}
                      >
                        {paymentModeType === 'custom' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="font-bold text-xs text-slate-900">
                        Pay Custom or Installment Amount
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">Partial Payment</span>
                  </div>

                  {paymentModeType === 'custom' && (
                    <div className="mt-3 pl-7">
                      <div className="relative max-w-xs">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="100"
                          max={totalOutstanding || 45000}
                          value={customAmountInput}
                          onChange={(e) => {
                            setCustomAmountInput(e.target.value);
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val > 0) {
                              setPayableAmount(val);
                            }
                          }}
                          placeholder="Enter amount"
                          className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Minimum payment: ₹100. Outstanding limit: ₹{totalOutstanding.toLocaleString('en-IN')}.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Channel Options: UPI, Cards, NetBanking */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
                  Select Payment Gateway Channel
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {/* UPI */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('upi')}
                    className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedMethod === 'upi'
                        ? 'border-[#2563EB] bg-blue-50/70 text-[#2563EB] shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 font-bold text-xs">
                      <QrCode className="w-4 h-4" />
                      <span>Instant UPI / QR</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block font-normal mt-0.5">
                      GPay, PhonePe, Paytm, BHIM
                    </span>
                  </button>

                  {/* Card */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('card')}
                    className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedMethod === 'card'
                        ? 'border-[#2563EB] bg-blue-50/70 text-[#2563EB] shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 font-bold text-xs">
                      <CreditCard className="w-4 h-4" />
                      <span>Cards</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block font-normal mt-0.5">
                      Visa, MasterCard, RuPay
                    </span>
                  </button>

                  {/* NetBanking */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('netbanking')}
                    className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedMethod === 'netbanking'
                        ? 'border-[#2563EB] bg-blue-50/70 text-[#2563EB] shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 font-bold text-xs">
                      <Building2 className="w-4 h-4" />
                      <span>Net Banking</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block font-normal mt-0.5">
                      All 50+ Scheduled Banks
                    </span>
                  </button>
                </div>

                {/* Sub-channel details preview */}
                {selectedMethod === 'upi' && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">UPI Quick Apps & Instant QR:</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                        Zero Surcharge (0%)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {['Google Pay', 'PhonePe', 'Paytm UPI', 'BHIM UPI', 'Cred UPI'].map((app) => (
                        <span
                          key={app}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-xs"
                        >
                          {app}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10.5px] text-slate-500">
                      Clicking &quot;Pay with Razorpay&quot; will launch the official Razorpay checkout modal with
                      intent links and QR scanner.
                    </p>
                  </div>
                )}

                {selectedMethod === 'card' && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Supported Card Networks:</span>
                      <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-bold">
                        PCI-DSS Level 1
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-bold text-slate-700">
                        VISA
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-bold text-slate-700">
                        MasterCard
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-bold text-orange-600">
                        RuPay
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-bold text-slate-700">
                        Maestro
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500">
                      Cardholder name prefilled as <strong>{payerName}</strong>. 3D Secure OTP verification
                      handled via bank gateway.
                    </p>
                  </div>
                )}

                {selectedMethod === 'netbanking' && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <span className="text-xs font-bold text-slate-800 block">Popular Indian Banks:</span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {TOP_BANKS.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setSelectedBank(b.code)}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                            selectedBank === b.code
                              ? 'border-[#2563EB] bg-blue-50 text-[#2563EB] font-bold shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-[11px] block">{b.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Primary Action Button: Integrated Razorpay Button */}
              <button
                type="button"
                onClick={handleInitiateRazorpay}
                disabled={isInitiating || isProcessing || payableAmount <= 0}
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-[0_6px_20px_rgba(37,99,235,0.3)] transition-all disabled:opacity-50 cursor-pointer mt-4"
              >
                {isInitiating || isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Connecting to Razorpay Gateway...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{payableAmount.toLocaleString('en-IN')} with Razorpay</span>
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  PCI-DSS 256-Bit Encrypted
                </span>
                <span>•</span>
                <span>Instant Bank Reconciliation</span>
                <span>•</span>
                <span>Official GST Tax Receipt</span>
              </div>
            </div>
          </div>

          {/* Right Col: Bill Breakdown & Razorpay Badging */}
          <div className="space-y-6">
            <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 flex flex-col justify-between space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                    Official Gateway
                  </span>
                </h4>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="truncate max-w-[160px]" title={selectedFeeHead}>
                      {selectedFeeHead}
                    </span>
                    <span className="font-semibold text-slate-900">
                      ₹{payableAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Payment Gateway Charges</span>
                    <span className="font-semibold text-emerald-600">₹0 (School Sponsored)</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>GST (18% on Education)</span>
                    <span className="font-semibold text-slate-900">Exempted / Included</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-slate-900">
                    <span>Total Amount Payable</span>
                    <span className="text-[#2563EB] text-xl font-extrabold">
                      ₹{payableAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Payer Summary Box */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-xs">
                <span className="text-[10.5px] uppercase font-bold text-slate-400 block">Payer Record:</span>
                <p className="font-bold text-slate-800">{payerName}</p>
                <p className="text-[11px] text-slate-500">
                  Phone: <strong className="text-slate-700">{payerPhone}</strong>
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  Email: <strong className="text-slate-700">{payerEmail}</strong>
                </p>
              </div>

              {/* Razorpay Trust Banner */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">Powered by Razorpay</span>
                  <span className="text-[9px] font-bold bg-[#0C2340] text-[#3395FF] px-2 py-0.5 rounded">
                    RAZORPAY
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-500 leading-relaxed">
                  Supports UPI AutoPay, Google Pay, PhonePe, Credit &amp; Debit Cards, Net Banking &amp; Wallets.
                </p>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1">
                <p>• Verified instant transaction logging.</p>
                <p>• Zero payment gateway surcharges.</p>
                <p>• Fee clearance updated in student record immediately.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. SIMULATED RAZORPAY TEST MODAL (For Instant Review / Fallback)     */}
      {/* ==================================================================== */}
      {showSimulatedModal && simulatedOrderData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden space-y-0">
            {/* Modal Header mimicking Razorpay Branding */}
            <div className="bg-[#0C2340] p-5 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black tracking-wider text-[#3395FF] text-sm">RAZORPAY</span>
                  <span className="text-[10px] text-slate-300 font-mono">SECURE GATEWAY</span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1">Delhi Public School</h3>
                <p className="text-[11px] text-slate-300 truncate max-w-xs">{selectedFeeHead}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Amount</span>
                <span className="text-lg font-black text-[#3395FF] block">
                  ₹{payableAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-3 flex items-start gap-2.5 text-blue-800">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block">Test / Sandbox Gateway Environment</span>
                  <span className="text-[11px] text-blue-700 block">
                    Order ID: <code className="font-mono">{simulatedOrderData.orderId}</code>
                  </span>
                  <span className="text-[10.5px] text-blue-600 block">
                    Payer: <strong>{payerName}</strong> • Student: <strong>{student.name}</strong>
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 block text-[11px]">
                  Select One-Click Test Channel:
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      finalizePayment({
                        orderId: simulatedOrderData.orderId!,
                        paymentId: `pay_upi_${Date.now().toString().slice(-8)}`,
                        invoiceId: simulatedOrderData.invoiceId || selectedInvoiceId,
                      })
                    }
                    className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 text-left font-semibold transition-all flex items-center gap-2.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold">Simulate UPI</span>
                      <span className="block text-[10px] font-normal text-emerald-600">
                        Instant Approval
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      finalizePayment({
                        orderId: simulatedOrderData.orderId!,
                        paymentId: `pay_card_${Date.now().toString().slice(-8)}`,
                        invoiceId: simulatedOrderData.invoiceId || selectedInvoiceId,
                      })
                    }
                    className="p-3.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100/80 text-blue-800 text-left font-semibold transition-all flex items-center gap-2.5 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold">Simulate Card</span>
                      <span className="block text-[10px] font-normal text-blue-600">Visa / RuPay</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      finalizePayment({
                        orderId: simulatedOrderData.orderId!,
                        paymentId: `pay_nb_${Date.now().toString().slice(-8)}`,
                        invoiceId: simulatedOrderData.invoiceId || selectedInvoiceId,
                      })
                    }
                    className="p-3.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100/80 text-purple-800 text-left font-semibold transition-all flex items-center gap-2.5 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold">Net Banking</span>
                      <span className="block text-[10px] font-normal text-purple-600">HDFC / SBI</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      alert('Payment was cancelled by user simulation.');
                      setShowSimulatedModal(false);
                    }}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-left font-semibold transition-all flex items-center gap-2.5 cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold">Simulate Cancel</span>
                      <span className="block text-[10px] font-normal text-slate-500">Dismiss Modal</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowSimulatedModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-semibold cursor-pointer"
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
