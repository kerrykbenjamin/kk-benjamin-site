import { caseStudies } from "@/data/caseStudies";
import { valueProps } from "@/data/valueProps";
import { testimonial } from "@/data/testimonials";
import { portfolioIllustrations } from "@/data/portfolioIllustrations";
import { site } from "@/data/site";

/**
 * The editable-content whitelist. This is the single source of truth for:
 *  - which fields can be edited (anything not here is rejected on save),
 *  - each field's type, human label, and max length (validation + edit UI),
 *  - the DEFAULT value (sourced from the existing data files/pages), which is
 *    what renders when Supabase/local overrides are absent — so the site is
 *    never blank and matches the original copy exactly.
 *
 * This module is safe to import on the client (no server-only deps) so the edit
 * UI can read a field's constraints.
 */

export type FieldType = "text" | "image";
export type PageId = "global" | "home" | "about" | "portfolio" | `case:${string}`;

export type FieldDef = {
  key: string;
  page: PageId;
  type: FieldType;
  label: string;
  /** Max characters (text only) — sized to fit 375px→1440px per DESIGN_TOKENS.md. */
  maxLength?: number;
  multiline?: boolean;
  /**
   * Image fields only: uploads are center-cropped server-side to a 1:1 square
   * (process-step photos render in square slots — a non-square phone photo must
   * never distort or shift the step row).
   */
  square?: boolean;
  default: string;
};

// Max-length caps by role (fit at both 375px and 1440px on the fluid type scale)
const MAX = {
  eyebrow: 45,
  h1: 65,
  h2: 80,
  h3: 45,
  lead: 220,
  body: 480,
  tagline: 80,
  quote: 280,
  bullet: 110,
  chip: 28,
  statValue: 10,
  statLabel: 32,
  meta: 110,
  short: 60,
  url: 200,
  button: 24,
  name: 60,
  caption: 120, // centered results caption — fits one/two lines at 375px
  role: 24, // font role ("Headline" / "Body")
} as const;

function t(
  key: string,
  page: PageId,
  label: string,
  maxLength: number,
  def: string,
  multiline = false,
): FieldDef {
  return { key, page, type: "text", label, maxLength, multiline, default: def };
}

function img(key: string, page: PageId, label: string, def: string): FieldDef {
  return { key, page, type: "image", label, default: def };
}

const fields: FieldDef[] = [];

// ---------------------------------------------------------------- Global -----
fields.push(
  t("global.contact.eyebrow", "global", "Contact — eyebrow", MAX.eyebrow, "Get in touch"),
  t("global.contact.h2", "global", "Contact — heading", MAX.h2, "Let's create something amazing together."),
  t("global.contact.sub", "global", "Contact — subheading", MAX.lead, "I'm always open to discussing new projects, collaborations, or opportunities.", true),
  t("global.contact.button", "global", "Contact — button label", MAX.button, "Get in touch"),
  t("global.contact.email", "global", "Contact — email", MAX.short, site.email),
  t("global.contact.phone", "global", "Contact — phone", MAX.short, site.phone),
  t("global.contact.location", "global", "Contact — location", MAX.short, site.location),
  t("global.contact.linkedinUrl", "global", "Contact — LinkedIn URL", MAX.url, site.linkedin),
  t("global.contact.linkedinLabel", "global", "Contact — LinkedIn label", MAX.short, site.linkedinLabel),
  img("global.contact.image", "global", "Contact — portrait photo", "/images/portrait.jpg"),
);

// ------------------------------------------------------------------ Home -----
fields.push(
  t("home.hero.eyebrow", "home", "Hero — eyebrow", MAX.eyebrow, "Digital Marketer. Designer. Storyteller."),
  t("home.hero.h1", "home", "Hero — headline", MAX.h1, "I create strategies that connect brands with people."),
  t("home.hero.sub", "home", "Hero — subheading", MAX.lead, "I combine marketing strategy with creative design to build brands, tell stories, and deliver results that drive growth and engagement.", true),
  img("home.hero.image", "home", "Hero — image", "/images/hero.png"),
  t("home.featured.eyebrow", "home", "Featured — eyebrow", MAX.eyebrow, "Featured Work"),
  t("home.featured.h2", "home", "Featured — heading", MAX.h2, "Selected case studies"),
  t("home.values.eyebrow", "home", "Value props — eyebrow", MAX.eyebrow, "Why work with me"),
  t("home.values.h2", "home", "Value props — heading", MAX.h2, "Strategy and design, working together."),
);
valueProps.forEach((v) => {
  // Keyed by the ValueProp's own stable `n`, NOT array position — `n` exists
  // specifically so the source array can be reordered/refactored without
  // silently rebinding one card's default content to a different key.
  fields.push(
    t(`home.value.${v.n}.title`, "home", `Value ${v.n} — title`, MAX.h3, v.title),
    t(`home.value.${v.n}.desc`, "home", `Value ${v.n} — description`, MAX.body, v.description, true),
  );
});
fields.push(
  t("home.testimonial.eyebrow", "home", "Testimonial — eyebrow", MAX.eyebrow, "Kind words"),
  t("home.testimonial.quote", "home", "Testimonial — quote", MAX.quote, testimonial.quote, true),
  t("home.testimonial.author", "home", "Testimonial — author", MAX.short, testimonial.author),
  t("home.testimonial.role", "home", "Testimonial — role", MAX.short, testimonial.role),
);

// ----------------------------------------------------------------- About -----
fields.push(
  t("about.intro.eyebrow", "about", "Intro — eyebrow", MAX.eyebrow, "About KK Benjamin"),
  t("about.intro.h1", "about", "Intro — headline", MAX.h1, "I turn insight into stories people remember."),
  t("about.intro.body", "about", "Intro — body", MAX.body, "I'm a digital marketer, designer, and storyteller who blends strategy with visual craft. My work is rooted in understanding people—what they need, what they feel, and what makes them choose one brand over another.", true),
  img("about.intro.image", "about", "Intro — portrait photo", "/images/portrait.jpg"),
  t("about.story.kicker", "about", "My Story — kicker", MAX.short, "Strategy with a human pulse."),
  t("about.story.eyebrow", "about", "My Story — eyebrow", MAX.eyebrow, "My Story"),
  t("about.story.h2", "about", "My Story — heading", MAX.h2, "Marketing feels strongest when it understands the person on the other side."),
  t("about.story.body", "about", "My Story — body", MAX.body, "I'm drawn to work that makes brands feel clearer, warmer, and more intentional. Whether I'm shaping a launch campaign, designing a brand system, or building content around a product, I start by listening closely: to the audience, the business goals, and the feeling the brand needs to leave behind.", true),
  t("about.work.eyebrow", "about", "How I Work — eyebrow", MAX.eyebrow, "How I Work"),
  t("about.work.step.1", "about", "How I Work — step 1", MAX.bullet, "Research first, so creative decisions are grounded.", true),
  t("about.work.step.2", "about", "How I Work — step 2", MAX.bullet, "Build visual systems that feel clean, ownable, and memorable.", true),
  t("about.work.step.3", "about", "How I Work — step 3", MAX.bullet, "Turn campaign ideas into content that can actually perform.", true),
  t("about.work.quote", "about", "How I Work — pull quote", MAX.quote, "Strategy gives the work direction. Design gives it a voice."),
  t("about.bring.eyebrow", "about", "What I Bring — eyebrow", MAX.eyebrow, "What I bring to the work"),
);
const capabilities = [
  { title: "Strategy", description: "Turning business goals and audience insight into clear creative direction." },
  { title: "Design", description: "Creating polished visuals that feel organized, elegant, and easy to understand." },
  { title: "Storytelling", description: "Finding the message that makes a brand feel specific, human, and worth remembering." },
  { title: "Results", description: "Shaping campaigns and content with growth, engagement, and clarity in mind." },
];
capabilities.forEach((c, i) => {
  const n = i + 1;
  fields.push(
    t(`about.bring.${n}.title`, "about", `What I Bring ${n} — title`, MAX.h3, c.title),
    t(`about.bring.${n}.desc`, "about", `What I Bring ${n} — description`, MAX.body, c.description, true),
  );
});
fields.push(
  t("about.exp.body", "about", "Experience — body", MAX.lead, "Brand campaigns, social content, visual identity, and marketing strategy across wellness, lifestyle, hospitality, and local businesses.", true),
  t("about.exp.stat.1.value", "about", "Stat 1 — value", MAX.statValue, "25+"),
  t("about.exp.stat.1.label", "about", "Stat 1 — label", MAX.statLabel, "Campaign concepts"),
  t("about.exp.stat.2.value", "about", "Stat 2 — value", MAX.statValue, "3"),
  t("about.exp.stat.2.label", "about", "Stat 2 — label", MAX.statLabel, "Core disciplines"),
  t("about.exp.closing", "about", "Closing line", MAX.body, "Open to thoughtful collaborations and growth-focused marketing roles. If your project needs strategy, content, and a strong visual point of view, I'd love to connect.", true),
);

// ------------------------------------------------------------- Portfolio -----
fields.push(
  t("portfolio.intro.eyebrow", "portfolio", "Intro — eyebrow", MAX.eyebrow, "Portfolio Gallery"),
  t("portfolio.intro.h1", "portfolio", "Intro — headline", MAX.h1, "Selected work, campaigns, and visual stories."),
  t("portfolio.intro.sub", "portfolio", "Intro — subheading", MAX.lead, "A curated look at brand systems, social campaigns, digital strategy, and content concepts designed to make each project feel clear, warm, and memorable.", true),
  t("portfolio.illustrations.eyebrow", "portfolio", "Illustrations — eyebrow", MAX.eyebrow, "Illustrations and Projects"),
  t("portfolio.illustrations.h2", "portfolio", "Illustrations — heading", MAX.h2, "Supplementary concepts and explorations."),
  t("portfolio.cta.h2", "portfolio", "Bottom CTA — heading", MAX.h2, "Have a campaign that needs a stronger visual story?"),
);
// Gallery tiles — one image + optional caption pair per slot, derived from the
// data list so raising GALLERY_SLOT_COUNT automatically registers new fields.
// Images are `square` (uploads center-crop to 1:1, matching the square tiles).
portfolioIllustrations.forEach((il) => {
  fields.push(
    t(`portfolio.illus.${il.n}.title`, "portfolio", `Gallery tile ${il.n} — title`, MAX.h3, il.defaultTitle),
    t(`portfolio.illus.${il.n}.tagline`, "portfolio", `Gallery tile ${il.n} — tagline`, MAX.tagline, il.defaultTagline),
    { ...img(`portfolio.illus.${il.n}.image`, "portfolio", `Gallery tile ${il.n} — image`, il.defaultImage), square: true },
  );
});

// ----------------------------------------------------------- Case studies ----
// Independent per study (seeded from each study's current — shared — copy).
for (const cs of caseStudies) {
  const p: PageId = `case:${cs.slug}`;
  const k = (suffix: string) => `case.${cs.slug}.${suffix}`;
  fields.push(
    t(k("title"), p, `${cs.title} — title`, MAX.name, cs.title),
    t(k("tagline"), p, `${cs.title} — card tagline`, MAX.tagline, cs.cardTagline),
    img(k("image"), p, `${cs.title} — hero image`, cs.image),
    t(k("category"), p, `${cs.title} — category`, MAX.short, cs.category),
    t(k("intro"), p, `${cs.title} — intro`, MAX.body, cs.intro, true),
  );
  // Bound by each MetaItem's own stable `key`, NOT array position — a case
  // study is free to declare `meta` in any order without silently seeding a
  // default value under the wrong slot's label.
  cs.meta.forEach((m) => {
    fields.push(t(k(`meta.${m.key}`), p, `${cs.title} — ${m.label}`, MAX.meta, m.value));
  });
  cs.strategy.forEach((s, i) =>
    fields.push(t(k(`strategy.${i + 1}`), p, `${cs.title} — strategy ${i + 1}`, MAX.bullet, s)),
  );
  cs.designProcess.forEach((s, i) => {
    const n = i + 1;
    fields.push(t(k(`process.${n}`), p, `${cs.title} — process step ${n}`, MAX.chip, s));
    // Square photo beneath the step. Empty default → the designed
    // ProcessStepPlaceholder tile renders (publicly visible, never a blank
    // box); uploads are server-cropped to 1:1 via the `square` flag.
    fields.push({
      ...img(k(`process.${n}.image`), p, `${cs.title} — process step ${n} photo`, ""),
      square: true,
    });
  });
  cs.deliverables.forEach((s, i) =>
    fields.push(t(k(`deliverable.${i + 1}`), p, `${cs.title} — deliverable ${i + 1}`, MAX.chip, s)),
  );
  // Typography block (font name + role editable; specimen image is a static
  // asset keyed to the font). Only projects with a reference sheet declare
  // fonts — Dunkin has none, so no keys are registered and the block hides.
  (cs.fonts ?? []).forEach((f, i) => {
    const n = i + 1;
    fields.push(
      t(k(`font.${n}.name`), p, `${cs.title} — font ${n} name`, MAX.name, f.name),
      t(k(`font.${n}.role`), p, `${cs.title} — font ${n} role`, MAX.role, f.role),
    );
  });
  // Campaign spotlight = three photos. All start empty → intentional
  // placeholders; the client uploads real campaign photos through edit mode.
  // (The old campaign headline/sub/cta keys are intentionally retired — the
  // spotlight no longer renders them — so they're no longer registered.)
  [1, 2, 3].forEach((n) =>
    fields.push(img(k(`spotlight.${n}.image`), p, `${cs.title} — campaign photo ${n}`, "")),
  );
  cs.results.forEach((r, i) => {
    const n = i + 1;
    fields.push(
      t(k(`result.${n}.value`), p, `${cs.title} — result ${n} value`, MAX.statValue, r.value),
      t(k(`result.${n}.label`), p, `${cs.title} — result ${n} label`, MAX.statLabel, r.label),
    );
  });
  fields.push(
    t(
      k("results.caption"),
      p,
      `${cs.title} — results caption`,
      MAX.caption,
      cs.resultsCaption ?? "*Projections based on a 3-month campaign strategy",
      true,
    ),
  );
  fields.push(t(k("reflection"), p, `${cs.title} — reflection`, MAX.body, cs.reflection, true));
}

export const REGISTRY: FieldDef[] = fields;

const byKey = new Map(fields.map((f) => [f.key, f]));

export function getField(key: string): FieldDef | undefined {
  return byKey.get(key);
}

/** Full map of key → default value (used as render fallback + DB seed). */
export function defaultsMap(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) out[f.key] = f.default;
  return out;
}
