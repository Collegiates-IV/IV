"use client";

import { useState } from "react";
import { MOCK_HISTORY, formatRelativeTime, formatDuration } from "@/lib/mock-data";
import { EmptyState } from "@/components/empty-state";
import { History, Film, ThumbsDown, Search, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type SortKey = "startedAt" | "durationMin" | "filamentSavedG";
type SortDir = "asc" | "desc";

const STATUS_STYLES = {
  passed:  { label: "Passed",  cls: "text-pg-healthy bg-healthy-dim border-pg-healthy/20" },
  warned:  { label: "Warned",  cls: "text-pg-warning bg-warning-dim border-pg-warning/20" },
  failed:  { label: "Failed",  cls: "text-pg-danger  bg-danger-dim  border-pg-danger/20"  },
  paused:  { label: "Paused",  cls: "text-pg-paused  bg-paused-dim  border-pg-paused/20"  },
  resumed: { label: "Resumed", cls: "text-muted-foreground bg-muted border-border"          },
};

const STATUS_FILTER_OPTIONS = ["all", "passed", "warned", "failed", "paused"] as const;

export default function HistoryPage() {
  const [search,       setSearch]      = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey,      setSortKey]     = useState<SortKey>("startedAt");
  const [sortDir,      setSortDir]     = useState<SortDir>("desc");
  const [expanded,     setExpanded]    = useState<string | null>(null);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = MOCK_HISTORY
    .filter((j) => {
      const matchesSearch = !search ||
        j.fileName.toLowerCase().includes(search.toLowerCase()) ||
        j.printerName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || j.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let valA: number;
      let valB: number;
      if (sortKey === "startedAt") {
        valA = new Date(a.startedAt).getTime();
        valB = new Date(b.startedAt).getTime();
      } else if (sortKey === "durationMin") {
        valA = a.durationMin;
        valB = b.durationMin;
      } else {
        valA = a.filamentSavedG ?? 0;
        valB = b.filamentSavedG ?? 0;
      }
      return sortDir === "desc" ? valB - valA : valA - valB;
    });

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown size={11} className="opacity-30" />;
    return sortDir === "desc"
      ? <ChevronDown size={11} className="text-primary" />
      : <ChevronUp   size={11} className="text-primary" />;
  }

  return (
    <div className="animate-fade-in">
      {/* ── Page Header ─────────────────────────────── */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <h1 className="text-lg font-bold text-foreground tracking-tight">Print History</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Past jobs with outcome, defect type, and waste data
        </p>
      </div>

      {/* ── Sticky Filter Bar ───────────────────────── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-2.5 flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Job or printer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "pl-8 pr-3 py-1.5 text-sm bg-surface-2 border border-border rounded-md w-52",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
            )}
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-0.5 p-1 bg-surface-2 rounded-lg border border-border">
          {STATUS_FILTER_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors",
                statusFilter === s
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex-1" />
        <span className="text-xs text-muted-foreground">{filtered.length} jobs</span>
      </div>

      {/* ── Table ───────────────────────────────────── */}
      <div className="px-6 py-6">
        {MOCK_HISTORY.length === 0 ? (
          <EmptyState
            icon={<History size={32} />}
            title="No print history yet"
            description="Completed print jobs will appear here with their outcomes and any waste metrics."
          />
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {/* Table header with sortable columns */}
            <div className="hidden md:grid grid-cols-[1fr_150px_100px_80px_100px_60px_36px] gap-4 px-4 py-2.5 border-b border-border bg-surface-2 text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
              <span>Job</span>
              <span>Printer</span>
              <span>Status</span>
              <button
                onClick={() => toggleSort("durationMin")}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Duration <SortIcon col="durationMin" />
              </button>
              <button
                onClick={() => toggleSort("filamentSavedG")}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Waste Saved <SortIcon col="filamentSavedG" />
              </button>
              <span>TL</span>
              <span />
            </div>

            <div className="divide-y divide-border">
              {filtered.map((job) => {
                const s = STATUS_STYLES[job.status] ?? STATUS_STYLES.warned;
                const isExpanded = expanded === job.id;
                return (
                  <div key={job.id}>
                    <div
                      className="grid grid-cols-1 md:grid-cols-[1fr_150px_100px_80px_100px_60px_36px] gap-2 md:gap-4 px-4 py-3.5 hover:bg-surface-2 transition-colors cursor-pointer"
                      onClick={() => setExpanded(isExpanded ? null : job.id)}
                    >
                      {/* Job name */}
                      <div>
                        <p className="text-sm font-medium text-foreground truncate max-w-[260px]">
                          {job.fileName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatRelativeTime(job.startedAt)}
                          {job.defectType && (
                            <span className="ml-2 font-mono">{job.defectType}</span>
                          )}
                        </p>
                      </div>

                      {/* Printer */}
                      <p className="text-xs text-muted-foreground self-center truncate">
                        {job.printerName}
                      </p>

                      {/* Status badge */}
                      <div className="self-center">
                        <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded border", s.cls)}>
                          {s.label}
                        </span>
                      </div>

                      {/* Duration */}
                      <p className="text-xs text-foreground self-center tabular-nums">
                        {formatDuration(job.durationMin)}
                      </p>

                      {/* Filament saved */}
                      <p className="text-xs self-center tabular-nums text-muted-foreground">
                        {job.filamentSavedG ? `${job.filamentSavedG}g saved` : "—"}
                      </p>

                      {/* Timelapse */}
                      <div className="self-center">
                        {job.hasTimelapse
                          ? <Film size={13} className="text-muted-foreground" />
                          : <span className="text-[11px] text-muted-foreground/30">—</span>
                        }
                      </div>

                      {/* False positive */}
                      <div className="self-center">
                        {(job.status === "failed" || job.status === "warned") && (
                          <button
                            className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                            title="Mark as false positive"
                            aria-label="Mark as false positive"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ThumbsDown size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <div className="px-4 pb-4 bg-surface-2 border-t border-border">
                        <div className="grid sm:grid-cols-3 gap-4 pt-4 text-xs">
                          <div>
                            <p className="text-muted-foreground mb-1">Lab</p>
                            <p className="text-foreground font-medium">{job.lab}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Time Saved</p>
                            <p className="text-foreground font-medium">
                              {job.timeSavedMin ? formatDuration(job.timeSavedMin) : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Defect Type</p>
                            <p className="text-foreground font-medium font-mono">
                              {job.defectType ?? "None"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
