// COMPONENT: <Skills>
// OWNS: "Tech Ecosystem" section with a scroll-driven card-deck reveal
//   (4 face-down cards; each scroll tick flips the top card to a category,
//    then shuffles it away before flipping the next one).
// DO NOT TOUCH FROM OUTSIDE: deckRef / cardRefs and the pinned ScrollTrigger
//   timeline — the animation coordinates its own start/end boundaries.
// CALLED BY: src/app/page.tsx
"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const skills = [
  {
    index: "01",
    icon: "javascript",
    title: "Frontend",
    tags: ["React", "JavaScript", "HTML", "CSS", "MUI", "Redux", "Axios", "Tailwind"],
  },
  {
    index: "02",
    icon: "dns",
    title: "Backend",
    tags: ["PHP", "MySQL", "Firebase", "PostgreSQL", "REST API"],
  },
  {
    index: "03",
    icon: "smartphone",
    title: "Mobile",
    tags: ["Flutter", "Dart", "TensorFlow Lite", "Isar DB", "Firebase Auth"],
  },
  {
    index: "04",
    icon: "polyline",
    title: "Tools & Design",
    tags: ["Figma", "Git", "GitLab", "Postman", "GSAP", "Draw.io"],
  },
];

const marqueeItems = [
  "React", "Flutter", "JavaScript", "Firebase", "Three.js", "GSAP", "Figma",
  "MySQL", "PostgreSQL", "PHP", "Dart", "TensorFlow", "Git", "Node.js",
  "React", "Flutter", "JavaScript", "Firebase", "Three.js", "GSAP", "Figma",
  "MySQL", "PostgreSQL", "PHP", "Dart", "TensorFlow", "Git", "Node.js",
];

const stackOffsets = [
  { x: -10, y: -8, rotate: -4 },
  { x:   6, y: -3, rotate:  2.5 },
  { x:  -4, y:  5, rotate: -1.5 },
  { x:   8, y: 10, rotate:  3.5 },
];

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);
  const deckRef    = useRef<HTMLDivElement>(null);
  const cardRefs   = useRef<(HTMLDivElement | null)[]>(Array(skills.length).fill(null));
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header reveal
      gsap.from(headerRef.current!.children, {
        opacity: 0,
        y: 40,
        stagger: 0.12,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
        },
      });

      const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];

      // Initial state: whole deck face-down and offset (poker-stack look).
      cards.forEach((card, i) => {
        const off = stackOffsets[i];
        gsap.set(card, {
          rotationY: 180,
          x: off.x,
          y: off.y,
          rotation: off.rotate,
          zIndex: cards.length - i,
          opacity: 1,
        });
      });

      // One pinned, scroll-scrubbed timeline that flips and shuffles each card.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: deckRef.current,
          start: "top top+=80",
          end: () => `+=${cards.length * 900}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      cards.forEach((card, i) => {
        // Flip up — top card becomes face-up and settles to centre.
        tl.to(card, {
          rotationY: 0,
          x: 0,
          y: 0,
          rotation: 0,
          duration: 1,
          ease: "power3.out",
        });

        // Dwell so the user can read the category.
        tl.to({}, { duration: 0.6 });

        // Shuffle every card off-screen after the dwell.
        tl.to(card, {
          x: () => -Math.max(window.innerWidth * 0.7, 600),
          rotation: -22,
          opacity: 0,
          duration: 0.9,
          ease: "power2.in",
        });
      });

      // Infinite marquee (unchanged)
      if (marqueeRef.current) {
        const totalWidth = marqueeRef.current.scrollWidth / 2;
        gsap.to(marqueeRef.current, {
          x: -totalWidth,
          duration: 28,
          ease: "none",
          repeat: -1,
        });
      }

      // Ensure triggers recalc after layout (fonts/images).
      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="bg-[#0D0D0D] overflow-hidden"
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto px-[clamp(24px,6vw,100px)] pt-[clamp(72px,10vw,110px)]">
        <div
          ref={headerRef}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-[1px] bg-brand-accent" />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-brand-accent">
                Capability
              </span>
            </div>
            <h2 className="font-headline font-extrabold text-[clamp(32px,5vw,52px)] leading-tight tracking-[-0.04em] text-white">
              Tech Ecosystem.
            </h2>
          </div>
          <p className="max-w-md text-white/40 font-mono text-[13px] leading-relaxed uppercase tracking-wider">
            Scroll to deal the deck — one category at a time.
          </p>
        </div>
      </div>

      {/* Pinned deck viewport */}
      <div
        ref={deckRef}
        className="relative h-screen w-full flex items-start justify-center pt-[clamp(8px,4vh,48px)] px-6"
        style={{ perspective: "1800px" }}
      >
        <div className="relative w-[min(360px,86vw)] aspect-[3/4.2]">
          {skills.map(({ index, icon, title, tags }, i) => (
            <div
              key={title}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="absolute inset-0 rounded-[22px] will-change-transform"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Card back (poker face-down) */}
              <div
                className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-[#181818] to-[#080808] border border-white/10 overflow-hidden"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg, #fff 0 2px, transparent 2px 16px), repeating-linear-gradient(-45deg, #fff 0 2px, transparent 2px 16px)",
                  }}
                />
                <div className="absolute inset-4 rounded-[18px] border border-white/10" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6">
                  <div className="font-headline font-extrabold text-white/15 text-[72px] leading-none">
                    TYL.
                  </div>
                  <div className="w-16 h-[1px] bg-brand-accent/50" />
                  <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/40">
                    Tech Deck
                  </div>
                </div>
              </div>

              {/* Card front (category) */}
              <div
                className="absolute inset-0 rounded-[22px] bg-[#121212] border border-white/10 overflow-hidden p-8"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <span
                  className="absolute top-4 right-5 font-headline font-extrabold text-white/[0.06] select-none leading-none pointer-events-none"
                  style={{ fontSize: "clamp(72px, 9vw, 112px)" }}
                  aria-hidden
                >
                  {index}
                </span>

                <div className="w-12 h-12 rounded-[14px] bg-brand-accent/20 flex items-center justify-center mb-6 text-brand-accent">
                  <span className="material-symbols-outlined text-[26px]">{icon}</span>
                </div>

                <h3 className="font-headline font-bold text-white text-2xl mb-6">
                  {title}
                </h3>

                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[10px] uppercase tracking-wider text-white/55 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Infinite marquee */}
      <div className="overflow-hidden border-y border-white/8 py-5 mt-[clamp(48px,8vw,96px)]">
        <div ref={marqueeRef} className="flex gap-12 whitespace-nowrap w-max">
          {marqueeItems.map((item, i) => (
            <span
              key={i}
              className="font-mono text-[13px] uppercase tracking-[0.2em] text-white/30 hover:text-brand-accent transition-colors flex items-center gap-3"
            >
              <span className="w-1 h-1 rounded-full bg-brand-accent inline-block" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
