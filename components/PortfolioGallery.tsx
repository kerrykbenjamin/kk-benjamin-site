"use client";

import { useState, type ReactNode } from "react";

const FILTERS = ["ALL", "BRANDING", "SOCIAL", "STRATEGY"] as const;
type Filter = (typeof FILTERS)[number];

/**
 * Filter tabs (styled STUB per the brief — every study touches all disciplines,
 * so all cards stay visible). The grid itself is owned by whatever's passed as
 * `children` (an OrderedGrid, in practice) — this component only renders the
 * tabs, so it never double-wraps the grid.
 */
export default function PortfolioGallery({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<Filter>("ALL");

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter work by discipline">
        {FILTERS.map((f) => {
          const selected = f === active;
          return (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(f)}
              className={`rounded-full border px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.16em] transition-colors ${
                selected
                  ? "border-forest bg-forest text-cream"
                  : "border-forest/20 text-forest/70 hover:border-forest/50 hover:text-forest"
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>

      {children}
    </div>
  );
}
