const links = [
  { label: "GitHub",   href: "https://github.com/leongiscoding" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/tan-yew-leong-a70aab25b" },
  { label: "WhatsApp", href: "https://wa.me/60123456789" },
];

export default function Footer() {
  return (
    <footer className="bg-[#060608] w-full py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6">
      <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">
        © 2024 TYL. PORTFOLIO — BUILT WITH PRECISION
      </div>
      <div className="flex gap-8">
        {links.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/35 hover:text-brand-accent transition-colors font-mono text-[11px] uppercase tracking-[0.22em]"
          >
            {label}
          </a>
        ))}
      </div>
    </footer>
  );
}
