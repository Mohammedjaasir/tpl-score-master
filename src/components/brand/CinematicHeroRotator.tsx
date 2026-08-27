import { useState, useEffect } from "react";

const CRICKET_IMAGES = [
  {
    src: "/hero-cricket-1.jpg",
    alt: "Sri Lanka batsman playing a lofted power shot under stadium floodlights",
  },
  {
    src: "/hero-cricket-5.jpg",
    alt: "Indian cricket batsman Rohit Sharma playing a powerful shot",
  },
  {
    src: "/hero-cricket-6.jpg",
    alt: "Legendary Indian cricketer MS Dhoni batting in international cricket",
  },
  {
    src: "/hero-cricket-4.jpg",
    alt: "Sri Lanka batsman executing a classic cover drive",
  },
  {
    src: "/hero-cricket-2.jpg",
    alt: "Sri Lanka batsman celebration moment under stadium floodlights",
  },
  {
    src: "/hero-cricket-3.jpg",
    alt: "Batsman dynamic pull shot under floodlights",
  },
];

const DISPLAY_DURATION_MS = 1000; // 1.0 second display per image
const FADE_DURATION_MS = 400; // 0.4 second smooth crossfade transition

export function CinematicHeroRotator({ className = "" }: { className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Check for reduced motion preference
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CRICKET_IMAGES.length);
    }, DISPLAY_DURATION_MS + FADE_DURATION_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden pointer-events-none select-none bg-[#080B10] ${className}`}>
      {CRICKET_IMAGES.map((img, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={img.src}
            className="absolute inset-0 w-full h-full"
            style={{
              opacity: isActive ? 1 : 0,
              transition: `opacity ${FADE_DURATION_MS}ms ease-in-out`,
              zIndex: isActive ? 2 : 1,
              transform: "none",
              willChange: "opacity",
            }}
            aria-hidden={!isActive}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.06] saturate-[1.02]"
              style={{ transform: "none" }}
              loading={idx < 2 ? "eager" : "lazy"}
            />
          </div>
        );
      })}
    </div>
  );
}
