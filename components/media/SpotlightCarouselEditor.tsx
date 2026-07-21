"use client";

import { useEdit } from "@/components/edit/EditProvider";
import SpotlightCarousel, { type SpotlightSlide } from "./SpotlightCarousel";

/**
 * Editor-side wrapper for the spotlight carousel. SpotlightCallout renders
 * this ONLY for a logged-in editor (EditProvider is mounted app-wide from
 * app/layout.tsx, so useEdit() is always backed by real context here);
 * visitors get the plain SpotlightCarousel with editMode={false} directly.
 * Splitting it this way keeps the hook call unconditional — the carousel
 * itself never calls useEdit().
 *
 * Edit-site OFF → editMode=false → the carousel behaves exactly like the
 * visitor view (filled slots only). Edit-site ON → all slots become slides.
 */
export default function SpotlightCarouselEditor({
  slug,
  slides,
}: {
  slug: string;
  slides: SpotlightSlide[];
}) {
  const { editMode } = useEdit();
  return <SpotlightCarousel slug={slug} slides={slides} editMode={editMode} />;
}
