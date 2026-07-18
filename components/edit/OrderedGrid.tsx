import type { ReactNode } from "react";
import { getIsEditor } from "@/lib/editor-state";
import Reorderable from "./Reorderable";

export type OrderedItem = { id: string; node: ReactNode };

/**
 * Server-side gate, same pattern as Field/ImageField: visitors get the plain
 * grid div with zero extra markup or client JS; only a logged-in editor in
 * edit mode gets the interactive drag/arrow reorder controls. The display
 * ORDER itself (already resolved server-side via lib/order) is identical for
 * everyone — only the ability to CHANGE it is gated.
 */
export default async function OrderedGrid({
  collection,
  items,
  className,
}: {
  collection: string;
  items: OrderedItem[];
  className: string;
}) {
  const editor = await getIsEditor();

  if (!editor) {
    return <div className={className}>{items.map((i) => i.node)}</div>;
  }
  return <Reorderable collection={collection} items={items} className={className} />;
}
