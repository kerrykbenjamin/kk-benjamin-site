"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useEdit } from "./EditProvider";
import type { OrderedItem } from "./OrderedGrid";

/**
 * Drag-to-reorder within a fixed grid — never free positioning. Two equally
 * first-class ways to reorder, since drag gestures can't be verified on a real
 * phone from this environment:
 *  - Drag handle, using Pointer Events (unifies mouse + touch + pen in one
 *    code path — the modern, mobile-correct approach; `touch-action: none` on
 *    the handle stops the browser's native scroll from hijacking the gesture).
 *  - Move left/right arrow buttons — guaranteed to work regardless of device
 *    or gesture precision, no drag skill required.
 * The overlay controls are absolutely positioned on top of each item, so they
 * never affect the underlying grid's column count, gaps, or item size — only
 * the ORDER of items changes, never the layout.
 *
 * State design notes (fixed after an owl-method review found real bugs here):
 *  - `orderRef` is the single source of truth read by every event handler, so
 *    `persist()` is NEVER called from inside a `setState` updater function —
 *    React Strict Mode intentionally double-invokes updater functions in dev
 *    to catch impurity, which was silently double-saving on every reorder.
 *  - `requestIdRef` sequences saves: if a second reorder starts before the
 *    first one's request finishes, the first (stale) response is ignored
 *    entirely, so the LAST action always wins, not whichever network response
 *    happens to arrive last (a real lost-update race with rapid clicks).
 *  - `lastGoodOrderRef` — not the frozen mount-time `items` — is what a failed
 *    save reverts to, so error recovery reflects the actual last-persisted
 *    state instead of stale data from first render.
 *  - Buttons are disabled while `saving`, so a fast double-click can't even
 *    start a second save in the first place (the sequencing above is the
 *    backstop, not the primary defense).
 */
export default function Reorderable({
  collection,
  items,
  className,
}: {
  collection: string;
  items: OrderedItem[];
  className: string;
}) {
  const { editMode, toast } = useEdit();
  const router = useRouter();

  const [order, setOrderState] = useState<string[]>(() => items.map((i) => i.id));
  const orderRef = useRef(order);
  const lastGoodOrderRef = useRef(order);
  const requestIdRef = useRef(0);
  const savingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const draggingId = useRef<string | null>(null);
  const [draggingVisual, setDraggingVisual] = useState<string | null>(null);
  const byId = new Map(items.map((i) => [i.id, i]));

  function updateOrder(next: string[]) {
    orderRef.current = next;
    setOrderState(next);
  }

  // Resync when the underlying collection's id SET changes (e.g. an item
  // added/removed in source) — preserves relative order for ids still
  // present, appends new ones. Skipped while actively dragging or saving so
  // it never clobbers an in-progress interaction.
  useEffect(() => {
    const currentIds = items.map((i) => i.id);
    if (draggingId.current || savingRef.current) return;
    const prev = orderRef.current;
    const currentSet = new Set(currentIds);
    const sameSet = prev.length === currentIds.length && prev.every((id) => currentSet.has(id));
    if (sameSet) return;
    const prevSet = new Set(prev);
    const kept = prev.filter((id) => currentSet.has(id));
    const added = currentIds.filter((id) => !prevSet.has(id));
    const next = [...kept, ...added];
    lastGoodOrderRef.current = next;
    updateOrder(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map((i) => i.id).join("|")]);

  async function persist(next: string[]) {
    const myRequestId = ++requestIdRef.current;
    savingRef.current = true;
    setSaving(true);
    try {
      const res = await fetch("/api/content/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection, ids: next }),
      });
      // A newer reorder started after this request was sent — let that one
      // own the outcome; applying this stale response would be the race.
      if (myRequestId !== requestIdRef.current) return;

      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Couldn't save the new order.", "error");
        updateOrder(lastGoodOrderRef.current);
        return;
      }
      lastGoodOrderRef.current = next;
      toast("Order saved");
      router.refresh();
    } catch {
      if (myRequestId !== requestIdRef.current) return;
      toast("Couldn't save the new order. Check your connection.", "error");
      updateOrder(lastGoodOrderRef.current);
    } finally {
      if (myRequestId === requestIdRef.current) {
        savingRef.current = false;
        setSaving(false);
      }
    }
  }

  function moveBy(id: string, dir: -1 | 1) {
    if (savingRef.current) return;
    const prev = orderRef.current;
    const idx = prev.indexOf(id);
    const swapWith = idx + dir;
    if (swapWith < 0 || swapWith >= prev.length) return;
    const next = [...prev];
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    updateOrder(next);
    persist(next);
  }

  useEffect(() => {
    if (!draggingVisual) return;

    function onMove(e: PointerEvent) {
      const overEl = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest<HTMLElement>("[data-reorder-id]");
      const overId = overEl?.dataset.reorderId;
      if (!overId || !draggingId.current || overId === draggingId.current) return;
      const prev = orderRef.current;
      const from = prev.indexOf(draggingId.current);
      const to = prev.indexOf(overId);
      if (from === -1 || to === -1) return;
      const next = [...prev];
      next.splice(from, 1);
      next.splice(to, 0, draggingId.current);
      updateOrder(next);
    }
    function onUp() {
      const finished = draggingId.current;
      draggingId.current = null;
      setDraggingVisual(null);
      if (finished) persist(orderRef.current);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [draggingVisual]);

  const displayItems = order.map((id) => byId.get(id)).filter((i): i is OrderedItem => Boolean(i));

  return (
    <div className={className}>
      {displayItems.map((item, i) => (
        <div
          key={item.id}
          data-reorder-id={item.id}
          className={`relative ${draggingVisual === item.id ? "opacity-60" : ""}`}
        >
          {item.node}
          {editMode && (
            <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-forest-deep/90 px-1.5 py-1 text-cream shadow-md backdrop-blur-sm">
              <button
                type="button"
                aria-label="Move earlier"
                disabled={saving || i === 0}
                onClick={() => moveBy(item.id, -1)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-sm disabled:opacity-30"
              >
                ‹
              </button>
              <span
                role="button"
                tabIndex={0}
                aria-label="Drag to reorder"
                aria-disabled={saving}
                onPointerDown={(e) => {
                  if (savingRef.current) return;
                  (e.target as HTMLElement).setPointerCapture(e.pointerId);
                  draggingId.current = item.id;
                  setDraggingVisual(item.id);
                }}
                style={{ touchAction: "none" }}
                className={`flex h-7 w-7 items-center justify-center text-sm ${
                  saving ? "cursor-not-allowed opacity-30" : "cursor-grab active:cursor-grabbing"
                }`}
              >
                ⠿
              </span>
              <button
                type="button"
                aria-label="Move later"
                disabled={saving || i === displayItems.length - 1}
                onClick={() => moveBy(item.id, 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-sm disabled:opacity-30"
              >
                ›
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
