"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const education = [
  {
    index: "01",
    year: "2025",
    yearLabel: "GRADUATING",
    degree: ["Bachelor's in", "Software Engineering"],
    school: "New Era University College",
    icon: "school",
    tag: "UNDERGRADUATE · DEAN'S LIST · CGPA 3.82",
  },
  {
    index: "02",
    year: "2023",
    yearLabel: "GRADUATED",
    degree: ["Diploma in", "Computer Science"],
    school: "New Era University College",
    icon: "laptop_mac",
    tag: "DIPLOMA",
  },
];

export default function Education() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".edu-row").forEach((row) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: row,
            start: "top 78%",
            toggleActions: "play none none none",
          },
        });

        tl.fromTo(
          row.querySelector(".edu-line"),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.9, ease: "power3.out" }
        )
          .fromTo(
            row.querySelector(".edu-index"),
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
            "-=0.5"
          )
          .fromTo(
            row.querySelectorAll(".edu-word"),
            { opacity: 0, y: 60, skewY: 4 },
            {
              opacity: 1,
              y: 0,
              skewY: 0,
              duration: 0.75,
              stagger: 0.12,
              ease: "power3.out",
            },
            "-=0.3"
          )
          .fromTo(
            row.querySelector(".edu-meta"),
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" },
            "-=0.45"
          )
          .fromTo(
            row.querySelector(".edu-year-bg"),
            { opacity: 0, x: 80 },
            { opacity: 1, x: 0, duration: 1.1, ease: "power2.out" },
            "-=0.8"
          );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-[clamp(72px,10vw,110px)] bg-[#080808] text-white overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto px-[clamp(24px,6vw,100px)]">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-24">
          <span className="w-10 h-[1px] bg-brand-accent" />
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-brand-accent">
            Academic Foundation
          </span>
        </div>

        {/* Rows */}
        <div>
          {education.map(({ index, year, yearLabel, degree, school, icon, tag }) => (
            <div
              key={index}
              className="edu-row relative group border-t border-white/10 py-16 cursor-default"
            >
              {/* Hover gradient wash */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-accent/0 via-brand-accent/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />

              {/* Top bar: line + index + tag */}
              <div className="flex items-center gap-4 mb-8">
                <span className="edu-line block h-[1px] w-14 bg-brand-accent origin-left" />
                <span className="edu-index font-mono text-[11px] text-brand-accent tracking-widest opacity-0">
                  {index}
                </span>
                <span className="font-mono text-[11px] text-white/25 tracking-widest">
                  {tag}
                </span>
              </div>

              {/* Main layout */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
                {/* Degree — each word clips separately */}
                <div>
                  {degree.map((line) => (
                    <div key={line} className="overflow-hidden leading-none">
                      <span
                        className="edu-word inline-block font-headline font-bold text-white opacity-0"
                        style={{ fontSize: "clamp(40px, 6.5vw, 88px)", lineHeight: 1.05 }}
                      >
                        {line}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Meta: school + year + icon */}
                <div className="edu-meta flex flex-col items-start lg:items-end gap-3 shrink-0 opacity-0">
                  <p className="text-white/50 text-[17px] tracking-wide">{school}</p>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-white/30 tracking-widest uppercase">
                      {yearLabel}
                    </span>
                    <span className="font-mono text-[11px] text-brand-accent tracking-widest">
                      {year}
                    </span>
                    <span className="material-symbols-outlined text-[22px] text-brand-accent/40 group-hover:text-brand-accent group-hover:rotate-12 transition-all duration-500">
                      {icon}
                    </span>
                  </div>
                </div>
              </div>

              {/* Giant watermark year */}
              <div
                className="edu-year-bg absolute right-[-2vw] top-1/2 -translate-y-1/2 font-headline font-bold select-none pointer-events-none leading-none text-white/[0.028] group-hover:text-white/[0.055] transition-all duration-700 opacity-0"
                style={{ fontSize: "clamp(140px, 22vw, 300px)" }}
                aria-hidden
              >
                {year}
              </div>
            </div>
          ))}

          {/* Bottom rule */}
          <div className="border-t border-white/10" />
        </div>
      </div>
    </section>
  );
}
