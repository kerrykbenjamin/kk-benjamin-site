"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEdit } from "./EditProvider";
import SlotPlaceholder from "./SlotPlaceholder";
import LightboxImage from "@/components/lightbox/LightboxImage";

/**
 * Editor-side image slot. Three interaction states — none of them a dead
 * click (a logged-in editor browsing with Edit-site OFF previously got a
 * plain image with NO handler at all, which read as "clicking does nothing"):
 *
 *  - Edit mode OFF (browsing): behaves exactly like the visitor view — a
 *    `lightbox`-wired slot with a photo renders the LightboxImage trigger, so
 *    the editor sees the same click-to-enlarge (with caption) visitors get.
 *  - Edit mode ON: the WHOLE slot is a "Change/Add photo" target (not just
 *    the pill button), and the lightbox never fires — edit wins.
 *  - Empty slots: placeholder (never lightbox-eligible).
 *
 * mode "hide": optional photo — empty + not editing renders nothing (no gap).
 * mode "show": empty always shows the intentional placeholder.
 *
 * Upload flow is identical to EditableImage (same /api/content/image endpoint,
 * same compression + toast + router.refresh). Swap-only by design: once a
 * photo exists the only affordance is replace — no remove/revert control.
 */
export default function EditableImageSlot({
  fieldKey,
  src,
  alt,
  sizes,
  mode,
  tone = "light",
  label,
  placeholder,
  lightbox,
  lightboxCaption,
  imgClassName = "object-cover",
  wrapperClassName,
}: {
  fieldKey: string;
  src: string;
  alt: string;
  sizes?: string;
  mode: "show" | "hide";
  tone?: "light" | "dark";
  label?: string;
  placeholder?: ReactNode;
  lightbox?: string;
  lightboxCaption?: { title?: string; desc?: string };
  imgClassName?: string;
  wrapperClassName: string;
}) {
  const { editMode, toast } = useEdit();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("That file isn't an image.", "error");
      return;
    }
    setUploading(true);
    setPreview(URL.createObjectURL(file));
    const fd = new FormData();
    fd.append("key", fieldKey);
    fd.append("file", file);
    try {
      const res = await fetch("/api/content/image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Upload failed.", "error");
        setPreview(null);
        setUploading(false);
        return;
      }
      toast("Photo updated");
      setUploading(false);
      router.refresh();
    } catch {
      toast("Upload failed. Check your connection.", "error");
      setPreview(null);
      setUploading(false);
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const shown = preview ?? src;
  const dashColor = tone === "dark" ? "var(--cs-on-dark,#FBF7F1)" : "var(--cs-text,#1F2A19)";
  const dashStyle = placeholder
    ? undefined
    : {
        borderWidth: 2,
        borderStyle: "dashed" as const,
        borderColor: `color-mix(in srgb, ${dashColor} 30%, transparent)`,
      };
  const emptyContent = placeholder ?? <SlotPlaceholder label={label} tone={tone} />;

  // Editor is logged in but NOT actively editing → behave exactly like a
  // visitor, including the click-to-enlarge lightbox on real photos.
  if (!editMode) {
    if (!shown) {
      if (mode === "hide") return null;
      return (
        <div className={wrapperClassName} style={dashStyle}>
          {emptyContent}
        </div>
      );
    }
    if (lightbox) {
      return (
        <div className={wrapperClassName}>
          <LightboxImage
            group={lightbox}
            src={shown}
            alt={alt}
            sizes={sizes}
            className={imgClassName}
            caption={lightboxCaption}
          />
        </div>
      );
    }
    return (
      <div className={wrapperClassName}>
        <Image src={shown} alt={alt} fill sizes={sizes} className={imgClassName} />
      </div>
    );
  }

  // Edit mode: the whole slot opens the picker (the pill button remains as
  // the visible affordance; stopPropagation keeps one gesture = one open).
  return (
    <div
      className={`${wrapperClassName} cursor-pointer`}
      style={shown ? undefined : dashStyle}
      onClick={() => inputRef.current?.click()}
    >
      {shown ? (
        <Image
          src={shown}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
          unoptimized={Boolean(preview)}
        />
      ) : (
        emptyContent
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.click();
        }}
        disabled={uploading}
        className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-forest-deep/90 px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-cream shadow-lg backdrop-blur-sm transition-colors hover:bg-forest-deep disabled:opacity-70"
      >
        {uploading ? "Uploading…" : shown ? "Change photo" : "Add photo"}
      </button>
      {shown && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] outline-dashed outline-2 -outline-offset-2 outline-sage/70"
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onClick={(e) => e.stopPropagation()}
        onChange={onFile}
      />
    </div>
  );
}
