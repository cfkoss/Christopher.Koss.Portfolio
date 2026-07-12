import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const supabase = await createClient();
  const { data: site } = await supabase
    .from("sites")
    .select("id, name, subdomain, is_published")
    .eq("id", siteId)
    .maybeSingle();
  if (!site) notFound();

  const tabs = [
    { href: `/dashboard/sites/${site.id}`, label: "Overview" },
    { href: `/dashboard/sites/${site.id}/sections`, label: "Sections" },
    { href: `/dashboard/sites/${site.id}/settings`, label: "Settings" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="body-text text-sm text-white/40 mb-1">
            <Link href="/dashboard" className="hover:text-white/70">
              My sites
            </Link>{" "}
            /
          </p>
          <h1 className="hero-title text-4xl">{site.name}</h1>
        </div>
        <Link
          href={`/s/${site.subdomain}`}
          target="_blank"
          className="body-text text-sm px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          {site.is_published ? "View live ↗" : "Preview draft ↗"}
        </Link>
      </div>

      <nav className="flex items-center gap-2 border-b border-white/10 mb-10 body-text text-sm">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="px-4 py-3 text-white/60 hover:text-white transition-colors"
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
