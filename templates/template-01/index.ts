import type { TemplateModule } from "@/lib/templates/types";
import { HomePage } from "./HomePage";
import { SectionPage } from "./SectionPage";
import { ProjectPage } from "./ProjectPage";
import { demoData } from "./demo-data";

const template01: TemplateModule = {
  slug: "template-01",
  name: "Noir Editorial",
  description:
    "A cinematic dark portfolio with serif display type, circular project cards, glass-effect hero panels and immersive full-bleed galleries.",
  thumbnail: "/demo/arch-1.svg",
  HomePage,
  SectionPage,
  ProjectPage,
  demoData,
};

export default template01;
