export function PageHeader({ title, description, badge }: { title: string; description?: string; badge?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {badge && <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-forensic-cyan/20 text-forensic-cyan border border-forensic-cyan/30">{badge}</span>}
      </div>
      {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
    </div>
  );
}
