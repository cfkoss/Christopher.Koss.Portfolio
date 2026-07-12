import { createElement } from "react";
import {
  Briefcase,
  Building2,
  Camera,
  Code,
  Globe,
  Grid3x3,
  Heart,
  Home,
  Layers,
  Music,
  Palette,
  PenTool,
  Shirt,
  Sofa,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";

/**
 * Curated set of section icons. `sections.icon` stores one of these names;
 * the dashboard icon picker offers the same list.
 */
export const SECTION_ICONS: Record<string, LucideIcon> = {
  Briefcase,
  Building2,
  Camera,
  Code,
  Globe,
  Grid3x3,
  Heart,
  Home,
  Layers,
  Music,
  Palette,
  PenTool,
  Shirt,
  Sofa,
  Sparkles,
  Star,
};

export function getSectionIcon(name: string | null): LucideIcon {
  return (name && SECTION_ICONS[name]) || Briefcase;
}

export function SectionIcon({
  name,
  size,
  className,
}: {
  name: string | null;
  size?: number;
  className?: string;
}) {
  // createElement with a looked-up (not newly created) component — keeps the
  // static-components lint rule from misreading the registry lookup.
  return createElement(getSectionIcon(name), { size, className });
}
