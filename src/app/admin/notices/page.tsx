import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/session';
import { getCachedTenantNotices } from '@/lib/tenant-cache';
import NoticesManagerClient, { NoticeItem } from '@/components/admin/NoticesManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminNoticesPage() {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    redirect('/unauthorized');
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    redirect('/unauthorized');
  }

  // Ultra-fast cached notices fetch (SWR cache with sub-ms retrieval)
  const noticesRaw = await getCachedTenantNotices(tenantId);

  const notices: NoticeItem[] = noticesRaw.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    priority: n.priority,
    targetAudience: n.targetAudience,
    publishedAt: new Date(n.publishedAt).toISOString(),
    authorName: `${n.author.firstName} ${n.author.lastName}`,
  }));

  return <NoticesManagerClient notices={notices} />;
}
