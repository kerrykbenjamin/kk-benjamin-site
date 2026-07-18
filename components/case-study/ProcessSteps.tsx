import Field from "@/components/edit/Field";
import ImageSlot from "@/components/edit/ImageSlot";
import { getText } from "@/lib/content";
import ProcessStepPlaceholder from "./ProcessStepPlaceholder";
import { IconAward, IconGrid, IconPencil, IconShapes } from "./icons";

// Cycled by step index so a future 5th step still gets an icon.
const STEP_ICONS = [
  <IconGrid key="g" />, // mood board
  <IconPencil key="p" />, // sketches
  <IconShapes key="s" />, // logo concepts
  <IconAward key="a" />, // final brand
];

/**
 * Design-process steps as a horizontal row with connecting lines on desktop,
 * collapsing to a centered vertical stack on mobile. The numeral badge uses the
 * theme's `accent` only as a decorative ring border (not text) since every
 * project's accent measured below the safe text-contrast threshold — the
 * numeral itself and the connector line stay on the contrast-safe `text` role.
 * Step labels stay editable.
 *
 * Each step carries a SQUARE (1:1) photo slot beneath its label. Empty slots
 * always render the designed ProcessStepPlaceholder (icon + current step name
 * on the project's tint) — publicly visible until the client uploads a real
 * photo, which the square wrapper + object-cover center-crops with zero layout
 * shift. Every geometry state (all / some / no photos) is identical: no gaps,
 * no ragged heights. Swap-only — no remove control.
 */
export default async function ProcessSteps({
  slug,
  count,
}: {
  slug: string;
  count: number;
}) {
  // Current (possibly edited) step names, shown inside the placeholders.
  const labels = await Promise.all(
    Array.from({ length: count }, (_, i) => getText(`case.${slug}.process.${i + 1}`)),
  );

  return (
    <ol className="flex flex-col gap-8 md:flex-row md:items-start md:gap-0">
      {Array.from({ length: count }, (_, i) => {
        const first = i === 0;
        const last = i === count - 1;
        return (
          <li key={i} className="flex flex-1 flex-col items-center text-center">
            <div className="flex w-full items-center justify-center">
              <span
                aria-hidden
                className={`hidden h-px flex-1 md:block ${
                  first ? "invisible" : "bg-[var(--cs-accent,#6F8B5F)]/30"
                }`}
              />
              <span className="mx-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[var(--cs-accent,#6F8B5F)] font-display text-lg font-semibold text-[var(--cs-text,#1F2A19)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                aria-hidden
                className={`hidden h-px flex-1 md:block ${
                  last ? "invisible" : "bg-[var(--cs-accent,#6F8B5F)]/30"
                }`}
              />
            </div>
            <Field
              id={`case.${slug}.process.${i + 1}`}
              as="p"
              className="mt-3 max-w-[10rem] text-sm font-medium text-[var(--cs-text,#1F2A19)]/80"
            />
            <ImageSlot
              id={`case.${slug}.process.${i + 1}.image`}
              alt={`${labels[i]} photo`}
              mode="show"
              tone="light"
              lightbox={`case:${slug}`}
              placeholder={
                <ProcessStepPlaceholder
                  icon={STEP_ICONS[i % STEP_ICONS.length]}
                  label={labels[i]}
                />
              }
              sizes="(max-width: 768px) 80vw, 200px"
              wrapperClassName="relative mx-auto mt-4 aspect-square w-full max-w-[11.5rem] overflow-hidden rounded-[10px]"
            />
          </li>
        );
      })}
    </ol>
  );
}
