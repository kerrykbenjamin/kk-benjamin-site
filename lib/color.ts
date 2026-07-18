/**
 * Shared color/contrast utilities — used by BOTH the server (API route
 * validation, the source of truth) and the client (live preview + instant
 * feedback before a save is even attempted). Never trust a client-only check:
 * every save re-validates here on the server.
 */

const HEX_RE = /^#[0-9a-f]{6}$/i;

export function isValidHex(hex: string): boolean {
  return HEX_RE.test(hex);
}

function lin(c: number): number {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex: string): number {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG relative-luminance contrast ratio between two hex colors (1–21). */
export function contrastRatio(a: string, b: string): number {
  const L1 = luminance(a),
    L2 = luminance(b);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

/** AA minimum for normal body/heading text. */
export const AA_TEXT = 4.5;
/** AA minimum for large text (≥18px bold / ≥24px) and non-text UI graphics. */
export const AA_LARGE = 3;

export function mix(hex: string, target: string, amt: number): string {
  const n = (h: string) => parseInt(h.replace("#", ""), 16);
  const a = n(hex),
    t = n(target);
  const ar = (a >> 16) & 255,
    ag = (a >> 8) & 255,
    ab = a & 255;
  const tr = (t >> 16) & 255,
    tg = (t >> 8) & 255,
    tb = t & 255;
  const r = Math.round(ar + (tr - ar) * amt);
  const g = Math.round(ag + (tg - ag) * amt);
  const b = Math.round(ab + (tb - ab) * amt);
  return (
    "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase()
  );
}

/** Picks whichever of two candidate foregrounds contrasts better against `bg`. */
export function bestForeground(bg: string, candidates: [string, string]): string {
  const [a, b] = candidates;
  return contrastRatio(bg, a) >= contrastRatio(bg, b) ? a : b;
}

export type ContrastCheck = {
  ok: boolean;
  ratio: number;
  minRequired: number;
  message?: string;
};

/** Shape shared by every case-study/site color theme (see data/caseStudies.ts CaseStudyTheme). */
export type ResolvedTheme = {
  tint: string;
  card: string;
  accent: string;
  text: string;
  dark: string;
  onDark: string;
};

/**
 * Plain-English-ready contrast gate. `role` picks the required threshold and
 * tailors the failure message so a non-technical editor understands what to
 * try next, instead of a raw ratio number.
 */
export function checkContrast(
  foreground: string,
  background: string,
  role: "text" | "large" = "text",
): ContrastCheck {
  const ratio = contrastRatio(foreground, background);
  const minRequired = role === "text" ? AA_TEXT : AA_LARGE;
  if (ratio >= minRequired) return { ok: true, ratio, minRequired };

  const bgIsLighter = luminance(background) > luminance(foreground);
  const message = bgIsLighter
    ? "This text won't be readable on that background — try a darker background, or a lighter text/accent color."
    : "This text won't be readable on that background — try a lighter background, or a darker text/accent color.";
  return { ok: false, ratio, minRequired, message };
}

/**
 * Derives a full theme from an editor's two picks (background + accent).
 * Accent doubles as the heading/text color AND the dark-surface/badge fill —
 * that's the one pairing the caller must gate on `checkContrast` before
 * calling this. Everything else is auto-derived and safely defaults back
 * toward `bg` if it would ever fail.
 *
 * Pure and dependency-free (only this module) so it can run identically on
 * the server (the source of truth, in the theme API route) AND the client
 * (ColorPanel's live preview) — the same function, not a hand-approximated
 * copy, guarantees preview and saved result can never diverge.
 */
export function resolveCustomTheme(bg: string, accent: string): ResolvedTheme {
  let card = mix(bg, accent, 0.12);
  if (!checkContrast(accent, card, "text").ok) card = bg; // auto-correct, never block on a derived value
  const onDark = bestForeground(accent, [bg, "#FFFFFF"]);
  return { tint: bg, card, accent, text: accent, dark: accent, onDark };
}
