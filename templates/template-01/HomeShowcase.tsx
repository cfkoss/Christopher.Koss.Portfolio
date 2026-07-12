"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ShowcaseSection {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  images: string[];
}

interface HomeShowcaseProps {
  sections: ShowcaseSection[];
  basePath: string;
}

/**
 * The interactive half of the home page: desktop grid of section cards with
 * auto-rotating cover images, and a swipeable carousel on mobile.
 * Ported from the original artifact's HomePage.
 */
export function HomeShowcase({ sections, basePath }: HomeShowcaseProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Rotate every section's cover image in lockstep every 2.5s.
  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prev) => prev + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance the mobile carousel every 10s.
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.innerWidth < 768) {
        setCurrentSlide((prev) => (prev + 1) % Math.max(sections.length, 1));
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [sections.length]);

  if (sections.length === 0) return null;

  const nextSlide = () => setCurrentSlide((p) => (p + 1) % sections.length);
  const prevSlide = () =>
    setCurrentSlide((p) => (p - 1 + sections.length) % sections.length);

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) nextSlide();
    if (touchStart - touchEnd < -75) prevSlide();
  };

  const SectionCard = ({
    section,
    index,
  }: {
    section: ShowcaseSection;
    index: number;
  }) => {
    const activeImage =
      section.images.length > 0
        ? section.images[imageIndex % section.images.length]
        : null;

    return (
      <Link
        href={`${basePath}/${section.slug}`}
        className="hero-section relative h-96 rounded-lg overflow-hidden block slide-up"
        style={{ animationDelay: `${0.4 + index * 0.1}s` }}
      >
        <div className="absolute inset-0 w-full h-full">
          {activeImage ? (
            section.images.map((img, imgIndex) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={img + imgIndex}
                src={img}
                alt={section.title}
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  opacity:
                    imgIndex === imageIndex % section.images.length ? 1 : 0,
                  transition: "opacity 0.7s ease-in-out",
                }}
              />
            ))
          ) : (
            <div className="placeholder-cover absolute inset-0" />
          )}
        </div>
        <div className="absolute inset-0 z-10 flex items-center justify-center p-8">
          <div className="glass-effect rounded-2xl p-6 transition-all duration-300 text-center w-full">
            <h2 className="hero-title hero-card-title mb-3">{section.title}</h2>
            {section.description && (
              <p className="body-text text-white/80 hero-card-description">
                {section.description}
              </p>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Desktop grid */}
      <div className="max-w-7xl mx-auto px-6 pb-32 hidden md:block">
        <div
          className={`grid gap-8 ${
            sections.length === 1
              ? "grid-cols-1"
              : sections.length === 2
                ? "grid-cols-2"
                : "grid-cols-3"
          }`}
        >
          {sections.map((section, index) => (
            <SectionCard key={section.id} section={section} index={index} />
          ))}
        </div>
      </div>

      {/* Mobile carousel */}
      <div
        className="max-w-7xl mx-auto px-6 pb-32 md:hidden carousel-container"
        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
        onTouchMove={(e) => setTouchEnd(e.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative h-96">
          <div
            className="carousel-track"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {sections.map((section, index) => (
              <div key={section.id} className="min-w-full px-2">
                <SectionCard section={section} index={index} />
              </div>
            ))}
          </div>

          {sections.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="carousel-arrow left"
                aria-label="Previous section"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="carousel-arrow right"
                aria-label="Next section"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
                {sections.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      currentSlide === index ? "bg-white w-8" : "bg-white/40 w-2"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
