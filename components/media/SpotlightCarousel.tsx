"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import EditableImageSlot from "@/components/edit/EditableImageSlot";
import SlotPlaceholder from "@/components/edit/SlotPlaceholder";
import LightboxImage from "@/components/lightbox/LightboxImage";
import { openLightbox, type LightboxItem } from "@/components/lightbox/lightbox-bus";
import SpotlightVideo from "./SpotlightVideo";
import SpotlightGif from "./SpotlightGif";
import { mediaKindFromUrl } from "@/lib/media";

/**
 * Lightbox group for a study's spotlight. Deliberately DISTINCT from the hero
 * (`case:<slug>:hero`) and the process photos (`case:<slug>:process`) so the
 * viewer's next/prev can never walk out of the spotlight into another section.
 */
export function spotlightGroup(slug: string) {
  return `case:${slug}:spotlight`;
}

/**
 * Campaign-spotlight carousel — the ONE-at-a-time featured media area inside
 * the dark SpotlightCallout card. Replaces the old 3-across grid.
 *
 * Slide-list rules (SpotlightCallout passes ALL registered slots, in order):
 *  - Visitor / editor browsing with Edit-site OFF: empty slots are skipped
 *    entirely — only slots with a real src become slides; dots match.
 *  - 0 filled → ONE static placeholder frame (dashed, "Campaign media") so
 *    the card never looks broken. No controls.
 *  - 1 filled → static single item: no arrows, no dots, no auto-advance.
 *  - ≥2 filled → full carousel (arrows, dots, swipe, keyboard, auto-advance).
 *  - Edit mode ON → ALL slots appear as slides (empty ones show the editable
 *    placeholder via EditableImageSlot) and auto-advance is disabled.
 *
 * Every slide shares the identical 4:3 frame, so mixed photo/GIF/video decks
 * have zero layout shift between slides.
 *
 * Lazy rule (visitor path): full media (video player / GIF / lightbox image)
 * mounts ONLY for the active slide and the next slide (wrap-aware); all other
 * slides render just their stored poster/src as a plain <img> — six videos
 * never load at once.
 *
 * Wrap-around: Next on the last slide returns to the first, Prev on the first
 * jumps to the last (the translateX track rewinds across the deck — no clone
 * slides). prefers-reduced-motion: instant jumps, and no auto-advance at all.
 *
 * Auto-advance: 6s. Pauses on hover / focus-within / off-screen
 * (IntersectionObserver) and stops PERMANENTLY after any user interaction
 * (arrow, dot, swipe, keyboard arrow).
 *
 * playback-agent: `holdAutoAdvanceRef` is the extension point for video
 * slides — set `.current = true` while a video should hold the deck (e.g.
 * until the clip finishes) and the 6s tick becomes a no-op without killing
 * the timer; set it back to `false` to resume.
 */

export type SpotlightSlide = {
  /** 1-based slot number (stable — matches the registry key). */
  n: number;
  /** Full field key, e.g. `case.<slug>.spotlight.<n>.image`. */
  key: string;
  /** Stored media URL ("" when the slot is empty). */
  src: string;
  /** Companion poster URL ("" when absent). */
  poster: string;
};

/** Featured single item ≈ max-w-3xl wide (768px) at desktop. */
const SIZES = "(max-width: 832px) 94vw, 768px";

// Prev/next arrows sit OUTSIDE the media frame, in the dark spotlight card's
// padding — so they never obscure the photo/GIF/video. On the `--cs-dark`
// surface the onDark foreground is the contrast-safe role (validated in
// CASE_STUDY_PALETTES.md); a translucent onDark fill reads as a button
// without matching the card. `shrink-0` keeps them 44×44 as the media flexes.
const CTRL_BTN =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full " +
  "bg-[var(--cs-on-dark,#FBF7F1)]/10 text-[var(--cs-on-dark,#FBF7F1)] " +
  "transition-colors hover:bg-[var(--cs-on-dark,#FBF7F1)]/20 " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cs-on-dark,#FBF7F1)]";

export default function SpotlightCarousel({
  slug,
  slides,
  editMode,
}: {
  slug: string;
  /** All registered spotlight slots in order (filled or not). */
  slides: SpotlightSlide[];
  /** True only while the logged-in editor has Edit-site ON. */
  editMode: boolean;
}) {
  const deck = editMode ? slides : slides.filter((s) => s.src);
  const count = deck.length;

  // The viewer's set for this section. Built from the WHOLE deck, not from
  // what is currently mounted — the lazy window only ever renders the active
  // slide + the next one, so a DOM-derived set would show "2" for a 6-slide
  // spotlight. Photos, GIFs and videos all appear here, in deck order, so
  // paging in the viewer moves across mixed media seamlessly.
  const viewerItems: LightboxItem[] = deck
    .filter((s) => s.src)
    .map((s) => ({
      src: s.src,
      alt: `Campaign media ${s.n}`,
      kind: mediaKindFromUrl(s.src) === "video" ? ("video" as const) : ("image" as const),
      poster: s.poster || undefined,
    }));
  /** deck index → index within viewerItems (they differ only in edit mode). */
  const viewerIndexOf = (deckIdx: number) =>
    Math.max(0, viewerItems.findIndex((it) => it.src === deck[deckIdx]?.src));

  const regionRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  // Any explicit user interaction permanently retires the auto-advance.
  const [interacted, setInteracted] = useState(false);

  // A playing video slide raises this so the 6s tick holds (see onHoldChange
  // wiring below); the interval keeps running but skips, so the deck waits for
  // the clip without a timer restart.
  const holdAutoAdvanceRef = useRef(false);

  // No deck-length reconciliation effect needed: `index` is clamped at read
  // (activeIdx) and every writer moduloes by `count`, so a stale-high value
  // from an Edit-site toggle (6 slots ⇄ filled-only) is always corrected.

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = regionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const activeIdx = count > 0 ? Math.min(index, count - 1) : 0;

  const goTo = useCallback(
    (i: number, byUser: boolean) => {
      if (count < 1) return;
      setIndex(((i % count) + count) % count);
      if (byUser) setInteracted(true);
    },
    [count],
  );

  // ---- Auto-advance (visitor decks of 2+ only) -----------------------------
  const autoActive =
    count >= 2 && !editMode && !reduced && !interacted && !hovered && !focusWithin && inView;
  useEffect(() => {
    if (!autoActive) return;
    const id = setInterval(() => {
      // playback-agent: hold point — a raised holdAutoAdvanceRef skips the
      // tick (deck stays put) without tearing the interval down.
      if (holdAutoAdvanceRef.current) return;
      setIndex((i) => (i + 1) % count);
    }, 6000);
    return () => clearInterval(id);
  }, [autoActive, count]);

  // ---- Swipe (pointer events; vertical page scroll stays native) -----------
  const pointerStart = useRef<{ id: number; x: number; y: number } | null>(null);
  const justSwiped = useRef(false);

  function onPointerDown(e: ReactPointerEvent) {
    if (count < 2) return;
    pointerStart.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    justSwiped.current = false;
  }
  function onPointerUp(e: ReactPointerEvent) {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start || e.pointerId !== start.id) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    // Only a decisively horizontal gesture counts — a plain tap (or a
    // vertical scroll the browser kept, via touch-action: pan-y) never does.
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      justSwiped.current = true;
      goTo(activeIdx + (dx < 0 ? 1 : -1), true);
    }
  }
  function onPointerCancel() {
    pointerStart.current = null;
  }
  function onClickCapture(e: ReactMouseEvent) {
    // A swipe must not ALSO fire the slide's click (lightbox / edit picker);
    // a plain tap passes through untouched.
    if (justSwiped.current) {
      e.preventDefault();
      e.stopPropagation();
      justSwiped.current = false;
    }
  }

  function onKeyDown(e: ReactKeyboardEvent) {
    if (count < 2) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(activeIdx - 1, true);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(activeIdx + 1, true);
    }
  }

  function onBlur(e: ReactFocusEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setFocusWithin(false);
    }
  }

  // ---- 0 filled (visitor): a single intentional placeholder frame ----------
  if (count === 0) {
    return (
      <div
        className="relative aspect-[4/3] w-full overflow-hidden rounded-[12px]"
        style={{
          borderWidth: 2,
          borderStyle: "dashed",
          borderColor: "color-mix(in srgb, var(--cs-on-dark,#FBF7F1) 30%, transparent)",
        }}
      >
        <SlotPlaceholder label="Campaign media" tone="dark" />
      </div>
    );
  }

  const showControls = count >= 2;

  return (
    <div
      ref={regionRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Campaign media"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={onBlur}
    >
      {/* Arrows BRACKET the media (flex siblings), so they live in the card's
          padding and never cover the photo/GIF/video. Below sm there isn't room
          to place 44×44 targets outside the frame without cramping the media —
          there the arrows are hidden and swipe + dots + arrow-keys drive it. */}
      <div className="flex items-center gap-2 sm:gap-3">
        {showControls && (
          <button
            type="button"
            onClick={() => goTo(activeIdx - 1, true)}
            aria-label="Previous"
            className={`hidden sm:flex ${CTRL_BTN}`}
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="m15 6-6 6 6 6" />
            </svg>
          </button>
        )}

        <div
          className="relative min-w-0 flex-1 touch-pan-y select-none overflow-hidden rounded-[12px]"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onClickCapture={onClickCapture}
          onDragStart={(e) => e.preventDefault()}
        >
          <div
            className="flex"
            style={{
              transform: `translateX(-${activeIdx * 100}%)`,
              transition: reduced ? "none" : "transform 500ms ease",
            }}
          >
            {deck.map((slide, i) => {
              const isActive = i === activeIdx;
              // Wrap-aware lazy window: the active slide + the one after it.
              const isMounted = isActive || i === (activeIdx + 1) % count;
              return (
                <div
                  key={slide.key}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${count}`}
                  aria-hidden={!isActive}
                  inert={!isActive}
                  className="relative aspect-[4/3] w-full shrink-0"
                >
                  {editMode ? (
                    <EditableImageSlot
                      fieldKey={slide.key}
                      src={slide.src}
                      alt={`Campaign media ${slide.n}`}
                      sizes={SIZES}
                      mode="show"
                      tone="dark"
                      label={`Campaign media ${slide.n}`}
                      lightbox={spotlightGroup(slug)}
                      wrapperClassName="relative h-full w-full overflow-hidden rounded-[12px]"
                      mediaCapable
                      poster={slide.poster}
                    />
                  ) : (
                    <SlideMedia
                      slide={slide}
                      slug={slug}
                      mounted={isMounted}
                      active={isActive}
                      items={viewerItems}
                      index={viewerIndexOf(i)}
                      onHoldChange={(hold) => {
                        // Only the ACTIVE slide's video may drive the deck hold —
                        // the preloaded next slide (active=false) never plays, so
                        // its cleanup can't clobber the current clip's hold.
                        if (isActive) holdAutoAdvanceRef.current = hold;
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {showControls && (
          <button
            type="button"
            onClick={() => goTo(activeIdx + 1, true)}
            aria-label="Next"
            className={`hidden sm:flex ${CTRL_BTN}`}
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        )}
      </div>

      {showControls && (
        <div className="mt-3 flex justify-center">
          {deck.map((slide, i) => (
            <button
              key={slide.key}
              type="button"
              onClick={() => goTo(i, true)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === activeIdx ? "true" : undefined}
              className="flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-8px] focus-visible:outline-[var(--cs-on-dark,#FBF7F1)]"
            >
              <span
                aria-hidden
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === activeIdx
                    ? "bg-[var(--cs-on-dark,#FBF7F1)]"
                    : "bg-[var(--cs-on-dark,#FBF7F1)]/35 hover:bg-[var(--cs-on-dark,#FBF7F1)]/60"
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {showControls && (
        <p aria-live="polite" className="sr-only">
          {`Slide ${activeIdx + 1} of ${count}`}
        </p>
      )}
    </div>
  );
}

/**
 * Visitor-path slide content. Full media mounts only inside the lazy window
 * (active + next); everything else is just the stored still — or an empty
 * dark frame for a poster-less video — so slides stay cheap until needed.
 */
function SlideMedia({
  slide,
  slug,
  mounted,
  active,
  onHoldChange,
  items,
  index,
}: {
  slide: SpotlightSlide;
  slug: string;
  mounted: boolean;
  /** True when this slide is the carousel's current one. */
  active: boolean;
  /** Video hold hook — true while auto-advance should wait for this clip. */
  onHoldChange: (hold: boolean) => void;
  /** The FULL filled-slide set for the viewer (see note in the parent). */
  items: LightboxItem[];
  index: number;
}) {
  const kind = mediaKindFromUrl(slide.src);

  if (!mounted) {
    const still = slide.poster || (kind === "video" ? "" : slide.src);
    if (!still) return null; // poster-less video waits as an empty dark frame
    return (
      // eslint-disable-next-line @next/next/no-img-element -- deliberate
      // lightweight still for a not-yet-active slide (no next/image runtime)
      <img
        src={still}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  if (kind === "video") {
    return (
      <SpotlightVideo
        src={slide.src}
        poster={slide.poster || undefined}
        alt={`Campaign media ${slide.n}`}
        active={active}
        onHoldChange={onHoldChange}
        onExpand={() => openLightbox(expandAnchor(), { items, index })}
      />
    );
  }

  if (kind === "gif") {
    return (
      <SpotlightGif
        src={slide.src}
        poster={slide.poster || undefined}
        alt={`Campaign media ${slide.n}`}
        sizes={SIZES}
        className="object-cover"
        lightbox={spotlightGroup(slug)}
        items={items}
        index={index}
      />
    );
  }

  return (
    <LightboxImage
      group={spotlightGroup(slug)}
      src={slide.src}
      alt={`Campaign media ${slide.n}`}
      sizes={SIZES}
      className="object-cover"
      items={items}
      index={index}
    />
  );
}

/**
 * Focus-return target for a video expand. SpotlightVideo's zoom surface is the
 * currently focused element when it is activated, so hand the viewer that —
 * falling back to <body> if the click came from a pointer with no focus.
 */
function expandAnchor(): HTMLElement {
  const el = document.activeElement;
  return el instanceof HTMLElement ? el : document.body;
}
