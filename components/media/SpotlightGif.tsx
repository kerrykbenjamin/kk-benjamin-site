"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import LightboxImage from "@/components/lightbox/LightboxImage";
import type { LightboxItem } from "@/components/lightbox/lightbox-bus";

/**
 * Campaign-spotlight GIF renderer with reduced-motion support.
 *
 *  - Default / no-JS / first paint: shows the STILL poster frame (written by
 *    the upload flow via sharp) — doubling as a lazy-load placeholder.
 *  - Motion OK: upgrades to the normal animated GIF inside the standard
 *    LightboxImage click-to-enlarge wrapper (same behavior as a photo slot).
 *  - prefers-reduced-motion: stays on the still + a visible play/pause
 *    toggle (44×44 target). While honoring reduced motion the slot does NOT
 *    open the lightbox — the tap target belongs to the animation toggle.
 *  - No poster stored (e.g. sharp failed on that GIF): falls back to the
 *    plain animated behavior — never a blank box.
 */
export default function SpotlightGif({
  src,
  poster,
  alt,
  sizes,
  className = "object-cover",
  lightbox,
  caption,
  items,
  index,
}: {
  src: string;
  poster?: string;
  alt: string;
  sizes?: string;
  className?: string;
  lightbox?: string;
  caption?: { title?: string; desc?: string };
  /** Explicit section set — only the virtualizing spotlight carousel passes it. */
  items?: LightboxItem[];
  index?: number;
}) {
  const [reduced, setReduced] = useState<boolean | null>(null); // null = pre-mount
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const still = poster || src; // no poster ⇒ the "still" is the gif itself

  // Motion allowed (or no way to honor reduced motion without a poster):
  // exactly the photo-slot behavior — animated GIF, lightbox if wired.
  if (reduced === false || (reduced === true && !poster)) {
    if (lightbox) {
      return (
        <LightboxImage
          group={lightbox}
          src={src}
          alt={alt}
          sizes={sizes}
          className={className}
          caption={caption}
          items={items}
          index={index}
        />
      );
    }
    return <Image src={src} alt={alt} fill sizes={sizes} className={className} />;
  }

  // Pre-mount (SSR/hydration) or reduced motion with a poster: still frame.
  const showAnimated = animating && reduced === true;
  return (
    <>
      <Image
        src={showAnimated ? src : still}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        unoptimized={showAnimated}
      />
      {reduced === true && (
        <button
          type="button"
          onClick={() => setAnimating((a) => !a)}
          aria-label={showAnimated ? "Pause animation" : "Play animation"}
          className="absolute bottom-2.5 right-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--cs-dark,#182312)]/75 text-[var(--cs-on-dark,#FBF7F1)] backdrop-blur-sm transition-colors hover:bg-[var(--cs-dark,#182312)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cs-on-dark,#FBF7F1)]"
        >
          {showAnimated ? (
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z" />
            </svg>
          ) : (
            <svg aria-hidden viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current">
              <path d="M8 5.5v13l11-6.5-11-6.5Z" />
            </svg>
          )}
        </button>
      )}
    </>
  );
}
