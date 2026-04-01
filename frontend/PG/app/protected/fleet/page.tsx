"use client";

import { useState } from "react";
import { MOCK_PRINTERS } from "@/lib/mock-data";
import type { Printer } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { QuickEditDrawer } from "@/components/quick-edit-drawer";
import { Camera, CameraOff, Wifi, WifiOff, Plus, Search, Pencil, Monitor } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/mock-data";

export default function FleetPage() {
  const [printers, setPrinters]       = useState<Printer[]>(MOCK_PRINTERS);
  const [search,   setSearch]         = useState("");
  const [editTarget, setEditTarget]   = useState<Printer | null>(null);
  const [drawerOpen, setDrawerOpen]   = useState(false);

  const labs = [...new Set(printers.map((p) => p.lab))];

  const filtered = printers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.model.toLowerCase().includes(search.toLowerCase()) ||
    p.lab.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (p: Printer) => {
    setEditTarget(p);
    setDrawerOpen(true);
  };

  const handleSave = (updated: Partial<Printer>) => {
    if (!editTarget) return;
    setPrinters((prev) =>
      prev.map((p) => (p.id === editTarget.id ? { ...p, ...updated } : p))
    );
    setDrawerOpen(false);
    setEditTarget(null);
  };

  return (
    <div className="animate-fade-in">
      {/* ── Page Header ─────────────────────────────── */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <h1 className="text-lg font-bold text-foreground tracking-tight">Fleet</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {printers.length} printers across {labs.length} labs
        </p>
      </div>

      {/* ── Sticky Action Bar ───────────────────────── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-2.5 flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search printers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full pl-8 pr-3 py-1.5 text-sm bg-surface-2 border border-border rounded-md",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
            )}
          />
        </div>
        <div className="flex-1" />
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={14} />
          Add Printer
        </button>
      </div>

      {/* ── Printer Tables ──────────────────────────── */}
      <div className="px-6 py-6 space-y-8">
        {labs.map((lab) => {
          const labPrinters = filtered.filter((p) => p.lab === lab);
          if (labPrinters.length === 0) return null;

          return (
            <section key={lab}>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {lab} · {labPrinters.length} printers
              </h2>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                {/* Table header */}
                <div className="hidden sm:grid grid-cols-[1fr_120px_80px_80px_90px_100px] gap-4 px-4 py-2.5 border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground font-medium bg-surface-2">
                  <span>Printer</span>
                  <span>Status</span>
                  <span className="flex items-center gap-1"><Camera size={10} /> Camera</span>
                  <span className="flex items-center gap-1"><Wifi size={10} /> Serial</span>
                  <span>Last Frame</span>
                  <span>Actions</span>
                </div>

                <div className="divide-y divide-border">
                  {labPrinters.map((printer) => (
                    <div
                      key={printer.id}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_120px_80px_80px_90px_100px] gap-2 sm:gap-4 px-4 py-3.5 hover:bg-surface-2 transition-colors"
                    >
                      {/* Printer name */}
                      <div>
                        <p className="text-sm font-medium text-foreground">{printer.name}</p>
                        <p className="text-[11px] text-muted-foreground">{printer.model}</p>
                      </div>

                      {/* Status */}
                      <div className="self-center">
                        <StatusBadge status={printer.status} size="sm" />
                      </div>

                      {/* Camera */}
                      <div className="self-center flex items-center gap-1.5 text-xs">
                        {printer.cameraConnected ? (
                          <Camera size={13} className="text-pg-healthy" />
                        ) : (
                          <CameraOff size={13} className="text-pg-offline" />
                        )}
                        <span className={cn(
                          "text-[11px]",
                          printer.cameraConnected ? "text-pg-healthy" : "text-pg-offline"
                        )}>
                          {printer.cameraConnected ? "OK" : "Off"}
                        </span>
                      </div>

                      {/* Serial */}
                      <div className="self-center flex items-center gap-1.5 text-xs">
                        {printer.octoprintConnected ? (
                          <Wifi size={13} className="text-pg-healthy" />
                        ) : (
                          <WifiOff size={13} className="text-pg-offline" />
                        )}
                        <span className={cn(
                          "text-[11px]",
                          printer.octoprintConnected ? "text-pg-healthy" : "text-pg-offline"
                        )}>
                          {printer.octoprintConnected ? "OK" : "Off"}
                        </span>
                      </div>

                      {/* Last frame */}
                      <p className="text-[11px] text-muted-foreground self-center tabular-nums">
                        {formatRelativeTime(printer.lastFrameAt)}
                      </p>

                      {/* Actions */}
                      <div className="self-center flex items-center gap-2">
                        <button
                          onClick={() => openEdit(printer)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent"
                          aria-label={`Edit ${printer.name}`}
                        >
                          <Pencil size={12} />
                          Edit
                        </button>
                        <Link
                          href={`/protected/printers/${printer.id}`}
                          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded-md hover:bg-primary/5"
                        >
                          <Monitor size={12} />
                          Monitor
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-sm text-muted-foreground">
            No printers match &ldquo;{search}&rdquo;
          </div>
        )}
      </div>

      {/* Quick Edit Drawer */}
      <QuickEditDrawer
        printer={editTarget}
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditTarget(null); }}
        onSave={handleSave}
      />
    </div>
  );
}
