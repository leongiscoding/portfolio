"use client";

import { Fragment, useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function About() {
  const sectionRef  = useRef<HTMLElement>(null);
  const badgeRef    = useRef<HTMLDivElement>(null);
  const headingRef  = useRef<HTMLHeadingElement>(null);
  const bodyRef     = useRef<HTMLDivElement>(null);
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

      // Typewriter: each line types at ~55 ms/char with random inter-line pauses
      const codeEls = codeRef.current?.querySelectorAll<HTMLElement>(".code-line code");
      const cursorEls = codeRef.current?.querySelectorAll<HTMLElement>(".code-line .tw-cursor");
      if (codeEls && codeEls.length) {
        gsap.set(codeEls, { clipPath: "inset(0 100% 0 0)" });

        const lines = Array.from(codeEls);
        const cursors = cursorEls ? Array.from(cursorEls) : [];
        let cumDelay = 0;

        ScrollTrigger.create({
          trigger: codeRef.current,
          start: "top 75%",
          once: true,
          onEnter: () => {
            lines.forEach((el, index) => {
              const chars = Math.max(el.textContent?.length ?? 8, 1);
              // 40–75 ms per character — varies per line for a human feel
              const msPerChar = 65 + Math.random() * 30;
              const dur = Math.max((chars * msPerChar) / 1000, 0.10);
              const cursor = cursors[index];

              if (cursor) {
                // Anchor cursor at the left edge of this code element
                gsap.set(cursor, { left: el.offsetLeft });
                // Show cursor when line starts typing
                gsap.to(cursor, { opacity: 1, duration: 0, delay: cumDelay });
                // Move cursor right in lock-step with the clipPath reveal
                gsap.to(cursor, {
                  left: el.offsetLeft + el.offsetWidth,
                  duration: dur,
                  ease: `steps(${chars})`,
                  delay: cumDelay,
                });
              }

              gsap.to(el, {
                clipPath: "inset(0 0% 0 0)",
                duration: dur,
                // one step per character → each step reveals exactly one char width
                ease: `steps(${chars})`,
                delay: cumDelay,
              });

              if (cursor) {
                if (index < lines.length - 1) {
                  // Hide when line finishes; next line's cursor takes over
                  gsap.to(cursor, { opacity: 0, duration: 0, delay: cumDelay + dur });
                } else {
                  // Last line: blink at the final position once typing finishes
                  gsap.delayedCall(cumDelay + dur, () => {
                    cursor.classList.add("tw-cursor--blink");
                  });
                }
              }

              // Inter-line pause: 80–260 ms (simulates thinking before next line)
              cumDelay += dur + 0.15 + Math.random() * 0.25;
            });
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  const codeLines = [
    <Fragment key="l1"><span className="text-[#C678DD]">const</span> <span className="text-[#E06C75]">developer</span> = {"{"}</Fragment>,
    <span key="l2" className="ml-4">name: <span className="text-[#98C379]">&apos;Edwin Tan&apos;</span>,</span>,
    <span key="l3" className="ml-4">focus: <span className="text-[#98C379]">&apos;Full Stack Developer&apos;</span>,</span>,
    <span key="l4" className="ml-4">location: <span className="text-[#98C379]">&apos;Malaysia&apos;</span>,</span>,
    <span key="l5" className="ml-4">languages: {"{"}</span>,
    <span key="l6" className="ml-8">mandarin: <span className="text-[#98C379]">&apos;Native&apos;</span>,</span>,
    <span key="l7" className="ml-8">malay: <span className="text-[#98C379]">&apos;Fluent&apos;</span>,</span>,
    <span key="l7b" className="ml-8">english: <span className="text-[#98C379]">&apos;Fluent&apos;</span>,</span>,
    <span key="l7c" className="ml-4">{"}"}</span>,
    <span key="l8" className="ml-4">passionate: <span className="text-[#E06C75]">true</span></span>,
    <Fragment key="l9">{"}"};</Fragment>,
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

          <div className="p-4 md:p-8 font-mono text-[11px] md:text-[13px] leading-relaxed overflow-x-hidden">
            {codeLines.map((line, i) => (
              <div key={i} className="code-line relative flex gap-1 items-center">
                <span className="text-white/20 select-none w-7 md:w-9 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <code className="text-white inline-block overflow-hidden whitespace-nowrap">{line}</code>
                <span className="tw-cursor absolute top-1/2 -translate-y-1/2 w-[2px] h-[1em] bg-brand-accent opacity-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
