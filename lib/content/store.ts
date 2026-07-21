import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getAdminClient, isSupabaseConfigured, IMAGE_BUCKET } from "@/lib/supabase";
import { getField } from "./registry";

/**
 * A ContentStore reads/writes the editable overrides. Two implementations:
 *  - SupabaseStore  → production (Supabase table + Storage bucket)
 *  - LocalStore     → dev fallback (JSON file + /public/images/uploads) so the
 *                     whole edit flow is testable before Supabase is wired up.
 * Selected automatically by whether Supabase env vars are present.
 */
export interface ContentStore {
  getAll(): Promise<Record<string, string>>;
  setText(key: string, value: string): Promise<void>;
  /**
   * Persist an already-processed media buffer; returns the public URL/path.
   * `contentType` defaults to `image/<ext>` — video uploads MUST pass their
   * real MIME type (video/mp4, video/webm) or Supabase serves them wrong.
   */
  setImage(key: string, buffer: Buffer, ext: string, contentType?: string): Promise<string>;
  // ---- Direct-to-storage uploads (big video/GIF; Supabase ONLY) -------------
  // Production media uploads can't travel through an API route (Netlify's ~6MB
  // function payload limit vs the 50MB media cap), so the client PUTs the file
  // straight to the bucket with a signed URL, then commits the object path.
  // The LOCAL store never participates: /api/content/media/sign answers
  // { mode: "local" } before these are reached, and LocalStore's
  // implementations throw a clear error if something calls them anyway.
  /** Mint a signed upload URL for `objectPath` in the media bucket. */
  createSignedMediaUpload(
    objectPath: string,
  ): Promise<{ path: string; token: string; signedUrl: string }>;
  /** Does `objectPath` exist in the bucket, and how big is it (bytes)? */
  statObject(objectPath: string): Promise<{ exists: boolean; size: number | null }>;
  /** Delete `objectPath` from the bucket (used to purge oversized uploads). */
  removeObject(objectPath: string): Promise<void>;
  /**
   * Point `key` at an ALREADY-UPLOADED bucket object — same pointer-save +
   * previous-object orphan cleanup as setImage, minus the upload. Returns the
   * public URL saved.
   */
  commitExternalObject(key: string, objectPath: string): Promise<string>;
  readonly kind: "supabase" | "local";
}

/**
 * Bucket/filename-safe form of a content key — the ONE sanitization used for
 * every generated upload filename (`safeKey-<timestamp>.<ext>`), shared by
 * both stores and by the media sign/commit routes so their path validation
 * can never drift from the names actually written.
 */
export function safeKeyForFile(key: string): string {
  return key.replace(/[^a-z0-9._-]/gi, "_");
}

const LOCAL_NO_DIRECT_UPLOAD =
  "Direct-to-storage upload isn't available on the local store — local dev uses the multipart /api/content/image route.";

// ----------------------------------------------------------------------------
// Local fallback store (development / no Supabase yet)
// ----------------------------------------------------------------------------
const LOCAL_DIR = path.join(process.cwd(), ".content-store");
const LOCAL_FILE = path.join(LOCAL_DIR, "content.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "images", "uploads");

class LocalStore implements ContentStore {
  readonly kind = "local" as const;

  async getAll(): Promise<Record<string, string>> {
    try {
      const raw = await fs.readFile(LOCAL_FILE, "utf8");
      return JSON.parse(raw) as Record<string, string>;
    } catch {
      return {};
    }
  }

  private async writeAll(data: Record<string, string>): Promise<void> {
    await fs.mkdir(LOCAL_DIR, { recursive: true });
    await fs.writeFile(LOCAL_FILE, JSON.stringify(data, null, 2), "utf8");
  }

  async setText(key: string, value: string): Promise<void> {
    const all = await this.getAll();
    all[key] = value;
    await this.writeAll(all);
  }

  async setImage(key: string, buffer: Buffer, ext: string, _contentType?: string): Promise<string> {
    // (contentType is irrelevant locally — the file extension drives the MIME
    // type when Next serves /public files.)
    // Capture the value being replaced BEFORE overwriting, so the old upload
    // can be cleaned up (filenames embed key + timestamp, so no URL is ever
    // shared between keys — deleting it can't break another slot).
    const previous = (await this.getAll())[key];

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const filename = `${safeKeyForFile(key)}-${Date.now()}.${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
    const url = `/images/uploads/${filename}`;
    await this.setText(key, url);

    // Best-effort orphan cleanup — only files this store created (under
    // /images/uploads/), and only after the new pointer is safely saved. A
    // cleanup failure must never fail the upload.
    if (previous && previous !== url && previous.startsWith("/images/uploads/")) {
      try {
        await fs.unlink(path.join(UPLOAD_DIR, path.basename(previous)));
      } catch {
        // already gone / locked — an orphan is acceptable, a failed upload isn't
      }
    }
    return url;
  }

  // Direct-to-storage is a Supabase-only concept: the sign route answers
  // { mode: "local" } before any of these could be reached, so a call landing
  // here is a routing bug — fail loudly instead of pretending.
  async createSignedMediaUpload(): Promise<{ path: string; token: string; signedUrl: string }> {
    throw new Error(LOCAL_NO_DIRECT_UPLOAD);
  }

  async statObject(): Promise<{ exists: boolean; size: number | null }> {
    throw new Error(LOCAL_NO_DIRECT_UPLOAD);
  }

  async removeObject(): Promise<void> {
    throw new Error(LOCAL_NO_DIRECT_UPLOAD);
  }

  async commitExternalObject(): Promise<string> {
    throw new Error(LOCAL_NO_DIRECT_UPLOAD);
  }
}

// ----------------------------------------------------------------------------
// Supabase store (production)
// ----------------------------------------------------------------------------
class SupabaseStore implements ContentStore {
  readonly kind = "supabase" as const;

  async getAll(): Promise<Record<string, string>> {
    const db = getAdminClient();
    if (!db) return {};
    const { data, error } = await db.from("content").select("key, value");
    if (error || !data) {
      // LOUD: Supabase is configured but the read failed — edits exist in the DB
      // but the site is silently showing defaults. Surface it every time.
      console.warn(
        "⚠️ [content] Supabase content fetch failed — falling back to built-in defaults:",
        error?.message ?? "no data returned",
      );
      return {};
    }
    const out: Record<string, string> = {};
    for (const row of data) out[row.key as string] = row.value as string;
    return out;
  }

  async setText(key: string, value: string): Promise<void> {
    const db = getAdminClient();
    if (!db) throw new Error("Supabase not configured");
    const field = getField(key);
    const { error } = await db.from("content").upsert(
      {
        key,
        value,
        page: field?.page ?? null,
        type: field?.type ?? "text",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
    if (error) throw new Error(error.message);
  }

  /**
   * Save `url` as the new value of `key`, then best-effort delete the bucket
   * object the previous value pointed at. THE single implementation of the
   * orphan-cleanup semantics — used by both the server-side upload path
   * (setImage) and the direct-upload commit (commitExternalObject). Only
   * objects in OUR bucket are touched (built-in /images/* defaults and
   * anything else are left alone), and only after the new pointer is safely
   * saved. Filenames embed key + timestamp, so no URL is ever shared between
   * keys — deleting the old one can't break another slot.
   */
  private async savePointerWithCleanup(key: string, url: string): Promise<void> {
    const db = getAdminClient();
    if (!db) throw new Error("Supabase not configured");

    // Capture the value being replaced BEFORE overwriting, for orphan cleanup.
    let previous: string | undefined;
    try {
      const { data: prevRow } = await db
        .from("content")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      previous = (prevRow?.value as string | undefined) ?? undefined;
    } catch {
      previous = undefined; // cleanup is best-effort; never block the upload
    }

    await this.setText(key, url);

    const marker = `/object/public/${IMAGE_BUCKET}/`;
    if (previous && previous !== url && previous.includes(marker)) {
      try {
        const oldPath = decodeURIComponent(previous.split(marker)[1] ?? "");
        if (oldPath) await db.storage.from(IMAGE_BUCKET).remove([oldPath]);
      } catch {
        // an orphaned object is acceptable, a failed upload isn't
      }
    }
  }

  async setImage(key: string, buffer: Buffer, ext: string, contentType?: string): Promise<string> {
    const db = getAdminClient();
    if (!db) throw new Error("Supabase not configured");

    const objectPath = `${safeKeyForFile(key)}-${Date.now()}.${ext}`;
    const { error: upErr } = await db.storage
      .from(IMAGE_BUCKET)
      .upload(objectPath, buffer, {
        contentType: contentType ?? `image/${ext}`,
        cacheControl: "31536000",
        upsert: true,
      });
    if (upErr) throw new Error(upErr.message);
    const { data } = db.storage.from(IMAGE_BUCKET).getPublicUrl(objectPath);
    await this.savePointerWithCleanup(key, data.publicUrl);
    return data.publicUrl;
  }

  async createSignedMediaUpload(
    objectPath: string,
  ): Promise<{ path: string; token: string; signedUrl: string }> {
    const db = getAdminClient();
    if (!db) throw new Error("Supabase not configured");
    // No upsert: object paths are timestamped, so collisions can't happen and
    // a leaked token can only ever create ONE new object, never overwrite.
    const { data, error } = await db.storage.from(IMAGE_BUCKET).createSignedUploadUrl(objectPath);
    if (error || !data) throw new Error(error?.message ?? "Could not create an upload URL.");
    return { path: data.path, token: data.token, signedUrl: data.signedUrl };
  }

  async statObject(objectPath: string): Promise<{ exists: boolean; size: number | null }> {
    const db = getAdminClient();
    if (!db) throw new Error("Supabase not configured");

    // Primary: the object-info endpoint (storage-js ≥ 2.6). Errors (404 or an
    // older storage backend without the endpoint) fall through to list().
    try {
      const { data, error } = await db.storage.from(IMAGE_BUCKET).info(objectPath);
      if (!error && data) {
        return { exists: true, size: typeof data.size === "number" ? data.size : null };
      }
    } catch {
      // fall through
    }

    // Fallback: exact-name search at the bucket root (all uploads are flat).
    const { data: rows, error: listErr } = await db.storage
      .from(IMAGE_BUCKET)
      .list("", { search: objectPath, limit: 100 });
    if (listErr || !rows) return { exists: false, size: null };
    const hit = rows.find((r) => r.name === objectPath);
    if (!hit) return { exists: false, size: null };
    const size = (hit.metadata as { size?: unknown } | null)?.size;
    return { exists: true, size: typeof size === "number" ? size : null };
  }

  async removeObject(objectPath: string): Promise<void> {
    const db = getAdminClient();
    if (!db) throw new Error("Supabase not configured");
    const { error } = await db.storage.from(IMAGE_BUCKET).remove([objectPath]);
    if (error) throw new Error(error.message);
  }

  async commitExternalObject(key: string, objectPath: string): Promise<string> {
    const db = getAdminClient();
    if (!db) throw new Error("Supabase not configured");
    const { data } = db.storage.from(IMAGE_BUCKET).getPublicUrl(objectPath);
    await this.savePointerWithCleanup(key, data.publicUrl);
    return data.publicUrl;
  }
}

let localStore: LocalStore | null = null;
let supabaseStore: SupabaseStore | null = null;

export function getStore(): ContentStore {
  if (isSupabaseConfigured()) {
    return (supabaseStore ??= new SupabaseStore());
  }
  return (localStore ??= new LocalStore());
}
