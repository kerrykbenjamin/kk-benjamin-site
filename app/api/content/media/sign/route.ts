import { NextResponse, type NextRequest } from "next/server";
import { isEditorRequest } from "@/lib/auth";
import { getField } from "@/lib/content/registry";
import { getStore, safeKeyForFile } from "@/lib/content/store";
import {
  ACCEPTED_VIDEO_TYPES,
  MAX_MEDIA_BYTES,
  MAX_VIDEO_SECONDS,
  MEDIA_ERRORS,
} from "@/lib/media";

export const runtime = "nodejs";

/**
 * Step 1 of the direct-to-storage media upload (video/GIF up to 50MB).
 *
 * A 50MB body can NEVER travel through an API route in production — Netlify
 * caps function payloads around 6MB — so the client asks this route for a
 * signed Supabase Storage upload URL (tiny JSON in/out), PUTs the file
 * straight to the bucket, then reports the object path to
 * /api/content/media/commit. On the local store there are no signed URLs;
 * this route answers { mode: "local" } and the client falls back to the
 * existing multipart /api/content/image route (fine in dev — no body limit).
 *
 * Request (JSON):  { key, fileType, fileSize, duration? }
 * Response (JSON): { mode: "local" }
 *               |  { mode: "signed", path, token, url, method, headers }
 *                  → browser uploads with: fetch(url, { method, headers, body: file })
 *                    (the signed token rides in the URL's ?token= query — no
 *                    service key, no auth header)
 *               |  { error } with status 400/401/500
 *
 * NOTE: fileSize/duration here are client-reported — a signed URL cannot
 * enforce them. The commit route re-verifies the REAL object size server-side
 * and deletes oversized uploads, so lying here buys nothing.
 */

/** MIME → stored extension (the extension drives mediaKindFromUrl at render). */
const EXT_BY_TYPE: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "image/gif": "gif",
};

export async function POST(req: NextRequest) {
  if (!(await isEditorRequest())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  let body: { key?: unknown; fileType?: unknown; fileSize?: unknown; duration?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const key = typeof body.key === "string" ? body.key : "";
  const fileType = typeof body.fileType === "string" ? body.fileType : "";
  const fileSize = typeof body.fileSize === "number" ? body.fileSize : NaN;
  const duration = typeof body.duration === "number" ? body.duration : null;

  const field = getField(key);
  if (!field?.media) {
    return NextResponse.json({ error: "That slot doesn't accept media." }, { status: 400 });
  }

  const isGif = fileType === "image/gif";
  if (!isGif && !(ACCEPTED_VIDEO_TYPES as readonly string[]).includes(fileType)) {
    return NextResponse.json({ error: MEDIA_ERRORS.badFormat }, { status: 400 });
  }
  if (!Number.isFinite(fileSize) || fileSize <= 0) {
    return NextResponse.json({ error: MEDIA_ERRORS.uploadFailed }, { status: 400 });
  }
  if (fileSize > MAX_MEDIA_BYTES) {
    return NextResponse.json(
      { error: isGif ? MEDIA_ERRORS.gifTooLarge : MEDIA_ERRORS.tooLarge },
      { status: 400 },
    );
  }
  if (!isGif && duration !== null && duration > MAX_VIDEO_SECONDS + 0.5) {
    return NextResponse.json({ error: MEDIA_ERRORS.tooLong }, { status: 400 });
  }

  const store = getStore();
  if (store.kind === "local") {
    return NextResponse.json({ mode: "local" });
  }

  // Same naming scheme as SupabaseStore.setImage — sanitized key + timestamp,
  // flat in the bucket. The commit route validates this EXACT shape, so a
  // signed path is only ever committable to the key it was minted for.
  const objectPath = `${safeKeyForFile(key)}-${Date.now()}.${EXT_BY_TYPE[fileType]}`;

  try {
    const { path, token, signedUrl } = await store.createSignedMediaUpload(objectPath);
    return NextResponse.json({
      mode: "signed",
      path,
      token,
      url: signedUrl,
      // The exact request the browser should make (token is inside `url`):
      method: "PUT",
      headers: { "content-type": fileType, "cache-control": "max-age=31536000" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not start the upload.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
