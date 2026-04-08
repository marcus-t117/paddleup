interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  progress?: number; // 0-100
  className?: string;
}

export default function StatCard({ label, value, subtitle, progress, className = '' }: StatCardProps) {
  return (
    <div className={`bg-surface-container-lowest p-5 rounded-[1.5rem] flex flex-col justify-between shadow-[0_0_32px_rgba(0,0,0,0.03)] ${className}`}>
      <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest block mb-4">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <div className="text-4xl font-extrabold font-[family-name:var(--font-headline)] text-primary">
          {value}
        </div>
        {subtitle && (
          <div className="text-on-surface-variant text-sm font-medium">{subtitle}</div>
        )}
      </div>
      {progress !== undefined && (
        <div className="mt-4 h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
