export default function FloatingActions() {
  return (
    <div className="fixed bottom-8 right-8 z-[100] hidden md:flex flex-col items-center gap-6">
      <div className="flex flex-col gap-4">
        <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-brand-accent hover:text-white transition-all cursor-pointer">
          <span className="material-symbols-outlined text-lg">mail</span>
        </button>
        <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-brand-accent hover:text-white transition-all cursor-pointer">
          <span className="material-symbols-outlined text-lg">description</span>
        </button>
      </div>
      <div className="h-20 w-[1px] bg-white/10" />
    </div>
  );
}
