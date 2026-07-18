import Container from "./Container";
import Reveal from "./Reveal";
import Field from "./edit/Field";

export default function Testimonial() {
  return (
    <section className="bg-cream">
      <Container className="py-16 sm:py-24">
        <Reveal>
          <figure className="mx-auto max-w-3xl text-center">
            <Field id="home.testimonial.eyebrow" as="p" className="eyebrow mb-6 text-sage" />
            <blockquote className="font-display text-[clamp(1.5rem,1.1rem+1.8vw,2.25rem)] font-medium leading-[1.35] text-forest">
              &ldquo;
              <Field id="home.testimonial.quote" as="span" className="whitespace-pre-line" />
              &rdquo;
            </blockquote>
            <figcaption className="mt-8 text-sm text-forest/60">
              <span className="font-semibold text-forest">
                — <Field id="home.testimonial.author" as="span" />
              </span>
              , <Field id="home.testimonial.role" as="span" />
            </figcaption>
          </figure>
        </Reveal>
      </Container>
    </section>
  );
}
