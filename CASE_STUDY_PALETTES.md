# Case Study Accent Palettes

Per-project accent palettes for the three themed case studies. Hex values were
**sampled directly from pixel data** in the client reference sheets (not
approximated from memory) — see `scripts/sample-palette.mjs` /
`scripts/contrast.mjs` used to extract and verify them. Site chrome (header,
footer, nav, `Container`, global typography) stays on `DESIGN_TOKENS.md` tokens
on every page, unaffected by any of this.

**Dunkin Scholarly Study has no reference sheet and is intentionally left on the
site's default palette — flagging back per the brief. Supply a reference sheet
if you'd like it themed too.**

## How each project maps to UI roles

Every project defines two layers:
1. **Literal palette** — the exact sampled swatch colors, shown verbatim in the
   `PaletteSwatchRow` "Brand palette" section as case-study *content*.
2. **UI theme** — a small, accessibility-checked subset of roles (`tint`,
   `card`, `accent`, `text`, `dark`, `onDark`) used to actually color the page.
   Where a literal swatch failed WCAG contrast in its functional role, the UI
   theme uses a **derived, accessibility-adjusted variant** of that same color
   (documented below) — never a fabricated hue.

| Role | Used for |
|---|---|
| `tint` | Section background (replaces `bg-cream`) |
| `card` | Card/panel fill — At a Glance, deliverables, stat cards (replaces `bg-ivory`) |
| `accent` | Decorative only — connector lines, ring borders, swatch dots. **Not used for text or icon strokes** (fails contrast, see below) |
| `text` | Headings/body text within the themed page (replaces `text-forest`) |
| `dark` | Icon-badge fill + the campaign spotlight card background |
| `onDark` | Icon glyph + spotlight text + button fill on the dark surface |

---

## Natural Beauty

Sampled from the "BRAND IDENTITY" swatch row.

| Swatch (literal) | Hex |
|---|---|
| Sage Green | `#9CA387` |
| Cream | `#F4EFE4` |
| Warm Beige | `#DECAAE` |
| Soft Gold | `#CFB18B` |
| Charcoal | `#47463E` |

**UI theme:**
| Role | Hex | Source |
|---|---|---|
| `tint` | `#F0EDE4` | Sage mixed 88% into site cream |
| `card` | `#EBDECC` | Warm Beige mixed 45% into site cream |
| `accent` | `#9CA387` | Sage Green, literal — decorative only |
| `text` | `#47463E` | Charcoal, literal |
| `dark` | `#47463E` | Charcoal, literal |
| `onDark` | `#F4EFE4` | Cream, literal |

Contrast: Charcoal/tint **8.10:1** · Charcoal/card **7.16:1** · Cream/Charcoal (dark surface) **8.27:1** — all comfortably pass AA. Sage on light backgrounds measured **2.29:1 (text) / 2.62:1 (white icon)** — fails; that's why Sage is decorative-only and icon badges use the Charcoal/Cream dark-surface pairing instead.

---

## Throwback Pizza

Hex codes are printed directly on the reference sheet's own swatch labels — used verbatim, no sampling needed.

| Swatch (literal) | Hex |
|---|---|
| Red | `#D62828` |
| Cream | `#F4E8D0` |
| Yellow | `#FFC857` |
| Navy | `#0D3B66` |
| Teal | `#2A9D8F` |

**UI theme:**
| Role | Hex | Source |
|---|---|---|
| `tint` | `#F4E8D0` | Cream, literal |
| `card` | `#F6E2BA` | Yellow mixed 82% into Cream |
| `accent` | `#2A9D8F` | Teal, literal — decorative only |
| `text` | `#0D3B66` | Navy, literal |
| `dark` | `#0D3B66` | Navy, literal |
| `onDark` | `#F4E8D0` | Cream, literal |
| CTA-on-dark | bg `#FFC857` / text `#0D3B66` | Yellow button, Navy label |

Contrast: Navy/tint **9.43:1** · Navy/card **9.00:1** · Cream/Navy (dark surface) **9.43:1** · Yellow/Navy (CTA) **7.44:1** — all excellent. Teal measured **2.74:1 (text) / 3.32:1 (white icon)** — below the safe margin, so it's decorative-only (connector lines, ring borders); Red measured **4.13:1**, usable for bold/large accents but not guaranteed for small body text, so it's also kept decorative rather than relied on for readability.

---

## The Perfected Flower

Sampled from the "visual identity" swatch circles. **This replaces the earlier
placeholder earthy palette** used during the case-study-pilot pass — that was
explicitly flagged as a placeholder at the time; these are the real values.

| Swatch (literal) | Hex |
|---|---|
| Olive | `#837B1E` |
| Pink | `#E96E83` |
| Orange | `#DE7A1D` |
| Peach | `#F1916B` |
| Cream | `#F9DFC2` |
| Dark Olive-Brown | `#846937` |

**UI theme:**
| Role | Hex | Source |
|---|---|---|
| `tint` | `#F9DFC2` | Cream, literal |
| `card` | `#F7CFB1` | Peach mixed 80% into Cream |
| `accent` | `#DE7A1D` | Orange, literal — decorative only |
| `text` | **`#70592F`** | Dark Olive-Brown **darkened 15%** — see below |
| `dark` | `#70592F` | same accessibility-adjusted tone, for consistency |
| `onDark` | `#F9DFC2` | Cream, literal |

**Why `text`/`dark` differ from the literal swatch:** the sampled Dark
Olive-Brown (`#846937`) measured only **4.03:1** against the Cream tint/card —
below the 4.5:1 AA minimum for body text (Olive measured worse, 3.40:1). Per the
brief's guardrail, the tone was darkened by 15% toward black to
**`#70592F` (5.18:1)** for anywhere it's used as functional text or the dark
icon/spotlight surface. The **literal** `#846937` is preserved unmodified in the
"Brand palette" swatch display, since that IS real brand content and shouldn't
be altered. Pink and Orange measured 2.3–3.0:1 and are decorative-only for the
same reason as Natural Beauty's Sage and Throwback Pizza's Teal.

---

## Contrast methodology

WCAG 2.1 relative-luminance contrast ratio, computed programmatically (not
eyeballed) via `scripts/contrast.mjs`. AA thresholds applied: **4.5:1** for
body/small text, **3:1** for large text (≥18px bold / ≥24px) and non-text UI
graphics (icons, borders). Any palette color under 3:1 was excluded from every
text and icon-stroke role and used for decoration only (connector lines, ring
borders, swatch chips).
