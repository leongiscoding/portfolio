export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/5 bg-[#060608]">
      <div className="max-w-7xl mx-auto px-[clamp(24px,6vw,100px)] py-8 flex flex-col sm:flex-row items-center sm:justify-between gap-2 sm:gap-0">
        <span className="font-mono text-[9px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.22em] text-white/30 text-center sm:text-left">
          © {year} TYL. Portfolio — Built with Precision
        </span>
        <span className="font-mono text-[9px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.22em] text-white/20">
          Edwin Tan
        </span>
      </div>
    </footer>
  );
}
