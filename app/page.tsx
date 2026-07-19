import Container from "@/components/Container";
import ButtonLink from "@/components/ButtonLink";
import CaseStudyCard from "@/components/CaseStudyCard";
import ValueProps from "@/components/ValueProps";
import Testimonial from "@/components/Testimonial";
import Field from "@/components/edit/Field";
import ImageField from "@/components/edit/ImageField";
import OrderedGrid, { type OrderedItem } from "@/components/edit/OrderedGrid";
import { caseStudies } from "@/data/caseStudies";
import { getOrder, applyOrder } from "@/lib/order";

export default async function Home() {
  const order = await getOrder(
    "caseStudies",
    caseStudies.map((c) => c.slug),
  );
  const orderedStudies = applyOrder(caseStudies, order, (c) => c.slug);
  const caseItems: OrderedItem[] = orderedStudies.map((s, i) => ({
    id: s.slug,
    node: <CaseStudyCard key={s.slug} slug={s.slug} priority={i === 0} />,
  }));

  return (
    <>
      {/* Hero — text overlaid on the full-bleed image behind a forest-deep
          scrim. The section's height is content-driven (padding), and the
          image `fill`s it, so the text can never overflow the image bounds at
          any breakpoint. The scrim is a pure CSS gradient (no second image)
          and the image keeps `priority`, so LCP is unaffected. Gradient stops
          are stronger below `sm` where the photo sits behind ALL the text. */}
      <section className="relative overflow-hidden bg-forest-deep">
        {/* Deliberately NOT lightbox-eligible: this is a background/design
            element, not a content image, so it gets no click-to-enlarge, no
            zoom cursor, and no focusable trigger. `lightbox` is opt-in across
            all image components, so omitting it is the whole mechanism — the
            editor's change-photo flow is unaffected and still works. */}
        <div className="absolute inset-0">
          <ImageField
            id="home.hero.image"
            alt="KK Benjamin marketing and design work"
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-deep/85 via-forest-deep/65 to-forest-deep/40 sm:bg-gradient-to-r sm:via-forest-deep/70 sm:to-forest-deep/25"
        />
        {/* pointer-events-none on the grid layer keeps the editor's
            bottom-center "Change photo" button clickable; the text block
            itself restores pointer-events for its links + inline editing. */}
        <Container className="pointer-events-none relative z-10 py-24 sm:py-32 lg:py-40">
          <div className="pointer-events-auto max-w-2xl">
            <Field id="home.hero.eyebrow" as="p" className="eyebrow text-cream/75" />
            <Field
              id="home.hero.h1"
              as="h1"
              className="mt-5 font-display text-display font-semibold text-cream"
            />
            <Field
              id="home.hero.sub"
              as="p"
              className="mt-6 max-w-xl whitespace-pre-line text-lead text-cream/85"
            />
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/portfolio" variant="light" arrow>
                View my work
              </ButtonLink>
              <ButtonLink href="/about" variant="outlineLight">
                About me
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured case studies */}
      <section className="bg-cream">
        <Container className="py-14 sm:py-20">
          <div className="max-w-2xl">
            <Field id="home.featured.eyebrow" as="p" className="eyebrow text-sage" />
            <Field
              id="home.featured.h2"
              as="h2"
              className="mt-4 font-display text-h2 font-semibold text-forest"
            />
          </div>
          <OrderedGrid
            collection="caseStudies"
            items={caseItems}
            className="mt-10 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-4"
          />
        </Container>
      </section>

      {/* Value props */}
      <section className="bg-ivory">
        <Container className="py-16 sm:py-24">
          <div className="max-w-2xl">
            <Field id="home.values.eyebrow" as="p" className="eyebrow text-sage" />
            <Field
              id="home.values.h2"
              as="h2"
              className="mt-4 font-display text-h2 font-semibold text-forest"
            />
          </div>
          <div className="mt-12">
            <ValueProps />
          </div>
        </Container>
      </section>

      <Testimonial />
    </>
  );
}
