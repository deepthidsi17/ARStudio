import { loginAction } from "@/app/login/actions";
import { MessageBanner } from "@/components/ui";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; redirect?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Admin Login</h1>
        <p className="mt-2 text-sm text-stone-600">Enter the master password to access the staff dashboard.</p>
        
        {params.error && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
            {params.error}
          </div>
        )}
        
        <form action={loginAction} className="mt-6 space-y-4">
          <input type="hidden" name="redirect" value={params.redirect || "/admin"} />
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-stone-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-base"
              placeholder="••••••••"
            />
          </div>
          
          <button className="w-full rounded-2xl bg-stone-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-stone-800">
            Secure Login
          </button>
        </form>
      </div>
    </div>
  );
}