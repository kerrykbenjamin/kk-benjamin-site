"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Subtle fade/translate entrance on scroll — built FAIL-VISIBLE.
 *
 * The server renders children fully visible (no hidden initial state), so the
 * site is completely readable even if JS never loads, hydration fails, or the
 * browser is old. Only after the client mounts do elements still BELOW the
 * viewport get hidden and transitioned in when scrolled into view.
 *
 * (Previous implementation used framer-motion whileInView, which SSR'd
 * `opacity:0` inline — any hydration/JS failure left whole sections permanently
 * invisible. Do not reintroduce that pattern.)
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // "visible" (SSR default, never hidden) → "pending" (below fold, hidden) → "revealed"
  const [state, setState] = useState<"visible" | "pending" | "revealed">("visible");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return; // stay visible

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;
    // If the OS-level preference flips to reduced-motion mid-session while
    // still pending/animating, snap straight to visible rather than let the
    // transition play out.
    const onReducedMotionChange = () => {
      if (reducedMotion.matches) setState("revealed");
    };
    reducedMotion.addEventListener("change", onReducedMotionChange);

    // Only animate elements not yet on screen — anything already visible stays
    // visible (no flash, LCP unaffected).
    if (el.getBoundingClientRect().top <= window.innerHeight - 80) {
      reducedMotion.removeEventListener("change", onReducedMotionChange);
      return;
    }

    setState("pending");
    try {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setState("revealed");
            io.disconnect();
          }
        },
        { rootMargin: "0px 0px -80px 0px" },
      );
      io.observe(el);
      return () => {
        io.disconnect();
        reducedMotion.removeEventListener("change", onReducedMotionChange);
      };
    } catch {
      // A broken/shimmed IntersectionObserver must never leave content
      // stranded invisible (state was already set to "pending" above) — fail
      // open to fully visible instead, matching this component's whole point.
      setState("revealed");
      reducedMotion.removeEventListener("change", onReducedMotionChange);
    }
  }, []);

  const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
  return (
    <div
      ref={ref}
      className={className}
      style={
        state === "visible"
          ? undefined
          : {
              opacity: state === "pending" ? 0 : 1,
              transform: state === "pending" ? "translateY(24px)" : "none",
              transition: `opacity 0.6s ${ease} ${delay}s, transform 0.6s ${ease} ${delay}s`,
            }
      }
    >
      {children}
    </div>
  );
}
