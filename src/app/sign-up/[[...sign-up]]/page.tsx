import { SignUp } from '@clerk/nextjs';

export const metadata = {
  title: 'Sign Up — Alpha Edu Hub',
  description: 'Create an account on Alpha Edu Hub School Management System',
};

export default function SignUpPage() {
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
          <p className="text-xs text-slate-500 mt-1">Student, Teacher & Administration Registration</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: 'bg-[#0B72E7] hover:bg-blue-600 text-sm font-semibold normal-case',
              card: 'shadow-none border-0 p-0',
              headerTitle: 'text-lg font-bold text-slate-900',
              headerSubtitle: 'text-xs text-slate-500',
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}
