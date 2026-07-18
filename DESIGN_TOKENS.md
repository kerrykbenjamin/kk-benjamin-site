# KK Benjamin — Design Tokens

Extracted **verbatim from the live reference site's rendered CSS**
(`https://sienna-iris-720715.framer.app/`), not approximated. Implemented in
`app/globals.css` via Tailwind v4 `@theme`. This file is the source of truth.

## Color palette

| Token (Tailwind class) | Hex | Role |
| --- | --- | --- |
| `cream` (`bg-cream`) | `#FBF7F1` | Page background |
| `ivory` (`bg-ivory`) | `#FFFAF4` | Raised card / alternating section background |
| `forest` (`text-forest`) | `#1F2A19` | Primary text |
| `forest-deep` (`bg-forest-deep`) | `#182312` | Darkest — contact section, footer, mobile menu |
| `forest-surface` | `#283321` | Secondary dark surface |
| `sage` (`text-sage`) | `#6F8B5F` | Accent (eyebrows, numerals, arrows) |
| `blush` (`text-blush`) | `#EFB8C7` | Accent (on dark, campaign mockups) |

Opacity modifiers are used throughout for muted text, e.g. `text-forest/70`.

## Typography

Both are free Google Fonts, loaded and self-hosted via `next/font/google`
(`app/layout.tsx`) — exact match to the reference, no substitutes.

- **Display / headings:** `Cormorant` (serif) — weights 500 / 600 / 700 → `font-display`
- **Body / UI:** `Inter` (sans) — weights 400 / 500 / 600 / 700 → `font-sans`

### Fluid type scale (`clamp()` — desktop values from the reference, scaled to 375px)

| Class | Size | Line height | Use |
| --- | --- | --- | --- |
| `text-display` | clamp(2.5rem → 4.75rem) | 1.03 | H1 hero |
| `text-h2` | clamp(1.9rem → 3rem) | 1.08 | Section H2 |
| `text-h3` | clamp(1.35rem → 1.75rem) | 1.15 | Card / capability titles |
| `text-lead` | clamp(1.05rem → 1.2rem) | 1.7 | Subheads / body lead |
| `text-stat` | clamp(2.25rem → 3.5rem) | 1 | Result / experience numbers |
| `.eyebrow` | 0.8125rem, 0.2em tracking, uppercase | — | Kickers / labels |

## Shape & spacing

- Buttons: `rounded-[6px]`; cards / image frames: `rounded-[14px]`–`rounded-[18px]`
- Content width: `max-w-[1200px]`, gutters `px-6 sm:px-8` (see `components/Container.tsx`)
- Section rhythm: `py-14 sm:py-20` (standard) / `py-16 sm:py-24` (feature)
- Mobile-first: every component built at 375px, scaled up with `sm:`/`md:`/`lg:`.
