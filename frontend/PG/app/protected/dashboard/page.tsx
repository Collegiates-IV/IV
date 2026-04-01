"use client";

import {
  MOCK_PRINTERS,
  MOCK_FLEET_METRICS,
  MOCK_ALERTS,
  formatRelativeTime,
} from "@/lib/mock-data";
import { MetricCard } from "@/components/metric-card";
import { PrinterStatusCard } from "@/components/printer-status-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SectionNav } from "@/components/section-nav";
import { useBackendHealth } from "@/components/backend-health-provider";
import {
  Printer,
  AlertTriangle,
  PauseCircle,
  XOctagon,
  ChevronRight,
  Activity,
  Camera,
  Wifi,
  WifiOff,
  CameraOff,
  Circle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "overview",    label: "Overview" },
  { id: "attention",   label: "Attention Needed" },
  { id: "fleet",       label: "Fleet Status" },
  { id: "activity",   label: "Recent Activity" },
  { id: "connectivity", label: "Connectivity" },
];

// Connectivity mock — replace with real data from BackendHealthProvider / API
const CAMERA_ONLINE  = MOCK_PRINTERS.filter((p) => p.cameraConnected).length;
const CAMERA_OFFLINE = MOCK_PRINTERS.filter((p) => !p.cameraConnected).length;
const SERIAL_ONLINE  = MOCK_PRINTERS.filter((p) => p.octoprintConnected).length;
const SERIAL_OFFLINE = MOCK_PRINTERS.filter((p) => !p.octoprintConnected).length;

function SectionHeader({
  title,
  count,
  action,
}: {
  title: string;
  count?: number;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
        {title}
        {count !== undefined && (
          <span className="text-xs font-normal text-muted-foreground">({count})</span>
        )}
      </h2>
      {action && (
        <Link
          href={action.href}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          {action.label} <ChevronRight size={12} />
        </Link>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { status: backendStatus } = useBackendHealth();
  const m = MOCK_FLEET_METRICS;

  const failureCount  = MOCK_PRINTERS.filter((p) => p.status === "danger").length;
  const activeCount   = MOCK_PRINTERS.filter((p) => p.status === "monitoring").length;

  const needsAttention = MOCK_PRINTERS.filter(
    (p) => p.status === "danger" || p.status === "warning" || p.status === "paused"
  );
  const recentAlerts = [...MOCK_ALERTS].slice(0, 5);

  return (
    <div className="animate-fade-in">
      {/* ── Page Header ────────────────────────────────── */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Operations Overview</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              DSU Makerspace · {MOCK_PRINTERS.length} printers
            </p>
          </div>
          {/* Global backend status */}
          <div className="flex items-center gap-1.5 text-xs mt-1">
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                backendStatus === "online"   ? "bg-pg-healthy" :
                backendStatus === "checking" ? "bg-muted-foreground animate-pulse" :
                "bg-pg-danger animate-pulse"
              )}
            />
            <span className={cn(
              "font-medium",
              backendStatus === "online"   ? "text-healthy" :
              backendStatus === "checking" ? "text-muted-foreground" :
              "text-danger"
            )}>
              {backendStatus === "online"   ? "System Online" :
               backendStatus === "checking" ? "Connecting…" :
               "Backend Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Sticky Section Nav ──────────────────────────── */}
      <SectionNav sections={SECTIONS} />

      {/* ── Page Body ──────────────────────────────────── */}
      <div className="px-6 py-8 space-y-12">

        {/* ① Overview — Operational KPIs */}
        <section id="overview">
          <SectionHeader title="Operational Overview" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard
              label="Active"
              value={activeCount}
              icon={<Printer size={14} />}
              status="neutral"
              subtext="monitoring"
            />
            <MetricCard
              label="Paused"
              value={m.paused}
              icon={<PauseCircle size={14} />}
              status={m.paused > 0 ? "paused" : "neutral"}
              subtext="awaiting override"
            />
            <MetricCard
              label="Warnings"
              value={m.warnings}
              icon={<AlertTriangle size={14} />}
              status={m.warnings > 0 ? "warning" : "neutral"}
              subtext="need attention"
            />
            <MetricCard
              label="Failures"
              value={failureCount}
              icon={<XOctagon size={14} />}
              status={failureCount > 0 ? "danger" : "neutral"}
              subtext="confirmed incidents"
            />
          </div>
        </section>

        {/* ② Attention Needed */}
        <section id="attention">
          <SectionHeader
            title="Attention Needed"
            count={needsAttention.length}
            action={needsAttention.length > 0 ? { label: "View Alerts", href: "/protected/alerts" } : undefined}
          />

          {needsAttention.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Circle size={13} className="text-pg-healthy fill-pg-healthy" />
              All printers operating normally — no issues require attention.
            </div>
          ) : (
            <div className="space-y-2">
              {needsAttention.map((p) => (
                <Link
                  key={p.id}
                  href={`/protected/printers/${p.id}`}
                  className={cn(
                    "flex items-stretch bg-card border border-border rounded-lg overflow-hidden",
                    "hover:bg-surface-2 hover:shadow-sm transition-all duration-150 group"
                  )}
                >
                  {/* Status accent strip */}
                  <div className={cn(
                    "w-1 shrink-0",
                    p.status === "danger"  ? "bg-pg-danger" :
                    p.status === "warning" ? "bg-pg-warning" :
                    "bg-pg-paused"
                  )} />

                  {/* Content */}
                  <div className="flex-1 min-w-0 px-4 py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {p.detectedLabel !== "GOOD"
                          ? `${p.detectedLabel} · ${Math.round(p.confidence * 100)}% confidence`
                          : p.currentJob ?? "No active job"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={p.status} size="sm" />
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {formatRelativeTime(p.lastFrameAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ③ Fleet Status */}
        <section id="fleet">
          <SectionHeader
            title="Fleet Status"
            count={MOCK_PRINTERS.length}
            action={{ label: "Manage Fleet", href: "/protected/fleet" }}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MOCK_PRINTERS.map((p) => (
              <PrinterStatusCard key={p.id} printer={p} />
            ))}
          </div>
        </section>

        {/* ④ Recent Activity — two column on large screens */}
        <section id="activity">
          <SectionHeader
            title="Recent Detections"
            count={recentAlerts.length}
            action={{ label: "All Alerts", href: "/protected/alerts" }}
          />
          <div className="space-y-2">
            {recentAlerts.map((a) => {
              const confPct = Math.round(a.confidence * 100);
              const isHigh = a.confidence >= 0.85;
              const isMid  = a.confidence >= 0.5 && !isHigh;
              return (
                <div
                  key={a.id}
                  className="bg-card border border-border rounded-lg px-4 py-3 flex items-center justify-between gap-4 hover:bg-surface-2 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* type accent dot */}
                    <span className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      isHigh ? "bg-pg-danger" :
                      isMid  ? "bg-pg-warning" :
                               "bg-muted-foreground"
                    )} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{a.printerName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <span className="font-mono">{a.defect}</span>
                        {" · "}{a.lab}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={cn(
                      "text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded border",
                      isHigh ? "text-pg-danger bg-danger-dim border-pg-danger/20" :
                      isMid  ? "text-pg-warning bg-warning-dim border-pg-warning/20" :
                               "text-muted-foreground bg-muted border-border"
                    )}>
                      {confPct}%
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatRelativeTime(a.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ⑤ Connectivity / System Health */}
        <section id="connectivity">
          <SectionHeader title="System Health" />
          <div className="bg-card border border-border rounded-lg divide-y divide-border">

            {/* Backend */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Activity size={14} className="text-muted-foreground" />
                <span className="text-sm text-foreground">Backend API</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  backendStatus === "online"   ? "bg-pg-healthy" :
                  backendStatus === "checking" ? "bg-muted-foreground animate-pulse" :
                  "bg-pg-danger animate-pulse"
                )} />
                <span className={cn(
                  "font-medium",
                  backendStatus === "online" ? "text-healthy" :
                  backendStatus === "checking" ? "text-muted-foreground" :
                  "text-danger"
                )}>
                  {backendStatus === "online"   ? "Online" :
                   backendStatus === "checking" ? "Checking…" :
                   "Offline"}
                </span>
              </div>
            </div>

            {/* Camera feeds */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                {CAMERA_OFFLINE > 0
                  ? <CameraOff size={14} className="text-pg-offline" />
                  : <Camera    size={14} className="text-muted-foreground" />
                }
                <span className="text-sm text-foreground">Camera Feeds</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-pg-healthy font-medium">{CAMERA_ONLINE} online</span>
                {CAMERA_OFFLINE > 0 && (
                  <span className="text-pg-offline font-medium">{CAMERA_OFFLINE} offline</span>
                )}
              </div>
            </div>

            {/* Serial / device connections */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                {SERIAL_OFFLINE > 0
                  ? <WifiOff size={14} className="text-pg-offline" />
                  : <Wifi    size={14} className="text-muted-foreground" />
                }
                <span className="text-sm text-foreground">Serial / Device Links</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-pg-healthy font-medium">{SERIAL_ONLINE} connected</span>
                {SERIAL_OFFLINE > 0 && (
                  <span className="text-pg-offline font-medium">{SERIAL_OFFLINE} disconnected</span>
                )}
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
