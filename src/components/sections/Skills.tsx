"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

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
    tags: ["PHP", "MySQL", "Firebase", "PostgreSQL", "Node.js", "REST API"],
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
    tags: ["Figma", "Git", "GitLab", "Postman", "GSAP", "Three.js", "Draw.io"],
  },
];

const marqueeItems = [
  "React", "Flutter", "JavaScript", "Firebase", "Three.js", "GSAP", "Figma",
  "MySQL", "PostgreSQL", "PHP", "Dart", "TensorFlow", "Git", "Node.js",
  "React", "Flutter", "JavaScript", "Firebase", "Three.js", "GSAP", "Figma",
  "MySQL", "PostgreSQL", "PHP", "Dart", "TensorFlow", "Git", "Node.js",
];

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);
  const cardsRef   = useRef<HTMLDivElement>(null);
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

      // Cards: fire as soon as the grid enters the viewport bottom — no blank gap
      gsap.fromTo(
        cardsRef.current!.children,
        { opacity: 0, y: 48, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.1,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top bottom", // triggers the instant ANY part enters the viewport
            once: true,
          },
        }
      );

      // Infinite marquee
      if (marqueeRef.current) {
        const totalWidth = marqueeRef.current.scrollWidth / 2;
        gsap.to(marqueeRef.current, {
          x: -totalWidth,
          duration: 28,
          ease: "none",
          repeat: -1,
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="py-[clamp(72px,10vw,110px)] bg-[#0D0D0D] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-[clamp(24px,6vw,100px)]">
        {/* Header */}
        <div
          ref={headerRef}
          className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16"
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
            I leverage the most performant tools in the industry to build
            future-ready web applications.
          </p>
        </div>

        {/* Cards grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
        >
          {skills.map(({ index, icon, title, tags }) => (
            <div
              key={title}
              className="relative group bg-white/[0.04] border border-white/10 rounded-[20px] p-7 overflow-hidden hover:border-brand-accent/60 hover:bg-white/[0.07] transition-all duration-500"
            >
              {/* Faint index watermark */}
              <span
                className="absolute top-3 right-4 font-headline font-extrabold text-white/[0.05] select-none leading-none pointer-events-none group-hover:text-white/[0.09] transition-all duration-500"
                style={{ fontSize: "clamp(56px, 7vw, 80px)" }}
                aria-hidden
              >
                {index}
              </span>

              {/* Icon */}
              <div className="w-11 h-11 rounded-[14px] bg-white/10 flex items-center justify-center mb-5 group-hover:bg-brand-accent group-hover:text-white transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 text-white/60">
                <span className="material-symbols-outlined text-[22px]">{icon}</span>
              </div>

              {/* Title */}
              <h3 className="font-headline font-bold text-white text-xl mb-4">{title}</h3>

              {/* Tech tags */}
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] uppercase tracking-wider text-white/40 bg-white/5 border border-white/8 px-2.5 py-1 rounded-full group-hover:border-white/15 transition-colors duration-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Infinite marquee */}
      <div className="overflow-hidden border-y border-white/8 py-5">
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
