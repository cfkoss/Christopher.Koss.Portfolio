import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { assetUrl } from "@/lib/assets";
import {
  updateProject,
  addProjectImage,
  deleteProjectImage,
  setProjectCover,
} from "@/lib/actions/projects";
import { ProjectEditForm } from "@/components/dashboard/ProjectEditForm";
import { ImageUploader } from "@/components/dashboard/ImageUploader";
import { GalleryControls } from "@/components/dashboard/GalleryControls";

export const metadata: Metadata = { title: "Edit project" };

export default async function ProjectEditPage({
  params,
}: {
  params: Promise<{ siteId: string; projectId: string }>;
}) {
  const { siteId, projectId } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select(
      "id, site_id, section_id, slug, title, description, body, tags, cover_image_path, sections(id, slug, title)",
    )
    .eq("id", projectId)
    .eq("site_id", siteId)
    .maybeSingle();
  if (!project) notFound();

  const { data: images } = await supabase
    .from("project_images")
    .select("id, storage_path, alt, sort_order")
    .eq("project_id", projectId)
    .order("sort_order");

  const section = project.sections as unknown as {
    id: string;
    slug: string;
    title: string;
  } | null;

  return (
    <div className="grid gap-12 lg:grid-cols-2 max-w-5xl">
      <div>
        <p className="body-text text-sm text-white/40 mb-1">
          <Link
            href={`/dashboard/sites/${siteId}/sections`}
            className="hover:text-white/70"
          >
            Sections
          </Link>
          {section && (
            <>
              {" / "}
              <Link
                href={`/dashboard/sites/${siteId}/sections/${section.id}`}
                className="hover:text-white/70"
              >
                {section.title}
              </Link>
            </>
          )}{" "}
          /
        </p>
        <h2 className="hero-title text-3xl mb-8">{project.title}</h2>

        <ProjectEditForm
          action={updateProject.bind(null, project.id)}
          defaults={{
            title: project.title,
            description: project.description ?? "",
            body: project.body ?? "",
            tags: (project.tags ?? []).join(", "),
          }}
        />
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="hero-title text-2xl mb-2">Images</h3>
          <p className="body-text text-xs text-white/40">
            The cover appears on the project card and page hero; the rest form
            the gallery. Images are resized automatically before upload.
          </p>
        </div>

        <ImageUploader
          siteId={siteId}
          registerAction={addProjectImage.bind(null, project.id)}
        />

        {(images ?? []).length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {(images ?? []).map((image) => {
              const url = assetUrl(image.storage_path);
              const isCover = image.storage_path === project.cover_image_path;
              return (
                <div key={image.id}>
                  <div
                    className={`aspect-video overflow-hidden rounded-lg border ${
                      isCover ? "border-emerald-400/60" : "border-white/10"
                    }`}
                  >
                    {url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={url}
                        alt={image.alt ?? ""}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <GalleryControls
                    isCover={isCover}
                    setCoverAction={setProjectCover.bind(
                      null,
                      project.id,
                      image.storage_path,
                    )}
                    deleteAction={deleteProjectImage.bind(null, image.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
