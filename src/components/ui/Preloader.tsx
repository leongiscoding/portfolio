"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export default function Preloader({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const wrapRef    = useRef<HTMLDivElement>(null);
  const topRef     = useRef<HTMLDivElement>(null);
  const botRef     = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const logoRef    = useRef<HTMLDivElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete() {
        if (wrapRef.current) wrapRef.current.style.display = "none";
        onComplete();
      },
    });

    // Entrance
    tl.from(logoRef.current,    { opacity: 0, y: 16, duration: 0.6, ease: "power3.out" }, 0.1)
      .from(taglineRef.current, { opacity: 0, duration: 0.5, ease: "power3.out" }, 0.3)
      .from(counterRef.current, { opacity: 0, duration: 0.3 }, 0.4);

    // Counter + bar fill
    const obj = { n: 0 };
    tl.to(obj, {
      n: 100,
      duration: 2.4,
      ease: "power1.inOut",
      onUpdate() {
        const v = Math.floor(obj.n);
        if (counterRef.current)
          counterRef.current.textContent = String(v).padStart(3, "0");
        if (barFillRef.current)
          barFillRef.current.style.width = `${v}%`;
      },
    }, 0.4);

    // Hold at 100
    tl.to({}, { duration: 0.25 });

    // Curtain split — top flies up, bottom flies down
    tl.to(topRef.current, {
      yPercent: -100,
      duration: 1.0,
      ease: "expo.inOut",
    }, "exit")
    .to(botRef.current, {
      yPercent: 100,
      duration: 1.0,
      ease: "expo.inOut",
    }, "exit")
    .to([logoRef.current, counterRef.current, taglineRef.current], {
      opacity: 0,
      duration: 0.25,
    }, "exit");

    return () => { tl.kill(); };
  }, [onComplete]);

  return (
    <div ref={wrapRef} className="fixed inset-0 z-[9999]" style={{ pointerEvents: "none" }}>
      {/* Curtain panels — purely for the split-exit animation */}
      <div ref={topRef} className="absolute top-0 left-0 right-0 h-1/2 bg-[#080808]" />
      <div ref={botRef} className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#080808]" />

      {/* Content — always centered in the full viewport, above curtains */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-8">
        <div
          ref={logoRef}
          className="font-mono font-bold text-white tracking-[0.35em] text-2xl"
        >
          TYL.
        </div>
        <div
          ref={counterRef}
          className="font-headline font-extrabold leading-none tabular-nums text-white"
          style={{ fontSize: "clamp(64px,18vw,160px)" }}
        >
          000
        </div>

        {/* Loading bar */}
        <div className="w-full max-w-[320px] h-[1px] bg-white/10 relative overflow-hidden">
          <div
            ref={barFillRef}
            className="absolute top-0 left-0 h-full bg-brand-accent"
            style={{ width: "0%", transition: "none" }}
          />
        </div>
        <div
          ref={taglineRef}
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30"
        >
          Portfolio — Edwin Tan
        </div>
      </div>
    </div>
  );
}
