import Link from "next/link";
import Field from "./edit/Field";
import ImageField from "./edit/ImageField";
import { getText } from "@/lib/content";
import { getIsEditor } from "@/lib/editor-state";

export default async function CaseStudyCard({
  slug,
  priority = false,
}: {
  slug: string;
  priority?: boolean;
}) {
  const editor = await getIsEditor();
  const title = await getText(`case.${slug}.title`);

  const media = (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[14px] bg-ivory">
      <ImageField
        id={`case.${slug}.image`}
        alt={title}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        priority={priority}
      />
    </div>
  );

  const heading = (
    <>
      <Field id={`case.${slug}.title`} as="h3" className="mt-5 font-display text-h3 font-semibold text-forest" />
      <Field id={`case.${slug}.tagline`} as="p" className="mt-1.5 text-sm text-forest/60" />
    </>
  );

  // In edit mode the card must NOT be a link, or click-to-edit would navigate.
  if (editor) {
    return (
      <div className="group block">
        {media}
        {heading}
        <Link
          href={`/portfolio/${slug}`}
          className="mt-3 inline-flex items-center gap-1.5 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-sage"
        >
          View Project <span aria-hidden>→</span>
        </Link>
      </div>
    );
  }

  return (
    <Link href={`/portfolio/${slug}`} className="group block">
      {media}
      {heading}
      <span className="mt-3 inline-flex items-center gap-1.5 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-sage">
        View Project
        <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </Link>
  );
}
