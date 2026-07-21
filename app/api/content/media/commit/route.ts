import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { isEditorRequest } from "@/lib/auth";
import { getField } from "@/lib/content/registry";
import { getStore, safeKeyForFile } from "@/lib/content/store";
import {
  MAX_MEDIA_BYTES,
  MAX_PHOTO_BYTES,
  MAX_VIDEO_SECONDS,
  MEDIA_ERRORS,
  posterKeyFor,
} from "@/lib/media";

export const runtime = "nodejs";

/**
 * Step 2 of the direct-to-storage media upload: the client has already PUT
 * the video/GIF straight into the bucket with a signed URL from
 * /api/content/media/sign — this route verifies the object and points the
 * content key at it. Multipart, but only TINY parts ever arrive here:
 *   - key       content key (spotlight media slot)
 *   - path      bucket object path returned by the sign route
 *   - duration  optional client-measured seconds (videos)
 *   - poster    optional small client-captured frame (jpeg) — never the media
 * The 50MB media file itself must NEVER travel through this route — Netlify
 * would 413 it (~6MB function payload limit).
 *
 * Response: { ok: true, url } | { error } with status 400/401/500.
 */

const MAX_DIMENSION = 2000; // px — same poster processing as the image route

export async function POST(req: NextRequest) {
  if (!(await isEditorRequest())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const key = String(form.get("key") ?? "");
  const objectPath = String(form.get("path") ?? "");

  const field = getField(key);
  if (!field?.media) {
    return NextResponse.json({ error: "That slot doesn't accept media." }, { status: 400 });
  }

  // The client may only commit an object the sign route named for THIS key —
  // `safeKey-<timestamp>.<mp4|webm|gif>` — never an arbitrary bucket object
  // (no slashes, no other keys' files, no built-in assets). safeKeyForFile
  // output only contains [a-z0-9._-], so `.` is the one regex metachar to
  // escape; the replace below escapes defensively anyway.
  const escapedKey = safeKeyForFile(key).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pathPattern = new RegExp(`^${escapedKey}-\\d+\\.(mp4|webm|gif)$`);
  if (!pathPattern.test(objectPath)) {
    return NextResponse.json({ error: MEDIA_ERRORS.uploadFailed }, { status: 400 });
  }

  const store = getStore();
  if (store.kind === "local") {
    // Can't happen through the real client (sign answered { mode: "local" },
    // which routes it to the multipart image route) — guard anyway.
    return NextResponse.json(
      { error: "Direct upload isn't available in local development." },
      { status: 400 },
    );
  }

  // Signed upload URLs don't enforce a size cap — the sign route only saw the
  // CLAIMED size. Verify what actually landed; purge anything oversized.
  let stat: { exists: boolean; size: number | null };
  try {
    stat = await store.statObject(objectPath);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload check failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
  if (!stat.exists) {
    return NextResponse.json({ error: MEDIA_ERRORS.uploadFailed }, { status: 400 });
  }
  if (stat.size !== null && stat.size > MAX_MEDIA_BYTES) {
    try {
      await store.removeObject(objectPath);
    } catch {
      // best-effort purge — the slot is refused either way
    }
    return NextResponse.json(
      { error: objectPath.endsWith(".gif") ? MEDIA_ERRORS.gifTooLarge : MEDIA_ERRORS.tooLarge },
      { status: 400 },
    );
  }

  // Duration: client-measured (no server-side video decoding without ffmpeg —
  // same trust model as the multipart route's client fallback). Reject + purge
  // when over the cap.
  const clientDuration = Number(form.get("duration") ?? NaN);
  if (
    !objectPath.endsWith(".gif") &&
    Number.isFinite(clientDuration) &&
    clientDuration > MAX_VIDEO_SECONDS + 0.5
  ) {
    try {
      await store.removeObject(objectPath);
    } catch {
      // best-effort purge
    }
    return NextResponse.json({ error: MEDIA_ERRORS.tooLong }, { status: 400 });
  }

  // Point the key at the uploaded object — SAME orphan-cleanup semantics as
  // SupabaseStore.setImage (previous bucket object is removed best-effort
  // after the new pointer is saved).
  let url: string;
  try {
    url = await store.commitExternalObject(key, objectPath);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Poster: small client-captured frame — best-effort, never fails the commit.
  // Missing or unprocessable → CLEAR the poster key so the player can never
  // show the PREVIOUS clip's frame over the new media.
  const posterKey = posterKeyFor(key);
  if (getField(posterKey)) {
    let posterSaved = false;
    const poster = form.get("poster");
    if (
      poster instanceof File &&
      poster.type.startsWith("image/") &&
      poster.size <= MAX_PHOTO_BYTES
    ) {
      try {
        const { default: sharp } = await import("sharp");
        const posterBuf = await sharp(Buffer.from(await poster.arrayBuffer()))
          .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 75 })
          .toBuffer();
        await store.setImage(posterKey, posterBuf, "webp");
        posterSaved = true;
      } catch {
        posterSaved = false;
      }
    }
    if (!posterSaved) {
      try {
        await store.setText(posterKey, "");
      } catch {
        // stale-poster clearing is best-effort; the media commit already stuck
      }
    }
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, url });
}
