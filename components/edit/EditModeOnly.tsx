"use client";

import type { ReactNode } from "react";
import { useEdit } from "./EditProvider";

/**
 * Renders children only while "Edit site" is actively toggled ON — not merely
 * logged in. Used for edit-only UI that must stay hidden while an editor is
 * just browsing (e.g. the gallery tiles' caption fields, which visitors and
 * browsing editors never see; the captions display in the lightbox instead).
 *
 * Callers should still gate on the server-side editor check first
 * (`{editor && <EditModeOnly>…}`), so visitors get zero client payload.
 */
export default function EditModeOnly({ children }: { children: ReactNode }) {
  const { editMode } = useEdit();
  if (!editMode) return null;
  return <>{children}</>;
}
