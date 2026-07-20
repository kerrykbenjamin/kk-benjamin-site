import Image from "next/image";
import type { ReactNode } from "react";
import { getImage } from "@/lib/content";
import { getIsEditor } from "@/lib/editor-state";
import { mediaKindFromUrl, posterKeyFor } from "@/lib/media";
import EditableImageSlot from "./EditableImageSlot";
import SlotPlaceholder from "./SlotPlaceholder";
import LightboxImage from "@/components/lightbox/LightboxImage";
import SpotlightVideo from "@/components/media/SpotlightVideo";
import SpotlightGif from "@/components/media/SpotlightGif";

/**
 * An image slot that owns its own aspect-ratio wrapper (unlike ImageField, which
 * fills a parent). Two empty-state modes:
 *  - "hide"  → optional. Empty + visitor renders NOTHING (no reserved gap).
 *  - "show"  → placeholder. Empty always shows an intentional placeholder frame.
 *              Used for the campaign spotlight + process-step photos the client
 *              fills in later.
 *
 * `placeholder` (optional ReactNode) swaps the default dashed frame + generic
 * SlotPlaceholder for a custom designed empty state (e.g. the process steps'
 * icon + step-name tile). It doubles as the fail-safe fallback: getImage()
 * returning the empty default — including when the store fetch fails — always
 * lands here, never on a blank space or broken image.
 *
 * Visitors get plain static markup (no client JS); a logged-in editor gets the
 * upload affordances via EditableImageSlot. `tone` picks token colors for a
 * light surface (`--cs-text`) vs the dark spotlight surface (`--cs-on-dark`).
 */
export default async function ImageSlot({
  id,
  alt,
  sizes,
  mode = "show",
  tone = "light",
  label,
  placeholder,
  lightbox,
  imgClassName = "object-cover",
  lightboxCaption,
  wrapperClassName = "relative aspect-[4/3] w-full overflow-hidden rounded-[12px]",
  mediaCapable = false,
}: {
  id: string;
  alt: string;
  sizes?: string;
  mode?: "show" | "hide";
  tone?: "light" | "dark";
  label?: string;
  placeholder?: ReactNode;
  /**
   * Lightbox gallery group id — visitor-only, and only once a REAL photo
   * exists (an empty slot's styled placeholder must never open a viewer).
   */
  lightbox?: string;
  /** Class for the img itself (visitor view) — e.g. adds a hover zoom. */
  imgClassName?: string;
  /** Optional title/desc shown inside the lightbox (bottom-left overlay). */
  lightboxCaption?: { title?: string; desc?: string };
  wrapperClassName?: string;
  /**
   * Campaign-spotlight slots only: the slot also holds GIFs and short videos
   * (registry `media: true` + companion `.poster` key — see lib/media.ts).
   * Every other ImageSlot use (process steps, gallery) leaves this off and is
   * completely untouched by the media feature.
   */
  mediaCapable?: boolean;
}) {
  const [src, editor, poster] = await Promise.all([
    getImage(id),
    getIsEditor(),
    mediaCapable ? getImage(posterKeyFor(id)) : Promise.resolve(""),
  ]);
  const kind = mediaCapable && src ? mediaKindFromUrl(src) : "image";

  if (editor) {
    return (
      <EditableImageSlot
        fieldKey={id}
        src={src}
        alt={alt}
        sizes={sizes}
        mode={mode}
        tone={tone}
        label={label}
        placeholder={placeholder}
        lightbox={lightbox}
        lightboxCaption={lightboxCaption}
        imgClassName={imgClassName}
        wrapperClassName={wrapperClassName}
        mediaCapable={mediaCapable}
        poster={poster}
      />
    );
  }

  // Visitor, no image: hide entirely (optional) or show an intentional frame.
  if (!src) {
    if (mode === "hide") return null;
    if (placeholder) {
      return <div className={wrapperClassName}>{placeholder}</div>;
    }
    const dashColor = tone === "dark" ? "var(--cs-on-dark,#FBF7F1)" : "var(--cs-text,#1F2A19)";
    return (
      <div
        className={wrapperClassName}
        style={{
          borderWidth: 2,
          borderStyle: "dashed",
          borderColor: `color-mix(in srgb, ${dashColor} 30%, transparent)`,
        }}
      >
        <SlotPlaceholder label={label} tone={tone} />
      </div>
    );
  }

  // Video plays in place — excluded from the lightbox by design (no dead
  // clicks: its own play/pause/unmute controls own the interaction).
  if (kind === "video") {
    return (
      <div className={wrapperClassName}>
        <SpotlightVideo src={src} poster={poster || undefined} alt={alt} />
      </div>
    );
  }

  // GIFs keep the photo behavior (incl. lightbox) but honor reduced motion
  // via the stored still frame + play toggle.
  if (kind === "gif") {
    return (
      <div className={wrapperClassName}>
        <SpotlightGif
          src={src}
          poster={poster || undefined}
          alt={alt}
          sizes={sizes}
          className={imgClassName}
          lightbox={lightbox}
          caption={lightboxCaption}
        />
      </div>
    );
  }

  return (
    <div className={wrapperClassName}>
      {lightbox ? (
        <LightboxImage
          group={lightbox}
          src={src}
          alt={alt}
          sizes={sizes}
          className={imgClassName}
          caption={lightboxCaption}
        />
      ) : (
        <Image src={src} alt={alt} fill sizes={sizes} className={imgClassName} />
      )}
    </div>
  );
}
