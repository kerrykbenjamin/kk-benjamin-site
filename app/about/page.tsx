import type { Metadata } from "next";
import Container from "@/components/Container";
import ButtonLink from "@/components/ButtonLink";
import Reveal from "@/components/Reveal";
import Field from "@/components/edit/Field";
import ImageField from "@/components/edit/ImageField";

export const metadata: Metadata = {
  title: "About",
  description:
    "I'm a digital marketer, designer, and storyteller who blends strategy with visual craft.",
};

export default function AboutPage() {
  return (
    <>
      {/* Intro */}
      <section className="bg-cream">
        <Container className="grid items-center gap-10 py-14 sm:py-20 md:grid-cols-2 md:gap-14 lg:py-24">
          <div>
            <Field id="about.intro.eyebrow" as="p" className="eyebrow text-sage" />
            <Field
              id="about.intro.h1"
              as="h1"
              className="mt-5 font-display text-display font-semibold text-forest"
            />
            <Field
              id="about.intro.body"
              as="p"
              className="mt-6 max-w-xl whitespace-pre-line text-lead text-forest/70"
            />
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/portfolio" variant="solid" arrow>
                View my work
              </ButtonLink>
              <ButtonLink href="#contact" variant="outline">
                Get in touch
              </ButtonLink>
            </div>
          </div>

          <Reveal delay={0.1}>
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[16px] bg-ivory">
              <ImageField
                id="about.intro.image"
                alt="Portrait of KK Benjamin"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                lightbox="about"
              />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* My story */}
      <section className="bg-ivory">
        <Container className="py-16 sm:py-24">
          <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
            <Reveal>
              <div>
                <Field
                  id="about.story.kicker"
                  as="p"
                  className="font-display text-h3 italic text-sage"
                />
                <Field id="about.story.eyebrow" as="p" className="eyebrow mt-4 text-sage" />
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div>
                <Field
                  id="about.story.h2"
                  as="h2"
                  className="font-display text-h2 font-semibold text-forest"
                />
                <Field
                  id="about.story.body"
                  as="p"
                  className="mt-6 whitespace-pre-line text-lead text-forest/70"
                />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* How I work */}
      <section className="bg-cream">
        <Container className="py-16 sm:py-24">
          <Field id="about.work.eyebrow" as="p" className="eyebrow text-sage" />
          <div className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <Reveal key={n} delay={(n - 1) * 0.08}>
                <div className="border-t border-forest/15 pt-5">
                  <span className="font-display text-4xl font-semibold text-sage">
                    {String(n).padStart(2, "0")}
                  </span>
                  <Field
                    id={`about.work.step.${n}`}
                    as="p"
                    className="mt-3 whitespace-pre-line text-lead text-forest/80"
                  />
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <blockquote className="mt-14 max-w-3xl font-display text-h2 font-medium leading-tight text-forest">
              &ldquo;
              <Field id="about.work.quote" as="span" />
              &rdquo;
            </blockquote>
          </Reveal>
        </Container>
      </section>

      {/* What I bring */}
      <section className="bg-ivory">
        <Container className="py-16 sm:py-24">
          <div className="max-w-2xl">
            <Field id="about.bring.eyebrow" as="p" className="eyebrow text-sage" />
          </div>
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <Reveal key={n} delay={(n - 1) * 0.08}>
                <div className="border-t border-forest/15 pt-5">
                  <Field
                    id={`about.bring.${n}.title`}
                    as="h3"
                    className="font-display text-h3 font-semibold text-forest"
                  />
                  <Field
                    id={`about.bring.${n}.desc`}
                    as="p"
                    className="mt-2 whitespace-pre-line text-[0.95rem] leading-relaxed text-forest/70"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Experience + stats */}
      <section className="bg-cream">
        <Container className="py-16 sm:py-24">
          <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
            <Reveal>
              <Field
                id="about.exp.body"
                as="p"
                className="max-w-xl whitespace-pre-line text-lead text-forest/75"
              />
            </Reveal>
            <Reveal delay={0.08}>
              <div className="grid grid-cols-2 gap-6">
                {[1, 2].map((n) => (
                  <div key={n} className="rounded-[14px] bg-ivory px-6 py-8 text-center">
                    <Field
                      id={`about.exp.stat.${n}.value`}
                      as="div"
                      className="font-display text-stat font-semibold text-forest"
                    />
                    <Field
                      id={`about.exp.stat.${n}.label`}
                      as="div"
                      className="mt-2 text-sm text-forest/60"
                    />
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <Field
              id="about.exp.closing"
              as="p"
              className="mt-14 max-w-3xl whitespace-pre-line font-display text-h3 leading-snug text-forest"
            />
          </Reveal>
        </Container>
      </section>
    </>
  );
}
