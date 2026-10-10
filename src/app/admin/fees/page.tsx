import { redirect } from 'next/navigation';
import { getAuthenticatedContext } from '@/lib/auth-context';
import { getCachedAdminFees } from '@/lib/tenant-cache';
import FeeCounterClient, {
  InvoiceItem,
  PaymentItem,
  StudentLookupItem,
} from '@/components/admin/FeeCounterClient';
import { calculateLateFineForInvoice } from '@/services/fee-engine.service';

export const dynamic = 'force-dynamic';

export default async function AdminFeesPage() {
  const authContext = await getAuthenticatedContext();
  if (
    !authContext ||
    (authContext.role !== 'ADMIN' && authContext.role !== 'SUPER_ADMIN' && authContext.role !== 'ACCOUNTANT')
  ) {
    redirect('/unauthorized');
  }

  const tenantId = authContext.tenantId;
  if (!tenantId) {
    redirect('/unauthorized');
  }

  const now = new Date();

  // Ultra-fast cached fees fetch (SWR cache with sub-ms retrieval)
  const [invoicesRaw, paymentsRaw, studentsRaw, academicYears, classGrades, feeTerms] =
    await getCachedAdminFees(tenantId);

  // Map invoices into clean serializable objects
  const invoices: InvoiceItem[] = invoicesRaw.map((inv: any) => {
    const isDuePassed = new Date(inv.dueDate) < now;
    const isOverdue = isDuePassed && Number(inv.balanceAmount) > 0;
    const lateCalc = calculateLateFineForInvoice(inv, now);

    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      studentId: inv.studentId,
      studentName: `${inv.student.user.firstName} ${inv.student.user.lastName}`,
      admissionNumber: inv.student.admissionNumber,
      className: `${inv.student.section.classGrade.name}-${inv.student.section.name}`,
      termName: inv.feeTerm?.name || 'General Term',
      dueDate: new Date(inv.dueDate).toISOString(),
      totalAmount: Number(inv.totalAmount),
      paidAmount: Number(inv.paidAmount),
      balanceAmount: Number(inv.balanceAmount),
      lateFee: Number(inv.lateFee) || lateCalc.lateFee,
      status: inv.status as any,
      isOverdue,
      items: (inv.items || []).map((it: any) => ({
        category: it.feeCategory?.name || 'General Fee',
        amount: Number(it.amount),
        description: it.description || it.feeCategory?.name || 'Fee Item',
      })),
    };
  });

  // Map payments into clean serializable objects
  const payments: PaymentItem[] = paymentsRaw.map((p) => {
    const student = p.feeInvoice.student;
    return {
      id: p.id,
      receiptNumber: p.receiptNumber,
      invoiceNumber: p.feeInvoice.invoiceNumber,
      studentName: `${student.user.firstName} ${student.user.lastName}`,
      admissionNumber: student.admissionNumber,
      className: `${student.section.classGrade.name}-${student.section.name}`,
      amount: Number(p.amount),
      paymentMethod: p.paymentMethod,
      remarks: p.remarks,
      date: new Date(p.createdAt).toISOString(),
      collectorName: p.collector ? `${p.collector.firstName} ${p.collector.lastName}` : (p.collectedById ? 'Admin' : 'System'),
    };
  });

  // Map students for autocomplete search
  const studentsList: StudentLookupItem[] = studentsRaw.map((s) => {
    const firstParent = s.parents[0]?.parent;
    return {
      id: s.id,
      name: `${s.user.firstName} ${s.user.lastName}`,
      admissionNumber: s.admissionNumber,
      className: `${s.section.classGrade.name}-${s.section.name}`,
      parentName: firstParent ? `${firstParent.user.firstName} ${firstParent.user.lastName}` : null,
      parentPhone: firstParent?.user.phone || null,
    };
  });

  // Calculate metrics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = invoices.reduce((sum, inv) => sum + inv.balanceAmount, 0);
  const overdueCount = invoices.filter((inv) => inv.isOverdue).length;

  return (
    <FeeCounterClient
      metrics={{
        totalInvoiced,
        totalCollected,
        totalPending,
        overdueCount,
      }}
      invoices={invoices}
      payments={payments}
      students={studentsList}
      academicYears={academicYears}
      classGrades={classGrades}
      feeTerms={feeTerms}
    />
  );
}
