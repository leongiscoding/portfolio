// COMPONENT: <Blog>
// OWNS: Blog section placeholder — "coming soon" state
// DO NOT TOUCH FROM OUTSIDE: sectionRef / GSAP context
// CALLED BY: src/app/page.tsx (rendered after <Experience />)
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export default function Blog() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current!.children, {
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

      gsap.from(cardRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="blog"
      ref={sectionRef}
      className="py-[clamp(72px,10vw,110px)] bg-[#080808] text-white"
    >
      <div className="max-w-7xl mx-auto px-[clamp(24px,6vw,100px)]">
        {/* Header */}
        <div ref={headerRef}>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-[1px] bg-brand-accent" />
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-brand-accent">
              Blog
            </span>
          </div>
          <h2 className="font-headline font-extrabold text-[clamp(32px,5vw,52px)] leading-tight tracking-[-0.04em] mb-16">
            The Dev Journal.
          </h2>
        </div>

        {/* Coming soon card */}
        <div
          ref={cardRef}
          className="relative border border-white/8 rounded-[20px] overflow-hidden bg-[#0D0D0D] px-[clamp(32px,6vw,80px)] py-[clamp(48px,8vw,96px)] flex flex-col items-center justify-center text-center gap-6"
        >
          {/* Corner brackets */}
          <span className="absolute top-0 left-0 w-7 h-7 border-t border-l border-brand-accent/40" />
          <span className="absolute top-0 right-0 w-7 h-7 border-t border-r border-brand-accent/40" />
          <span className="absolute bottom-0 left-0 w-7 h-7 border-b border-l border-brand-accent/40" />
          <span className="absolute bottom-0 right-0 w-7 h-7 border-b border-r border-brand-accent/40" />

          <div className="w-12 h-12 rounded-[14px] bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent">
            <span className="material-symbols-outlined text-[24px]">edit_note</span>
          </div>

          <div className="space-y-3">
            <p className="font-headline font-bold text-2xl text-white">
              Coming Soon
            </p>
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-white/30">
              Articles, tutorials, and dev notes are on the way.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-brand-accent/60">
              In Progress
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
