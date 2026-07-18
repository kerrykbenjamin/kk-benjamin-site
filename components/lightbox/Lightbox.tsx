"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { LIGHTBOX_EVENT, type LightboxOpenDetail } from "./lightbox-bus";

type OpenState = {
  src: string;
  alt: string;
  title?: string;
  desc?: string;
  trigger: HTMLElement;
};

/**
 * The site-wide image viewer — mounted ONCE in the root layout, opened by any
 * LightboxImage trigger via the lightbox-bus CustomEvent.
 *
 * SINGLE-IMAGE by design: each click shows only that image — there is no
 * next/prev navigation of any kind (no arrows, no arrow keys, no swipe, no
 * counter). What remains:
 *  - role="dialog" + aria-modal, focus moved in on open, trapped among the
 *    dialog's controls, and returned to the triggering image on close.
 *  - Close: × button, backdrop click, Esc.
 *  - Body scroll locked while open (same approach as MobileNav).
 *  - Optional caption (title/desc off the trigger's data attributes) centered
 *    along the bottom over a forest-deep gradient scrim — gallery images use
 *    this; images without a caption render no bar.
 *  - z-[90]: above header 50 / mobile nav 60 / edit toolbar 70 / toasts 80.
 */
export default function Lightbox() {
  const [state, setState] = useState<OpenState | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Open requests from any LightboxImage on the page — the clicked trigger's
  // own data attributes are the entire payload.
  useEffect(() => {
    function onOpen(e: Event) {
      const { trigger } = (e as CustomEvent<LightboxOpenDetail>).detail;
      const src = trigger.dataset.lightboxSrc;
      if (!src) return;
      setState({
        src,
        alt: trigger.dataset.lightboxAlt ?? "",
        title: trigger.dataset.lightboxTitle,
        desc: trigger.dataset.lightboxDesc,
        trigger,
      });
    }
    window.addEventListener(LIGHTBOX_EVENT, onOpen);
    return () => window.removeEventListener(LIGHTBOX_EVENT, onOpen);
  }, []);

  const close = useCallback(() => {
    setState((s) => {
      // Return focus to the image that opened the viewer.
      s?.trigger?.focus?.();
      return null;
    });
  }, []);

  const open = state !== null;

  // Scroll lock + keyboard while open (same body.style.overflow approach as MobileNav).
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "Tab") {
        // Focus trap: cycle through the dialog's own buttons only.
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusables = Array.from(dialog.querySelectorAll<HTMLElement>("button"));
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && (active === first || !dialog.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !dialog.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // Move focus into the dialog (the close button) on open.
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  if (!state) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={state.alt ? `Image viewer: ${state.alt}` : "Image viewer"}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-forest-deep/90 backdrop-blur-sm"
      onClick={close}
    >
      {/* Close */}
      <button
        type="button"
        aria-label="Close image viewer"
        onClick={close}
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      {/* The enlarged image — clicks on it shouldn't close */}
      <div
        className="relative h-[78vh] w-[92vw] max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          key={state.src}
          src={state.src}
          alt={state.alt}
          fill
          sizes="92vw"
          className="object-contain"
          priority
        />
        {/* Caption — centered along the bottom, only when the image carries
            one (gallery). A forest-deep gradient scrim keeps it legible over
            any photo; images without a title/desc render nothing here. */}
        {(state.title || state.desc) && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-deep/85 via-forest-deep/50 to-transparent px-5 pb-5 pt-14 text-center">
            {state.title && (
              <p className="font-display text-h3 font-semibold leading-tight text-cream">
                {state.title}
              </p>
            )}
            {state.desc && (
              <p className="mx-auto mt-1 max-w-xl text-sm text-cream/80">{state.desc}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
