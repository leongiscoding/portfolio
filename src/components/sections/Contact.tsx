"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

const socials = [
  { label: "GitHub",   href: "https://github.com/leongiscoding" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/tan-yew-leong-a70aab25b" },
  { label: "WhatsApp", href: "https://wa.me/60183631583" },
];

interface FormState { name: string; email: string; message: string; }
interface Errors    { name?: string; email?: string; message?: string; }

export default function Contact() {
  const sectionRef  = useRef<HTMLElement>(null);
  const labelRef    = useRef<HTMLDivElement>(null);
  const word1Ref    = useRef<HTMLDivElement>(null);
  const word2Ref    = useRef<HTMLDivElement>(null);
  const formRef     = useRef<HTMLFormElement>(null);
  const socialsRef  = useRef<HTMLDivElement>(null);
  const toastRef    = useRef<HTMLDivElement>(null);

  const [form,      setForm]      = useState<FormState>({ name: "", email: "", message: "" });
  const [errors,    setErrors]    = useState<Errors>({});
  const [toast,     setToast]     = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [timestamp, setTimestamp] = useState("");
  const successRef     = useRef<HTMLDivElement>(null);
  const successTextRef = useRef<HTMLDivElement>(null);
  const twLine1Ref     = useRef<HTMLSpanElement>(null);
  const twLine2Ref     = useRef<HTMLSpanElement>(null);
  const twCursorRef    = useRef<HTMLSpanElement>(null);

  /* ── Animate success panel on mount ────────────────────── */
  useEffect(() => {
    if (!submitted || !successRef.current) return;
    const text = successTextRef.current;
    const L1 = "UPLINK", L2 = "ESTABLISHED", cps = 0.13; // slower per-char

    // Panel entrance
    gsap.fromTo(successRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }
    );

    // Sub-elements fade up
    if (text) {
      gsap.fromTo(Array.from(text.children),
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.55, ease: "power3.out", delay: 0.8 }
      );
    }

    // Cursor — blinks continuously throughout the loop
    gsap.set(twCursorRef.current, { opacity: 1 });
    gsap.to(twCursorRef.current, {
      opacity: 0,
      duration: 0.45,
      repeat: -1,
      yoyo: true,
      ease: "steps(1)",
    });

    // Looping typewriter: type line1 → type line2 → hold → erase line2 → erase line1 → hold → repeat
    gsap.set([twLine1Ref.current, twLine2Ref.current], { clipPath: "inset(0 100% 0 0)" });

    const dur1  = L1.length * cps;
    const dur2  = L2.length * cps;
    const edur1 = dur1 * 0.65;  // erase slightly faster
    const edur2 = dur2 * 0.65;

    const loop = gsap.timeline({ repeat: -1, delay: 0.5 });
    loop
      .to(twLine1Ref.current, { clipPath: "inset(0 0% 0 0)",   duration: dur1,  ease: `steps(${L1.length})` })
      .to(twLine2Ref.current, { clipPath: "inset(0 0% 0 0)",   duration: dur2,  ease: `steps(${L2.length})` })
      .to({}, { duration: 2.0 })                                              // hold
      .to(twLine2Ref.current, { clipPath: "inset(0 100% 0 0)", duration: edur2, ease: `steps(${L2.length})` })
      .to(twLine1Ref.current, { clipPath: "inset(0 100% 0 0)", duration: edur1, ease: `steps(${L1.length})` })
      .to({}, { duration: 0.7 });                                             // pause before repeat
  }, [submitted]);

  /* ── Animate toast in/out ───────────────────────────────── */
  useEffect(() => {
    if (!toast || !toastRef.current) return;
    gsap.fromTo(toastRef.current,
      { y: 24, opacity: 0 },
      { y: 0,  opacity: 1, duration: 0.35, ease: "power3.out" }
    );
    const t = setTimeout(() => {
      gsap.to(toastRef.current, {
        y: -12, opacity: 0, duration: 0.3, ease: "power2.in",
        onComplete: () => setToast(null),
      });
    }, 3200);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── GSAP scroll animations ─────────────────────────────── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(labelRef.current, {
        opacity: 0, y: 20, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
      });
      gsap.set([word1Ref.current, word2Ref.current], { y: "110%" });
      gsap.to([word1Ref.current, word2Ref.current], {
        y: "0%", stagger: 0.15, duration: 1.1, ease: "power4.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 72%" },
      });
      const fields = formRef.current?.querySelectorAll(".form-field");
      if (fields) {
        gsap.from(fields, {
          opacity: 0, y: 30, stagger: 0.1, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: formRef.current, start: "top 80%" },
        });
      }
      gsap.from(socialsRef.current!.children, {
        opacity: 0, y: 20, stagger: 0.08, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: socialsRef.current, start: "top 88%" },
      });
    });
    return () => ctx.revert();
  }, []);

  /* ── Validation ─────────────────────────────────────────── */
  function validate(): Errors {
    const e: Errors = {};
    if (!form.name.trim())
      e.name = "Name is required.";
    if (!form.email.trim())
      e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Please enter a valid email address.";
    if (!form.message.trim())
      e.message = "Message cannot be empty.";
    return e;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setToast({ type: "error", msg: "Please fix the errors below." });
      return;
    }
    // Submission placeholder — swap with your API call
    setForm({ name: "", email: "", message: "" });
    setErrors({});
    setTimestamp(new Date().toISOString().slice(0, 19).replace("T", " ") + " UTC");
    setSubmitted(true);
  }

  const field = (key: keyof FormState) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(f => ({ ...f, [key]: e.target.value }));
      if (errors[key]) setErrors(err => ({ ...err, [key]: undefined }));
    },
  });

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="py-[clamp(72px,10vw,110px)] px-[clamp(24px,6vw,100px)] bg-[#060608] text-white relative overflow-hidden"
    >
      <div className="dot-grid absolute inset-0 z-0" />
      <div className="scan-lines absolute inset-0 z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Custom toast notification */}
      {toast && (
        <div
          ref={toastRef}
          className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border font-mono text-[12px] tracking-wide ${
            toast.type === "success"
              ? "bg-[#0a1a0a] border-green-500/40 text-green-400"
              : "bg-[#1a0a0a] border-brand-accent/40 text-brand-accent"
          }`}
        >
          <span className="text-base">{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.msg}
        </div>
      )}

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <div ref={labelRef} className="flex flex-col items-center gap-4 mb-8">
          <div className="w-12 h-[1px] bg-brand-accent" />
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-brand-accent">
            Final Connect
          </span>
        </div>

        <h2 className="font-headline font-extrabold text-[clamp(40px,7vw,82px)] leading-none tracking-tight mb-12">
          <div className="overflow-hidden inline-block mr-4">
            <div ref={word1Ref}>Let&apos;s build</div>
          </div>
          <div className="overflow-hidden inline-block">
            <div ref={word2Ref} className="italic font-light opacity-50">tomorrow.</div>
          </div>
        </h2>

        {submitted ? (
          /* ── Success panel ──────────────────────────────── */
          <div
            ref={successRef}
            className="relative border border-brand-accent/30 bg-[#060608] overflow-hidden text-left"
          >
            {/* Scan sweep */}
            <div className="success-scan absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-brand-accent/60 to-transparent pointer-events-none z-10" />

            {/* Corner brackets flush to edges */}
            <span className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-brand-accent" />
            <span className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-brand-accent" />
            <span className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-brand-accent" />
            <span className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-brand-accent" />

            {/* ── Top status bar ── */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/8 bg-white/[0.025]">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-brand-accent">
                  Transmission Confirmed
                </span>
              </div>
              <span className="font-mono text-[9px] text-white/20 tabular-nums">{timestamp}</span>
            </div>

            {/* ── Main body ── */}
            <div ref={successTextRef} className="px-8 py-12 flex flex-col items-center gap-8">

              {/* Heading */}
              <div className="text-center">
                <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-brand-accent/50 block mb-4">
                  STATUS: UPLINK ACTIVE
                </span>
                <h3 className="font-headline font-extrabold text-[clamp(36px,6vw,68px)] tracking-tight uppercase leading-[0.9]">
                  <span ref={twLine1Ref} className="block">UPLINK</span>
                  <span ref={twLine2Ref} className="block">
                    ESTABLISHED
                    <span ref={twCursorRef} className="inline-block ml-1 text-brand-accent opacity-0">|</span>
                  </span>
                </h3>
              </div>

              {/* Separator with pulse dot */}
              <div className="w-full flex items-center gap-4">
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-brand-accent/25" />
                <div className="w-7 h-7 border border-brand-accent/40 rounded-full flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-pulse" />
                </div>
                <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-brand-accent/25" />
              </div>

              {/* Terminal data readout */}
              <div className="w-full max-w-sm space-y-2.5 font-mono text-[11px]">
                {[
                  { key: "CHANNEL",  val: "Direct_Link_01",       accent: false },
                  { key: "PRIORITY", val: "HIGH",                  accent: true  },
                  { key: "ENCRYPT",  val: "TLS_AES_256_GCM",       accent: false },
                  { key: "STATUS",   val: "QUEUED FOR RESPONSE",   accent: false },
                ].map(({ key, val, accent }) => (
                  <div key={key} className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-white/25 uppercase tracking-widest">{key}</span>
                    <span className={accent ? "text-brand-accent" : "text-white/50"}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Message */}
              <p className="font-mono text-sm text-white/35 text-center max-w-xs leading-relaxed">
                Message received. I&apos;ll reach back through the digital ether soon.
              </p>
            </div>

            {/* ── Bottom status bar ── */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-white/8 bg-white/[0.025]">
              <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">TYL.PORTFOLIO</span>
              {/* Signal strength bars */}
              <div className="flex items-end gap-[3px]">
                {[3, 5, 7, 9, 11].map((h, i) => (
                  <div
                    key={i}
                    className={`w-[3px] rounded-sm ${i < 4 ? "bg-brand-accent" : "bg-white/15"}`}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Ambient red glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-20 bg-brand-accent/8 blur-[50px] pointer-events-none" />
          </div>
        ) : (
          /* ── Form ───────────────────────────────────────── */
          <form ref={formRef} noValidate onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Name */}
            <div className="form-field space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-4">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                {...field("name")}
                className={`w-full bg-white/5 border rounded-full px-8 py-4 focus:outline-none transition-colors placeholder:text-white/10 focus:bg-white/8 ${
                  errors.name ? "border-brand-accent" : "border-white/10 focus:border-brand-accent"
                }`}
              />
              {errors.name && (
                <p className="font-mono text-[10px] text-brand-accent ml-4">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="form-field space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-4">
                Email Address
              </label>
              <input
                type="text"
                placeholder="john@example.com"
                {...field("email")}
                className={`w-full bg-white/5 border rounded-full px-8 py-4 focus:outline-none transition-colors placeholder:text-white/10 focus:bg-white/8 ${
                  errors.email ? "border-brand-accent" : "border-white/10 focus:border-brand-accent"
                }`}
              />
              {errors.email && (
                <p className="font-mono text-[10px] text-brand-accent ml-4">{errors.email}</p>
              )}
            </div>

            {/* Message */}
            <div className="form-field space-y-2 md:col-span-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-4">
                Message
              </label>
              <textarea
                rows={4}
                placeholder="How can I help you?"
                {...field("message")}
                className={`w-full bg-white/5 border rounded-[24px] px-8 py-4 focus:outline-none transition-colors placeholder:text-white/10 focus:bg-white/8 ${
                  errors.message ? "border-brand-accent" : "border-white/10 focus:border-brand-accent"
                }`}
              />
              {errors.message && (
                <p className="font-mono text-[10px] text-brand-accent ml-4">{errors.message}</p>
              )}
            </div>

            {/* Submit */}
            <div className="form-field md:col-span-2 pt-4">
              <button
                type="submit"
                className="w-full bg-brand-accent text-white py-6 rounded-full font-headline font-extrabold text-xl hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-2xl shadow-brand-accent/20"
              >
                Initialize Project
              </button>
            </div>
          </form>
        )}

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
