"use client";

import { useState } from "react";
import { MOCK_ALERTS } from "@/lib/mock-data";
import type { Alert } from "@/lib/mock-data";
import { IncidentEvidenceCard } from "@/components/incident-evidence-card";
import { EmptyState } from "@/components/empty-state";
import { Bell, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/mock-data";

type TabType = "warning" | "confirmed" | "resolved";

const TABS: { key: TabType; label: string }[] = [
  { key: "warning",   label: "Warnings" },
  { key: "confirmed", label: "Confirmed" },
  { key: "resolved",  label: "Resolved" },
];

export default function AlertsPage() {
  const [activeTab,    setActiveTab]   = useState<TabType>("confirmed");
  const [selected,     setSelected]    = useState<Alert | null>(null);
  const [search,       setSearch]      = useState("");

  const counts: Record<TabType, number> = {
    warning:   MOCK_ALERTS.filter((a) => a.type === "warning").length,
    confirmed: MOCK_ALERTS.filter((a) => a.type === "confirmed").length,
    resolved:  MOCK_ALERTS.filter((a) => a.type === "resolved").length,
  };

  const filtered = MOCK_ALERTS.filter((a) => {
    const matchesTab    = a.type === activeTab;
    const matchesSearch = !search ||
      a.printerName.toLowerCase().includes(search.toLowerCase()) ||
      a.defect.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalActive = counts.confirmed + counts.warning;

  return (
    <div className="animate-fade-in h-full flex flex-col">
      {/* ── Page Header ────────────────────────────── */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <h1 className="text-lg font-bold text-foreground tracking-tight">Alert Center</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {totalActive > 0
            ? `${totalActive} active · ${counts.resolved} resolved`
            : `All clear · ${counts.resolved} resolved`}
        </p>
      </div>

      {/* ── Sticky Filter Bar ──────────────────────── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-2.5 flex items-center gap-3">
        {/* Tab switcher */}
        <div className="flex gap-0.5 p-1 bg-surface-2 rounded-lg border border-border">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSelected(null); }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors",
                activeTab === key
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
              {counts[key] > 0 && (
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  key === "confirmed" ? "bg-pg-danger/15 text-pg-danger" :
                  key === "warning"   ? "bg-pg-warning/15 text-pg-warning" :
                  "bg-muted text-muted-foreground"
                )}>
                  {counts[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search printer or defect…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full pl-8 pr-3 py-1.5 text-sm bg-surface-2 border border-border rounded-md",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
            )}
          />
        </div>
      </div>

      {/* ── Content ────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<Bell size={32} />}
              title={`No ${activeTab} alerts`}
              description={
                activeTab === "resolved"
                  ? "Resolved incidents will appear here after you act on a warning or confirmed failure."
                  : "All clear — no active alerts in this category."
              }
            />
          </div>
        ) : (
          // Two-pane layout on xl screens: list left, detail right
          <div className="flex h-full">
            {/* Left: Incident list */}
            <div className={cn(
              "overflow-y-auto",
              selected ? "hidden xl:flex xl:flex-col xl:w-80 xl:border-r xl:border-border" : "flex-1"
            )}>
              {selected ? (
                // Narrow list when detail is open (xl)
                <div className="divide-y divide-border">
                  {filtered.map((a) => {
                    const confPct = Math.round(a.confidence * 100);
                    const isHigh = a.confidence >= 0.85;
                    const isMid  = a.confidence >= 0.5 && !isHigh;
                    return (
                      <button
                        key={a.id}
                        onClick={() => setSelected(a)}
                        className={cn(
                          "w-full text-left px-4 py-3 hover:bg-surface-2 transition-colors",
                          selected?.id === a.id && "bg-surface-2"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{a.printerName}</p>
                          <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0",
                            isHigh ? "text-pg-danger bg-danger-dim border-pg-danger/20" :
                            isMid  ? "text-pg-warning bg-warning-dim border-pg-warning/20" :
                                     "text-muted-foreground bg-muted border-border"
                          )}>
                            {confPct}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {a.defect} · {formatRelativeTime(a.timestamp)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                // Full card grid when no detail selected
                <div className="p-6 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => setSelected(alert)}
                      className="cursor-pointer"
                    >
                      <IncidentEvidenceCard alert={alert} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Selected incident detail */}
            {selected && (
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setSelected(null)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back to list
                  </button>
                </div>
                <IncidentEvidenceCard alert={selected} className="max-w-2xl" />

                {/* Operator actions */}
                <div className="mt-4 max-w-2xl flex flex-wrap gap-2">
                  <button className="px-3 py-2 rounded-md text-sm font-medium bg-pg-paused/10 border border-pg-paused/30 text-pg-paused hover:bg-pg-paused/20 transition-colors">
                    Acknowledge
                  </button>
                  {selected.type !== "resolved" && (
                    <button className="px-3 py-2 rounded-md text-sm font-medium bg-pg-healthy/10 border border-pg-healthy/30 text-pg-healthy hover:bg-pg-healthy/20 transition-colors">
                      Mark Resolved
                    </button>
                  )}
                  <button className="px-3 py-2 rounded-md text-sm font-medium bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    Mark as False Positive
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
