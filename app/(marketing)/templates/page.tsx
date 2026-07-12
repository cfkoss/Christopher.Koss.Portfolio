import type { Metadata } from "next";
import Link from "next/link";
import { createAnonClient } from "@/lib/supabase/anon";
import { getTemplate } from "@/lib/templates/registry";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Browse professionally designed portfolio templates and preview each one with real content.",
};

export const revalidate = 3600;

export default async function TemplatesPage() {
  const supabase = createAnonClient();
  const { data: templates } = await supabase
    .from("templates")
    .select("id, slug, name, description, price_monthly_cents")
    .eq("status", "published")
    .order("created_at");

  const catalog = (templates ?? [])
    .map((row) => ({ row, mod: getTemplate(row.slug) }))
    .filter((entry) => entry.mod !== null);

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <h1 className="hero-title text-6xl md:text-7xl mb-4 fade-in">Templates</h1>
      <p className="body-text text-lg text-white/60 max-w-xl mb-16">
        Every template is a complete portfolio site — sections, case studies,
        galleries and mobile layout included. Preview each with real content
        before you choose.
      </p>

      <div className="grid gap-10 md:grid-cols-2">
        {catalog.map(({ row, mod }) => (
          <div
            key={row.id}
            className="rounded-2xl border border-white/15 overflow-hidden hover:border-white/35 transition-colors"
          >
            <Link href={`/templates/${row.slug}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mod!.thumbnail}
                alt={row.name}
                className="w-full aspect-video object-cover border-b border-white/10"
              />
            </Link>
            <div className="p-6">
              <div className="flex items-baseline justify-between gap-4 mb-3">
                <h2 className="hero-title text-3xl">{row.name}</h2>
                <span className="body-text text-sm text-white/50 whitespace-nowrap">
                  ${(row.price_monthly_cents / 100).toFixed(0)}/mo
                </span>
              </div>
              {row.description && (
                <p className="body-text text-sm text-white/60 mb-6">
                  {row.description}
                </p>
              )}
              <div className="flex items-center gap-3 body-text text-sm">
                <Link
                  href={`/templates/${row.slug}`}
                  className="px-5 py-2.5 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors"
                >
                  Details
                </Link>
                <Link
                  href={`/preview/${row.slug}`}
                  target="_blank"
                  className="px-5 py-2.5 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-colors"
                >
                  Live preview ↗
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="body-text text-sm text-white/40 mt-16 text-center">
        More templates are on the way — the catalog grows every month.
      </p>
    </div>
  );
}
