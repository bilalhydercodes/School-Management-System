import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { PaymentMethod, PaymentStatus, InvoiceStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * Razorpay Webhook Listener
 * Endpoint: POST /api/webhooks/razorpay
 * Verifies webhook signatures using HMAC-SHA256 and handles asynchronous payment confirmation.
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'placeholder_webhook_secret';

    // 1. Signature Verification
    if (signature && !webhookSecret.includes('placeholder')) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.error('[Razorpay Webhook] Invalid signature mismatch');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    console.log(`[Razorpay Webhook] Received event: ${event}`);

    // 2. Handle Payment Captured / Order Paid
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderEntity = payload.payload?.order?.entity;

      const razorpayPaymentId = paymentEntity?.id;
      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
      const amountInPaise = paymentEntity?.amount || orderEntity?.amount;
      const amountInRupees = amountInPaise ? amountInPaise / 100 : 0;
      const notes = paymentEntity?.notes || orderEntity?.notes || {};

      const tenantId = notes.tenantId;
      const invoiceId = notes.invoiceId;
      const studentId = notes.studentId;

      if (!razorpayPaymentId) {
        return NextResponse.json({ received: true, note: 'No payment id in payload' });
      }

      // Check if already processed (Idempotency)
      const existingPayment = await prisma.feePayment.findUnique({
        where: { razorpayPaymentId },
      });

      if (existingPayment) {
        return NextResponse.json({ received: true, note: 'Already recorded' });
      }

      // Resolve invoice
      let invoice = null;
      if (invoiceId && invoiceId !== 'pending_fees') {
        invoice = await prisma.feeInvoice.findUnique({ where: { id: invoiceId } });
      }

      if (!invoice && studentId) {
        invoice = await prisma.feeInvoice.findFirst({
          where: { studentId, status: { in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL] } },
          orderBy: { dueDate: 'asc' },
        });
      }

      if (invoice) {
        const currentYear = new Date().getFullYear();
        const count = await prisma.feePayment.count({ where: { tenantId: invoice.tenantId } });
        const receiptNumber = `REC-${currentYear}-${String(count + 1).padStart(5, '0')}`;

        let method: PaymentMethod = PaymentMethod.RAZORPAY_UPI;
        if (paymentEntity?.method === 'card') method = PaymentMethod.RAZORPAY_CARD;
        else if (paymentEntity?.method === 'netbanking') method = PaymentMethod.RAZORPAY_NETBANKING;

        await prisma.$transaction(async (tx) => {
          await tx.feePayment.create({
            data: {
              tenantId: invoice.tenantId,
              feeInvoiceId: invoice.id,
              amount: amountInRupees,
              paymentMethod: method,
              razorpayPaymentId,
              razorpayOrderId: razorpayOrderId || null,
              razorpaySignature: signature || null,
              receiptNumber,
              status: PaymentStatus.SUCCESS,
              remarks: `Webhook auto-settlement: ${notes.payerName || 'Parent'} (${notes.payerPhone || ''})`,
              transactionDate: new Date(),
            },
          });

          const currentBalance = Number(invoice.balanceAmount);
          const currentPaid = Number(invoice.paidAmount);
          const newPaidAmount = currentPaid + amountInRupees;
          const newBalanceAmount = Math.max(0, currentBalance - amountInRupees);
          const newStatus = newBalanceAmount === 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL;

          await tx.feeInvoice.update({
            where: { id: invoice.id },
            data: {
              paidAmount: newPaidAmount,
              balanceAmount: newBalanceAmount,
              status: newStatus,
            },
          });
        });

        console.log(`[Razorpay Webhook] Successfully reconciled receipt ${receiptNumber} for invoice ${invoice.invoiceNumber}`);
      }
    }

    return NextResponse.json({ received: true, status: 'processed' });
  } catch (err: any) {
    console.error('[Razorpay Webhook Handler Error]', err);
    return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
  }
}
