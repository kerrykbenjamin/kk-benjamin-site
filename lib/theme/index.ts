import "server-only";
import { getStore } from "@/lib/content/store";
import { isValidHex, resolveCustomTheme } from "@/lib/color";
import { THEME_PRESETS, DEFAULT_PRESET_ID, getPreset } from "./presets";
import type { CaseStudyTheme } from "@/data/caseStudies";

export { THEME_PRESETS, DEFAULT_PRESET_ID, getPreset };
// Re-exported for callers that only import from "@/lib/theme" — the real
// implementation lives in lib/color.ts (dependency-free) so the client-side
// ColorPanel preview can import the exact same function, not a copy.
export { resolveCustomTheme };

type StoredSelection =
  | { mode: "default" }
  | { mode: "preset"; presetId: string }
  | { mode: "custom"; bg: string; accent: string };

/**
 * Reads directly from the store — NOT via lib/content's getText(), which
 * filters through the text/image field registry whitelist. Theme (and order)
 * keys are a different, separately-validated kind of content and must bypass
 * that whitelist or they'd be silently dropped.
 */
async function readSelection(scope: string): Promise<StoredSelection> {
  try {
    const all = await getStore().getAll();
    const mode = all[`theme.${scope}.mode`];
    if (mode === "preset") {
      const presetId = all[`theme.${scope}.presetId`];
      if (presetId && getPreset(presetId)) return { mode: "preset", presetId };
    } else if (mode === "custom") {
      const bg = all[`theme.${scope}.bg`];
      const accent = all[`theme.${scope}.accent`];
      if (bg && accent && isValidHex(bg) && isValidHex(accent)) {
        return { mode: "custom", bg, accent };
      }
    }
  } catch {
    // fall through to default below — never throw, never render blank
  }
  return { mode: "default" };
}

/** Site-wide theme. Falls back to the "Classic" preset (== site's literal defaults) on any missing/invalid data. */
export async function getGlobalTheme(): Promise<CaseStudyTheme> {
  const sel = await readSelection("global");
  if (sel.mode === "preset") return getPreset(sel.presetId)!.colors;
  if (sel.mode === "custom") return resolveCustomTheme(sel.bg, sel.accent);
  return getPreset(DEFAULT_PRESET_ID)!.colors;
}

/** Per-case-study override. Falls back to that PROJECT's own built-in theme (not "Classic"). */
export async function getPageTheme(
  slug: string,
  fallback: CaseStudyTheme,
): Promise<CaseStudyTheme> {
  const sel = await readSelection(`case.${slug}`);
  if (sel.mode === "preset") return getPreset(sel.presetId)!.colors;
  if (sel.mode === "custom") return resolveCustomTheme(sel.bg, sel.accent);
  return fallback;
}
