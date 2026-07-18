import Image from "next/image";
import Field from "@/components/edit/Field";
import type { FontSpec } from "@/data/caseStudies";

/**
 * The brand's typefaces, shown beside PaletteSwatchRow (mirrors how the client
 * reference sheets pair fonts with the color swatches).
 *
 * The specimen is a STATIC IMAGE, not a live webfont — the client typefaces
 * (Cooper Black, Bebas Neue, etc.) are never loaded into the site. The image is
 * keyed to the font's canonical name (from data, not the editable value, so a
 * renamed label can't break the mapping); the font name + role themselves stay
 * inline-editable. `alt` is the font name, since the specimen glyph isn't real
 * text.
 *
 * A project with no `fonts` (e.g. Dunkin — no reference sheet) renders nothing.
 */

const SPECIMENS: Record<string, string> = {
  "Cooper Black": "/images/type-specimens/cooper-black.png",
  "Grotesk Rounded": "/images/type-specimens/grotesk-rounded.png",
  "Playfair Display": "/images/type-specimens/playfair-display.png",
  Montserrat: "/images/type-specimens/montserrat.png",
  "Bebas Neue": "/images/type-specimens/bebas-neue.png",
};
const FALLBACK_SPECIMEN = "/images/type-specimens/generic.png";

export default function TypographyDisplay({
  slug,
  fonts,
}: {
  slug: string;
  fonts?: FontSpec[];
}) {
  if (!fonts || fonts.length === 0) return null;
  return (
    <ul className="flex flex-col gap-5">
      {fonts.map((f, i) => {
        const n = i + 1;
        const specimen = SPECIMENS[f.name] ?? FALLBACK_SPECIMEN;
        return (
          <li key={n} className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[12px] bg-[var(--cs-tint,#FBF7F1)] ring-1 ring-inset ring-[var(--cs-text,#1F2A19)]/10">
              <Image
                src={specimen}
                alt={f.name}
                fill
                sizes="64px"
                className="object-contain p-2"
              />
            </div>
            <div className="min-w-0">
              <Field
                id={`case.${slug}.font.${n}.role`}
                as="p"
                className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[var(--cs-text,#1F2A19)]/45"
              />
              <Field
                id={`case.${slug}.font.${n}.name`}
                as="p"
                className="mt-1 font-display text-h3 leading-tight text-[var(--cs-text,#1F2A19)]"
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
