// COMPONENT: <CurrentlyUsing>
// OWNS: standalone "daily stack" section — flex-wrap chips on mobile,
//   floating scattered layout on md+ (768px+).
// DO NOT TOUCH FROM OUTSIDE: floatingRef / GSAP context — desktop only.
// CALLED BY: src/app/page.tsx (rendered after <Skills />)
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const currentStack = [
  "React", "React MUI", "Redux", "Axios", "PHP",
  "MySQL", "PostgreSQL", "Git", "GitLab", "Postman", "Sourcetree",
];

const placements = [
  { xPct: 0.04, yPct: 0.05, rot: -12 },
  { xPct: 0.28, yPct: 0.00, rot:   6 },
  { xPct: 0.55, yPct: 0.08, rot:  -8 },
  { xPct: 0.74, yPct: 0.02, rot:  14 },
  { xPct: 0.10, yPct: 0.38, rot:  10 },
  { xPct: 0.36, yPct: 0.32, rot: -15 },
  { xPct: 0.62, yPct: 0.40, rot:   4 },
  { xPct: 0.00, yPct: 0.68, rot:  -6 },
  { xPct: 0.30, yPct: 0.65, rot:  12 },
  { xPct: 0.56, yPct: 0.72, rot: -10 },
  { xPct: 0.78, yPct: 0.60, rot:   7 },
];

const chipClass =
  "font-mono text-[12px] uppercase tracking-[0.18em] text-white/70 bg-white/[0.04] border border-white/10 px-4 py-2.5 rounded-full transition-colors duration-300 cursor-default select-none";

export default function CurrentlyUsing() {
  const sectionRef  = useRef<HTMLElement>(null);
  const headerRef   = useRef<HTMLDivElement>(null);
  const floatRef    = useRef<HTMLDivElement>(null); // desktop floating container

  useEffect(() => {
    const section   = sectionRef.current!;
    const header    = headerRef.current!;
    const container = floatRef.current!;
    const chips     = Array.from(container.children) as HTMLElement[];

    const ctx = gsap.context(() => {
      // Header reveal
      gsap.from(header.children, {
        opacity: 0, y: 40, stagger: 0.1, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 78%" },
      });

      // Position chips absolutely
      const cw = container.offsetWidth;
      const ch = container.offsetHeight;
      chips.forEach((chip, i) => {
        const p  = placements[i];
        const ew = chip.offsetWidth  || 80;
        const eh = chip.offsetHeight || 36;
        const x  = Math.max(0, Math.min(p.xPct * (cw - ew), cw - ew));
        const y  = Math.max(0, Math.min(p.yPct * (ch - eh), ch - eh));
        gsap.set(chip, { position: "absolute", x, y, rotation: p.rot, opacity: 0, scale: 0.8 });
      });

      // Reveal on scroll
      gsap.fromTo(
        chips,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1, scale: 1, stagger: 0.07, duration: 0.6,
          ease: "back.out(1.4)",
          scrollTrigger: { trigger: container, start: "top bottom", once: true },
        }
      );

      // Float loop
      chips.forEach((chip, i) => {
        const p = placements[i];
        gsap.to(chip, {
          y: `+=${7 + (i % 3) * 5}`,
          rotation: p.rot + (i % 2 === 0 ? 4 : -4),
          duration: 2.4 + (i * 0.31) % 1.8,
          repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.18,
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="currently-using"
      ref={sectionRef}
      className="py-[clamp(72px,10vw,110px)] bg-[#0A0A0A] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-[clamp(24px,6vw,100px)]">
        {/* Header */}
        <div
          ref={headerRef}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-14"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-brand-accent">
                Currently Using
              </span>
            </div>
            <h2 className="font-headline font-extrabold text-[clamp(32px,5vw,52px)] leading-tight tracking-[-0.04em] text-white">
              The daily stack.
            </h2>
          </div>
          <p className="max-w-md text-white/40 font-mono text-[13px] leading-relaxed uppercase tracking-wider">
            The tools I reach for every day — the ones powering the projects I&apos;m shipping right now.
          </p>
        </div>

        {/* Mobile: simple flex-wrap rows */}
        <div className="flex flex-wrap gap-3 md:hidden">
          {currentStack.map((item) => (
            <span key={item} className={chipClass}>{item}</span>
          ))}
        </div>

        {/* Desktop: floating scattered layout */}
        <div
          ref={floatRef}
          className="relative w-full hidden md:block"
          style={{ height: "clamp(280px, 36vw, 460px)" }}
        >
          {currentStack.map((item) => (
            <span
              key={item}
              className={chipClass + " hover:border-brand-accent hover:text-white hover:bg-brand-accent/15"}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 18px 6px rgba(220,38,38,0.35)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
