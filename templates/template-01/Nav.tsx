import Link from "next/link";
import type { TemplateProps } from "@/lib/templates/types";

export function Nav({ data, basePath }: TemplateProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href={basePath || "/"} className="hero-title text-2xl tracking-tight">
            {data.site.name}
          </Link>
          <div className="hidden md:flex items-center space-x-8 body-text text-sm">
            <Link
              href={basePath || "/"}
              className="nav-link opacity-70 hover:opacity-100"
            >
              Home
            </Link>
            {data.sections.map((section) => (
              <Link
                key={section.id}
                href={`${basePath}/${section.slug}`}
                className="nav-link opacity-70 hover:opacity-100"
              >
                {section.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
