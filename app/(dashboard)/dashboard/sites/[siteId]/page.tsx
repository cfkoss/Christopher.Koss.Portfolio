import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublishToggle } from "@/components/dashboard/PublishToggle";

export const metadata: Metadata = { title: "Site overview" };

export default async function SiteOverviewPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const supabase = await createClient();

  const { data: site } = await supabase
    .from("sites")
    .select("id, name, subdomain, is_published, published_at")
    .eq("id", siteId)
    .maybeSingle();
  if (!site) notFound();

  const [{ count: sectionCount }, { count: projectCount }, { count: imageCount }] =
    await Promise.all([
      supabase
        .from("sections")
        .select("id", { count: "exact", head: true })
        .eq("site_id", siteId),
      supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("site_id", siteId),
      supabase
        .from("project_images")
        .select("id", { count: "exact", head: true })
        .eq("site_id", siteId),
    ]);

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  const liveUrl = `http://${site.subdomain}.${rootDomain}`;

  const steps = [
    {
      done: (sectionCount ?? 0) > 0,
      label: "Create your sections",
      href: `/dashboard/sites/${siteId}/sections`,
    },
    {
      done: (projectCount ?? 0) > 0,
      label: "Add your first project",
      href: `/dashboard/sites/${siteId}/sections`,
    },
    {
      done: (imageCount ?? 0) > 0,
      label: "Upload project images",
      href: `/dashboard/sites/${siteId}/sections`,
    },
    {
      done: site.is_published,
      label: "Publish your site",
      href: `/dashboard/sites/${siteId}`,
    },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        {/* Status card */}
        <div className="rounded-xl border border-white/15 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="body-text text-sm text-white/50 mb-1">
                {site.is_published ? "Your site is live at" : "Your site will be live at"}
              </p>
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="body-text text-lg text-white underline underline-offset-4 decoration-white/30 hover:decoration-white"
              >
                {site.subdomain}.{rootDomain}
              </a>
            </div>
            <PublishToggle siteId={site.id} isPublished={site.is_published} />
          </div>
          {!site.is_published && (
            <p className="body-text text-xs text-white/40 mt-4">
              Unpublished sites return a 404 for visitors — only you can
              preview them. Changes to a published site go live as soon as you
              save.
            </p>
          )}
        </div>

        {/* Getting started */}
        <div className="rounded-xl border border-white/15 p-6">
          <h2 className="hero-title text-2xl mb-5">Getting started</h2>
          <ul className="space-y-3 body-text text-sm">
            {steps.map((step) => (
              <li key={step.label} className="flex items-center gap-3">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                    step.done
                      ? "bg-emerald-400 text-black"
                      : "border border-white/25 text-transparent"
                  }`}
                >
                  ✓
                </span>
                <Link
                  href={step.href}
                  className={
                    step.done ? "text-white/40 line-through" : "hover:underline"
                  }
                >
                  {step.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-4">
        {[
          { label: "Sections", value: sectionCount ?? 0 },
          { label: "Projects", value: projectCount ?? 0 },
          { label: "Images", value: imageCount ?? 0 },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/15 p-5 flex items-baseline justify-between"
          >
            <span className="body-text text-sm text-white/50">{stat.label}</span>
            <span className="hero-title text-3xl">{stat.value}</span>
          </div>
        ))}
        <Link
          href={`/dashboard/sites/${siteId}/sections`}
          className="block text-center px-4 py-3 bg-white/10 rounded-xl body-text text-sm hover:bg-white/20 transition-colors"
        >
          Manage content →
        </Link>
      </div>
    </div>
  );
}
