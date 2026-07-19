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

### Extended sections (doc-sourced content — NB / Throwback / Perfected Flower)
- [ ] **Section order** matches: header → Challenge → Objectives → Audience +
      Persona → Pillars → Visual identity (+ photography) → Strategy → Process
      → Deliverables → Content mix → Campaign spotlight → Local marketing →
      Marketing funnel → Sample performance metrics → Results → Key takeaways
      → What I learned → Skills — only sections with data appear, in this order
- [ ] **Background alternation is computed from VISIBLE sections**, not
      hardcoded — no two adjacent sections share the same tint/card color on
      ANY of the 4 pages, regardless of how many optional sections a study has
- [ ] **Dunkin renders unchanged**: same section set, same content, same
      template as before this work — it has none of the 10 new sections and is
      not in the notes doc
- [ ] **The Perfected Flower is the empty-state proof**: Target audience,
      Persona, Brand pillars, photography-in-visual-identity, Deliverables,
      Local marketing, Marketing funnel, and Sample performance metrics ALL
      hide cleanly — no empty headings, no blank padded bands, no leftover
      section wrapper
- [ ] **Challenge / Objectives / Local marketing / Key takeaways** (generic
      bullet-block sections): heading + intro + bulleted items + outro render
      only where the study has that field; accent-dot bullets
- [ ] **Target audience + Persona**: primary list (+ intro/secondary where
      present) plus a distinct dark/onDark persona callout card — NOT styled
      like a plain bullet list
- [ ] **Brand pillars**: Natural Beauty's pillars (have descriptions) render as
      a card grid; Throwback's pillars (no descriptions) render as a dark chip
      row — both driven by the same data, no hardcoded per-project switch
- [ ] **Photography style** list appears inside Visual identity for NB/Throwback
      only; absent (not empty) on Perfected Flower/Dunkin
- [ ] **Strategy sections** (Perfected Flower only): 5 numbered subsections,
      each with circle badge + title, optional intro, 2-col bullets at `md`,
      optional outro — reuses the ProcessSteps numbering language
- [ ] **Deliverables — grouped mode**: NB (3 groups/13 items) and Throwback (3
      groups/16 items) render subheadings per group; flat/ungrouped mode still
      works unchanged for Dunkin
- [ ] **Content mix bars**: bar widths are proportional to each category's
      `percent` and the set sums to 100% per study (NB/PF 40/30/20/10,
      Throwback 30/30/20/20) — CSS-only, no charting library
- [ ] **Campaign spotlight text** (NB "Glow Naturally", Throwback "Flashback
      Fridays"): name/description/element-list/outro render above the 3 photo
      slots; Perfected Flower/Dunkin show photos only (no campaign copy), as
      before
- [ ] **Marketing funnel** (NB/Throwback, 4 stages each): horizontal with
      connector lines at `lg`+, stacked at 375px — same visual language as
      Process steps
- [ ] **Sample performance metrics table**: real `<table>` at `sm+`, stacked
      label/Before/After cards below `sm` — confirm **no horizontal overflow
      at 375px** (`document.documentElement.scrollWidth <= innerWidth`); the
      "projected outcomes for portfolio demonstration purposes" note is
      visible in the viewport alongside the numbers on every study that has
      this section; Throwback's "Online Orders" row reads Before "—" / After
      "+38%"
- [ ] **Skills chips**: dark/onDark pill row, flex-wraps at any count (NB 12,
      Throwback 13, Perfected Flower 10)
- [ ] **Numbers audit**: `+215%`, `+180%`, `+68%`, `+42%` do NOT appear
      anywhere on Natural Beauty, Throwback Pizza, or The Perfected Flower;
      they still appear (unchanged) on Dunkin. Each study's new stat card(s)
      match the notes doc exactly — Natural Beauty is a single "+71%" card
      (this is correct, not a bug — the doc gives only one numeric outcome for
      that project)
- [ ] **Palette contrast**: every new section's guaranteed-legible text (chips,
      persona card, metric labels) uses the `dark`/`onDark` pairing, never
      `accent` for text (`CASE_STUDY_PALETTES.md`)
- [ ] **Editability**: every new field (challenge/objectives/audience/persona/
      pillars/photography/strategy/deliverable groups/content mix/campaign
      copy/funnel/metrics/skills) has a Field id registered in
      `lib/content/registry.ts` and is reachable through the normal edit-mode
      flow — the "projected outcomes" honesty notes and content-mix
      percentages are intentionally NOT editable (verified via static id
      cross-check against `data/caseStudies.ts`, not a live logged-in pass —
      `.env.local` has no dev password configured in this environment)
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
