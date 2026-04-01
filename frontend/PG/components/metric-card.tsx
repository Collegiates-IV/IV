import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  status?: "healthy" | "warning" | "danger" | "paused" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

const STATUS_MAP = {
  healthy: {
    value:  "text-pg-healthy",
    border: "border-l-pg-healthy",
    icon:   "text-pg-healthy",
  },
  warning: {
    value:  "text-pg-warning",
    border: "border-l-pg-warning",
    icon:   "text-pg-warning",
  },
  danger: {
    value:  "text-pg-danger",
    border: "border-l-pg-danger",
    icon:   "text-pg-danger",
  },
  paused: {
    value:  "text-pg-paused",
    border: "border-l-pg-paused",
    icon:   "text-pg-paused",
  },
  neutral: {
    value:  "text-foreground",
    border: "border-l-border",
    icon:   "text-muted-foreground",
  },
};

export function MetricCard({
  label,
  value,
  unit,
  subtext,
  status = "neutral",
  icon,
  className,
}: MetricCardProps) {
  const s = STATUS_MAP[status];

  return (
    <div
      className={cn(
        // Neutral surface — only the left border carries status color
        "bg-card border border-border border-l-[3px] rounded-lg p-5 flex flex-col gap-2",
        "hover:bg-surface-2 transition-colors duration-150",
        s.border,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        {icon && (
          <span className={cn("opacity-70", s.icon)}>{icon}</span>
        )}
      </div>
      <div className="flex items-end gap-1.5">
        <span className={cn("text-2xl font-bold tabular-nums leading-none", s.value)}>
          {value}
        </span>
        {unit && (
          <span className="text-sm text-muted-foreground mb-0.5">{unit}</span>
        )}
      </div>
      {subtext && (
        <p className="text-xs text-muted-foreground">{subtext}</p>
      )}
    </div>
  );
}
