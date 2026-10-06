import { prisma } from '@/lib/db';
import InstitutionRequestsManagerClient from '@/components/superadmin/InstitutionRequestsManagerClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Institution Requests — Super Admin Alpha Edu Hub',
  description: 'Manage and review school and college registration applications for Alpha Edu Hub.',
};

export default async function SuperAdminInstitutionRequestsPage() {
  const [applications, totalCount] = await Promise.all([
    prisma.institutionApplication.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reviewedBy: {
          select: { firstName: true, lastName: true, email: true },
        },
        tenant: {
          select: { id: true, name: true, slug: true },
        },
      },
      take: 100,
    }),
    prisma.institutionApplication.count(),
  ]);

  return (
    <InstitutionRequestsManagerClient
      initialApplications={applications as any}
      totalCount={totalCount}
    />
  );
}
