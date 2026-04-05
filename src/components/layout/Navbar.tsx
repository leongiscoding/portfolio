"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

// useLayoutEffect fires synchronously before the browser paints — prevents
// content flashing at natural position when the preloader curtain opens.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
import { gsap } from "@/lib/gsap";
import HamburgerMenu from "@/components/ui/HamburgerMenu";

const links = ["About", "Skills", "Experience", "Projects", "Contact"];

export default function Navbar({ ready }: { ready: boolean }) {
  const navRef   = useRef<HTMLElement>(null);
  const logoRef  = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const btnRef   = useRef<HTMLButtonElement>(null);

  useIsomorphicLayoutEffect(() => {
    // Always set nav off-screen before any paint so the curtain never
    // exposes it at its natural (visible) position.
    gsap.set(navRef.current, { y: -72, opacity: 0 });

    if (!ready) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(navRef.current,  { y: 0, opacity: 1, duration: 0.65 })
        .from(logoRef.current,  { opacity: 0, x: -12, duration: 0.45 }, "-=0.3")
        .from(linksRef.current!.children, { opacity: 0, y: -8, stagger: 0.06, duration: 0.35 }, "-=0.25")
        .from(btnRef.current,   { opacity: 0, x: 12, duration: 0.35 }, "-=0.3");
    });

    return () => ctx.revert();
  }, [ready]);

  /* ── Hide on scroll-down, reveal on scroll-up ───── */
  useEffect(() => {
    if (!ready) return;

    let lastY    = window.scrollY;
    let isHidden = false;

    const onScroll = () => {
      const currentY = window.scrollY;
      const delta    = currentY - lastY;

      if (currentY < 80) {
        // Always visible near the top
        if (isHidden) {
          gsap.to(navRef.current, { y: 0, duration: 0.38, ease: "power2.out" });
          isHidden = false;
        }
      } else if (delta > 5 && !isHidden) {
        // Scrolling down — slide out
        gsap.to(navRef.current, { y: -72, duration: 0.32, ease: "power2.in" });
        isHidden = true;
      } else if (delta < -5 && isHidden) {
        // Scrolling up — slide back in
        gsap.to(navRef.current, { y: 0, duration: 0.38, ease: "power2.out" });
        isHidden = false;
      }

      lastY = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ready]);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 w-full z-[100] bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/10 flex justify-between items-center h-16 px-6 md:px-12"
    >
      <div ref={logoRef} className="font-mono font-bold text-xl tracking-[0.12em] text-white">
        TYL.
      </div>

      <div ref={linksRef} className="hidden md:flex gap-8 items-center font-headline font-medium tracking-tight text-sm">
        {links.map((label, i) => (
          <a
            key={label}
            href={`#${label.toLowerCase()}`}
            className={`pb-0.5 transition-all duration-200 hover:border-b-2 hover:border-brand-accent ${
              i === 0
                ? "text-brand-accent font-bold border-b-2 border-brand-accent"
                : "text-white/60 hover:text-white"
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          ref={btnRef}
          className="bg-brand-accent text-white px-6 py-2 rounded-full font-label text-sm font-bold hover:opacity-80 hover:scale-105 transition-all active:scale-95 duration-200"
        >
          Resume
        </button>
        <HamburgerMenu />
      </div>
    </nav>
  );
}
