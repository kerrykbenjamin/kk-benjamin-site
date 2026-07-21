"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEdit } from "./EditProvider";
import SlotPlaceholder from "./SlotPlaceholder";
import LightboxImage from "@/components/lightbox/LightboxImage";
import SpotlightVideo from "@/components/media/SpotlightVideo";
import SpotlightGif from "@/components/media/SpotlightGif";
import {
  ACCEPTED_VIDEO_TYPES,
  MAX_MEDIA_BYTES,
  MAX_PHOTO_BYTES,
  MAX_VIDEO_SECONDS,
  MEDIA_ACCEPT,
  MEDIA_ERRORS,
  mediaKindFromUrl,
} from "@/lib/media";
import { uploadSpotlightMedia } from "@/lib/media-upload";

/**
 * Read a picked video's duration and grab a first-frame poster via canvas —
 * all client-side (the server has no video decoder; no ffmpeg by design).
 * Best-effort: resolves with whatever it managed to get within 4s. A video
 * this browser can't decode yields {null, null} — the server still enforces
 * type/size and (for MP4) re-checks duration from the file itself.
 */
function inspectVideo(file: File): Promise<{ poster: Blob | null; duration: number | null }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    let settled = false;
    const done = (poster: Blob | null, duration: number | null) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      resolve({ poster, duration });
    };
    const timer = setTimeout(
      () => done(null, Number.isFinite(v.duration) ? v.duration : null),
      4000,
    );
    v.muted = true;
    v.playsInline = true;
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      // Seek slightly in so the poster isn't a black leader frame.
      v.currentTime = Math.min(0.1, (v.duration || 1) / 2);
    };
    v.onseeked = () => {
      try {
        const c = document.createElement("canvas");
        c.width = v.videoWidth;
        c.height = v.videoHeight;
        c.getContext("2d")!.drawImage(v, 0, 0);
        c.toBlob(
          (b) => {
            clearTimeout(timer);
            done(b, v.duration);
          },
          "image/jpeg",
          0.8,
        );
      } catch {
        clearTimeout(timer);
        done(null, v.duration);
      }
    };
    v.onerror = () => {
      clearTimeout(timer);
      done(null, null);
    };
    v.src = url;
  });
}

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
  mediaCapable = false,
  poster,
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
  /** Spotlight slots: also accepts GIF/short-video uploads (lib/media.ts). */
  mediaCapable?: boolean;
  /** Stored still frame for the slot's current video/GIF (may be empty). */
  poster?: string;
}) {
  const { editMode, toast } = useEdit();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  // Blob preview URLs have no extension, so remember what was picked.
  const [previewIsVideo, setPreviewIsVideo] = useState(false);
  // Upload progress 0–1 (null = indeterminate, e.g. a quick photo).
  const [progress, setProgress] = useState<number | null>(null);
  // Set while a large upload is in flight so it can be cancelled; also holds
  // the last picked file so a timeout/drop offers a one-tap retry.
  const abortRef = useRef<AbortController | null>(null);
  const [retryFile, setRetryFile] = useState<File | null>(null);

  async function runUpload(file: File) {
    const isVideo = file.type.startsWith("video/");
    const isVideoOrGif = mediaCapable && (isVideo || file.type === "image/gif");

    // ---- Client-side gating (instant, plain-English) ----
    if (!mediaCapable) {
      if (!file.type.startsWith("image/")) {
        toast("That file isn't an image.", "error");
        return;
      }
    } else {
      if (!file.type.startsWith("image/") && !isVideo) {
        toast(MEDIA_ERRORS.notMedia, "error");
        return;
      }
      if (isVideo && !(ACCEPTED_VIDEO_TYPES as readonly string[]).includes(file.type)) {
        toast(MEDIA_ERRORS.badFormat, "error");
        return;
      }
    }
    const isStill = !isVideo && file.type !== "image/gif";
    const sizeCap = mediaCapable && !isStill ? MAX_MEDIA_BYTES : MAX_PHOTO_BYTES;
    if (file.size > sizeCap) {
      toast(
        !mediaCapable || isStill
          ? MEDIA_ERRORS.photoTooLarge
          : file.type === "image/gif"
            ? MEDIA_ERRORS.gifTooLarge
            : MEDIA_ERRORS.tooLarge,
        "error",
      );
      return;
    }

    // ---- Video: measure duration + grab a poster (browser-only) ----
    let duration: number | null = null;
    let posterBlob: Blob | null = null;
    if (mediaCapable && isVideo) {
      const inspected = await inspectVideo(file);
      if (inspected.duration !== null && inspected.duration > MAX_VIDEO_SECONDS + 0.5) {
        toast(MEDIA_ERRORS.tooLong, "error");
        return;
      }
      duration = inspected.duration;
      posterBlob = inspected.poster;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setUploading(true);
    setRetryFile(null);
    setProgress(isVideoOrGif ? 0 : null);
    setPreviewIsVideo(isVideo);
    setPreview(URL.createObjectURL(file));

    const result = await uploadSpotlightMedia({
      file,
      fieldKey,
      duration,
      poster: posterBlob,
      isVideoOrGif,
      signal: controller.signal,
      onProgress: (f) => setProgress(f),
    });

    abortRef.current = null;
    setUploading(false);
    setProgress(null);

    if (result.ok) {
      toast(mediaCapable ? "Media updated" : "Photo updated");
      router.refresh();
      return;
    }
    setPreview(null);
    if (result.canceled) {
      toast("Upload canceled.");
    } else {
      // Offer a retry for network failures (not for validation rejections,
      // which won't succeed on a re-try of the same file).
      const retryable =
        result.error === MEDIA_ERRORS.uploadFailed || result.error === MEDIA_ERRORS.uploadTimeout;
      if (retryable) setRetryFile(file);
      toast(result.error, "error");
    }
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    await runUpload(file);
  }

  function cancelUpload() {
    abortRef.current?.abort();
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
    // Media slots: same rendering visitors get — video plays in place (no
    // lightbox), GIFs honor reduced motion via their stored still.
    if (mediaCapable && mediaKindFromUrl(shown) === "video") {
      return (
        <div className={wrapperClassName}>
          <SpotlightVideo src={shown} poster={poster || undefined} alt={alt} />
        </div>
      );
    }
    if (mediaCapable && mediaKindFromUrl(shown) === "gif") {
      return (
        <div className={wrapperClassName}>
          <SpotlightGif
            src={shown}
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
      className={`${wrapperClassName} ${uploading ? "cursor-default" : "cursor-pointer"}`}
      style={shown ? undefined : dashStyle}
      onClick={() => {
        if (!uploading) inputRef.current?.click();
      }}
    >
      {shown ? (
        (preview ? previewIsVideo : mediaCapable && mediaKindFromUrl(shown) === "video") ? (
          // Edit-mode video preview: inert (the whole slot is the picker
          // target), poster keeps it from being a black box before load.
          <video
            src={shown}
            poster={preview ? undefined : poster || undefined}
            muted
            playsInline
            preload="metadata"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <Image
            src={shown}
            alt={alt}
            fill
            sizes={sizes}
            className="object-cover"
            unoptimized={Boolean(preview) || (mediaCapable && mediaKindFromUrl(shown) === "gif")}
          />
        )
      ) : (
        emptyContent
      )}
      {uploading ? (
        // In-flight overlay: real progress for big media + a Cancel control.
        // A ≥60MB video on a phone can take a minute — a bare spinner reads as
        // frozen, so show the percentage whenever it's known.
        <div
          className="absolute inset-x-3 bottom-3 z-20 flex flex-col gap-2 rounded-xl bg-forest-deep/90 px-3 py-2.5 text-cream shadow-lg backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between text-[0.7rem] font-medium uppercase tracking-[0.12em]">
            <span>
              {progress === null
                ? "Uploading…"
                : `Uploading ${Math.round(progress * 100)}%`}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                cancelUpload();
              }}
              className="rounded-full px-2 py-0.5 text-cream/90 underline decoration-cream/40 underline-offset-2 hover:text-cream"
            >
              Cancel
            </button>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-cream/25"
            role="progressbar"
            aria-label="Upload progress"
            aria-valuenow={progress === null ? undefined : Math.round(progress * 100)}
          >
            <div
              className={`h-full rounded-full bg-cream transition-[width] duration-200 ${
                progress === null ? "w-1/3 animate-pulse" : ""
              }`}
              style={progress === null ? undefined : { width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      ) : retryFile ? (
        // Network failure/timeout left the slot unchanged — one-tap retry.
        <div
          className="absolute inset-x-3 bottom-3 z-20 flex items-center justify-center gap-3 rounded-full bg-forest-deep/90 px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-cream shadow-lg backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const f = retryFile;
              setRetryFile(null);
              if (f) void runUpload(f);
            }}
            className="hover:text-cream/80"
          >
            Retry upload
          </button>
          <span aria-hidden className="text-cream/40">
            ·
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setRetryFile(null);
            }}
            className="text-cream/70 hover:text-cream"
          >
            Dismiss
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
          className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-forest-deep/90 px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-cream shadow-lg backdrop-blur-sm transition-colors hover:bg-forest-deep"
        >
          {shown
            ? mediaCapable
              ? "Change media"
              : "Change photo"
            : mediaCapable
              ? "Add media"
              : "Add photo"}
        </button>
      )}
      {shown && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] outline-dashed outline-2 -outline-offset-2 outline-sage/70"
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept={mediaCapable ? MEDIA_ACCEPT : "image/*"}
        className="hidden"
        onClick={(e) => e.stopPropagation()}
        onChange={onFile}
      />
    </div>
  );
}
