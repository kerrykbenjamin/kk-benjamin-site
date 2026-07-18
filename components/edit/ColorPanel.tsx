"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { THEME_PRESETS } from "@/lib/theme/presets";
import { checkContrast, isValidHex, resolveCustomTheme } from "@/lib/color";
import { caseStudies } from "@/data/caseStudies";

type ToastType = "success" | "error";
type Scope = "global" | `case.${string}`;

const GLOBAL_VAR_NAMES = [
  "--color-cream",
  "--color-ivory",
  "--color-sage",
  "--color-forest",
  "--color-forest-deep",
] as const;
const PAGE_VAR_NAMES = [
  "--cs-tint",
  "--cs-card",
  "--cs-accent",
  "--cs-text",
  "--cs-dark",
  "--cs-on-dark",
] as const;

function pageTarget(): HTMLElement | null {
  return document.querySelector<HTMLElement>("[data-cs-theme-root]");
}

/** Applies a preset's colors live, instantly, before any save. */
function applyPreview(scope: Scope, colors: {
  tint: string; card: string; accent: string; text: string; dark: string; onDark: string;
}) {
  if (scope === "global") {
    const el = document.documentElement;
    el.style.setProperty("--color-cream", colors.tint);
    el.style.setProperty("--color-ivory", colors.card);
    el.style.setProperty("--color-sage", colors.accent);
    el.style.setProperty("--color-forest", colors.text);
    el.style.setProperty("--color-forest-deep", colors.dark);
  } else {
    const el = pageTarget();
    if (!el) return;
    el.style.setProperty("--cs-tint", colors.tint);
    el.style.setProperty("--cs-card", colors.card);
    el.style.setProperty("--cs-accent", colors.accent);
    el.style.setProperty("--cs-text", colors.text);
    el.style.setProperty("--cs-dark", colors.dark);
    el.style.setProperty("--cs-on-dark", colors.onDark);
  }
}

function snapshot(scope: Scope): Record<string, string> {
  const el = scope === "global" ? document.documentElement : pageTarget();
  const names = scope === "global" ? GLOBAL_VAR_NAMES : PAGE_VAR_NAMES;
  const out: Record<string, string> = {};
  if (!el) return out;
  const cs = getComputedStyle(el);
  for (const n of names) out[n] = cs.getPropertyValue(n).trim();
  return out;
}

function restore(scope: Scope, snap: Record<string, string>) {
  const el = scope === "global" ? document.documentElement : pageTarget();
  if (!el) return;
  for (const [k, v] of Object.entries(snap)) {
    if (v) el.style.setProperty(k, v);
  }
}

export default function ColorPanel({
  open,
  onClose,
  toast,
}: {
  open: boolean;
  onClose: () => void;
  toast: (m: string, t?: ToastType) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const pageSlug = useMemo(() => {
    const m = pathname?.match(/^\/portfolio\/([^/]+)$/);
    if (!m) return null;
    const study = caseStudies.find((c) => c.slug === m[1]);
    return study?.template === "rich" ? study.slug : null;
  }, [pathname]);

  const [scope, setScope] = useState<Scope>("global");
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [bg, setBg] = useState("#FBF7F1");
  const [accent, setAccent] = useState("#1F2A19");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const originalSnapshot = useRef<Record<string, string>>({});

  // Reset to a sensible scope whenever the panel opens.
  useEffect(() => {
    if (!open) return;
    setScope(pageSlug ? `case.${pageSlug}` : "global");
    setMode("preset");
    setDirty(false);
  }, [open, pageSlug]);

  // Snapshot current live colors so an abandoned preview can be reverted.
  useEffect(() => {
    if (!open) return;
    originalSnapshot.current = snapshot(scope);
  }, [open, scope]);

  function revertPreview() {
    if (Object.keys(originalSnapshot.current).length) {
      restore(scope, originalSnapshot.current);
    }
    setDirty(false);
  }

  function handleClose() {
    if (dirty) revertPreview();
    onClose();
  }

  function previewPreset(id: string) {
    const preset = THEME_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    applyPreview(scope, preset.colors);
    setDirty(true);
  }

  function previewCustom(nextBg: string, nextAccent: string) {
    if (!isValidHex(nextBg) || !isValidHex(nextAccent)) return;
    // The SAME function the server uses to derive + save (lib/color.ts), not
    // a hand-approximated copy — guarantees the preview can never show a
    // different color than what actually gets saved (e.g. the badge/CTA
    // foreground, which isn't always `bg`; see resolveCustomTheme).
    applyPreview(scope, resolveCustomTheme(nextBg, nextAccent));
    setDirty(true);
  }

  const liveCheck =
    mode === "custom" && isValidHex(bg) && isValidHex(accent)
      ? checkContrast(accent, bg, "text")
      : null;

  async function savePreset(id: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/content/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, mode: "preset", presetId: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Couldn't save that color.", "error");
        setSaving(false);
        return;
      }
      toast("Colors updated");
      setDirty(false);
      onClose();
      router.refresh();
    } catch {
      toast("Couldn't save. Check your connection.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function saveCustom() {
    if (!liveCheck?.ok) {
      toast(liveCheck?.message ?? "Please pick two valid colors.", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/content/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, mode: "custom", bg, accent }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Couldn't save those colors.", "error");
        setSaving(false);
        return;
      }
      toast("Colors updated");
      setDirty(false);
      onClose();
      router.refresh();
    } catch {
      toast("Couldn't save. Check your connection.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function resetToDefault() {
    setSaving(true);
    try {
      const res = await fetch("/api/content/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, mode: "default" }),
      });
      if (!res.ok) {
        toast("Couldn't reset. Try again.", "error");
        setSaving(false);
        return;
      }
      toast("Reset to default colors");
      setDirty(false);
      onClose();
      router.refresh();
    } catch {
      toast("Couldn't reset. Check your connection.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center bg-forest-deep/40 px-4 pb-24 pt-10 sm:items-center sm:pb-10">
      <div className="max-h-full w-full max-w-md overflow-y-auto rounded-[16px] bg-cream p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-h3 font-semibold text-forest">Colors</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="-mr-2 -mt-2 flex h-11 w-11 items-center justify-center text-forest/60"
          >
            ✕
          </button>
        </div>

        {pageSlug && (
          <div className="mt-4 flex gap-2" role="tablist" aria-label="Color scope">
            <button
              type="button"
              onClick={() => setScope("global")}
              className={`flex-1 rounded-full border px-3 py-2 text-[0.7rem] font-medium uppercase tracking-[0.1em] ${
                scope === "global"
                  ? "border-forest bg-forest text-cream"
                  : "border-forest/20 text-forest/70"
              }`}
            >
              Site-wide
            </button>
            <button
              type="button"
              onClick={() => setScope(`case.${pageSlug}`)}
              className={`flex-1 rounded-full border px-3 py-2 text-[0.7rem] font-medium uppercase tracking-[0.1em] ${
                scope !== "global"
                  ? "border-forest bg-forest text-cream"
                  : "border-forest/20 text-forest/70"
              }`}
            >
              This page
            </button>
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("preset")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-wide ${
              mode === "preset" ? "bg-forest text-cream" : "bg-forest/10 text-forest/70"
            }`}
          >
            Presets
          </button>
          <button
            type="button"
            onClick={() => setMode("custom")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-wide ${
              mode === "custom" ? "bg-forest text-cream" : "bg-forest/10 text-forest/70"
            }`}
          >
            Custom
          </button>
        </div>

        {mode === "preset" ? (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {THEME_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onMouseEnter={() => previewPreset(p.id)}
                onFocus={() => previewPreset(p.id)}
                onClick={() => savePreset(p.id)}
                disabled={saving}
                className="rounded-[10px] border border-forest/15 p-3 text-left transition-colors hover:border-forest/40 disabled:opacity-50"
              >
                <div className="flex gap-1.5">
                  <span
                    className="h-6 w-6 rounded-full ring-1 ring-inset ring-forest/10"
                    style={{ backgroundColor: p.colors.tint }}
                  />
                  <span
                    className="h-6 w-6 rounded-full ring-1 ring-inset ring-forest/10"
                    style={{ backgroundColor: p.colors.dark }}
                  />
                  <span
                    className="h-6 w-6 rounded-full ring-1 ring-inset ring-forest/10"
                    style={{ backgroundColor: p.colors.accent }}
                  />
                </div>
                <p className="mt-2 text-sm font-medium text-forest">{p.name}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-forest/60">
                Background color
              </span>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  type="color"
                  value={bg}
                  onChange={(e) => {
                    setBg(e.target.value);
                    previewCustom(e.target.value, accent);
                  }}
                  className="h-11 w-16 cursor-pointer rounded-[8px] border border-forest/15"
                />
                <span className="font-mono text-sm text-forest/70">{bg}</span>
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-forest/60">
                Accent color (headings &amp; buttons)
              </span>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  type="color"
                  value={accent}
                  onChange={(e) => {
                    setAccent(e.target.value);
                    previewCustom(bg, e.target.value);
                  }}
                  className="h-11 w-16 cursor-pointer rounded-[8px] border border-forest/15"
                />
                <span className="font-mono text-sm text-forest/70">{accent}</span>
              </div>
            </label>

            {liveCheck && (
              <p
                className={`rounded-[8px] px-3 py-2 text-sm ${
                  liveCheck.ok
                    ? "bg-sage/15 text-forest"
                    : "bg-[#8a2d2d]/10 text-[#8a2d2d]"
                }`}
              >
                {liveCheck.ok
                  ? "✓ This combination is easy to read."
                  : liveCheck.message}
              </p>
            )}

            <button
              type="button"
              onClick={saveCustom}
              disabled={saving || !liveCheck?.ok}
              className="w-full rounded-[8px] bg-forest px-4 py-3 text-sm font-medium uppercase tracking-wide text-cream disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save custom colors"}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={resetToDefault}
          disabled={saving}
          className="mt-5 w-full rounded-[8px] border border-forest/15 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-forest/70 hover:text-forest disabled:opacity-40"
        >
          Reset to default
        </button>
      </div>
    </div>
  );
}
