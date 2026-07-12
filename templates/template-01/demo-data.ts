import type { PortfolioData } from "@/lib/portfolio/types";

/** Fake studio used for marketplace previews of this template. */
export const demoData: PortfolioData = {
  site: {
    name: "Mara Voss",
    tagline:
      "A curated collection of architecture, interiors and object design",
    heroTitle: "Selected\nWorks",
    settings: {},
  },
  sections: [
    {
      id: "demo-architecture",
      slug: "architecture",
      title: "Architecture",
      description: "Spatial design & structural innovation",
      coverImageUrl: "/demo/arch-1.svg",
      icon: "Building2",
      projects: [
        {
          id: "demo-arch-1",
          slug: "hillside-pavilion",
          title: "Hillside Pavilion",
          description: "A cantilevered retreat suspended over a granite slope.",
          body: "Commissioned as a weekend residence, the pavilion negotiates a steep granite slope with a single cantilevered volume. The structure rests on three concrete fins, letting the hillside run uninterrupted beneath the living floor.\n\nInteriors are finished in blackened timber and lime plaster, with a continuous band of glazing that frames the valley below.",
          coverImageUrl: "/demo/arch-1.svg",
          galleryImages: [
            { url: "/demo/arch-2.svg", alt: "Structural fins at dusk" },
            { url: "/demo/arch-3.svg", alt: "Glazing band detail" },
          ],
          tags: ["Residential", "Concrete", "Cantilever"],
        },
        {
          id: "demo-arch-2",
          slug: "courtyard-library",
          title: "Courtyard Library",
          description: "A civic reading room wrapped around a sunken garden.",
          body: "The library organises its collection around a sunken courtyard garden, drawing daylight deep into the reading rooms. Board-formed concrete walls carry the memory of their timber moulds, and the roof plane floats on slender steel columns.",
          coverImageUrl: "/demo/arch-3.svg",
          galleryImages: [
            { url: "/demo/arch-1.svg", alt: "Courtyard at midday" },
          ],
          tags: ["Civic", "Landscape", "Daylight"],
        },
      ],
    },
    {
      id: "demo-interiors",
      slug: "interiors",
      title: "Interiors",
      description: "Warm, restrained spaces built to be lived in",
      coverImageUrl: "/demo/int-1.svg",
      icon: "Sofa",
      projects: [
        {
          id: "demo-int-1",
          slug: "atelier-apartment",
          title: "Atelier Apartment",
          description: "A painter's loft reworked as a live-work residence.",
          body: "The brief asked for a home that could disappear behind the work. Storage, kitchen and sleeping quarters fold into a single oak-lined service wall, leaving the north-lit studio floor entirely free.",
          coverImageUrl: "/demo/int-1.svg",
          galleryImages: [
            { url: "/demo/int-2.svg", alt: "Service wall, closed" },
            { url: "/demo/int-3.svg", alt: "Studio floor" },
          ],
          tags: ["Residential", "Oak", "Live-work"],
        },
        {
          id: "demo-int-2",
          slug: "hotel-verde",
          title: "Hotel Verde Lobby",
          description: "Hospitality interiors in travertine and brass.",
          body: "A compact city hotel lobby that trades reception desks for a long travertine table. Brass detailing and hand-troweled plaster keep the palette to three materials.",
          coverImageUrl: "/demo/int-2.svg",
          galleryImages: [],
          tags: ["Hospitality", "Travertine", "Brass"],
        },
      ],
    },
    {
      id: "demo-objects",
      slug: "objects",
      title: "Objects",
      description: "Furniture and lighting, drawn then built",
      coverImageUrl: "/demo/obj-1.svg",
      icon: "Palette",
      projects: [
        {
          id: "demo-obj-1",
          slug: "arc-lamp",
          title: "Arc Lamp",
          description: "A counterweighted floor lamp in patinated steel.",
          body: "The Arc Lamp balances a two-metre reach on a cast-iron counterweight, letting the shade drift over a dining table without a ceiling fixture. Each piece is patinated by hand.",
          coverImageUrl: "/demo/obj-1.svg",
          galleryImages: [
            { url: "/demo/obj-2.svg", alt: "Counterweight detail" },
            { url: "/demo/obj-3.svg", alt: "Shade profile" },
          ],
          tags: ["Lighting", "Steel", "Limited run"],
        },
      ],
    },
  ],
};
