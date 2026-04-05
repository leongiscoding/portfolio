"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "@/lib/gsap";

const menuLinks = [
  { label: "About",      href: "#about"      },
  { label: "Skills",     href: "#skills"      },
  { label: "Experience", href: "#experience"  },
  { label: "Projects",   href: "#projects"    },
  { label: "Education",  href: "#education"   },
  { label: "Contact",    href: "#contact"     },
];

export default function HamburgerMenu() {
  const [open, setOpen]       = useState(false);
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const linksRef   = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const tlRef      = useRef<gsap.core.Timeline | null>(null);

  /* mount guard for createPortal (SSR safe) */
  useEffect(() => { setMounted(true); }, []);

  /* ── Lock / unlock body scroll ─────────────────── */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* ── GSAP open / close ─────────────────────────── */
  useEffect(() => {
    if (!overlayRef.current || !linksRef.current) return;

    tlRef.current?.kill();

    if (open) {
      gsap.set(overlayRef.current, { display: "flex" });

      tlRef.current = gsap.timeline()
        .fromTo(overlayRef.current,
          { clipPath: "inset(0 0 100% 0)" },
          { clipPath: "inset(0 0 0% 0)", duration: 0.65, ease: "power4.inOut" }
        )
        .fromTo(
          linksRef.current.querySelectorAll("a"),
          { y: 90, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.07, duration: 0.65, ease: "power3.out" },
          "-=0.25"
        )
        .fromTo(
          contactRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
          "-=0.55"
        );
    } else {
      tlRef.current = gsap.timeline({
        onComplete: () => {
          if (overlayRef.current) gsap.set(overlayRef.current, { display: "none" });
        },
      })
        .to(linksRef.current.querySelectorAll("a"),
          { y: -50, opacity: 0, stagger: 0.04, duration: 0.3, ease: "power2.in" }
        )
        .to(overlayRef.current,
          { clipPath: "inset(0 0 100% 0)", duration: 0.5, ease: "power4.inOut" },
          "-=0.1"
        );
    }
  }, [open]);

  const close = () => setOpen(false);

  const overlay = (
    <div
      ref={overlayRef}
      style={{ display: "none", clipPath: "inset(0 0 100% 0)" }}
      className="fixed inset-0 z-[200] bg-[#0A0A0A] flex"
    >
      {/* Logo (top-left) */}
      <div className="absolute top-0 left-0 h-16 flex items-center px-6 md:px-12">
        <span className="font-mono font-bold text-xl tracking-[0.12em] text-white">
          TYL.
        </span>
      </div>

      {/* Close button (top-right) */}
      <button
        onClick={close}
        aria-label="Close menu"
        className="absolute top-4 right-6 md:right-10 w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white transition-all duration-200 cursor-pointer"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
      </button>

      {/* Left: contact info */}
      <div
        ref={contactRef}
        className="hidden lg:flex flex-col justify-end pb-14 pl-12 w-[280px] border-r border-white/10 shrink-0"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-5">
          Get In Touch
        </p>
        <a
          href="https://wa.me/60123456789"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm text-white/70 hover:text-brand-accent transition-colors mb-1"
        >
          WhatsApp
        </a>
        <p className="font-mono text-sm text-white/40 mb-8">+60 18-363 1583</p>
        <div className="flex gap-5">
          {[
            { label: "GitHub",   href: "https://github.com/leongiscoding" },
            { label: "LinkedIn", href: "https://www.linkedin.com/in/tan-yew-leong-a70aab25b" },
            { label: "WhatsApp", href: "https://wa.me/60123456789" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] uppercase tracking-widest text-white/35 hover:text-brand-accent transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Right: nav links */}
      <div className="flex-1 flex flex-col justify-center px-[clamp(32px,8vw,120px)]">
        <div ref={linksRef} className="space-y-0">
          {menuLinks.map(({ label, href }) => (
            <div key={label}>
              <a
                href={href}
                onClick={close}
                className="relative inline-block font-headline font-extrabold text-white leading-[0.95] tracking-[-0.04em] whitespace-nowrap"
                style={{ fontSize: "clamp(44px, 9vw, 110px)" }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  const chars = Array.from(el.querySelectorAll<HTMLElement>(".char"));
                  // Kill any existing wave on this link
                  (el as any)._waveTl?.kill();
                  gsap.killTweensOf(chars);

                  // Build a staggered timeline that repeats — chars stay permanently
                  // phase-offset so the wave ripples continuously while hovering
                  const tl = gsap.timeline({ repeat: -1 });
                  chars.forEach((char, i) => {
                    tl.fromTo(
                      char,
                      { y: 0 },
                      { y: -16, duration: 0.36, ease: "sine.inOut", yoyo: true, repeat: 1 },
                      i * 0.07   // offset each char within the timeline
                    );
                  });
                  (el as any)._waveTl = tl;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  const chars = el.querySelectorAll<HTMLElement>(".char");
                  (el as any)._waveTl?.kill();
                  delete (el as any)._waveTl;
                  gsap.killTweensOf(chars);
                  gsap.to(chars, { y: 0, duration: 0.45, ease: "power3.out", stagger: 0.025 });
                }}
              >
                {/* Per-character spans for wave animation */}
                <span className="relative z-10 inline-flex flex-nowrap">
                  {label.split("").map((char, i) => (
                    <span key={i} className="char inline-block">{char}</span>
                  ))}
                </span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Hamburger trigger ──────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex flex-col justify-center gap-[5px] p-2 group cursor-pointer"
      >
        <span className="block h-[1.5px] bg-white transition-all duration-300 w-6 group-hover:w-7" />
        <span className="block h-[1.5px] bg-white w-7" />
        <span className="block h-[1.5px] bg-white transition-all duration-300 w-5 group-hover:w-7" />
      </button>

      {/* ── Portal: overlay renders directly in body ─ */}
      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
