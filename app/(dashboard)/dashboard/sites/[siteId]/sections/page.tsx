import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  createSection,
  deleteSection,
  moveSection,
} from "@/lib/actions/sections";
import {
  AddTitleForm,
  DangerButton,
  MoveButtons,
} from "@/components/dashboard/ActionForms";

export const metadata: Metadata = { title: "Sections" };

interface SectionRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  projects: { count: number }[];
}

export default async function SectionsPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const supabase = await createClient();

  const { data: site } = await supabase
    .from("sites")
    .select("id")
    .eq("id", siteId)
    .maybeSingle();
  if (!site) notFound();

  const { data: sections } = await supabase
    .from("sections")
    .select("id, slug, title, description, icon, sort_order, projects(count)")
    .eq("site_id", siteId)
    .order("sort_order")
    .returns<SectionRow[]>();

  const list = sections ?? [];

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="hero-title text-3xl mb-2">Sections</h2>
        <p className="body-text text-sm text-white/50">
          Sections are the top-level categories of your portfolio — they appear
          in your site&apos;s navigation and on the home page.
        </p>
      </div>

      <AddTitleForm
        action={createSection.bind(null, siteId)}
        placeholder="New section title — e.g. Architecture"
        buttonLabel="Add section"
      />

      {list.length === 0 ? (
        <p className="body-text text-white/40">No sections yet.</p>
      ) : (
        <ul className="space-y-3">
          {list.map((section, index) => (
            <li
              key={section.id}
              className="flex items-center gap-4 rounded-xl border border-white/15 p-4"
            >
              <MoveButtons
                action={moveSection.bind(null, section.id)}
                isFirst={index === 0}
                isLast={index === list.length - 1}
              />
              <div className="flex-1 min-w-0">
                <Link
                  href={`/dashboard/sites/${siteId}/sections/${section.id}`}
                  className="hero-title text-xl hover:underline underline-offset-4 decoration-white/40"
                >
                  {section.title}
                </Link>
                <p className="body-text text-xs text-white/40 mt-1 truncate">
                  /{section.slug} · {section.projects[0]?.count ?? 0} project
                  {(section.projects[0]?.count ?? 0) === 1 ? "" : "s"}
                  {section.description && ` · ${section.description}`}
                </p>
              </div>
              <Link
                href={`/dashboard/sites/${siteId}/sections/${section.id}`}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg body-text text-xs transition-colors"
              >
                Edit
              </Link>
              <DangerButton
                action={deleteSection.bind(null, section.id)}
                confirmText={`Delete "${section.title}" and all of its projects?`}
              >
                Delete
              </DangerButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
