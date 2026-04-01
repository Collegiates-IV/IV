"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Printer } from "@/lib/mock-data";

interface QuickEditDrawerProps {
  printer: Printer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updated: Partial<Printer>) => void;
}

const FIELD_CLS =
  "w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm text-foreground " +
  "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring " +
  "focus:border-transparent transition-shadow";

const LABEL_CLS = "block text-xs font-medium text-muted-foreground mb-1";

/**
 * Fleet quick-edit drawer.
 * Slides in from the right. Lets operators update printer metadata
 * without leaving the context of the Fleet list.
 */
export function QuickEditDrawer({ printer, isOpen, onClose, onSave }: QuickEditDrawerProps) {
  const [name,  setName]  = useState(printer?.name  ?? "");
  const [lab,   setLab]   = useState(printer?.lab   ?? "");
  const [model, setModel] = useState(printer?.model ?? "");
  const [notes, setNotes] = useState("");

  // Sync local state when the selected printer changes
  if (printer && printer.name !== name && !isOpen) {
    setName(printer.name);
    setLab(printer.lab);
    setModel(printer.model);
  }

  const handleSave = () => {
    onSave?.({ name, lab, model });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-[1px]"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-80 bg-card border-l border-border shadow-xl",
          "flex flex-col transition-transform duration-250 ease-out",
          isOpen ? "translate-x-0 animate-slide-in-right" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="text-sm font-semibold text-foreground">Edit Printer</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {printer?.name ?? "—"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Close edit drawer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <label className={LABEL_CLS}>Display Name</label>
            <input
              className={FIELD_CLS}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ender 3 #1"
            />
          </div>

          <div>
            <label className={LABEL_CLS}>Lab / Location</label>
            <input
              className={FIELD_CLS}
              value={lab}
              onChange={(e) => setLab(e.target.value)}
              placeholder="e.g. DSU Makerspace"
            />
          </div>

          <div>
            <label className={LABEL_CLS}>Machine Model</label>
            <input
              className={FIELD_CLS}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. Creality Ender 3 Pro"
            />
          </div>

          <div>
            <label className={LABEL_CLS}>Notes</label>
            <textarea
              className={cn(FIELD_CLS, "resize-none h-20")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes for this printer…"
            />
          </div>

          {/* Read-only info */}
          <div className="rounded-md bg-surface-2 border border-border p-3 space-y-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Connection Info
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <span className="text-muted-foreground">Camera</span>
              <span className={printer?.cameraConnected ? "text-pg-healthy" : "text-pg-offline"}>
                {printer?.cameraConnected ? "Connected" : "Offline"}
              </span>
              <span className="text-muted-foreground">Serial / OctoPrint</span>
              <span className={printer?.octoprintConnected ? "text-pg-healthy" : "text-pg-offline"}>
                {printer?.octoprintConnected ? "Connected" : "Offline"}
              </span>
              <span className="text-muted-foreground">Latency</span>
              <span className="text-foreground tabular-nums">
                {printer?.latencyMs ? `${printer.latencyMs}ms` : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-border flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Save size={14} />
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-surface-2 border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-surface-3 transition-colors"
          >
            Cancel
          </button>
        </div>
      </aside>
    </>
  );
}
