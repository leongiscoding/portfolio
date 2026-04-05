"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const projects = [
  {
    num: "01",
    title: "Food Detection System",
    desc: "Mobile application that identifies food using image classification and machine learning, deployed with TensorFlow Lite for on-device inference.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA6ELisx82nV7xQYXBXRrIYpAYODuFr1ToR6eV07-XJrETLaodDETohHj91fRWMEcZfaMUwon2rkHJJZItgvfWj80LXsm_qi2YB8RxWOE7kt7q9VtxZDGG8oZPmLJYo2EiTuw0Zz26B037FTgpf6Qar1eoNw-JKohJ8rkyoUwA8W7ay6TlJq0DBgilUb_F9SWRUagBHIfzueeC0vpM21FgtYrcLhGuQqeOyop3BdazLMLoRaHdVWOIyb0Pho0XBe99Doq-714C1taT2",
    tags: ["Flutter", "TensorFlow Lite", "Firebase"],
    year: "2024",
  },
  {
    num: "02",
    title: "Note Application",
    desc: "A clean and efficient CRUD mobile application with offline-first local database storage, built with Flutter and Isar for high-performance data handling.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD0qP90zIZnYpmtJG9zJoB7qLn8NNfzGnM929pJYTF22keOFyF49xK6bjeBFIfBTxQuHamwUNykm7fJ1CqTSK0lx6XEWLX9SLiN3HH-7onniF8bbfVjxjnpwQRkVTFQTGbHwoN7PyEWk8oGW3YXgnEnN5vyBEvVPH6WNxMLsMVbQ0SZPN-Gzlhkg7-iQG4QhC3X-b6nkIZQEoXLiGNAgpH1HQYRNLlQXFuWz__-9JMl_1dBV5lVjSaCcY4CU63p1tC9akyV2DHcH1ej",
    tags: ["Flutter", "Dart", "Isar DB"],
    year: "2023",
  },
];

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef    = useRef<HTMLDivElement>(null);
  const cardsRef   = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];

      // All cards start off-screen to the right, invisible
      gsap.set(cards, { xPercent: 110, opacity: 0 });

      // Header reveal
      gsap.from(headRef.current!.children, {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
      });

      // Master timeline — cards enter/exit one by one
      const tl = gsap.timeline();

      cards.forEach((card, i) => {
        if (i === 0) {
          // First card: slide in from right
          tl.to(card, { xPercent: 0, opacity: 1, duration: 1, ease: "power2.out" });
          // Hold so user can read
          tl.to({}, { duration: 0.8 });
        } else {
          // Slide previous card out (subtle push-left + fade)
          // Simultaneously slide current card in from right
          tl.to(cards[i - 1], { xPercent: -12, opacity: 0, duration: 1, ease: "power2.in" });
          tl.to(card,          { xPercent:   0, opacity: 1, duration: 1, ease: "power2.out" }, "<");
          // Hold on last card
          tl.to({}, { duration: 0.8 });
        }
      });

      // Pin section and scrub the master timeline
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: () => `+=${window.innerHeight * cards.length * 2}`,
        pin: true,
        scrub: 1.2,
        animation: tl,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative h-screen bg-[#080808] text-white flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div
        ref={headRef}
        className="shrink-0 px-[clamp(24px,6vw,100px)] pt-[clamp(20px,2.5vw,36px)] pb-4 relative z-10"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="w-10 h-[1px] bg-brand-accent" />
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-brand-accent">
            Selected Builds
          </span>
        </div>
        <div className="flex items-end justify-between">
          <h2 className="font-headline font-extrabold text-[clamp(32px,5vw,52px)] leading-tight tracking-[-0.04em]">
            High-Fidelity Work.
          </h2>
          <span className="font-mono text-[11px] text-white/30 uppercase tracking-widest hidden md:block">
            Scroll to explore →
          </span>
        </div>
      </div>

      {/* Stacked cards — each absolutely fills the content area */}
      <div className="relative flex-1 overflow-hidden">
        {projects.map(({ num, title, desc, image, tags, year }, i) => (
          <div
            key={num}
            ref={(el) => { cardsRef.current[i] = el; }}
            className="proj-card absolute inset-x-[clamp(24px,6vw,100px)] top-[clamp(12px,2vw,24px)] bottom-[clamp(40px,5.5vw,72px)] rounded-[20px] overflow-hidden border border-white/8 group cursor-pointer"
            style={{ zIndex: i + 1 }}
          >
            {/* Big number watermark */}
            <div className="absolute inset-0 flex items-center justify-end pr-6 pointer-events-none z-[1] overflow-hidden">
              <span
                className="font-headline font-extrabold text-white select-none"
                style={{ fontSize: "clamp(120px,20vw,220px)", opacity: 0.04, lineHeight: 1 }}
              >
                {num}
              </span>
            </div>

            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={title}
              className="proj-img absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-700"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-[#080808]/20 z-[2]" />

            {/* Hover accent */}
            <div className="absolute inset-0 bg-brand-accent/0 group-hover:bg-brand-accent/6 transition-all duration-700 z-[3]" />

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 z-[4]">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[9px] md:text-[10px] font-mono border border-white/10 uppercase tracking-widest whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-end gap-3">
                <div className="min-w-0">
                  <h3
                    className="font-headline font-bold leading-tight tracking-tight mb-2 group-hover:text-brand-accent transition-colors duration-400"
                    style={{ fontSize: "clamp(22px,4vw,52px)" }}
                  >
                    {title}
                  </h3>
                  <p className="text-white/45 text-sm md:text-base max-w-sm leading-relaxed line-clamp-3">{desc}</p>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <span className="font-mono text-white/25 text-xs">{year}</span>
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-brand-accent group-hover:border-brand-accent group-hover:rotate-45 transition-all duration-400">
                    <span className="material-symbols-outlined text-sm">north_east</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
