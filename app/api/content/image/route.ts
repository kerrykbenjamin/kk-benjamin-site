import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { isEditorRequest } from "@/lib/auth";
import { getField } from "@/lib/content/registry";
import { getStore } from "@/lib/content/store";
import {
  ACCEPTED_VIDEO_TYPES,
  MAX_MEDIA_BYTES,
  MAX_VIDEO_SECONDS,
  MEDIA_ERRORS,
  posterKeyFor,
} from "@/lib/media";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB raw upload cap
const MAX_DIMENSION = 2000; // px — cap longest side after resize

/**
 * Best-effort MP4 duration from the mvhd box (pure buffer scan — deliberately
 * no ffmpeg/mp4 parsing dependency; videos are stored as-is and the caps are
 * the performance guardrail). Returns null when the box can't be read (e.g.
 * WebM, or moov at an odd offset) — the client-side check is the primary
 * gate; this catches uploads that bypass the picker.
 */
function mp4DurationSeconds(buf: Buffer): number | null {
  const idx = buf.indexOf("mvhd");
  if (idx < 0 || idx + 28 > buf.length) return null;
  const version = buf.readUInt8(idx + 4);
  try {
    if (version === 0) {
      const timescale = buf.readUInt32BE(idx + 16);
      const duration = buf.readUInt32BE(idx + 20);
      return timescale > 0 ? duration / timescale : null;
    }
    if (version === 1) {
      const timescale = buf.readUInt32BE(idx + 24);
      const duration = Number(buf.readBigUInt64BE(idx + 28));
      return timescale > 0 ? duration / timescale : null;
    }
  } catch {
    return null;
  }
  return null;
}

export async function POST(req: NextRequest) {
  if (!(await isEditorRequest())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const key = String(form.get("key") ?? "");
  const file = form.get("file");

  const field = getField(key);
  if (!field || field.type !== "image") {
    return NextResponse.json({ error: "That image can't be replaced." }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No photo received." }, { status: 400 });
  }

  // ------------------------------------------------------------ media slots --
  // Spotlight slots (`media: true` in the registry) also take GIFs and short
  // videos. Everything else falls through to the photo-only path unchanged.
  if (field.media && file.type.startsWith("video/")) {
    if (!(ACCEPTED_VIDEO_TYPES as readonly string[]).includes(file.type)) {
      return NextResponse.json({ error: MEDIA_ERRORS.badFormat }, { status: 400 });
    }
    if (file.size > MAX_MEDIA_BYTES) {
      return NextResponse.json({ error: MEDIA_ERRORS.tooLarge }, { status: 400 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    // Duration: the picker already measured it client-side (sent along as a
    // form field); re-check server-side from the MP4 itself where possible.
    const clientDuration = Number(form.get("duration") ?? NaN);
    const parsedDuration = file.type === "video/mp4" ? mp4DurationSeconds(buf) : null;
    const duration = parsedDuration ?? (Number.isFinite(clientDuration) ? clientDuration : null);
    if (duration !== null && duration > MAX_VIDEO_SECONDS + 0.5) {
      return NextResponse.json({ error: MEDIA_ERRORS.tooLong }, { status: 400 });
    }

    // Poster frame: captured client-side (canvas) — no server-side video
    // decoding exists without ffmpeg. Optional: a missing poster only costs
    // the loading placeholder, never a broken slot.
    const posterKey = posterKeyFor(key);
    let posterUrl: string | null = null;
    const poster = form.get("poster");
    if (poster instanceof File && poster.type.startsWith("image/") && getField(posterKey)) {
      try {
        const { default: sharp } = await import("sharp");
        const posterBuf = await sharp(Buffer.from(await poster.arrayBuffer()))
          .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 75 })
          .toBuffer();
        posterUrl = await getStore().setImage(posterKey, posterBuf, "webp");
      } catch {
        posterUrl = null; // poster is best-effort; the video upload still counts
      }
    }

    let url: string;
    try {
      const ext = file.type === "video/webm" ? "webm" : "mp4";
      url = await getStore().setImage(key, buf, ext, file.type);
      if (!posterUrl && getField(posterKey)) {
        // Replacing a video without a fresh poster: clear the stale one so the
        // player never shows the PREVIOUS clip's frame.
        await getStore().setText(posterKey, "");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed.";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, url });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: field.media ? MEDIA_ERRORS.badFormat : "That file isn't an image." },
      { status: 400 },
    );
  }

  if (field.media && file.type === "image/gif") {
    // Real GIFs stay GIFs on media slots (everywhere else they still become a
    // static webp via the photo path below). Same 15MB cap; the message steers
    // big GIFs toward video instead.
    if (file.size > MAX_MEDIA_BYTES) {
      return NextResponse.json({ error: MEDIA_ERRORS.gifTooLarge }, { status: 400 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const posterKey = posterKeyFor(key);
    let url: string;
    try {
      url = await getStore().setImage(key, buf, "gif", "image/gif");
      if (getField(posterKey)) {
        // First frame as a still — lets the player honor prefers-reduced-motion.
        try {
          const { default: sharp } = await import("sharp");
          const posterBuf = await sharp(buf) // page 0 by default
            .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })
            .webp({ quality: 75 })
            .toBuffer();
          await getStore().setImage(posterKey, posterBuf, "webp");
        } catch {
          await getStore().setText(posterKey, ""); // best-effort
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed.";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, url });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "That photo is too large (max 15MB)." }, { status: 400 });
  }

  let processed: Buffer;
  try {
    // Loaded here (not as a static top-level import) so that a failure to
    // load sharp's native binary on the deployed platform is CAUGHT by this
    // try/catch and reported back in the response, instead of crashing the
    // whole route module at import time — which surfaced as an opaque,
    // undiagnosable "Internal Server Error" with no useful message.
    const { default: sharp } = await import("sharp");
    const input = Buffer.from(await file.arrayBuffer());
    const base = sharp(input).rotate(); // honor EXIF orientation from phone photos
    if (field.square) {
      // Center cover-crop to 1:1 for square slots (process-step photos): a
      // photo of any dimensions lands as a square, so the step row never
      // distorts or shifts. Side = the image's own short edge, capped — never
      // upscaled.
      const meta = await base.metadata();
      // .rotate() normalizes EXIF orientation, so swap dims for 90°/270° photos.
      const sideways = (meta.orientation ?? 1) >= 5;
      const w = (sideways ? meta.height : meta.width) ?? MAX_DIMENSION;
      const h = (sideways ? meta.width : meta.height) ?? MAX_DIMENSION;
      const side = Math.min(w, h, MAX_DIMENSION);
      processed = await base
        .resize(side, side, { fit: "cover" })
        .webp({ quality: 80 })
        .toBuffer();
    } else {
      processed = await base
        .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
    }
  } catch (e) {
    // TEMPORARY: surfacing the real message while diagnosing the Netlify
    // deploy issue — revert to the generic copy once uploads are confirmed
    // working end-to-end in production.
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `Couldn't process that image. Try another. (debug: ${detail})` },
      { status: 400 },
    );
  }

  let url: string;
  try {
    url = await getStore().setImage(key, processed, "webp");
    if (field.media && getField(posterKeyFor(key))) {
      // Photo replacing a video/GIF on a media slot: drop the stale poster.
      await getStore().setText(posterKeyFor(key), "");
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, url });
}
