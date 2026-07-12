import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="hero-title text-2xl tracking-tight">
              Foliomarket
            </Link>
            <nav className="hidden sm:flex items-center gap-6 body-text text-sm">
              <Link
                href="/templates"
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                Templates
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 body-text text-sm">
            {user ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 opacity-70 hover:opacity-100 transition-opacity"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">{children}</main>

      <footer className="border-t border-white/10 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
          <span className="body-text text-sm text-white/50">
            © {new Date().getFullYear()} Foliomarket
          </span>
          <span className="body-text text-sm text-white/40">
            Portfolio websites for designers, without the website work.
          </span>
        </div>
      </footer>
    </div>
  );
}
