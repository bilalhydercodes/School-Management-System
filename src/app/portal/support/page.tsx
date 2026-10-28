import { redirect } from 'next/navigation';

export default function PortalSupportPage() {
  redirect('/portal?view=help-support');
}
