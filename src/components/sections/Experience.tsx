"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const experiences = [
  {
    period: "MAY 2025 — AUG 2025",
    role: "Frontend Developer Intern",
    company: "COS Great Trading — Cheras, Selangor",
    desc: "Designed and developed UI for a household property management system with reusable components and Figma prototypes. Supported 5 concurrent clients with landing pages and CMS maintenance. Assisted in CMS migration integrating CDN libraries including Bootstrap, GSAP, and Three.js.",
    active: true,
  },
  {
    period: "JAN 2023 — APR 2023",
    role: "Admin Intern",
    company: "MAXCOM MM Sdn Bhd — Cheras, Selangor",
    desc: "Collaborated with team members on product commercials and worked with the department manager to analyse marketing resource effectiveness. Handled telecommunication submissions, data entry, and customer support via WhatsApp, phone, and email.",
    active: false,
  },
];

export default function Experience() {
  const sectionRef  = useRef<HTMLElement>(null);
  const headingRef  = useRef<HTMLDivElement>(null);
  const lineRef     = useRef<HTMLDivElement>(null);
  const entriesRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading
      gsap.from(headingRef.current!.children, {
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
        },
      });

      // Timeline line — slide down from top, then scrub red fill with scroll
      gsap.from(lineRef.current, {
        yPercent: -100,
        opacity: 0,
        duration: 1.0,
        ease: "power3.out",
        scrollTrigger: {
          trigger: entriesRef.current,
          start: "top 75%",
        },
      });

      // Red fill scrubs as user scrolls through entries
      const redLine = lineRef.current;
      if (redLine) {
        gsap.fromTo(
          redLine,
          { scaleY: 0, transformOrigin: "top center" },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: entriesRef.current,
              start: "top 60%",
              end: "bottom 65%",
              scrub: 0.6,
            },
          }
        );
      }

      // Each entry fades + slides down from top
      const entries = entriesRef.current?.querySelectorAll(".exp-entry");
      entries?.forEach((entry) => {
        gsap.from(entry, {
          opacity: 0,
          y: -40,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: entry,
            start: "top 85%",
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="py-[clamp(72px,10vw,110px)] bg-[#0A0A0A] text-white"
    >
      <div className="max-w-[720px] mx-auto px-[clamp(24px,6vw,48px)]">
        <div ref={headingRef}>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-[1px] bg-brand-accent" />
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-brand-accent">
              Career Logs
            </span>
          </div>
          <h2 className="font-headline font-extrabold text-[clamp(32px,5vw,52px)] leading-tight tracking-[-0.04em] mb-16">
            The Professional Arc.
          </h2>
        </div>

        <div className="relative pl-8" ref={entriesRef}>
          {/* Static grey track (always full height) */}
          <div className="absolute left-0 top-2 bottom-0 w-[1px] bg-gradient-to-b from-white/15 to-white/5" />
          {/* Red progress line — grows with scroll */}
          <div
            ref={lineRef}
            className="absolute left-0 top-2 bottom-0 w-[1px] bg-brand-accent origin-top"
          />

          <div className="space-y-12">
            {experiences.map(({ period, role, company, desc, active }) => (
              <div key={role} className="relative group exp-entry">
                {/* Dot */}
                <div
                  className={`absolute -left-10 top-1.5 w-4 h-4 bg-[#0A0A0A] border-2 rounded-full z-10 transition-all duration-300 ${
                    active
                      ? "border-brand-accent shadow-[0_0_12px_rgba(255,44,44,0.4)]"
                      : "border-white/20 group-hover:border-brand-accent"
                  }`}
                />
                {/* Ripple on active */}
                {active && (
                  <div className="absolute -left-12 -top-[2px] w-8 h-8 border border-brand-accent/30 rounded-full animate-ping" />
                )}

                <span
                  className={`font-mono text-[12px] font-bold mb-2 block tracking-widest transition-colors duration-200 ${
                    active
                      ? "text-brand-accent"
                      : "text-on-surface-variant/40 group-hover:text-brand-accent"
                  }`}
                >
                  {period}
                </span>
                <h3 className="font-headline font-bold text-2xl mb-1">{role}</h3>
                <p className="text-on-surface-variant/80 font-medium mb-4">{company}</p>
                <p className="text-on-surface-variant leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
