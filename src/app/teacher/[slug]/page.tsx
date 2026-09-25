import TeacherPortalPage from '../page';

export default function TeacherSlugPage({ params }: { params: { slug: string } }) {
  return <TeacherPortalPage params={params} />;
}
