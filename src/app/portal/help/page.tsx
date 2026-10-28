import { redirect } from 'next/navigation';

export default function PortalHelpPage() {
  redirect('/portal?view=help-support');
}
