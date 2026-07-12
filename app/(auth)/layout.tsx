import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6">
        <Link href="/" className="hero-title text-2xl tracking-tight">
          Foliomarket
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 pb-24">
        {children}
      </main>
    </div>
  );
}
