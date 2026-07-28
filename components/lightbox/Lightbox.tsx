"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  LIGHTBOX_EVENT,
  itemFromEl,
  type LightboxItem,
  type LightboxOpenDetail,
} from "./lightbox-bus";

type OpenState = {
  items: LightboxItem[];
  index: number;
  trigger: HTMLElement;
};

/** Swipe must beat an accidental drag, but stay easy on a small phone. */
const SWIPE_PX = 45;

/**
 * The site-wide media viewer — mounted ONCE in the root layout, opened by any
 * trigger via the lightbox-bus CustomEvent.
 *
 * SECTION-SCOPED navigation: a click opens that item inside its own section's
 * set and never leaves it (see lightbox-bus for how a set is resolved). A
 * one-item section shows no arrows, no counter, and ignores the arrow keys —
 * so the hero image still behaves exactly like the old single-image viewer.
 *
 * Media is always shown WHOLE (`object-contain` inside a viewport-bounded box):
 * nothing is ever cropped or pushed off-screen, at any aspect ratio or screen
 * size. Videos render as a real <video> with the browser's full native controls
 * (play/pause, scrubber, volume/mute, fullscreen) — deliberately unlike the
 * silent autoplaying inline preview in the spotlight carousel. Keying the
 * element on `src` means changing slide or closing UNMOUNTS the old video, so
 * only the item you are looking at can be playing.
 *
 * Also kept: role="dialog" + aria-modal, focus moved in on open / trapped /
 * returned to the trigger on close, close via × / backdrop / Esc, body scroll
 * lock, optional caption over a gradient scrim.
 * z-[90]: above header 50 / mobile nav 60 / edit toolbar 70 / toasts 80.
 */
export default function Lightbox() {
  const [state, setState] = useState<OpenState | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const swipeX = useRef<number | null>(null);

  // Open requests from any trigger on the page.
  useEffect(() => {
    function onOpen(e: Event) {
      const { trigger, items, index } = (e as CustomEvent<LightboxOpenDetail>).detail;

      // Explicit set (virtualized sections, e.g. the spotlight carousel).
      if (items && items.length > 0) {
        const i = Math.min(Math.max(index ?? 0, 0), items.length - 1);
        setState({ items, index: i, trigger });
        return;
      }

      // DOM-derived set, scoped to this trigger's group. Without a group the
      // item stands alone (never silently joins another section's set).
      const group = trigger.dataset.lightboxGroup;
      const self = itemFromEl(trigger);
      if (!self) return;
      if (!group) {
        setState({ items: [self], index: 0, trigger });
        return;
      }
      const els = Array.from(
        document.querySelectorAll<HTMLElement>(
          `[data-lightbox-group="${CSS.escape(group)}"]`,
        ),
      );
      const derived = els
        .map((el) => ({ el, item: itemFromEl(el) }))
        .filter((x): x is { el: HTMLElement; item: LightboxItem } => x.item !== null);
      const at = derived.findIndex((x) => x.el === trigger);
      setState(
        derived.length > 0 && at >= 0
          ? { items: derived.map((x) => x.item), index: at, trigger }
          : { items: [self], index: 0, trigger },
      );
    }
    window.addEventListener(LIGHTBOX_EVENT, onOpen);
    return () => window.removeEventListener(LIGHTBOX_EVENT, onOpen);
  }, []);

  const close = useCallback(() => {
    setState((s) => {
      // Return focus to the item that opened the viewer.
      s?.trigger?.focus?.();
      return null;
    });
  }, []);

  const step = useCallback((delta: number) => {
    setState((s) => {
      if (!s || s.items.length < 2) return s;
      const n = s.items.length;
      return { ...s, index: (s.index + delta + n) % n };
    });
  }, []);

  const open = state !== null;
  const count = state?.items.length ?? 0;
  const multi = count > 1;

  // Scroll lock + keyboard while open.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
      } else if (e.key === "ArrowLeft" && multi) {
        e.preventDefault();
        step(-1);
      } else if (e.key === "ArrowRight" && multi) {
        e.preventDefault();
        step(1);
      } else if (e.key === "Tab") {
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
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step, multi]);

  if (!state) return null;

  const item = state.items[state.index];
  const isVideo = item.kind === "video";

  // Swipe (touch/pen only — a mouse drag on a video is scrubbing, not paging).
  function onPointerDown(e: React.PointerEvent) {
    swipeX.current = e.pointerType === "mouse" ? null : e.clientX;
  }
  function onPointerUp(e: React.PointerEvent) {
    const start = swipeX.current;
    swipeX.current = null;
    if (start === null || !multi) return;
    const dx = e.clientX - start;
    if (Math.abs(dx) >= SWIPE_PX) step(dx < 0 ? 1 : -1);
  }

  const navBtn =
    "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.alt ? `Media viewer: ${item.alt}` : "Media viewer"}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-forest-deep/90 backdrop-blur-sm"
      onClick={close}
    >
      {/* Close */}
      <button
        type="button"
        aria-label="Close media viewer"
        onClick={close}
        className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      {/* Prev / Next — only when this SECTION has more than one item. Placed on
          the backdrop (outside the media box) so they never cover the media. */}
      {multi && (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            className={`${navBtn} left-2 sm:left-4`}
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 6-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            className={`${navBtn} right-2 sm:right-4`}
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        </>
      )}

      {/* The enlarged media — clicks inside shouldn't close. Bounded by the
          viewport so `object-contain` always shows the whole thing. */}
      <div
        className="relative flex h-[82vh] w-[92vw] max-w-6xl items-center justify-center sm:w-[84vw]"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipeX.current = null)}
      >
        {isVideo ? (
          // Keyed on src: changing slide or closing unmounts this element, so
          // the previous clip can never keep playing. (No <track>: campaign
          // clips are decorative and upload without a caption file.)
          <video
            key={item.src}
            src={item.src}
            poster={item.poster || undefined}
            controls
            autoPlay
            playsInline
            preload="metadata"
            aria-label={item.alt}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <Image
            key={item.src}
            src={item.src}
            alt={item.alt}
            fill
            sizes="92vw"
            className="object-contain"
            priority
          />
        )}

        {/* Caption — centered along the bottom, only when the item carries one
            (gallery). A forest-deep gradient scrim keeps it legible over any
            photo; items without a title/desc render nothing here. */}
        {(item.title || item.desc) && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-deep/85 via-forest-deep/50 to-transparent px-5 pb-5 pt-14 text-center">
            {item.title && (
              <p className="font-display text-h3 font-semibold leading-tight text-cream">
                {item.title}
              </p>
            )}
            {item.desc && (
              <p className="mx-auto mt-1 max-w-xl text-sm text-cream/80">{item.desc}</p>
            )}
          </div>
        )}
      </div>

      {/* Position indicator, scoped to this section's set. */}
      {multi && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-cream/10 px-3 py-1 text-sm tabular-nums text-cream/90">
          {state.index + 1} / {count}
        </p>
      )}
      <p aria-live="polite" className="sr-only">
        {multi ? `Item ${state.index + 1} of ${count}` : ""}
      </p>
    </div>
  );
}
