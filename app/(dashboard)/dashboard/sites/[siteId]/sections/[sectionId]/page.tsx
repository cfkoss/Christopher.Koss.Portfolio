import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { assetUrl } from "@/lib/assets";
import { updateSection, setSectionCover } from "@/lib/actions/sections";
import {
  createProject,
  deleteProject,
  moveProject,
} from "@/lib/actions/projects";
import { SECTION_ICONS } from "@/templates/template-01/icons";
import { SectionEditForm } from "@/components/dashboard/SectionEditForm";
import { ImageUploader } from "@/components/dashboard/ImageUploader";
import {
  AddTitleForm,
  DangerButton,
  MoveButtons,
} from "@/components/dashboard/ActionForms";

export const metadata: Metadata = { title: "Edit section" };

export default async function SectionEditPage({
  params,
}: {
  params: Promise<{ siteId: string; sectionId: string }>;
}) {
  const { siteId, sectionId } = await params;
  const supabase = await createClient();

  const { data: section } = await supabase
    .from("sections")
    .select("id, site_id, slug, title, description, icon, cover_image_path")
    .eq("id", sectionId)
    .eq("site_id", siteId)
    .maybeSingle();
  if (!section) notFound();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, slug, title, cover_image_path, sort_order")
    .eq("section_id", sectionId)
    .order("sort_order");

  const projectList = projects ?? [];
  const coverUrl = assetUrl(section.cover_image_path);

  return (
    <div className="grid gap-12 lg:grid-cols-2 max-w-5xl">
      <div className="space-y-10">
        <div>
          <p className="body-text text-sm text-white/40 mb-1">
            <Link
              href={`/dashboard/sites/${siteId}/sections`}
              className="hover:text-white/70"
            >
              Sections
            </Link>{" "}
            /
          </p>
          <h2 className="hero-title text-3xl">{section.title}</h2>
        </div>

        <SectionEditForm
          action={updateSection.bind(null, section.id)}
          defaults={{
            title: section.title,
            description: section.description ?? "",
            icon: section.icon ?? "Briefcase",
          }}
          iconOptions={Object.keys(SECTION_ICONS)}
        />

        <div className="max-w-lg">
          <h3 className="body-text text-sm text-white/70 mb-2">
            Fallback cover image
          </h3>
          <p className="body-text text-xs text-white/40 mb-3">
            Shown on the home page when this section has no project images yet.
          </p>
          {coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt={`${section.title} cover`}
              className="w-full aspect-video object-cover rounded-lg border border-white/10 mb-3"
            />
          )}
          <ImageUploader
            siteId={siteId}
            registerAction={setSectionCover.bind(null, section.id)}
            label={coverUrl ? "Replace cover image" : "Upload cover image"}
            multiple={false}
          />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="hero-title text-2xl">Projects</h3>
        <AddTitleForm
          action={createProject.bind(null, section.id)}
          placeholder="New project title"
          buttonLabel="Add project"
        />
        {projectList.length === 0 ? (
          <p className="body-text text-white/40 text-sm">
            No projects in this section yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {projectList.map((project, index) => {
              const thumb = assetUrl(project.cover_image_path);
              return (
                <li
                  key={project.id}
                  className="flex items-center gap-4 rounded-xl border border-white/15 p-3"
                >
                  <MoveButtons
                    action={moveProject.bind(null, project.id)}
                    isFirst={index === 0}
                    isLast={index === projectList.length - 1}
                  />
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10" />
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/dashboard/sites/${siteId}/projects/${project.id}`}
                      className="body-text font-medium hover:underline underline-offset-4 decoration-white/40"
                    >
                      {project.title}
                    </Link>
                    <p className="body-text text-xs text-white/40">
                      /{section.slug}/{project.slug}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/sites/${siteId}/projects/${project.id}`}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg body-text text-xs transition-colors"
                  >
                    Edit
                  </Link>
                  <DangerButton
                    action={deleteProject.bind(null, project.id)}
                    confirmText={`Delete "${project.title}"?`}
                  >
                    Delete
                  </DangerButton>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
