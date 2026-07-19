import Container from "./Container";
import Reveal from "./Reveal";
import Field from "./edit/Field";
import ImageField from "./edit/ImageField";
import ContactModal from "./contact/ContactModal";
import { getText } from "@/lib/content";
import { getIsEditor } from "@/lib/editor-state";

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[0.68rem] uppercase tracking-[0.18em] text-cream/45">
        {label}
      </dt>
      <dd className="mt-1 text-cream/85">{children}</dd>
    </div>
  );
}

export default async function ContactCTA() {
  const editor = await getIsEditor();
  const [email, location, linkedinUrl, linkedinLabel] = await Promise.all([
    getText("global.contact.email"),
    getText("global.contact.location"),
    getText("global.contact.linkedinUrl"),
    getText("global.contact.linkedinLabel"),
  ]);

  const mailto = `mailto:${email}`;

  return (
    // tabIndex={-1} makes this a real focus target for in-page "#contact"
    // links (a <section> isn't focusable by default), so keyboard and screen
    // reader users land INSIDE the section instead of tabbing on from the
    // link they just activated. scroll-mt-16 matches the 64px sticky header.
    <section
      id="contact"
      tabIndex={-1}
      className="scroll-mt-16 bg-forest-deep text-cream focus:outline-none"
    >
      <Container className="py-16 sm:py-24">
        <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
          <Reveal>
            <div>
              <Field id="global.contact.eyebrow" as="p" className="eyebrow !text-blush" />
              <Field
                id="global.contact.h2"
                as="h2"
                className="mt-4 font-display text-h2 font-semibold"
              />
              <Field
                id="global.contact.sub"
                as="p"
                className="mt-5 max-w-md whitespace-pre-line text-lead text-cream/75"
              />
              {/* Opens the contact-form modal (no mailto — visitors never
                  leave the site). The label stays inline-editable: in edit
                  mode the launcher ignores clicks so the text editor wins. */}
              <div className="mt-8">
                <ContactModal>
                  <Field id="global.contact.button" as="span" />
                </ContactModal>
              </div>

              <dl className="mt-10 grid grid-cols-1 gap-x-8 gap-y-5 text-sm sm:grid-cols-2">
                <Detail label="Email">
                  {editor ? (
                    <Field id="global.contact.email" as="span" />
                  ) : (
                    <a href={mailto} className="hover:text-blush">
                      {email}
                    </a>
                  )}
                </Detail>
                <Detail label="LinkedIn">
                  {editor ? (
                    <Field id="global.contact.linkedinLabel" as="span" />
                  ) : (
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blush"
                    >
                      {linkedinLabel}
                    </a>
                  )}
                </Detail>
                <Detail label="Location">
                  {editor ? (
                    <Field id="global.contact.location" as="span" />
                  ) : (
                    location
                  )}
                </Detail>
              </dl>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[16px]">
              <ImageField
                id="global.contact.image"
                alt="Portrait of KK Benjamin"
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover"
                lightbox="contact"
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
