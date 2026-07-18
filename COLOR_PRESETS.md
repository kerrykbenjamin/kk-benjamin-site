# Color Presets

Five curated, pre-validated color combinations available in the edit dashboard's
color panel — for the whole site, or for an individual case-study page. Every
preset was contrast-checked before being offered as an option, so **picking one
can never produce unreadable text.** Four of the five reuse tones already
established elsewhere on the site (the three per-case-study accent palettes
from `CASE_STUDY_PALETTES.md`, plus the site's own blush accent), so nothing
introduces an unfamiliar new hue into the brand.

| Preset | Background | Card | Text | Dark surface | On dark | Decorative accent | Text/bg contrast |
|---|---|---|---|---|---|---|---|
| **Classic** (site default) | `#FBF7F1` | `#FFFAF4` | `#1F2A19` | `#182312` | `#FBF7F1` | `#6F8B5F` | 15.3:1 |
| **Sage Forest** *(Natural Beauty tones)* | `#F0EDE4` | `#EBDECC` | `#47463E` | `#47463E` | `#F4EFE4` | `#9CA387` | 8.1:1 |
| **Blush Rose** *(site's own blush accent, leaned into)* | `#FAEFEC` | `#F6DEE0` | `#1F2A19` | `#182312` | `#FBF7F1` | `#EFB8C7` | 13.3:1 |
| **Warm Retro** *(Throwback Pizza tones)* | `#F4E8D0` | `#F6E2BA` | `#0D3B66` | `#0D3B66` | `#F4E8D0` | `#2A9D8F` | 9.4:1 |
| **Peach Bloom** *(Perfected Flower tones)* | `#F9DFC2` | `#F7CFB1` | `#70592F` | `#70592F` | `#F9DFC2` | `#DE7A1D` | 5.2:1 |

All five clear the 4.5:1 AA minimum for body text with margin to spare (the
tightest, Peach Bloom, still has 15% headroom above the requirement).

## Scope

- **Site-wide**: applies to the whole site by overriding the site's own design
  token CSS variables (`--color-cream`, `--color-forest`, `--color-forest-deep`,
  `--color-sage`, `--color-ivory`) at the root — every page picks it up
  automatically, no per-page setup.
- **Per-page** (case-study pages only, since those are the only pages with
  their own section-level theme): overrides just that one page's accent
  variables, leaving the site-wide choice and every other page untouched.

## Custom colors

Beyond the five presets, the dashboard also offers a **background + accent**
color picker per scope. Every custom combination is contrast-checked against
the existing text color **before it can be saved** — if it fails, the save is
blocked with a plain-English message instead of a raw contrast-ratio error.
The accent color's own on-accent foreground (used on badges/buttons) is
**auto-selected** between two safe candidates rather than asking the editor to
manage a third color — see `lib/theme/index.ts`.

"Reset to default" is always available and restores the site's/page's original
built-in colors exactly (same fail-safe pattern as the rest of the content
system — a missing or corrupted saved selection also falls back to default,
never renders broken).
