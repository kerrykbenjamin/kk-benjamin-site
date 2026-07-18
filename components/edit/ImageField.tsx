import Image from "next/image";
import { getImage } from "@/lib/content";
import { getIsEditor } from "@/lib/editor-state";
import EditableImage from "./EditableImage";
import LightboxImage from "@/components/lightbox/LightboxImage";

/**
 * Renders an editable image (fills its `relative` parent). Visitors get a plain
 * next/image — or, when `lightbox` names a gallery group, a click-to-enlarge
 * LightboxImage; a logged-in editor ALWAYS gets the replace-photo overlay
 * instead (the edit flow takes precedence — the lightbox never mounts for
 * editors, so the two interactions can't collide).
 */
export default async function ImageField({
  id,
  alt,
  sizes,
  className = "",
  priority = false,
  lightbox,
}: {
  id: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  /** Lightbox gallery group id (e.g. "case:<slug>") — visitor-only behavior. */
  lightbox?: string;
}) {
  const [src, editor] = await Promise.all([getImage(id), getIsEditor()]);

  if (!editor) {
    if (lightbox && src) {
      return (
        <LightboxImage
          group={lightbox}
          src={src}
          alt={alt}
          sizes={sizes}
          className={className}
          priority={priority}
        />
      );
    }
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        priority={priority}
      />
    );
  }
  return (
    <EditableImage
      fieldKey={id}
      src={src}
      alt={alt}
      sizes={sizes}
      className={className}
      priority={priority}
      lightbox={lightbox}
    />
  );
}
