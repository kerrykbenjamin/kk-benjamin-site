"use client";

/**
 * Tiny event bus between LightboxImage triggers (scattered across pages) and
 * the single Lightbox overlay mounted in the root layout. A DOM CustomEvent
 * keeps the two ends fully decoupled — no context threading through server
 * components.
 *
 * The lightbox is a SINGLE-IMAGE viewer: the event carries just the trigger
 * element, whose data-lightbox-* attributes hold everything the overlay needs
 * (src/alt/title/desc) — and which receives focus back on close.
 */
export const LIGHTBOX_EVENT = "kk:lightbox-open";

export type LightboxOpenDetail = {
  /** The trigger element — carries the image data and gets focus back on close. */
  trigger: HTMLElement;
};

export function openLightbox(trigger: HTMLElement) {
  window.dispatchEvent(
    new CustomEvent<LightboxOpenDetail>(LIGHTBOX_EVENT, { detail: { trigger } }),
  );
}
