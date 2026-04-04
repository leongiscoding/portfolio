"use client";

import { useRef, ReactNode } from "react";
import { gsap } from "@/lib/gsap";

interface Props {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function MagneticButton({ children, className, onClick }: Props) {
  const btnRef   = useRef<HTMLButtonElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = btnRef.current!.getBoundingClientRect();
    const cx   = rect.left + rect.width / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = e.clientX - cx;
    const dy   = e.clientY - cy;

    gsap.to(btnRef.current,  { x: dx * 0.38, y: dy * 0.38, duration: 0.5, ease: "power3.out" });
    gsap.to(innerRef.current,{ x: dx * 0.15, y: dy * 0.15, duration: 0.5, ease: "power3.out" });
  };

  const onLeave = () => {
    gsap.to(btnRef.current,  { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1.1,0.5)" });
    gsap.to(innerRef.current,{ x: 0, y: 0, duration: 0.8, ease: "elastic.out(1.1,0.5)" });
  };

  const onDown = () => gsap.to(btnRef.current, { scale: 0.94, duration: 0.15 });
  const onUp   = () => gsap.to(btnRef.current, { scale: 1,    duration: 0.4, ease: "elastic.out(1.2,0.5)" });

  return (
    <button
      ref={btnRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onMouseDown={onDown}
      onMouseUp={onUp}
      onClick={onClick}
      className={className}
    >
      <span ref={innerRef} className="flex items-center gap-2 w-full h-full justify-center">
        {children}
      </span>
    </button>
  );
}
