"use client";

import { useEffect, useState } from "react";
import { useEdit } from "@/components/edit/EditProvider";

/**
 * Floating "back to top" button, bottom-right. Appears once the visitor has
 * scrolled past ~one viewport height; hidden (and unfocusable) at the top.
 *
 * Stacking/placement: z-40 keeps it BELOW the sticky header (50), the mobile
 * nav overlay (60, which also scroll-locks so the button is inert while the
 * menu is open) and the edit toolbar (70). When logged in, the toolbar's
 * fixed full-width strip intercepts clicks along the bottom edge, so the
 * button lifts to bottom-24 to clear it — `useEdit().isEditor` tells us.
 *
 * Scrolling: the site sets `html { scroll-behavior: smooth }` globally, so we
 * must pass an explicit behavior — "smooth" normally, "instant" under
 * prefers-reduced-motion (same matchMedia pattern as Reveal.tsx).
 */
export default function ScrollToTop() {
  const { isEditor } = useEdit();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // No rAF throttle: browsers already coalesce scroll events, React skips
    // re-renders when the value is unchanged, and rAF never fires in hidden
    // tabs (which would leave the state permanently stale there).
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toTop() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
  }

  return (
    <button
      type="button"
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={toTop}
      className={`fixed right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-forest-deep text-cream shadow-lg ring-1 ring-cream/20 transition-all duration-300 hover:bg-forest-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage ${
        isEditor ? "bottom-24" : "bottom-5"
      } ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  );
}
