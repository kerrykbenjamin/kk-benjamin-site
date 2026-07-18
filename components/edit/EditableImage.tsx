"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useEdit } from "./EditProvider";
import LightboxImage from "@/components/lightbox/LightboxImage";

/**
 * Editor-side image (fills the caller's `relative` parent). No dead clicks:
 *  - Edit mode OFF (browsing): a `lightbox`-wired image behaves exactly like
 *    the visitor view — click-to-enlarge. (Previously this state rendered a
 *    plain image with no handler at all.)
 *  - Edit mode ON: clicking anywhere on the photo opens the file picker; the
 *    pill button remains as the visible affordance. Lightbox never fires.
 */
export default function EditableImage({
  fieldKey,
  src,
  alt,
  sizes,
  className = "",
  priority = false,
  lightbox,
}: {
  fieldKey: string;
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  lightbox?: string;
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

  // Browsing (edit mode off): identical to the visitor experience.
  if (!editMode) {
    if (lightbox && shown) {
      return (
        <LightboxImage
          group={lightbox}
          src={shown}
          alt={alt}
          sizes={sizes}
          className={className}
          priority={priority}
        />
      );
    }
    return (
      <Image
        src={shown}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        priority={priority}
      />
    );
  }

  return (
    <>
      <Image
        src={shown}
        alt={alt}
        fill
        sizes={sizes}
        className={`${className} cursor-pointer`}
        priority={priority}
        unoptimized={Boolean(preview)}
        onClick={() => inputRef.current?.click()}
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.click();
        }}
        disabled={uploading}
        className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-forest-deep/90 px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-cream shadow-lg backdrop-blur-sm transition-colors hover:bg-forest-deep disabled:opacity-70"
      >
        {uploading ? "Uploading…" : "Change photo"}
      </button>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] outline-dashed outline-2 -outline-offset-2 outline-sage/70"
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onClick={(e) => e.stopPropagation()}
        onChange={onFile}
      />
    </>
  );
}
