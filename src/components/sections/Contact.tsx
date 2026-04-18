"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

const socials = [
  { label: "GitHub",   href: "https://github.com/leongiscoding" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/tan-yew-leong-a70aab25b" },
  { label: "WhatsApp", href: "https://wa.me/60183631583" },
];

const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";

// Major providers — Levenshtein distance ≤ 2 from entered domain triggers a suggestion
const KNOWN_PROVIDERS = [
  "gmail.com","googlemail.com","yahoo.com","ymail.com",
  "outlook.com","hotmail.com","live.com","msn.com",
  "icloud.com","me.com","mac.com",
  "aol.com","protonmail.com","proton.me",
  "zoho.com","gmx.com","mail.com","fastmail.com",
];

function findProviderTypo(domain: string): string | null {
  const prev = Array.from({ length: domain.length + 1 }, (_, j) => j);
  for (const provider of KNOWN_PROVIDERS) {
    if (domain === provider) return null;
    if (Math.abs(domain.length - provider.length) > 3) continue;
    const row = new Array<number>(domain.length + 1);
    let cur = prev.slice();
    for (let i = 1; i <= provider.length; i++) {
      row[0] = i;
      for (let j = 1; j <= domain.length; j++)
        row[j] = provider[i-1] === domain[j-1]
          ? cur[j-1]
          : 1 + Math.min(cur[j], row[j-1], cur[j-1]);
      [cur] = [row.slice()];
    }
    if (cur[domain.length] <= 2) return provider;
  }
  return null;
}

// IANA reserved + common disposable/throwaway domains
const BLOCKED_DOMAINS = new Set([
  "example.com","example.org","example.net",
  "test.com","test.org","test.net",
  "fake.com","fake.org","fake.net",
  "mailinator.com","guerrillamail.com","guerrillamail.net","guerrillamail.org",
  "guerrillamail.de","guerrillamail.biz","guerrillamail.info",
  "tempmail.com","temp-mail.org","tempinbox.com",
  "throwaway.email","throwam.com","trashmail.com","trashmail.me","trashmail.net","trashmail.io",
  "yopmail.com","yopmail.fr","cool.fr.nf","jetable.fr.nf","nospam.ze.tc","nomail.xl.cx",
  "mega.zik.dj","speed.1s.fr","courriel.fr.nf","moncourrier.fr.nf","monemail.fr.nf",
  "10minutemail.com","10minutemail.net","10minutemail.org","10minutemail.de",
  "mailnull.com","maildrop.cc","mailnesia.com","discard.email","dispostable.com",
  "sharklasers.com","guerrillamailblock.com","grr.la","spam4.me","spamgourmet.com",
  "spamgourmet.net","spamgourmet.org","spamspot.com","spamfree24.org",
  "getairmail.com","filzmail.com","nwytg.net","mail.tm","emailondeck.com",
  "getnada.com","mohmal.com","mintemail.com","mailforspam.com",
]);

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

  const [form,         setForm]         = useState<FormState>({ name: "", email: "", message: "" });
  const [errors,       setErrors]       = useState<Errors>({});
  const [toast,        setToast]        = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const [submitted,    setSubmitted]    = useState(false);
  const [timestamp,    setTimestamp]    = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(form.email))
      e.email = "Please enter a valid email address.";
    else if (BLOCKED_DOMAINS.has(form.email.split("@")[1].toLowerCase()))
      e.email = "Please use a real email address.";
    else {
      const suggestion = findProviderTypo(form.email.split("@")[1].toLowerCase());
      if (suggestion) e.email = `Did you mean @${suggestion}?`;
    }
    if (!form.message.trim())
      e.message = "Message cannot be empty.";
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setToast({ type: "error", msg: "Please fix the errors below." });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("access_key", WEB3FORMS_ACCESS_KEY);
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("message", form.message);
      formData.append("from_name", "Portfolio Contact Form");
      formData.append("subject", `New message from ${form.name}`);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        setForm({ name: "", email: "", message: "" });
        setErrors({});
        setTimestamp(new Date().toISOString().slice(0, 19).replace("T", " ") + " UTC");
        setSubmitted(true);
      } else {
        setToast({ type: "error", msg: data.message || "Transmission failed. Please try again." });
      }
    } catch {
      setToast({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
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
                disabled={isSubmitting}
                className="w-full bg-brand-accent text-white py-6 rounded-full font-headline font-extrabold text-xl hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-2xl shadow-brand-accent/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? "Transmitting…" : "Initialize Project"}
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
