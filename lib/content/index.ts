import "server-only";
import { cache } from "react";
import { getStore } from "./store";
import { defaultsMap, getField } from "./registry";

/**
 * Content map = built-in defaults overlaid with whitelisted overrides from the
 * store. Wrapped in React cache() so it runs once per request no matter how many
 * fields read it. Pages are already dynamically rendered (the layout reads the
 * session cookie), so edits appear on the very next request — no cache to bust.
 */
export const getContentMap = cache(
  async (): Promise<Record<string, string>> => {
    const out = defaultsMap();
    let overrides: Record<string, string> = {};
    try {
      overrides = await getStore().getAll();
    } catch (e) {
      // LOUD failure signal: the site still renders (registry defaults), but any
      // saved edits are NOT being shown. Never let this fail silently.
      console.warn(
        "⚠️ [content] Store fetch FAILED — rendering built-in default copy; saved edits are not displayed!",
        e instanceof Error ? e.message : e,
      );
      overrides = {};
    }
    for (const [k, v] of Object.entries(overrides)) {
      if (getField(k)) out[k] = v; // ignore stale/unknown keys
    }
    return out;
  },
);

export async function getText(key: string): Promise<string> {
  const map = await getContentMap();
  return map[key] ?? getField(key)?.default ?? "";
}

/** Images are stored the same way (value = URL/path). */
export async function getImage(key: string): Promise<string> {
  return getText(key);
}
