import Link from "next/link";
import { notFound } from "next/navigation";
import type { TemplateProjectProps } from "@/lib/templates/types";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import "./styles.css";

export function ProjectPage({
  data,
  basePath,
  sectionSlug,
  projectSlug,
}: TemplateProjectProps) {
  const section = data.sections.find((s) => s.slug === sectionSlug);
  const project = section?.projects.find((p) => p.slug === projectSlug);
  if (!section || !project) notFound();

  return (
    <div className="tpl-01">
      <Nav data={data} basePath={basePath} />
      <div className="pt-16">
        {/* Hero image */}
        <div className="relative h-[60vh] overflow-hidden fade-in">
          {project.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.coverImageUrl}
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="placeholder-cover absolute inset-0" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />
          <Link
            href={`${basePath}/${section.slug}`}
            aria-label={`Back to ${section.title}`}
            className="absolute top-8 left-8 p-3 bg-black/50 backdrop-blur-md border border-white/20 rounded-full hover:bg-black/70 transition-colors z-10"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 -mt-32 relative z-10 pb-20">
          <div className="glass-effect rounded-2xl p-8 md:p-12 mb-12 slide-up">
            <h1 className="hero-title text-4xl md:text-7xl mb-6">
              {project.title}
            </h1>

            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-full body-text text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {project.description && (
              <p className="body-text text-xl text-white/80 mb-8 leading-relaxed">
                {project.description}
              </p>
            )}

            {project.body && (
              <div className="body-text text-white/70 leading-relaxed whitespace-pre-wrap">
                {project.body}
              </div>
            )}
          </div>

          {project.galleryImages.length > 0 && (
            <div className="space-y-8 slide-up" style={{ animationDelay: "0.2s" }}>
              <h2 className="hero-title text-3xl mb-6">Project Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.galleryImages.map((img, index) => (
                  <div
                    key={img.url + index}
                    className="aspect-video overflow-hidden rounded-lg border border-white/10"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt || `${project.title} — image ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Footer name={data.site.name} />
      </div>
    </div>
  );
}
