import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAnonClient } from "@/lib/supabase/anon";
import { getTemplate } from "@/lib/templates/registry";

export const revalidate = 3600;

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const mod = getTemplate(slug);
  if (!mod) return {};
  return { title: `${mod.name} template`, description: mod.description };
}

export default async function TemplateDetailPage({ params }: Params) {
  const { slug } = await params;
  const mod = getTemplate(slug);
  if (!mod) notFound();

  const supabase = createAnonClient();
  const { data: row } = await supabase
    .from("templates")
    .select("id, slug, name, description, price_monthly_cents")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!row) notFound();

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <p className="body-text text-sm text-white/40 mb-2">
        <Link href="/templates" className="hover:text-white/70">
          Templates
        </Link>{" "}
        /
      </p>
      <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="hero-title text-6xl md:text-7xl mb-4">{row.name}</h1>
          <p className="body-text text-lg text-white/60 max-w-2xl">
            {row.description}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="body-text text-white/50">
            ${(row.price_monthly_cents / 100).toFixed(0)}/mo · free during beta
          </span>
          <Link
            href={`/dashboard/new?template=${row.slug}`}
            className="px-7 py-3.5 bg-white text-black rounded-full body-text font-medium hover:bg-white/90 transition-colors whitespace-nowrap"
          >
            Use this template
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-white/15 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-white/15" />
            <span className="h-3 w-3 rounded-full bg-white/15" />
            <span className="h-3 w-3 rounded-full bg-white/15" />
            <span className="body-text text-xs text-white/40 ml-3">
              Interactive preview — click around, it&apos;s a real site
            </span>
          </div>
          <Link
            href={`/preview/${row.slug}`}
            target="_blank"
            className="body-text text-xs text-white/60 hover:text-white"
          >
            Open full screen ↗
          </Link>
        </div>
        <iframe
          src={`/preview/${row.slug}`}
          title={`${row.name} preview`}
          className="w-full h-[80vh] bg-black"
        />
      </div>
    </div>
  );
}
