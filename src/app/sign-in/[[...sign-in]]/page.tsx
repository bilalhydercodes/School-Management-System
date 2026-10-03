import { SignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Sign In — Alpha Edu Hub',
  description: 'Sign in to Alpha Edu Hub School Management System',
};

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const hasClerkKey = Boolean(
  clerkKey && clerkKey.startsWith('pk_') && !clerkKey.includes('placeholder')
);

export default function SignInPage() {
  if (!hasClerkKey) {
    redirect('/login');
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-[#CBE9FE]"
      style={{
        backgroundImage: "url('/bg-atmosphere.svg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-white/60 p-6 flex flex-col items-center">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Alpha Edu Hub</h1>
          <p className="text-xs text-slate-500 mt-1">Multi-Tenant School Management Platform</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: 'bg-[#0B72E7] hover:bg-blue-600 text-sm font-semibold normal-case',
              card: 'shadow-none border-0 p-0',
              headerTitle: 'text-lg font-bold text-slate-900',
              headerSubtitle: 'text-xs text-slate-500',
              footerAction: 'hidden', // Completely hide "Don't have an account? Sign up"
              footer: 'hidden',
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl={undefined}
        />
      </div>
    </div>
  );
}
