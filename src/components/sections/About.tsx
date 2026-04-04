"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function About() {
  const sectionRef  = useRef<HTMLElement>(null);
  const badgeRef    = useRef<HTMLDivElement>(null);
  const headingRef  = useRef<HTMLHeadingElement>(null);
  const bodyRef     = useRef<HTMLDivElement>(null);
  const yearsRef    = useRef<HTMLDivElement>(null);
  const projRef     = useRef<HTMLDivElement>(null);
  const counterRef  = useRef<HTMLDivElement>(null);
  const codeRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Left column reveal
      gsap.from([badgeRef.current, headingRef.current, bodyRef.current], {
        opacity: 0,
        y: 50,
        stagger: 0.15,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      });

      // Counters animate up
      ScrollTrigger.create({
        trigger: counterRef.current,
        start: "top 85%",
        once: true,
        onEnter: () => {
          const yearsObj = { val: 0 };
          gsap.to(yearsObj, {
            val: 8,
            duration: 1.8,
            ease: "power2.out",
            onUpdate() {
              if (yearsRef.current)
                yearsRef.current.textContent = `${Math.round(yearsObj.val)}+`;
            },
          });

          const projObj = { val: 0 };
          gsap.to(projObj, {
            val: 42,
            duration: 2,
            ease: "power2.out",
            onUpdate() {
              if (projRef.current)
                projRef.current.textContent = `${Math.round(projObj.val)}`;
            },
          });
        },
      });

      // Code widget slides in from right
      gsap.from(codeRef.current, {
        opacity: 0,
        x: 60,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: codeRef.current,
          start: "top 80%",
        },
      });

      // Typewriter: clip each code element left→right, line by line
      const codeEls = codeRef.current?.querySelectorAll<HTMLElement>(".code-line code");
      if (codeEls && codeEls.length) {
        gsap.set(codeEls, { clipPath: "inset(0 100% 0 0)" });
        gsap.to(codeEls, {
          clipPath: "inset(0 0% 0 0)",
          duration: 0.5,
          ease: "steps(20)",
          stagger: 0.42,
          scrollTrigger: {
            trigger: codeRef.current,
            start: "top 75%",
          },
          onComplete() {
            const cursor = codeRef.current?.querySelector<HTMLElement>(".tw-cursor");
            if (cursor) gsap.to(cursor, { opacity: 1, duration: 0 });
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  const codeLines = [
    <><span className="text-[#C678DD]">const</span> <span className="text-[#E06C75]">developer</span> = {"{"}</>,
    <span className="ml-4">name: <span className="text-[#98C379]">&apos;Edwin Tan&apos;</span>,</span>,
    <span className="ml-4">focus: <span className="text-[#98C379]">&apos;Full Stack Architect&apos;</span>,</span>,
    <span className="ml-4">stack: [</span>,
    <span className="ml-8 text-[#D19A66]">&apos;React&apos;, &apos;TypeScript&apos;,</span>,
    <span className="ml-8 text-[#D19A66]">&apos;Node.js&apos;, &apos;PostgreSQL&apos;</span>,
    <span className="ml-4">],</span>,
    <span className="ml-4">passionate: <span className="text-[#E06C75]">true</span></span>,
    <>{"}"};</>,
  ];

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-[clamp(72px,10vw,110px)] px-[clamp(24px,6vw,100px)] bg-[#0A0A0A] text-white relative overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl mx-auto items-center">
        {/* Left */}
        <div className="space-y-8">
          <div ref={badgeRef} className="inline-flex items-center gap-2 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-brand-accent">
              The Story
            </span>
          </div>

          <h2
            ref={headingRef}
            className="font-headline font-extrabold text-[clamp(32px,5vw,52px)] leading-tight tracking-[-0.04em]"
          >
            Blending visual art with{" "}
            <span className="text-on-surface-variant italic font-light">clean code.</span>
          </h2>

          <div ref={bodyRef} className="space-y-4 text-on-surface-variant leading-relaxed text-lg">
            <p>
              I started my journey in graphic design before diving head-first into
              the world of computer science. This unique blend allows me to
              approach development with an eye for aesthetics and a mind for logic.
            </p>
            <p>
              Currently focused on building scalable SaaS architectures and
              immersive WebGL experiences using the latest industry standards.
            </p>
          </div>

          <div ref={counterRef} className="flex gap-12 pt-4">
            <div>
              <div
                ref={yearsRef}
                className="font-headline font-extrabold text-4xl mb-1 tabular-nums"
              >
                0+
              </div>
              <div className="font-mono text-[11px] uppercase tracking-wider opacity-60">
                Years Experience
              </div>
            </div>
            <div>
              <div
                ref={projRef}
                className="font-headline font-extrabold text-4xl mb-1 tabular-nums"
              >
                0
              </div>
              <div className="font-mono text-[11px] uppercase tracking-wider opacity-60">
                Projects Built
              </div>
            </div>
          </div>
        </div>

        {/* Right: code widget */}
        <div
          ref={codeRef}
          className="bg-[#080808] rounded-[20px] overflow-hidden shadow-2xl border border-white/10"
        >
          <div className="bg-[#1A1A1A] px-6 py-3 flex items-center justify-between border-b border-white/5">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
            </div>
            <span className="font-mono text-[10px] text-white/40">developer.ts</span>
          </div>

          <div className="p-8 font-mono text-[13px] leading-relaxed">
            {codeLines.map((line, i) => (
              <div key={i} className="code-line flex gap-4">
                <span className="text-white/20 select-none w-5 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <code className="text-white block overflow-hidden w-full">{line}</code>
              </div>
            ))}
            <span className="tw-cursor inline-block w-[2px] h-[1em] bg-brand-accent ml-9 mt-1 opacity-0" />
          </div>
        </div>
      </div>
    </section>
  );
}
