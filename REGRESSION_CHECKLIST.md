# Regression Checklist — KK Benjamin Site

Run through this after ANY change, before calling work done. Check at **375px,
768px, 1024px, 1440px**, and (for the edit-mode rows) **logged out AND logged in**.

**Verification rule that prevented past misses:** checking `textContent` is NOT
enough — content can exist in the DOM but be invisible (e.g. stuck at
`opacity: 0`). Verify *visibility* (computed opacity/height) or eyeball it.

## Global (every page)
- [ ] KB monogram logo in header (crisp, ~40px tall, links to `/`); favicon in tab
- [ ] Desktop nav ≥768px: HOME / ABOUT / PORTFOLIO / CONTACT
- [ ] Mobile <768px: hamburger (44×44) opens **full-screen opaque `forest-deep`**
      menu — zero page bleed-through, body scroll locked, closes via ×/Esc/link
- [ ] Contact CTA block ("Let's create something amazing together." + portrait +
      email/LinkedIn/location — **no phone**, that field is unregistered) present
      and **visible** above the footer. LinkedIn href is exactly
      `https://www.linkedin.com/in/kerry-benjamin-8b695b2a9/`, new tab + noopener
- [ ] **"Get in touch" opens the contact-form modal** (two-column variant:
      first/last name side-by-side ≥640px, stacked at 375px): required-field +
      email validation with plain-English messages; Sending → success replaces
      the form / error offers retry (no key set = clear error, never fake
      success); closes via ×/backdrop/Esc; focus trap + restore + scroll lock;
      in edit mode the button label edits instead of opening the modal
- [ ] Footer: inverted logo, nav links, © line
- [ ] No horizontal scroll at any breakpoint
- [ ] No stuck-invisible sections (nothing left at `opacity: 0` after scroll)
- [ ] **Lightbox is SINGLE-IMAGE**: clicking an eligible photo opens only that
      photo — no arrows, no counter, arrow keys and swipe do nothing; closes
      via × / backdrop / Esc; focus trapped + restored; body scroll locked

## Home `/`
- [ ] Hero: eyebrow, H1 "I create strategies…", subhead, 2 CTAs, hero image
- [ ] Featured case studies: 4 cards (Perfected Flower, Natural Beauty,
      Throwback Pizza, Dunkin), each with image + title + tagline + VIEW PROJECT →
- [ ] Value props: **4 populated cards** (Strategic Thinker / Creative Designer /
      Results Driven / People First) — this section blanked out once before
- [ ] Testimonial: TPF quote + attribution

## About `/about`
- [ ] Intro: eyebrow, H1, body, 2 CTAs, portrait
- [ ] My Story: kicker + eyebrow + H2 + body
- [ ] How I Work: steps 01–03 populated + pull quote
- [ ] What I bring: 4 columns (Strategy / Design / Storytelling / Results)
- [ ] Experience: body + 2 stat tiles (25+ / 3) + closing line

## Portfolio `/portfolio`
- [ ] Intro: eyebrow, H1, subhead
- [ ] Filter tabs (ALL/BRANDING/SOCIAL/STRATEGY) styled, active state works
- [ ] Case studies grid: **even 2×2 on ≥640px** (no orphaned 4th card), 1-col mobile
- [ ] Illustrations and Projects: **16-slot square-tile gallery** (count =
      `GALLERY_SLOT_COUNT` in data/portfolioIllustrations.ts): uniform 1:1
      tiles, 2 columns below `lg` (8 full rows) / 4×4 at `lg+`, no orphaned
      partial rows — note 16 does NOT divide by 3, so no `md:grid-cols-3` step;
      empty slots show the styled GalleryPlaceholder (site tokens, never
      broken/blank); grid tiles are BARE images — no caption text for
      visitors OR for a logged-in editor who is browsing (caption fields
      appear under tiles only while "Edit site" is toggled on); title/tagline
      display centered along the bottom of the LIGHTBOX (gradient scrim, no
      empty bar when a tile has no caption; case-study images stay
      caption-free); placeholders never open the lightbox; edit-mode wins when
      logged in; tiles editable via Add/Change photo with 1:1 auto-crop,
      swap-only
- [ ] Mini CTA ("Have a campaign…" + LET'S TALK →)

## Case studies `/portfolio/[slug]`
**All four slugs render the RICH template** (the plain 04–09 template was retired
and `PlainCaseStudy.tsx` deleted). the-perfected-flower / natural-beauty /
throwback-pizza use their accent palettes; dunkin-scholarly-study stays on the
default DESIGN_TOKENS.md tokens.
- [ ] All 4 render: At-a-glance sidebar card, strategy list, process step row
      (horizontal ≥768px / stacked mobile), deliverables checklist (✓), dark
      campaign spotlight, 4 icon stat cards + caption, reflection — fully
      populated, nothing lost vs the old template
- [ ] **Visual identity section** (palette swatches + Typography block side-by-side
      ≥1024px, stacked below): shows for the 3 themed projects; **hides cleanly
      for Dunkin** (no palette, no fonts — section absent, not empty)
- [ ] **Typography block**: font name + role + specimen "Aa" image per font
      (Playfair/Montserrat, Bebas/Montserrat, Cooper Black/Grotesk Rounded);
      specimen `alt` = font name; images are static (no client webfont loaded)
- [ ] **Process step photos**: every step shows a SQUARE (1:1) slot — empty =
      the designed placeholder tile (step icon + step name on the project's
      `tint`; Dunkin on default tokens), NEVER a blank/broken/dashed box; all
      three states (all/some/no photos) have identical geometry — no gaps, no
      ragged heights; uploads center-crop to square with zero layout shift;
      swap-only (no remove control exists — do not add one)
- [ ] **Deliverables** have NO dead space at any item count — filled cards pack
      the row (1-col mobile → 2-col desktop; lone odd item grows to fill)
- [ ] **Campaign spotlight = 3 photos** (3-across ≥640px / stacked mobile) on the
      dark surface; empty = intentional placeholder frames (not broken/empty);
      NO "SHOP NOW" button or mockup copy remains
- [ ] **Results caption** centered under the 4 stat cards, no overflow at 375px
- [ ] All 4 slugs resolve; back-to-portfolio link works

## Edit mode
- [ ] Logged OUT: zero edit traces (view-source too — no "Edit site", no ✎,
      no `api/content` references)
- [ ] `/edit` login works; wrong password rejected; lockout after 5 failures
- [ ] Logged IN: toolbar appears; Edit Site → dashed outlines + ✎ on text,
      "Change photo" on images; save → toast → persists after reload;
      too-long/empty text rejected with clear error
- [ ] New case-study edit slots all work: font name + role (text), each process
      step **"Add photo"** (empty) / "Change photo" (set), each of the 3 campaign
      **"Add photo"** spotlight slots, and the results caption (text). Upload →
      toast → persists; replacing a photo only changes THAT slot (16 process
      slots are independent per project × step) and deletes the old upload from
      storage (no orphan accumulation)
- [ ] **No dead image clicks in ANY state**: logged OUT → lightbox; logged IN
      browsing (Edit site OFF) → same lightbox as visitors; Edit site ON →
      clicking ANYWHERE on an editable photo opens the picker (whole tile is
      the target, not just the pill) and the lightbox never fires
- [ ] Done Editing hides affordances; Log out removes everything
- [ ] Server logs show NO "⚠️ [content]" fallback warnings (that warning means
      saved edits are silently not displaying — investigate immediately)

## Build
- [ ] `npm run build` completes with no type/lint errors

## Architecture invariants (root causes of past regressions — do not reintroduce)
- [ ] Scroll-entrance animation (`components/Reveal.tsx`) must be FAIL-VISIBLE:
      server HTML contains no `opacity:0` inline styles (`curl` a page and grep).
      Never SSR content hidden and rely on JS to reveal it.
- [ ] No full-screen `fixed` overlay may live inside the header (its
      `backdrop-blur` makes it the containing block and traps `fixed inset-0`)
- [ ] Global element resets in `globals.css` must stay inside `@layer base`
      (unlayered CSS overrides Tailwind v4 utilities — broke logo sizing once)
