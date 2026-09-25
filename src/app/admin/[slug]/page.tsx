import AdminPortalPage from '../page';

export default function AdminSlugPage({ params }: { params: { slug: string } }) {
  return <AdminPortalPage params={params} />;
}
