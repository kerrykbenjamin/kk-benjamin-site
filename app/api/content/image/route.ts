import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { isEditorRequest } from "@/lib/auth";
import { getField } from "@/lib/content/registry";
import { getStore } from "@/lib/content/store";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB raw upload cap
const MAX_DIMENSION = 2000; // px — cap longest side after resize

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
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "That file isn't an image." }, { status: 400 });
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
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, url });
}
