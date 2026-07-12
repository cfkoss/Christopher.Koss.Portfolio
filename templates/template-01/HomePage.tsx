import type { TemplateProps } from "@/lib/templates/types";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { HomeShowcase } from "./HomeShowcase";
import "./styles.css";

export function HomePage({ data, basePath }: TemplateProps) {
  const heroTitle = data.site.heroTitle || "Selected\nWorks";

  const showcaseSections = data.sections.map((section) => {
    const projectImages = section.projects
      .map((p) => p.coverImageUrl)
      .filter((url): url is string => Boolean(url));
    return {
      id: section.id,
      slug: section.slug,
      title: section.title,
      description: section.description,
      images:
        projectImages.length > 0
          ? projectImages
          : section.coverImageUrl
            ? [section.coverImageUrl]
            : [],
    };
  });

  return (
    <div className="tpl-01">
      <Nav data={data} basePath={basePath} />
      <div className="pt-20 min-h-screen flex flex-col">
        <div className="max-w-7xl mx-auto px-6 py-32 w-full fade-in">
          <h1 className="hero-title text-7xl md:text-9xl mb-6 whitespace-pre-line">
            {heroTitle}
          </h1>
          {data.site.tagline && (
            <p
              className="body-text text-xl text-white/60 max-w-xl slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              {data.site.tagline}
            </p>
          )}
        </div>

        <HomeShowcase sections={showcaseSections} basePath={basePath} />

        <div className="mt-auto">
          <Footer name={data.site.name} />
        </div>
      </div>
    </div>
  );
}
