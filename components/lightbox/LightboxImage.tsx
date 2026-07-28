"use client";

import Image from "next/image";
import { openLightbox, type LightboxItem } from "./lightbox-bus";

/**
 * Click-to-enlarge wrapper around a content image. Renders a focusable
 * <button> that fills the caller's `relative` parent (exactly the box the
 * bare next/image previously filled, so zero layout change) and opens the
 * site Lightbox — a SINGLE-IMAGE viewer, no next/prev — on click / Enter /
 * Space.
 *
 * The data-lightbox-* attributes carry the image's payload (src/alt and the
 * optional caption) that the overlay reads off the clicked trigger; `group`
 * remains as an eligibility marker/identifier only. The SERVER decides who
 * gets this wrapper (visitor + browsing-editor branches of ImageField /
 * ImageSlot); in edit mode the change-photo flow always wins instead.
 */
export default function LightboxImage({
  group,
  src,
  alt,
  sizes,
  className = "",
  priority = false,
  caption,
  items,
  index,
}: {
  group: string;
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  /** Optional title/description shown bottom-left INSIDE the lightbox (not on
   *  the page). Used by the portfolio gallery; other groups omit it. */
  caption?: { title?: string; desc?: string };
  /**
   * Explicit section set — pass ONLY from a section that virtualizes its items
   * (the spotlight carousel), where a DOM query would see a partial set. Every
   * other caller omits these and the overlay derives the set from `group`.
   */
  items?: LightboxItem[];
  index?: number;
}) {
  return (
    <button
      type="button"
      data-lightbox-group={group}
      data-lightbox-src={src}
      data-lightbox-alt={alt}
      data-lightbox-kind="image"
      data-lightbox-title={caption?.title || undefined}
      data-lightbox-desc={caption?.desc || undefined}
      aria-label={alt ? `View larger: ${alt}` : "View larger image"}
      onClick={(e) =>
        openLightbox(
          e.currentTarget,
          items ? { items, index: index ?? 0 } : undefined,
        )
      }
      className="absolute inset-0 block h-full w-full cursor-zoom-in rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
    >
      <Image src={src} alt={alt} fill sizes={sizes} className={className} priority={priority} />
    </button>
  );
}
