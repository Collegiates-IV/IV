"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface SectionNavItem {
  id: string;
  label: string;
}

interface SectionNavProps {
  sections: SectionNavItem[];
  className?: string;
}

/**
 * Compact sticky in-page navigation bar.
 * Placed below the page header on long pages (Dashboard, Settings, Analytics).
 * Uses IntersectionObserver to highlight the currently-visible section.
 */
export function SectionNav({ sections, className }: SectionNavProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const callback: IntersectionObserverCallback = (entries) => {
      // Find the first section that is ≥ 40% visible
      const visible = entries
        .filter((e) => e.isIntersecting && e.intersectionRatio >= 0.15)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible.length > 0) {
        setActiveId(visible[0].target.id);
      }
    };

    observerRef.current = new IntersectionObserver(callback, {
      rootMargin: "-10% 0px -55% 0px",
      threshold: [0.15],
    });

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 100; // clearance for sticky bars
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
    setActiveId(id);
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-30 flex items-center gap-1 px-6 h-10",
        "bg-background/95 backdrop-blur-sm border-b border-border",
        className
      )}
      aria-label="Page sections"
    >
      {sections.map(({ id, label }) => {
        const active = activeId === id;
        return (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}
