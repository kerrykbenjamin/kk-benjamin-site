import "server-only";
import { getStore } from "@/lib/content/store";

/**
 * Resolves the saved display order for a repeating collection (case-study
 * cards, value props, gallery images…). Same fail-safe pattern as the rest of
 * the content system: if nothing's saved, or the saved order doesn't exactly
 * match the current set of ids (corrupted, stale after a content change, an
 * id renamed/removed), fall back to the original default order — NEVER drop
 * an item or render blank.
 *
 * Reads directly from the store — NOT via lib/content's getText(), which
 * filters through the text/image field registry whitelist that order keys
 * aren't part of (they're validated separately, in the order API route).
 */
export async function getOrder(collection: string, defaultIds: string[]): Promise<string[]> {
  try {
    const all = await getStore().getAll();
    const raw = all[`order.${collection}`];
    if (!raw) return defaultIds;
    const saved = raw.split(",").map((s) => s.trim()).filter(Boolean);
    const isValidPermutation =
      saved.length === defaultIds.length &&
      new Set(saved).size === defaultIds.length &&
      saved.every((id) => defaultIds.includes(id));
    return isValidPermutation ? saved : defaultIds;
  } catch {
    return defaultIds;
  }
}

/** Reorders `items` to match `order`, using `getId` to identify each item. */
export function applyOrder<T>(
  items: T[],
  order: string[],
  getId: (item: T) => string = (i) => (i as { id: string }).id,
): T[] {
  const byId = new Map(items.map((i) => [getId(i), i]));
  const ordered = order.map((id) => byId.get(id)).filter((i): i is T => Boolean(i));
  // Defensive: if order somehow omitted an item, append any missing ones rather than dropping them.
  for (const item of items) {
    if (!ordered.includes(item)) ordered.push(item);
  }
  return ordered;
}
