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
  readonly kind: "supabase" | "local";
}

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
    const safeKey = key.replace(/[^a-z0-9._-]/gi, "_");
    const filename = `${safeKey}-${Date.now()}.${ext}`;
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

  async setImage(key: string, buffer: Buffer, ext: string, contentType?: string): Promise<string> {
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

    const safeKey = key.replace(/[^a-z0-9._-]/gi, "_");
    const objectPath = `${safeKey}-${Date.now()}.${ext}`;
    const { error: upErr } = await db.storage
      .from(IMAGE_BUCKET)
      .upload(objectPath, buffer, {
        contentType: contentType ?? `image/${ext}`,
        cacheControl: "31536000",
        upsert: true,
      });
    if (upErr) throw new Error(upErr.message);
    const { data } = db.storage.from(IMAGE_BUCKET).getPublicUrl(objectPath);
    const url = data.publicUrl;
    await this.setText(key, url);

    // Best-effort orphan cleanup — only objects in OUR bucket (built-in
    // /images/* defaults and anything else are left alone), and only after the
    // new pointer is safely saved.
    const marker = `/object/public/${IMAGE_BUCKET}/`;
    if (previous && previous !== url && previous.includes(marker)) {
      try {
        const oldPath = decodeURIComponent(previous.split(marker)[1] ?? "");
        if (oldPath) await db.storage.from(IMAGE_BUCKET).remove([oldPath]);
      } catch {
        // an orphaned object is acceptable, a failed upload isn't
      }
    }
    return url;
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
