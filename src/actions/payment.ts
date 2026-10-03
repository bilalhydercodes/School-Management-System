'use server';

import crypto from 'crypto';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';
import { PaymentMethod, PaymentStatus, InvoiceStatus } from '@prisma/client';

export interface PayerDetails {
  name: string;
  email: string;
  phone: string;
  relationship?: string;
  role?: string;
}

export interface DynamicInvoiceItem {
  id: string;
  category: string;
  amount: number;
  description?: string;
}

export interface DynamicInvoice {
  id: string;
  invoiceNumber: string;
  title: string;
  dueDate: string;
  dueDateRaw: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'Paid' | 'Pending' | 'Partial' | 'Overdue';
  isOverdue: boolean;
  items: DynamicInvoiceItem[];
}

export interface StudentPaymentContext {
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
  payer: {
    name: string;
    email: string;
    phone: string;
    role: 'PARENT' | 'STUDENT';
    relationship: string;
  };
  invoices: DynamicInvoice[];
  summary: {
    totalBilled: number;
    totalPaid: number;
    totalPending: number;
    overdueAmount: number;
    isOverdue: boolean;
    nextDueDate: string;
  };
  razorpayKeyId: string;
  isTestMode: boolean;
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  amount?: number; // In rupees
  amountInPaise?: number;
  currency?: string;
  keyId?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  feeDescription?: string;
  studentName?: string;
  studentAdmission?: string;
  studentClass?: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  isDevSimulation?: boolean;
  error?: string;
}

export interface VerifyPaymentInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  invoiceId?: string;
  amount: number;
  paymentMethod?: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  feeDescription?: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  paymentId?: string;
  receiptNumber?: string;
  transactionDate?: string;
  amountPaid?: number;
  remainingBalance?: number;
  invoiceStatus?: string;
  invoiceNumber?: string;
  studentName?: string;
  admissionNumber?: string;
  studentClass?: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  paymentMethod?: string;
  feeDescription?: string;
  error?: string;
}

/**
 * Resolves full dynamic payment context for the current authenticated user (Student or Parent)
 */
export async function getStudentPaymentContextAction(
  studentIdOverride?: string
): Promise<{ success: boolean; data?: StudentPaymentContext; error?: string }> {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return { success: false, error: 'Unauthorized: Session expired. Please log in.' };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      include: {
        studentProfile: {
          include: {
            user: true,
            section: { include: { classGrade: true } },
          },
        },
        parentProfile: {
          include: {
            students: {
              include: {
                student: {
                  include: {
                    user: true,
                    section: { include: { classGrade: true } },
                  },
                },
              },
              orderBy: { isPrimary: 'desc' },
            },
          },
        },
      },
    });

    if (!user) {
      return { success: false, error: 'User account not found.' };
    }

    // Determine target student
    let student: any = null;
    let payerRole: 'PARENT' | 'STUDENT' = 'STUDENT';
    let payerName = `${user.firstName} ${user.lastName}`;
    let payerEmail = user.email;
    let payerPhone = user.phone || '+91 98765 43210';
    let payerRelationship = 'Self';

    if (user.parentProfile && user.parentProfile.students.length > 0) {
      payerRole = 'PARENT';
      payerRelationship = user.parentProfile.relationship || 'Father';
      const matched = studentIdOverride
        ? user.parentProfile.students.find((s) => s.student.id === studentIdOverride)
        : null;
      student = matched ? matched.student : user.parentProfile.students[0].student;
    } else if (user.studentProfile) {
      student = user.studentProfile;
      payerRelationship = 'Self';
      payerPhone = student.emergencyContact || payerPhone;
    }

    if (!student) {
      return { success: false, error: 'No associated student profile found for fee billing.' };
    }

    // Fetch dynamic fee invoices
    const dbInvoices = await prisma.feeInvoice.findMany({
      where: {
        tenantId: student.tenantId,
        studentId: student.id,
      },
      include: {
        items: {
          include: {
            feeCategory: true,
          },
        },
        payments: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    const now = new Date();
    const dynamicInvoices: DynamicInvoice[] = dbInvoices.map((inv) => {
      let title = inv.invoiceNumber;
      if (inv.invoiceNumber.includes('Q1')) title = 'Quarter 1 Tuition & Core Labs';
      else if (inv.invoiceNumber.includes('Q2')) title = 'Quarter 2 Tuition & Activities';
      else if (inv.invoiceNumber.includes('Q3')) title = 'Quarter 3 CBSE Examination & Assessment';
      else if (inv.invoiceNumber.includes('Q4')) title = 'Quarter 4 Consolidated Session Dues';
      else if (inv.items?.[0]?.description) title = inv.items[0].description;

      const isOverdue = Number(inv.balanceAmount) > 0 && new Date(inv.dueDate) < now;
      let status: 'Paid' | 'Pending' | 'Partial' | 'Overdue' = 'Pending';
      if (Number(inv.balanceAmount) === 0) status = 'Paid';
      else if (isOverdue) status = 'Overdue';
      else if (Number(inv.paidAmount) > 0) status = 'Partial';

      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        title,
        dueDate: new Date(inv.dueDate).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        dueDateRaw: inv.dueDate.toISOString(),
        totalAmount: Number(inv.totalAmount),
        paidAmount: Number(inv.paidAmount),
        balanceAmount: Number(inv.balanceAmount),
        status,
        isOverdue,
        items: inv.items.map((it) => ({
          id: it.id,
          category: it.feeCategory?.name || it.description || 'Fee Component',
          amount: Number(it.amount),
          description: it.description || it.feeCategory?.name,
        })),
      };
    });

    const totalBilled = dynamicInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = dynamicInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalPending = dynamicInvoices.reduce((sum, inv) => sum + inv.balanceAmount, 0);
    const overdueAmount = dynamicInvoices
      .filter((inv) => inv.isOverdue)
      .reduce((sum, inv) => sum + inv.balanceAmount, 0);
    const upcoming = dynamicInvoices.find((inv) => inv.balanceAmount > 0);

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
    const isTestMode = keyId.startsWith('rzp_test') || keyId.includes('placeholder');

    return {
      success: true,
      data: {
        student: {
          id: student.id,
          name: `${student.user.firstName} ${student.user.lastName}`,
          admissionNumber: student.admissionNumber,
          rollNumber: student.rollNumber,
          sectionName: student.section?.name || 'A',
          className: student.section?.classGrade?.name || 'Class 10',
          board: 'CBSE',
          avatarUrl: student.user.avatarUrl,
          email: student.user.email,
          phone: student.emergencyContact,
        },
        payer: {
          name: payerName,
          email: payerEmail,
          phone: payerPhone,
          role: payerRole,
          relationship: payerRelationship,
        },
        invoices: dynamicInvoices,
        summary: {
          totalBilled,
          totalPaid,
          totalPending,
          overdueAmount,
          isOverdue: overdueAmount > 0,
          nextDueDate: upcoming ? upcoming.dueDate : 'No Outstanding Due',
        },
        razorpayKeyId: keyId,
        isTestMode,
      },
    };
  } catch (error: any) {
    console.error('[getStudentPaymentContextAction error]', error);
    return {
      success: false,
      error: error?.message || 'Failed to retrieve dynamic payment details.',
    };
  }
}

/**
 * Creates a Razorpay Order dynamically based on student invoice data and custom payer info.
 */
export async function createRazorpayOrderAction(params: {
  invoiceId?: string;
  amount?: number;
  description?: string;
  studentId?: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
}): Promise<CreateOrderResult> {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return { success: false, error: 'Unauthorized: Session expired. Please log in.' };
    }

    // 1. Resolve current user & student
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      include: {
        studentProfile: {
          include: {
            user: true,
            section: { include: { classGrade: true } },
          },
        },
        parentProfile: {
          include: {
            students: {
              include: {
                student: {
                  include: {
                    user: true,
                    section: { include: { classGrade: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    let student = user.studentProfile;
    let payerRole = 'STUDENT';
    let defaultPayerName = `${user.firstName} ${user.lastName}`;
    let defaultPayerEmail = user.email;
    let defaultPayerPhone = user.phone || '+91 98765 43210';

    if (user.parentProfile?.students.length) {
      payerRole = 'PARENT';
      if (params.studentId) {
        const found = user.parentProfile.students.find((s) => s.student.id === params.studentId);
        student = found ? found.student : user.parentProfile.students[0].student;
      } else {
        student = user.parentProfile.students[0].student;
      }
    }

    if (!student) {
      return { success: false, error: 'No associated student found for fee payment.' };
    }

    // Dynamic payer fields
    const resolvedPayerName = params.payerName?.trim() || defaultPayerName;
    const resolvedPayerEmail = params.payerEmail?.trim() || defaultPayerEmail;
    const resolvedPayerPhone = params.payerPhone?.trim() || defaultPayerPhone;

    // 2. Resolve target Invoice
    let invoice = null;
    if (params.invoiceId) {
      invoice = await prisma.feeInvoice.findFirst({
        where: { id: params.invoiceId, studentId: student.id },
      });
    }

    if (!invoice) {
      invoice = await prisma.feeInvoice.findFirst({
        where: {
          studentId: student.id,
          status: { in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL] },
        },
        orderBy: { dueDate: 'asc' },
      });
    }

    const payableAmount =
      params.amount && params.amount > 0
        ? params.amount
        : invoice
        ? Number(invoice.balanceAmount)
        : 4500;

    if (payableAmount <= 0) {
      return { success: false, error: 'No outstanding dues for this account.' };
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
    const isMockKey =
      keyId.includes('placeholder') ||
      keyId.startsWith('rzp_test_mock') ||
      keySecret.includes('placeholder');

    const amountInPaise = Math.round(payableAmount * 100);
    const cleanAdmission = student.admissionNumber.replace(/[^a-zA-Z0-9]/g, '_');
    const receiptId = `rcpt_${cleanAdmission.slice(0, 10)}_${Date.now().toString().slice(-6)}`;

    let orderId = `order_sim_${Date.now()}`;
    let isDevSimulation = false;

    const studentFullName = `${student.user.firstName} ${student.user.lastName}`;
    const studentClassLabel = `${student.section?.classGrade?.name || 'Class 10'}-${student.section?.name || 'A'}`;
    const feeDescription = params.description || (invoice ? `Invoice ${invoice.invoiceNumber}` : 'Consolidated Fee Payment');

    if (!isMockKey) {
      try {
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: receiptId,
          notes: {
            tenantId: student.tenantId,
            studentId: student.id,
            admissionNumber: student.admissionNumber,
            studentName: studentFullName,
            studentClass: studentClassLabel,
            payerName: resolvedPayerName,
            payerEmail: resolvedPayerEmail,
            payerPhone: resolvedPayerPhone,
            payerRole,
            invoiceId: invoice?.id || 'pending_fees',
            invoiceNumber: invoice?.invoiceNumber || 'INV-2026-Q3-0428',
            description: feeDescription,
          },
        });
        orderId = order.id;
      } catch (err: any) {
        console.warn('[Razorpay API Live Order Fallback]', err?.message || err);
        isDevSimulation = true;
        orderId = `order_dev_${Date.now()}`;
      }
    } else {
      isDevSimulation = true;
    }

    return {
      success: true,
      orderId,
      amount: payableAmount,
      amountInPaise,
      currency: 'INR',
      keyId,
      invoiceId: invoice?.id,
      invoiceNumber: invoice?.invoiceNumber || 'INV-2026-Q3-0428',
      feeDescription,
      studentName: studentFullName,
      studentAdmission: student.admissionNumber,
      studentClass: studentClassLabel,
      payerName: resolvedPayerName,
      payerEmail: resolvedPayerEmail,
      payerPhone: resolvedPayerPhone,
      isDevSimulation,
    };
  } catch (error: any) {
    console.error('[createRazorpayOrderAction error]', error);
    return {
      success: false,
      error: error?.message || 'Failed to initialize payment gateway order.',
    };
  }
}

/**
 * Verifies Razorpay payment signature and records the transaction dynamically in database.
 */
export async function verifyRazorpayPaymentAction(
  input: VerifyPaymentInput
): Promise<VerifyPaymentResult> {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return { success: false, error: 'Unauthorized: Session expired.' };
    }

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      invoiceId,
      amount,
      payerName,
      payerEmail,
      payerPhone,
      feeDescription,
    } = input;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';

    // 1. Cryptographic HMAC-SHA256 signature verification if real keys
    if (
      razorpaySignature &&
      !razorpayOrderId.startsWith('order_dev_') &&
      !razorpayOrderId.startsWith('order_sim_') &&
      !keySecret.includes('placeholder')
    ) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        return {
          success: false,
          error: 'Cryptographic signature mismatch. Payment verification failed.',
        };
      }
    }

    // 2. Resolve target invoice or fallback to oldest pending invoice
    let invoice = null;
    if (invoiceId) {
      invoice = await prisma.feeInvoice.findUnique({
        where: { id: invoiceId },
        include: {
          student: {
            include: {
              user: true,
              section: { include: { classGrade: true } },
            },
          },
        },
      });
    }

    if (!invoice) {
      invoice = await prisma.feeInvoice.findFirst({
        where: { status: { in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL] } },
        orderBy: { dueDate: 'asc' },
        include: {
          student: {
            include: {
              user: true,
              section: { include: { classGrade: true } },
            },
          },
        },
      });
    }

    if (!invoice) {
      return { success: false, error: 'No fee invoice found to credit payment against.' };
    }

    const tenantId = invoice.tenantId;

    // 3. Generate sequential receipt number: REC-2026-XXXXX
    const currentYear = new Date().getFullYear();
    const count = await prisma.feePayment.count({ where: { tenantId } });
    const receiptNumber = `REC-${currentYear}-${String(count + 1).padStart(5, '0')}`;

    // Map payment method
    let method: PaymentMethod = PaymentMethod.RAZORPAY_UPI;
    if (input.paymentMethod === 'card') method = PaymentMethod.RAZORPAY_CARD;
    else if (input.paymentMethod === 'netbanking') method = PaymentMethod.RAZORPAY_NETBANKING;

    const resolvedPayer = payerName || `${session.firstName} ${session.lastName}`;
    const student = invoice.student;
    const studentName = student
      ? `${student.user.firstName} ${student.user.lastName}`
      : 'Student';
    const admissionNumber = student?.admissionNumber || 'DPS-2022-4891';
    const studentClass = student?.section?.classGrade
      ? `${student.section.classGrade.name}-${student.section.name}`
      : 'Class 10-A';

    // 4. Record payment & update invoice in an atomic database transaction
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.feePayment.create({
        data: {
          tenantId,
          feeInvoiceId: invoice.id,
          amount,
          paymentMethod: method,
          razorpayPaymentId,
          razorpayOrderId,
          razorpaySignature: razorpaySignature || null,
          receiptNumber,
          status: PaymentStatus.SUCCESS,
          remarks: `Online settlement via Razorpay Gateway (Ref: ${razorpayPaymentId}) by ${resolvedPayer}`,
          transactionDate: new Date(),
        },
      });

      const currentBalance = Number(invoice.balanceAmount);
      const currentPaid = Number(invoice.paidAmount);
      const newPaidAmount = currentPaid + amount;
      const newBalanceAmount = Math.max(0, currentBalance - amount);
      const newStatus = newBalanceAmount === 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL;

      const updatedInvoice = await tx.feeInvoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newPaidAmount,
          balanceAmount: newBalanceAmount,
          status: newStatus,
        },
      });

      // Audit log
      try {
        await tx.auditLog.create({
          data: {
            tenantId,
            userId: session.sub,
            action: 'FEE_PAYMENT_SUCCESS',
            entityType: 'FeePayment',
            entityId: payment.id,
            newValues: {
              amount,
              receiptNumber,
              razorpayPaymentId,
              invoiceId: invoice.id,
              invoiceNumber: invoice.invoiceNumber,
              payer: resolvedPayer,
            },
          },
        });
      } catch {}

      // Notification
      try {
        await tx.notification.create({
          data: {
            tenantId,
            recipientId: session.sub,
            title: 'Fee Payment Received',
            body: `Your payment of ₹${amount.toLocaleString('en-IN')} for ${studentName} (${invoice.invoiceNumber}) was successful. Official Receipt: ${receiptNumber}.`,
            type: 'FEE',
          },
        });
      } catch {}

      return { payment, updatedInvoice };
    });

    return {
      success: true,
      paymentId: result.payment.id,
      receiptNumber: result.payment.receiptNumber,
      transactionDate: result.payment.transactionDate.toISOString(),
      amountPaid: amount,
      remainingBalance: Number(result.updatedInvoice.balanceAmount),
      invoiceStatus: result.updatedInvoice.status,
      invoiceNumber: invoice.invoiceNumber,
      studentName,
      admissionNumber,
      studentClass,
      payerName: resolvedPayer,
      payerEmail: payerEmail || session.email,
      payerPhone: payerPhone || '+91 98765 43210',
      paymentMethod:
        method === PaymentMethod.RAZORPAY_UPI
          ? 'UPI (Razorpay Gateway)'
          : method === PaymentMethod.RAZORPAY_CARD
          ? 'Credit / Debit Card'
          : 'Net Banking',
      feeDescription: feeDescription || `Fee Settlement: ${invoice.invoiceNumber}`,
    };
  } catch (error: any) {
    console.error('[verifyRazorpayPaymentAction error]', error);
    return {
      success: false,
      error: error?.message || 'Payment processing failed in verification.',
    };
  }
}
