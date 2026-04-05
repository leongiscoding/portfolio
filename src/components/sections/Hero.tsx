"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
import dynamic from "next/dynamic";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import MagneticButton from "@/components/ui/MagneticButton";

const HeroCanvas = dynamic(() => import("@/components/three/HeroCanvas"), { ssr: false });

const LINE1 = "EDWIN";
const LINE2 = "TAN.";

export default function Hero({ ready }: { ready: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const badgeRef   = useRef<HTMLDivElement>(null);
  const metaRef    = useRef<HTMLDivElement>(null);
  const ctaRef     = useRef<HTMLDivElement>(null);

  const l1 = useRef<(HTMLSpanElement | null)[]>(Array(LINE1.length).fill(null));
  const l2 = useRef<(HTMLSpanElement | null)[]>(Array(LINE2.length).fill(null));

  useIsomorphicLayoutEffect(() => {
    const allChars = [...l1.current, ...l2.current].filter(Boolean) as HTMLSpanElement[];

    // Always hide hero elements before any paint — this runs synchronously
    // before the browser renders, so the curtain never reveals them at their
    // natural (fully-visible) position.
    gsap.set(allChars, { y: "115%", rotate: 4, opacity: 0 });
    gsap.set([badgeRef.current, metaRef.current, ctaRef.current], {
      opacity: 0,
      y: 28,
    });

    if (!ready) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.to(badgeRef.current, { opacity: 1, y: 0, duration: 0.7 })
        .to(allChars, {
          y: "0%",
          rotate: 0,
          opacity: 1,
          stagger: 0.038,
          duration: 1.05,
        }, "-=0.35")
        .to(metaRef.current,  { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
        .to(ctaRef.current,   { opacity: 1, y: 0, duration: 0.7 }, "-=0.6");

      // Scroll parallax
      gsap.to(sectionRef.current, {
        yPercent: 16,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [ready]);

  return (
    <header
      ref={sectionRef}
      className="relative min-h-screen flex items-center px-6 md:px-12 grid-overlay overflow-hidden"
    >
      {/* Three.js */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <HeroCanvas />
      </div>

      {/* Left-side vignette for readability */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 75% 80% at 18% 50%, rgba(10,10,10,0.90) 0%, rgba(10,10,10,0.50) 55%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div className="max-w-[960px] w-full z-10 relative">
        {/* Badge */}
        <div ref={badgeRef} className="flex items-center gap-3 mb-6">
          <span className="w-10 h-[1px] bg-brand-accent" />
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-brand-accent">
            Available for hire
          </span>
        </div>

        {/* Heading — per-character split */}
        <h1 className="font-headline font-extrabold text-[clamp(58px,11vw,128px)] leading-[0.9] tracking-[-0.04em] text-on-surface mb-8 select-none">
          <div className="overflow-hidden pb-2">
            {LINE1.split("").map((char, i) => (
              <span key={i} className="inline-block overflow-hidden">
                <span
                  ref={(el) => { l1.current[i] = el; }}
                  className="inline-block"
                >
                  {char}
                </span>
              </span>
            ))}
          </div>
          <div className="overflow-hidden pb-2">
            {LINE2.split("").map((char, i) => (
              <span key={i} className="inline-block overflow-hidden">
                <span
                  ref={(el) => { l2.current[i] = el; }}
                  className="inline-block text-brand-accent"
                >
                  {char}
                </span>
              </span>
            ))}
          </div>
        </h1>

        {/* Role + description */}
        <div
          ref={metaRef}
          className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-12 mb-12"
        >
          <div className="font-mono text-sm border-l-2 border-white/20 pl-4 py-1">
            <span className="text-on-surface-variant">~/roles: </span>
            <span className="text-on-surface font-bold">Full Stack Developer</span>
            <span className="animate-pulse text-brand-accent">_</span>
          </div>
          <p className="max-w-md text-on-surface-variant leading-relaxed">
            Architecting high-performance digital experiences where precision
            engineering meets minimalist design.
          </p>
        </div>

        {/* CTAs — magnetic */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row flex-wrap gap-4">
          <MagneticButton
            onClick={() => document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" })}
            className="w-full sm:w-auto justify-center bg-white text-[#0A0A0A] px-8 py-4 rounded-full font-label font-bold hover:bg-brand-accent hover:text-white transition-colors duration-300"
          >
            View My Work{" "}
            <span className="material-symbols-outlined text-sm">arrow_outward</span>
          </MagneticButton>
          <MagneticButton
            onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
            className="w-full sm:w-auto justify-center border border-white/30 text-white px-8 py-4 rounded-full font-label font-bold hover:bg-white/10 transition-colors duration-300"
          >
            Get In Touch
          </MagneticButton>
        </div>
      </div>

    </header>
  );
}
