export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/5 bg-[#060608]">
      <div className="max-w-7xl mx-auto px-[clamp(24px,6vw,100px)] py-8 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/30">
          © {year} TYL. Portfolio — Built with Precision
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/20">
          Edwin Tan
        </span>
      </div>
    </footer>
  );
}
