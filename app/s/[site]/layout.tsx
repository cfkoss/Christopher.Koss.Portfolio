import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { resolveTenant } from "@/lib/tenant";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ site: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ site: string }>;
}): Promise<Metadata> {
  const { site } = await params;
  const tenant = await resolveTenant(site);
  if (!tenant) return {};

  const { name, tagline } = tenant.site.data.site;
  return {
    title: {
      default: name,
      template: `%s — ${name}`,
    },
    description: tagline ?? `Portfolio of ${name}`,
    robots: tenant.isDraftPreview ? { index: false } : undefined,
  };
}

export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const { site } = await params;
  const tenant = await resolveTenant(site);
  if (!tenant) notFound();

  return (
    <>
      {tenant.isDraftPreview && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-4 rounded-full border border-amber-400/40 bg-black/85 px-5 py-2.5 text-sm text-amber-200 backdrop-blur-md body-text">
          <span>Draft preview — only you can see this site.</span>
          <Link
            href={`/dashboard/sites/${tenant.site.id}`}
            className="rounded-full bg-amber-300 px-3 py-1 font-medium text-black hover:bg-amber-200 transition-colors"
          >
            Publish
          </Link>
        </div>
      )}
      {children}
    </>
  );
}
