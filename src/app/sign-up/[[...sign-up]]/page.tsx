import { redirect } from 'next/navigation';

export default function SignUpPage() {
  // Public self sign-up is disabled; accounts are issued by school administration
  redirect('/sign-in');
}
