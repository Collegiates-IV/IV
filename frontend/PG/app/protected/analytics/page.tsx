import {
  MOCK_HISTORY,
  MOCK_FLEET_METRICS,
  MOCK_PRINTERS,
  formatDuration,
} from "@/lib/mock-data";
import { SectionNav } from "@/components/section-nav";
import { Layers, Clock, TrendingDown, BarChart3, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "savings",        label: "Savings" },
  { id: "utilization",    label: "Utilization" },
  { id: "failure-trends", label: "Failure Trends" },
  { id: "fleet-perf",     label: "Fleet Performance" },
];

const m = MOCK_FLEET_METRICS;

// Derived analytics from mock data
const totalFilamentSaved = MOCK_HISTORY.reduce((acc, j) => acc + (j.filamentSavedG ?? 0), 0);
const totalTimeSaved     = MOCK_HISTORY.reduce((acc, j) => acc + (j.timeSavedMin ?? 0), 0);
const totalJobs          = MOCK_HISTORY.length;
const failedJobs         = MOCK_HISTORY.filter((j) => j.status === "failed" || j.status === "paused").length;
const passedJobs         = MOCK_HISTORY.filter((j) => j.status === "passed").length;
const failureRate        = totalJobs > 0 ? failedJobs / totalJobs : 0;

const defectCounts: Record<string, number> = {};
MOCK_HISTORY.forEach((j) => {
  if (j.defectType) {
    defectCounts[j.defectType] = (defectCounts[j.defectType] ?? 0) + 1;
  }
});
const defectEntries = Object.entries(defectCounts).sort((a, b) => b[1] - a[1]);
const maxDefectCount = defectEntries[0]?.[1] ?? 1;

const printerJobCounts: Record<string, { passed: number; total: number }> = {};
MOCK_HISTORY.forEach((j) => {
  if (!printerJobCounts[j.printerName]) printerJobCounts[j.printerName] = { passed: 0, total: 0 };
  printerJobCounts[j.printerName].total++;
  if (j.status === "passed") printerJobCounts[j.printerName].passed++;
});
const printerPerf = Object.entries(printerJobCounts)
  .map(([name, { passed, total }]) => ({ name, passed, total, rate: total > 0 ? passed / total : 0 }))
  .sort((a, b) => b.rate - a.rate);

function StatCard({
  label,
  value,
  unit,
  subtext,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon size={14} />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-2xl font-bold tabular-nums text-foreground">{value}</span>
        {unit && <span className="text-sm text-muted-foreground mb-0.5">{unit}</span>}
      </div>
      {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {description && (
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="animate-fade-in">
      {/* ── Page Header ─────────────────────────────── */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <h1 className="text-lg font-bold text-foreground tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Operational performance, savings metrics, and fleet efficiency over time
        </p>
      </div>

      {/* ── Sticky Section Nav ──────────────────────── */}
      <SectionNav sections={SECTIONS} />

      {/* ── Content ─────────────────────────────────── */}
      <div className="px-6 py-8 space-y-12">

        {/* ① Savings */}
        <section id="savings" className="scroll-mt-20">
          <SectionHeader
            title="Waste Prevention & Savings"
            description="Cumulative filament and time saved by PrintGuard across all print jobs"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Filament Saved"
              value={(totalFilamentSaved / 1000).toFixed(2)}
              unit="kg"
              subtext="waste prevented"
              icon={Layers}
            />
            <StatCard
              label="Time Saved"
              value={Math.round(totalTimeSaved / 60)}
              unit="hrs"
              subtext="across all jobs"
              icon={Clock}
            />
            <StatCard
              label="Jobs Protected"
              value={failedJobs}
              subtext={`out of ${totalJobs} total`}
              icon={Activity}
            />
            <StatCard
              label="Success Rate"
              value={`${Math.round((passedJobs / totalJobs) * 100)}%`}
              subtext="jobs passed"
              icon={TrendingDown}
            />
          </div>

          {/* Savings breakdown bar */}
          <div className="mt-4 bg-card border border-border rounded-lg p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
              Filament saved per job
            </p>
            <div className="space-y-3">
              {MOCK_HISTORY.filter((j) => j.filamentSavedG).map((j) => {
                const pct = ((j.filamentSavedG ?? 0) / totalFilamentSaved) * 100;
                return (
                  <div key={j.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground truncate max-w-[240px]">{j.fileName}</span>
                      <span className="text-muted-foreground tabular-nums ml-4">{j.filamentSavedG}g</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pg-healthy rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ② Utilization */}
        <section id="utilization" className="scroll-mt-20">
          <SectionHeader
            title="Fleet Utilization"
            description="Print job distribution and activity across all printers"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard label="Total Print Jobs" value={m.totalPrintJobs}  subtext="all-time"     icon={BarChart3} />
            <StatCard label="Active Printers"   value={m.activePrinters} subtext="right now"    icon={Activity} />
            <StatCard label="Fleet Failure Rate" value={`${(m.failureRate * 100).toFixed(1)}%`} subtext="30-day target: <1%" icon={TrendingDown} />
          </div>

          <div className="mt-4 bg-card border border-border rounded-lg p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
              Jobs per printer
            </p>
            <div className="space-y-3">
              {printerPerf.map(({ name, total }) => {
                const maxJobs = Math.max(...printerPerf.map((p) => p.total));
                const pct = (total / maxJobs) * 100;
                return (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground">{name}</span>
                      <span className="text-muted-foreground tabular-nums ml-4">{total} jobs</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/70 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ③ Failure Trends */}
        <section id="failure-trends" className="scroll-mt-20">
          <SectionHeader
            title="Failure Trends"
            description="Most common defect types detected across the fleet"
          />
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Defect breakdown */}
            <div className="bg-card border border-border rounded-lg p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
                Defect frequency
              </p>
              {defectEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No defects recorded.</p>
              ) : (
                <div className="space-y-4">
                  {defectEntries.map(([defect, count]) => {
                    const pct = (count / maxDefectCount) * 100;
                    return (
                      <div key={defect} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-mono text-foreground">{defect}</span>
                          <span className="text-muted-foreground tabular-nums">{count} detection{count !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              defect === "SPAGHETTI" || defect === "DETACHMENT"
                                ? "bg-pg-danger"
                                : defect === "WARPING"
                                ? "bg-pg-warning"
                                : "bg-pg-paused"
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 30-day failure rate */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Fleet failure rate (30d)
              </p>
              <div className="flex items-end gap-3">
                <span className={cn(
                  "text-3xl font-bold tabular-nums",
                  failureRate < 0.05 ? "text-pg-healthy" :
                  failureRate < 0.15 ? "text-pg-warning" :
                  "text-pg-danger"
                )}>
                  {(failureRate * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground mb-1">Target: &lt;10%</span>
              </div>
              <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    failureRate < 0.05 ? "bg-pg-healthy" :
                    failureRate < 0.15 ? "bg-pg-warning" :
                    "bg-pg-danger"
                  )}
                  style={{ width: `${Math.min(failureRate * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {failedJobs} failed or paused out of {totalJobs} total jobs this period.
              </p>
            </div>
          </div>
        </section>

        {/* ④ Fleet Performance */}
        <section id="fleet-perf" className="scroll-mt-20">
          <SectionHeader
            title="Fleet Performance"
            description="Printer reliability ranked by pass rate"
          />
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="hidden sm:grid grid-cols-[1fr_60px_60px_80px_100px] gap-4 px-4 py-2.5 border-b border-border bg-surface-2 text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
              <span>Printer</span>
              <span>Jobs</span>
              <span>Passed</span>
              <span>Pass Rate</span>
              <span>Reliability</span>
            </div>
            <div className="divide-y divide-border">
              {printerPerf.map(({ name, passed, total, rate }) => (
                <div
                  key={name}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_60px_60px_80px_100px] gap-2 sm:gap-4 px-4 py-3.5 hover:bg-surface-2 transition-colors"
                >
                  <p className="text-sm font-medium text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground self-center tabular-nums">{total}</p>
                  <p className="text-xs text-muted-foreground self-center tabular-nums">{passed}</p>
                  <p className={cn(
                    "text-xs font-medium self-center tabular-nums",
                    rate >= 0.8 ? "text-pg-healthy" :
                    rate >= 0.5 ? "text-pg-warning" :
                    "text-pg-danger"
                  )}>
                    {Math.round(rate * 100)}%
                  </p>
                  {/* Micro bar */}
                  <div className="self-center">
                    <div className="w-20 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          rate >= 0.8 ? "bg-pg-healthy" :
                          rate >= 0.5 ? "bg-pg-warning" :
                          "bg-pg-danger"
                        )}
                        style={{ width: `${rate * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
