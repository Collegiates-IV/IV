"use client";

import { User, Mail, Bell, Sliders, Building2, Shield } from "lucide-react";
import { SectionNav } from "@/components/section-nav";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "profile",       label: "Profile" },
  { id: "signin",        label: "Sign-In" },
  { id: "notifications", label: "Notifications" },
  { id: "detection",     label: "Detection" },
  { id: "organization",  label: "Organization" },
];

const LABEL_CLS = "block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide";
const INPUT_CLS =
  "w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm text-foreground " +
  "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring " +
  "focus:border-transparent transition-shadow";

function SectionCard({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="bg-card border border-border rounded-lg overflow-hidden scroll-mt-20"
    >
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-surface-2">
        <Icon size={14} className="text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-5">
        {children}
      </div>
    </section>
  );
}

export default function SettingsPage() {
  return (
    <div className="animate-fade-in">
      {/* ── Page Header ─────────────────────────────── */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <h1 className="text-lg font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Account, notifications, and lab preferences
        </p>
      </div>

      {/* ── Sticky Section Nav ──────────────────────── */}
      <SectionNav sections={SECTIONS} />

      {/* ── Content ─────────────────────────────────── */}
      <div className="px-6 py-8 space-y-6 max-w-2xl">

        {/* Profile */}
        <SectionCard id="profile" icon={User} title="Profile">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLS}>Display Name</label>
              <input className={INPUT_CLS} defaultValue="Lab Manager" />
            </div>
            <div>
              <label className={LABEL_CLS}>Email</label>
              <input className={INPUT_CLS} defaultValue="manager@dsu.edu" type="email" />
            </div>
          </div>
          <div className="mt-4">
            <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              Save Changes
            </button>
          </div>
        </SectionCard>

        {/* Sign-In Methods */}
        <SectionCard id="signin" icon={Shield} title="Sign-In Methods">
          <div className="space-y-2">
            {[
              { label: "Email / Password", status: "Connected" },
              { label: "Google OAuth",     status: "Not linked" },
            ].map(({ label, status }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2.5 px-3 bg-surface-2 rounded-md border border-border"
              >
                <span className="text-sm text-foreground">{label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{status}</span>
                  <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                    {status === "Connected" ? "Update" : "Link"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard id="notifications" icon={Bell} title="Notifications">
          <div className="space-y-4">
            {[
              { label: "Email alerts on confirmed failure",   desc: "Sends an email when a failure is confirmed (≥85% confidence)", enabled: true  },
              { label: "Email alerts on warning (50–85%)",    desc: "Sends an email on early-stage detections", enabled: false },
              { label: "SMS notifications",                   desc: "Requires phone number configuration", enabled: false },
              { label: "Browser push notifications",          desc: "In-browser alerts without email", enabled: true  },
            ].map(({ label, desc, enabled }) => (
              <div key={label} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
                <button
                  role="switch"
                  aria-checked={enabled}
                  className={cn(
                    "relative w-10 h-5 rounded-full transition-colors shrink-0 mt-0.5",
                    enabled ? "bg-primary" : "bg-border"
                  )}
                >
                  <span className={cn(
                    "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
                    enabled ? "translate-x-5" : "translate-x-0"
                  )} />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Detection Sensitivity */}
        <SectionCard id="detection" icon={Sliders} title="Detection Sensitivity">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Confidence threshold for warnings</span>
              <span className="font-medium text-foreground tabular-nums">50%</span>
            </div>
            <input
              type="range"
              min={30} max={90} defaultValue={50}
              className="w-full accent-primary"
              disabled
            />
            <p className="text-[11px] text-muted-foreground">
              Adjustable thresholds are coming in V2.0. Currently fixed at 50% (warning) and 85% (confirmed failure).
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Alert Behavior</p>
            {[
              { label: "Pause print on confirmed failure",  enabled: true },
              { label: "Continue monitoring after warning", enabled: true },
              { label: "Auto-resume after manual check",   enabled: false },
            ].map(({ label, enabled }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{label}</span>
                <button
                  role="switch"
                  aria-checked={enabled}
                  className={cn(
                    "relative w-10 h-5 rounded-full transition-colors shrink-0",
                    enabled ? "bg-primary" : "bg-border"
                  )}
                >
                  <span className={cn(
                    "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
                    enabled ? "translate-x-5" : "translate-x-0"
                  )} />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Organization */}
        <SectionCard id="organization" icon={Building2} title="Organization">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLS}>Lab / Org Name</label>
              <input className={INPUT_CLS} defaultValue="DSU Makerspace" />
            </div>
            <div>
              <label className={LABEL_CLS}>Institution</label>
              <input className={INPUT_CLS} defaultValue="Delaware State University" />
            </div>
          </div>
          <div className="mt-4">
            <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              Save Changes
            </button>
          </div>
        </SectionCard>

      </div>
    </div>
  );
}
