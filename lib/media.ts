/**
 * Shared media rules for the campaign-spotlight slots — the ONE source of
 * truth for what a "media" slot accepts, used by the client picker, the
 * upload API routes, and the render branch. Client-safe (no server imports).
 *
 * Design decisions (see EDITING-GUIDE.md for the client-facing wording):
 *  - Media kind is inferred from the stored URL's file extension — the
 *    content store keeps plain string values, so no schema migration.
 *  - Video is stored AS-IS (no ffmpeg/transcoding dependency); the size and
 *    duration caps below are the performance guardrail instead.
 *  - Video/GIF cap is 50MB. That is far above the ~6MB Netlify Function
 *    request limit, so big files NEVER travel through an API route in
 *    production — the client asks /api/content/media/sign for a signed
 *    Supabase Storage upload URL, PUTs the file directly to storage, then
 *    reports the object path to /api/content/media/commit. Local dev (no
 *    function limit) keeps the simple multipart route.
 *  - Photos keep a smaller 15MB cap — they're recompressed server-side by
 *    sharp anyway, so bigger originals buy nothing.
 *  - MP4 (H.264) + WebM only — the widely-compatible set. iPhone .mov files
 *    are rejected with guidance rather than stored as something Firefox
 *    can't play.
 *  - GIFs share the video size cap; the rejection message still steers huge
 *    GIFs toward video, which is almost always far smaller.
 */

export type MediaKind = "image" | "gif" | "video";

/** Campaign-spotlight carousel size — registry keys, slot rendering, and the
 *  editing guide all derive from this ONE number. */
export const SPOTLIGHT_SLOT_COUNT = 6;

export const MAX_MEDIA_BYTES = 50 * 1024 * 1024; // 50MB — video + GIF
export const MAX_PHOTO_BYTES = 15 * 1024 * 1024; // 15MB — stills (sharp recompresses)
export const MAX_VIDEO_SECONDS = 30;

export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm"] as const;

/** value for <input accept> on media-capable slots */
export const MEDIA_ACCEPT = "image/*,video/mp4,video/webm";

export const MEDIA_ERRORS = {
  tooLarge: "This file is too large — the limit is 50MB for videos and GIFs.",
  photoTooLarge: "That photo is too large (max 15MB).",
  gifTooLarge:
    "This GIF is too large — the limit is 50MB. Tip: the same clip uploaded as an MP4 video is usually far smaller and looks better.",
  tooLong: "This video is too long — please use a clip under 30 seconds.",
  badFormat:
    "That video format isn't supported — please upload an MP4 (or WebM) file. iPhone videos saved as .mov need to be exported as MP4 first.",
  notMedia: "That file isn't a photo, GIF, or video.",
  uploadFailed:
    "The upload didn't finish — check your connection and try again.",
  uploadTimeout:
    "The upload is taking too long — check your connection and try again. Large videos upload faster on Wi-Fi.",
} as const;

export function mediaKindFromUrl(url: string): MediaKind {
  const clean = url.split(/[?#]/)[0].toLowerCase();
  if (clean.endsWith(".mp4") || clean.endsWith(".webm")) return "video";
  if (clean.endsWith(".gif")) return "gif";
  return "image";
}

/** Companion poster key for a media slot (e.g. …spotlight.1.image → …spotlight.1.poster). */
export function posterKeyFor(mediaKey: string): string {
  return mediaKey.replace(/\.image$/, ".poster");
}
