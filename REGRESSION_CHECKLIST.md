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
- [ ] All 4 render: At-a-glance sidebar card, dark campaign spotlight, and the
      sections their own notes supply — fully populated, nothing lost vs the old
      template. NB / Throwback / Perfected Flower additionally show the process
      step row (horizontal ≥768px / stacked mobile), deliverables checklist (✓),
      stat cards + caption and reflection; **Dunkin legitimately has none of
      those four** (see its own block below) — that is correct, not a regression

### Extended sections (doc-sourced content — NB / Throwback / Perfected Flower)
- [ ] **Section order** matches: header → Challenge → Objectives → Audience +
      Persona → Pillars → Visual identity (+ photography) → Strategy → Process
      → Deliverables → Content mix → Campaign spotlight → Local marketing →
      Marketing funnel → Sample performance metrics → Results → Key takeaways
      → What I learned → Skills — only sections with data appear, in this order
- [ ] **Background alternation is computed from VISIBLE sections**, not
      hardcoded — no two adjacent sections share the same tint/card color on
      ANY of the 4 pages, regardless of how many optional sections a study has
- [ ] **Dunkin is now fully populated from its own capstone notes** (it is NOT
      the empty-state case any more). 13 sections in this order: header →
      Skills → Challenge → Objectives → Target audience → My role → Strategy →
      Creative direction → Marketing campaign → Campaign spotlight → Financial
      highlights → Success metrics → Results. Stays on the DEFAULT tokens (no
      accent palette/fonts) and still color-customizable in edit mode
- [ ] **Dunkin is the empty-state proof for the ALWAYS-ON sections**: Process,
      Results stat cards, the results caption, and What I learned all hide
      cleanly when the source has no content — no empty heading, no blank
      padded band, no stray grid margin. (Its notes supply no process steps, no
      results figures and no reflection.) Visual identity, Content mix, Funnel,
      Metrics table, Persona and Key takeaways hide as before
- [ ] **Dunkin capstone/projection framing is VISIBLE and partly non-editable** —
      regression here is a factual-accuracy bug, not cosmetic:
      - category eyebrow reads `INTEGRATED MARKETING CAMPAIGN | MASTER'S CAPSTONE`
      - At-a-glance Client row says `academic concept project — not a client engagement`
      - `Proposed projections — not achieved results` sits beside the Financial
        highlights heading and is **not** an editable Field (like metricsNote)
      - `Academic capstone — proposed campaign, not a live launch` sits beside
        the Results heading and is **not** editable
      - **No Dunkin' logo, wordmark or brand asset anywhere** — the hero is a
        generic desk photo; never source or recreate one
- [ ] **Dunkin At-a-glance shows 4 rows, no Timeline** — the notes give no
      dates, so the row is omitted entirely rather than rendered empty
      (`AtAGlanceCard` renders only the keys a study declares; the other three
      studies still show all 5 rows)
- [ ] **Financial highlights are CARDS, never a table** — 5 figures ($2.99 /
      $1.95 / 65M units / $18M / 32.7M units) in a 1-col → 2-col → 3-col grid;
      verify **zero horizontal overflow at 375px**, which a real table caused
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
- [ ] **Strategy sections** (Perfected Flower only): 5 equal-width cards, each
      with circle badge + title, optional intro, single-col bullets, optional
      outro — 3-up top row + 2 CENTERED (not left-aligned/stretched) beneath at
      `lg`, all five the same pixel width; 2-up at `md` with the 5th centered;
      single stacked column on mobile
- [ ] **Deliverables — grouped mode**: NB (3 groups/13 items) and Throwback (3
      groups/16 items) render subheadings per group under the "Deliverables"
      label; Dunkin reuses the same grouped component for its campaign channels
      (3 groups/14 items) but relabels the section **"Marketing campaign"** via
      `deliverablesLabel` — the default label must stay "Deliverables"
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
      they still appear (unchanged) on Dunkin. Each study's stat card(s) match
      the reference data exactly — Natural Beauty shows FOUR cards (71% social
      audience, 141% engagement, 116% conversion, 75% email open rate), every
      value derived from its own Before/After metrics table (2,400→4,100 /
      2.7→6.5% / 1.8→3.9% / 24→42%); 4-across at `lg`, 2×2 at `sm`, stacked
      below — never an orphaned card
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
- [ ] **Campaign spotlight = a carousel over SPOTLIGHT_SLOT_COUNT (6) media
      slots** on the dark surface; featured single item centered in `max-w-3xl`,
      aspect 4/3; NO "SHOP NOW" button or mockup copy remains
- [ ] **Spotlight carousel (SpotlightCarousel — all 4 pages)**:
      - shows ONE item at a time; every slide identical dimensions → zero
        layout shift between a photo, GIF, and video slide (verify equal widths
        at 375 / 768 / 1024 / 1440)
      - empty slots are SKIPPED for visitors (2 filled → 2-item carousel);
        0 filled → one static dashed "Campaign media" placeholder, no controls;
        1 filled → static single item, no arrows/dots/auto-advance;
        ≥2 filled → full carousel
      - controls: prev/next arrows ≥44×44 (`aria-label` "Previous"/"Next"),
        dots with `aria-label` "Go to slide N" + `aria-current`, ArrowLeft/Right
        when focused; `role="region"` + `aria-roledescription="carousel"`,
        slides `aria-roledescription="slide"` labeled "N of M", polite live
        region announces "Slide N of M"
      - arrows BRACKET the media (flex siblings in the card padding) and never
        overlap the photo/GIF/video — verify prev.right ≤ frame.left and
        next.left ≥ frame.right at 768/1024/1440; below `sm` (375) the arrows
        are hidden (no room outside the frame) and swipe + dots + ArrowLeft/
        Right drive it, media using the full width
      - swipe: `touch-action: pan-y` on the track (horizontal swipe advances,
        vertical gesture still scrolls the page); a swipe suppresses the slide's
        click (no accidental lightbox), a plain tap passes through
      - auto-advance every 6s; pauses on hover / focus-within / off-screen
        (IntersectionObserver) and stops PERMANENTLY after any interaction;
        under prefers-reduced-motion: no auto-advance AND instant (no slide
        transition)
      - wrap-around both directions (last→first, first→last)
      - LAZY: full media mounts only for the active slide + the next slide
        (wrap-aware); other slides render just their stored still — six videos
        never load at once
      - only the ACTIVE slide's video plays; leaving a slide pauses its video;
        a playing video HOLDS auto-advance for one play-through (capped at the
        30s upload limit) so it isn't cut off mid-view
- [ ] **Spotlight media rendering (per slide — lib/media.ts)**:
      - video: `<video muted loop playsinline preload="none">` + poster,
        autoplay only when active + near viewport, NEVER under reduced motion
        (poster + play control); overlay controls ≥44×44 with state-tracking
        aria-labels ("Play/Pause video", "Unmute/Mute video"); EXCLUDED from
        the lightbox (plays in place, no dead clicks)
      - GIF: honors reduced motion via stored `.poster` still + play toggle;
        keeps the lightbox; no poster → animated fallback (never blank)
      - photo: keeps the lightbox
- [ ] **Media uploads (50MB — direct-to-storage in production)**:
      - video/GIF cap 50MB, photos 15MB; videos ≤30s (client gate + server
        MP4 mvhd re-check); MP4/WebM only — .mov/others rejected with the
        plain-English lib/media.ts messages; caps enforced BEFORE upload
      - **production path**: /api/content/media/sign (JSON, tiny) → browser PUTs
        the file DIRECT to Supabase Storage (never through a function — a 50MB
        body would 413 on Netlify's ~6MB limit) → /api/content/media/commit
        (tiny) records the path + poster; **local dev**: sign returns
        `{mode:"local"}` → multipart /api/content/image (no function limit)
      - commit validates the object path matches `safeKeyForFile(key)-<ts>.ext`
        (can't point a slot at arbitrary objects) and re-checks the stored
        object's real size (purges + rejects an oversized upload)
      - all 3 upload endpoints (sign, commit, image) 401 when logged out
      - UX: real % progress bar for video/GIF, Cancel mid-upload, Retry on
        timeout/dropped connection (stall = 30s no-progress), slot never left
        half-changed; edit-mode slot reads "Add/Change media", whole slot opens
        the picker (playback/lightbox suppressed), video preview inert
      - replacing a video with a photo clears the stale `.poster`; replacing a
        video without a fresh poster clears it too
      - non-media image slots (process steps, gallery, hero) unaffected:
        photo-only accept, 15MB cap, GIFs there still flatten to static webp
- [ ] **Results caption** centered under the 4 stat cards, no overflow at 375px
- [ ] All 4 slugs resolve; back-to-portfolio link works

### Layout format (wireframe pass — all case study pages)
- [ ] **Header order**: back link → "Case Study" eyebrow + h1 title (full
      content width) → media row → category eyebrow + intro (full width).
      Media row at `lg` = hero image left (`8fr`, ≈60%, aspect 16/10) +
      At-a-glance card right (`5fr`, ≈37%); below `lg` everything is one
      column in that same reading order. Category/intro must not look
      stranded below the media (block top margin `mt-10 lg:mt-12`). Container
      max-width + gutters intact, no edge-to-edge bleed; title/category/intro
      Fields stay editable (eyebrow is static by design)
- [ ] **Skills demonstrated is section #2** on every study that has skills
      (all but Dunkin) — immediately after the header, before The challenge;
      chip component unchanged, only position moved
- [ ] **What I learned** spans the content column: `max-w-[72ch]` on the
      paragraph (≈960–1010px at 1440px, full column at ≤1024px), left-aligned,
      ~72 chars/line
- [ ] **Band-aware card surfaces**: every `<section>` sets `--cs-surface` to
      the OPPOSITE of its band color; StatCard, pillar cards, deliverables
      rows, metrics header/stacked cards, and strategy cards fill with
      `var(--cs-surface)` — so no card can ever blend into its band no matter
      how section parity shifts. Verify computed card bg ≠ section bg on all
      4 pages (this regressed once when Skills moved and flipped parity)

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
