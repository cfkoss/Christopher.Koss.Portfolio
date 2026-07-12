import Link from "next/link";
import { notFound } from "next/navigation";
import type { TemplateSectionProps } from "@/lib/templates/types";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { SectionIcon } from "./icons";
import "./styles.css";

export function SectionPage({ data, basePath, sectionSlug }: TemplateSectionProps) {
  const section = data.sections.find((s) => s.slug === sectionSlug);
  if (!section) notFound();

  return (
    <div className="tpl-01">
      <Nav data={data} basePath={basePath} />
      <div className="pt-20 min-h-screen flex flex-col">
        <div className="max-w-7xl mx-auto px-6 py-20 w-full fade-in">
          <div className="flex items-center space-x-4 mb-6">
            <SectionIcon name={section.icon} size={40} className="text-white/60" />
            <h1 className="hero-title text-6xl md:text-8xl">{section.title}</h1>
          </div>
          {section.description && (
            <p className="body-text text-lg text-white/60 max-w-xl">
              {section.description}
            </p>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-20 w-full">
          {section.projects.length === 0 ? (
            <div className="text-center py-20">
              <p className="body-text text-white/40 text-lg">No projects yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {section.projects.map((project, index) => (
                <div
                  key={project.id}
                  className="slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Link
                    href={`${basePath}/${section.slug}/${project.slug}`}
                    className="circular-project w-full"
                  >
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
                    <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
                      <h3 className="hero-title text-2xl md:text-3xl text-center text-white">
                        {project.title}
                      </h3>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto">
          <Footer name={data.site.name} />
        </div>
      </div>
    </div>
  );
}
