export default function FloatingActions() {
  return (
    <div className="fixed bottom-8 right-8 z-[100] hidden md:flex flex-col items-center gap-6">
      <div className="flex flex-col gap-4">
        <a
          href="https://wa.me/60123456789"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-brand-accent hover:text-white transition-all"
          aria-label="WhatsApp"
        >
          <span className="material-symbols-outlined text-lg">chat</span>
        </a>
        <a
          href="https://github.com/leongiscoding"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-brand-accent hover:text-white transition-all"
          aria-label="GitHub"
        >
          <span className="material-symbols-outlined text-lg">code</span>
        </a>
        <a
          href="https://www.linkedin.com/in/tan-yew-leong-a70aab25b"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-brand-accent hover:text-white transition-all"
          aria-label="LinkedIn"
        >
          <span className="material-symbols-outlined text-lg">work</span>
        </a>
      </div>
      <div className="h-20 w-[1px] bg-white/10" />
    </div>
  );
}
