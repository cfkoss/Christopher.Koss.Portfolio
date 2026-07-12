import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My sites" };

interface SiteListRow {
  id: string;
  name: string;
  subdomain: string;
  is_published: boolean;
  updated_at: string;
  templates: { name: string } | null;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: sites } = await supabase
    .from("sites")
    .select("id, name, subdomain, is_published, updated_at, templates(name)")
    .order("created_at", { ascending: false })
    .returns<SiteListRow[]>();

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <h1 className="hero-title text-5xl">My sites</h1>
        <Link
          href="/dashboard/new"
          className="px-5 py-2.5 bg-white text-black rounded-full body-text text-sm font-medium hover:bg-white/90 transition-colors"
        >
          + New site
        </Link>
      </div>

      {!sites || sites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 py-24 text-center">
          <p className="body-text text-white/60 text-lg mb-6">
            You don&apos;t have a portfolio site yet.
          </p>
          <Link
            href="/dashboard/new"
            className="px-6 py-3 bg-white text-black rounded-full body-text text-sm font-medium hover:bg-white/90 transition-colors"
          >
            Create your first site
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {sites.map((site) => (
            <div
              key={site.id}
              className="rounded-xl border border-white/15 p-6 hover:border-white/35 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="hero-title text-2xl mb-1">{site.name}</h2>
                  <p className="body-text text-sm text-white/50">
                    {site.subdomain}.{rootDomain}
                    {site.templates?.name && ` · ${site.templates.name}`}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full body-text text-xs whitespace-nowrap ${
                    site.is_published
                      ? "bg-emerald-400/15 text-emerald-300"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {site.is_published ? "Live" : "Draft"}
                </span>
              </div>
              <div className="flex items-center gap-3 body-text text-sm">
                <Link
                  href={`/dashboard/sites/${site.id}`}
                  className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Manage
                </Link>
                <Link
                  href={`/s/${site.subdomain}`}
                  target="_blank"
                  className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                >
                  {site.is_published ? "View live ↗" : "Preview draft ↗"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
