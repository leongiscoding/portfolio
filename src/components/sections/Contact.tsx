"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const socials = [
  { label: "GitHub",   href: "https://github.com/leongiscoding" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/tan-yew-leong-a70aab25b" },
  { label: "WhatsApp", href: "https://wa.me/60123456789" },
];

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef   = useRef<HTMLDivElement>(null);
  const word1Ref   = useRef<HTMLDivElement>(null);
  const word2Ref   = useRef<HTMLDivElement>(null);
  const formRef    = useRef<HTMLFormElement>(null);
  const socialsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Badge
      gsap.from(labelRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
      });

      // Heading clip reveal word by word
      gsap.set([word1Ref.current, word2Ref.current], { y: "110%" });
      gsap.to([word1Ref.current, word2Ref.current], {
        y: "0%",
        stagger: 0.15,
        duration: 1.1,
        ease: "power4.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 72%" },
      });

      // Form fields stagger
      const fields = formRef.current?.querySelectorAll(".form-field");
      if (fields) {
        gsap.from(fields, {
          opacity: 0,
          y: 30,
          stagger: 0.1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: formRef.current, start: "top 80%" },
        });
      }

      // Socials
      gsap.from(socialsRef.current!.children, {
        opacity: 0,
        y: 20,
        stagger: 0.08,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: { trigger: socialsRef.current, start: "top 88%" },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="py-[clamp(72px,10vw,110px)] px-[clamp(24px,6vw,100px)] bg-[#060608] text-white relative overflow-hidden"
    >
      <div className="dot-grid absolute inset-0 z-0" />
      <div className="scan-lines absolute inset-0 z-0" />

      {/* Glow accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <div ref={labelRef} className="flex flex-col items-center gap-4 mb-8">
          <div className="w-12 h-[1px] bg-brand-accent" />
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-brand-accent">
            Final Connect
          </span>
        </div>

        {/* Heading with clip reveal */}
        <h2 className="font-headline font-extrabold text-[clamp(40px,7vw,82px)] leading-none tracking-tight mb-12">
          <div className="overflow-hidden inline-block mr-4">
            <div ref={word1Ref}>Let&apos;s build</div>
          </div>
          <div className="overflow-hidden inline-block">
            <div ref={word2Ref} className="italic font-light opacity-50">tomorrow.</div>
          </div>
        </h2>

        <form ref={formRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="form-field space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-4">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-4 focus:outline-none focus:border-brand-accent transition-colors placeholder:text-white/10 focus:bg-white/8"
            />
          </div>
          <div className="form-field space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-4">
              Email Address
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-4 focus:outline-none focus:border-brand-accent transition-colors placeholder:text-white/10 focus:bg-white/8"
            />
          </div>
          <div className="form-field space-y-2 md:col-span-2">
            <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-4">
              Message
            </label>
            <textarea
              rows={4}
              placeholder="How can I help you?"
              className="w-full bg-white/5 border border-white/10 rounded-[24px] px-8 py-4 focus:outline-none focus:border-brand-accent transition-colors placeholder:text-white/10 focus:bg-white/8"
            />
          </div>
          <div className="form-field md:col-span-2 pt-4">
            <button className="w-full bg-brand-accent text-white py-6 rounded-full font-headline font-extrabold text-xl hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-2xl shadow-brand-accent/20">
              Initialize Project
            </button>
          </div>
        </form>

        <div
          ref={socialsRef}
          className="mt-20 flex flex-wrap justify-center gap-12 font-mono text-[12px] text-white/40 uppercase tracking-widest"
        >
          {socials.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-accent transition-colors duration-200 hover:tracking-[0.3em]"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
