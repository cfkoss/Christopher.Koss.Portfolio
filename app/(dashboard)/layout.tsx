import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/dashboard" className="hero-title text-xl tracking-tight">
              Foliomarket
            </Link>
            <nav className="hidden sm:flex items-center gap-6 body-text text-sm">
              <Link
                href="/dashboard"
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                My sites
              </Link>
              <Link
                href="/templates"
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                Templates
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 body-text text-sm">
            <span className="hidden md:inline text-white/40">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        {children}
      </main>
    </div>
  );
}
