/**
 * Client-side spotlight media upload. Chooses the right path automatically and
 * reports real progress so a 50MB video on a phone connection never looks
 * frozen.
 *
 *  - Photos + local dev: multipart POST to /api/content/image (XHR, so we get
 *    upload progress + cancel there too).
 *  - Production video/GIF: /api/content/media/sign says mode:"signed", the
 *    browser PUTs the file DIRECTLY to Supabase Storage (bypassing Netlify's
 *    ~6MB function limit), then /api/content/media/commit records the path.
 *    If sign says mode:"local" (no Supabase configured) we fall back to the
 *    multipart route — same as photos.
 *
 * Every network leg is an abortable XHR with a stall timeout: if no progress
 * arrives for STALL_MS the upload is treated as a dropped connection and the
 * caller can retry. Cancellation is cooperative via an AbortSignal.
 */
import { MEDIA_ERRORS } from "./media";

const STALL_MS = 30_000; // no progress for 30s ⇒ treat as a dropped connection

export type UploadOutcome =
  | { ok: true; url: string }
  | { ok: false; error: string; canceled?: boolean };

export type UploadArgs = {
  file: File;
  fieldKey: string;
  /** Client-measured video duration (seconds), when known. */
  duration?: number | null;
  /** Client-captured poster frame (video only). */
  poster?: Blob | null;
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
};

/** One abortable XHR with progress + stall detection. */
function xhrSend(
  method: string,
  url: string,
  body: XMLHttpRequestBodyInit,
  {
    headers,
    onProgress,
    signal,
    responseType,
  }: {
    headers?: Record<string, string>;
    onProgress?: (fraction: number) => void;
    signal?: AbortSignal;
    responseType?: "json" | "text";
  } = {},
): Promise<{ status: number; body: unknown }> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const xhr = new XMLHttpRequest();
    let stall: ReturnType<typeof setTimeout> | null = null;
    const armStall = () => {
      if (stall) clearTimeout(stall);
      stall = setTimeout(() => xhr.abort(), STALL_MS);
    };
    const clearStall = () => {
      if (stall) clearTimeout(stall);
      stall = null;
    };
    const onAbort = () => xhr.abort();

    xhr.open(method, url);
    if (headers) for (const [k, v] of Object.entries(headers)) xhr.setRequestHeader(k, v);
    xhr.upload.onprogress = (e) => {
      armStall();
      if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
    };
    xhr.upload.onloadstart = armStall;
    xhr.upload.onload = clearStall; // upload done; awaiting response
    xhr.onload = () => {
      clearStall();
      signal?.removeEventListener("abort", onAbort);
      let parsed: unknown = xhr.responseText;
      if (responseType !== "text") {
        try {
          parsed = xhr.responseText ? JSON.parse(xhr.responseText) : null;
        } catch {
          parsed = null;
        }
      }
      resolve({ status: xhr.status, body: parsed });
    };
    xhr.onerror = () => {
      clearStall();
      signal?.removeEventListener("abort", onAbort);
      reject(new Error("network"));
    };
    xhr.onabort = () => {
      clearStall();
      signal?.removeEventListener("abort", onAbort);
      // Distinguish user-cancel from a stall: if the caller's signal fired it's
      // a cancel; otherwise the stall timer aborted us (dropped connection).
      reject(new DOMException(signal?.aborted ? "Aborted" : "Timeout", signal?.aborted ? "AbortError" : "TimeoutError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    armStall();
    xhr.send(body);
  });
}

function messageFor(err: unknown): { error: string; canceled?: boolean } {
  if (err instanceof DOMException && err.name === "AbortError") {
    return { error: "Upload canceled.", canceled: true };
  }
  if (err instanceof DOMException && err.name === "TimeoutError") {
    return { error: MEDIA_ERRORS.uploadTimeout };
  }
  return { error: MEDIA_ERRORS.uploadFailed };
}

/** Multipart path — photos everywhere, and video/GIF in local dev. */
async function uploadMultipart(args: UploadArgs): Promise<UploadOutcome> {
  const { file, fieldKey, duration, poster, onProgress, signal } = args;
  const fd = new FormData();
  fd.append("key", fieldKey);
  fd.append("file", file);
  if (duration != null) fd.append("duration", String(duration));
  if (poster) fd.append("poster", new File([poster], "poster.jpg", { type: "image/jpeg" }));
  try {
    const { status, body } = await xhrSend("POST", "/api/content/image", fd, {
      onProgress,
      signal,
    });
    const data = (body ?? {}) as { ok?: boolean; url?: string; error?: string };
    if (status >= 200 && status < 300 && data.url) return { ok: true, url: data.url };
    return { ok: false, error: data.error ?? MEDIA_ERRORS.uploadFailed };
  } catch (err) {
    return { ok: false, ...messageFor(err) };
  }
}

/**
 * Public entry point. `isVideoOrGif` selects the direct-upload path attempt;
 * photos always go multipart.
 */
export async function uploadSpotlightMedia(
  args: UploadArgs & { isVideoOrGif: boolean },
): Promise<UploadOutcome> {
  const { file, fieldKey, duration, poster, onProgress, signal, isVideoOrGif } = args;
  if (!isVideoOrGif) return uploadMultipart(args);

  // 1) Ask the server how to upload this (and let it validate type/size/dur).
  let sign: {
    mode?: "local" | "signed";
    url?: string;
    path?: string;
    method?: string;
    headers?: Record<string, string>;
    error?: string;
  };
  try {
    const res = await fetch("/api/content/media/sign", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        key: fieldKey,
        fileType: file.type,
        fileSize: file.size,
        duration: duration ?? undefined,
      }),
      signal,
    });
    sign = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: sign.error ?? MEDIA_ERRORS.uploadFailed };
  } catch (err) {
    return { ok: false, ...messageFor(err) };
  }

  // 2a) No Supabase (local dev): fall back to the multipart route.
  if (sign.mode !== "signed" || !sign.url || !sign.path) {
    return uploadMultipart(args);
  }

  // 2b) Direct-to-storage PUT — the file never touches a serverless function.
  try {
    const { status } = await xhrSend(sign.method ?? "PUT", sign.url, file, {
      headers: sign.headers ?? { "content-type": file.type },
      onProgress,
      signal,
      responseType: "text",
    });
    if (status < 200 || status >= 300) return { ok: false, error: MEDIA_ERRORS.uploadFailed };
  } catch (err) {
    return { ok: false, ...messageFor(err) };
  }

  // 3) Commit: record the object path + poster (tiny payload — safe on Netlify).
  try {
    const fd = new FormData();
    fd.append("key", fieldKey);
    fd.append("path", sign.path);
    if (duration != null) fd.append("duration", String(duration));
    if (poster) fd.append("poster", new File([poster], "poster.jpg", { type: "image/jpeg" }));
    const res = await fetch("/api/content/media/commit", { method: "POST", body: fd });
    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (res.ok && data.url) return { ok: true, url: data.url };
    return { ok: false, error: data.error ?? MEDIA_ERRORS.uploadFailed };
  } catch (err) {
    return { ok: false, ...messageFor(err) };
  }
}
