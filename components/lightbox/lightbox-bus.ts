"use client";

/**
 * Tiny event bus between lightbox triggers (scattered across pages) and the
 * single Lightbox overlay mounted in the root layout. A DOM CustomEvent keeps
 * the two ends fully decoupled — no context threading through server
 * components.
 *
 * SECTION SCOPING is the core rule: the viewer only ever navigates within the
 * group the clicked item belongs to, never across sections. A group id is one
 * section's set — `portfolio-gallery`, `case:<slug>:spotlight`,
 * `case:<slug>:process`, `case:<slug>:hero`, `about`. Two ways to supply the
 * set, both scoped identically:
 *
 *  - DOM-derived (default): the overlay queries
 *    `[data-lightbox-group="<group>"]` and builds the set in document order.
 *    Correct whenever every item of the section is actually in the DOM (the
 *    portfolio gallery, process steps).
 *  - Explicit `items` + `index`: required when a section VIRTUALIZES its
 *    items, so the DOM can't be the source of truth. The spotlight carousel
 *    only mounts the active slide + the next one, so it passes its full slide
 *    list here — otherwise the viewer would see a 2-item section.
 */
export const LIGHTBOX_EVENT = "kk:lightbox-open";

export type LightboxItem = {
  src: string;
  alt: string;
  /** "video" renders a <video> with full controls; anything else is an image. */
  kind?: "image" | "video";
  /** Still frame shown before a video is played. */
  poster?: string;
  title?: string;
  desc?: string;
};

export type LightboxOpenDetail = {
  /** The trigger element — gets focus back on close. */
  trigger: HTMLElement;
  /** Explicit set (virtualized sections). Omit to derive from the DOM. */
  items?: LightboxItem[];
  /** Index of the clicked item within `items`. Ignored without `items`. */
  index?: number;
};

export function openLightbox(
  trigger: HTMLElement,
  set?: { items: LightboxItem[]; index: number },
) {
  window.dispatchEvent(
    new CustomEvent<LightboxOpenDetail>(LIGHTBOX_EVENT, {
      detail: { trigger, items: set?.items, index: set?.index },
    }),
  );
}

/** Reads one item off a trigger's data-lightbox-* attributes. */
export function itemFromEl(el: HTMLElement): LightboxItem | null {
  const src = el.dataset.lightboxSrc;
  if (!src) return null;
  return {
    src,
    alt: el.dataset.lightboxAlt ?? "",
    kind: el.dataset.lightboxKind === "video" ? "video" : "image",
    poster: el.dataset.lightboxPoster || undefined,
    title: el.dataset.lightboxTitle,
    desc: el.dataset.lightboxDesc,
  };
}
