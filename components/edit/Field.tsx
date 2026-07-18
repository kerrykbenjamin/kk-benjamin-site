import type { ElementType } from "react";
import { getText } from "@/lib/content";
import { getIsEditor } from "@/lib/editor-state";
import EditableText from "./EditableText";

/**
 * Renders an editable text field. For normal visitors it emits plain server
 * markup with zero edit traces; only a logged-in editor gets the client editor.
 */
export default async function Field({
  id,
  as = "span",
  className = "",
}: {
  id: string;
  as?: ElementType;
  className?: string;
}) {
  const [value, editor] = await Promise.all([getText(id), getIsEditor()]);

  if (!editor) {
    const Tag = as;
    return <Tag className={className}>{value}</Tag>;
  }
  return <EditableText fieldKey={id} value={value} as={as} className={className} />;
}
