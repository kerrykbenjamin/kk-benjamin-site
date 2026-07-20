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
  /**
   * Image fields only: this slot also accepts GIF and short video uploads
   * (campaign-spotlight slots). Gates the video/GIF branch of the upload
   * route — every other image field stays photo-only. See lib/media.ts for
   * the caps/formats.
   */
  media?: boolean;
  default: string;
};

// Max-length caps by role (fit at both 375px and 1440px on the fluid type scale)
const MAX = {
  eyebrow: 45,
  h1: 65,
  h2: 80,
  h3: 45,
  lead: 220,
  body: 600, // multi-paragraph blocks (intro/reflection/persona) — wraps, never truncates
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
  item: 36, // checklist/chip items that run longer than MAX.chip ("Google Business Profile Assets")
  pillarDesc: 180, // one-to-two sentence pillar description
  metricLabel: 40, // metrics-table row label ("Average Monthly Website Visitors")
  metricValue: 16, // metrics-table cell ("19,400/month")
  stageTitle: 32, // funnel stage name ("Consideration")
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
  // No phone field by design. Unregistering the key also neutralizes any value
  // already saved in the content store — lib/content/index.ts drops overrides
  // whose key is no longer in the registry — so it cannot reappear.
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
  // Campaign spotlight = three MEDIA slots (photo, GIF, or short video —
  // `media: true` gates the video/GIF upload branch; caps in lib/media.ts).
  // All start empty → intentional placeholders; the client fills them through
  // edit mode. Each slot has a companion `.poster` key written AUTOMATICALLY
  // by the upload flow (video: client-captured first frame; GIF: sharp first
  // frame) and read by the player for lazy-load / reduced-motion stills — it
  // is never rendered as its own editable slot.
  // (The old campaign headline/sub/cta keys are intentionally retired — the
  // spotlight no longer renders them — so they're no longer registered.)
  [1, 2, 3].forEach((n) => {
    fields.push({
      ...img(k(`spotlight.${n}.image`), p, `${cs.title} — campaign media ${n}`, ""),
      media: true,
    });
    fields.push(img(k(`spotlight.${n}.poster`), p, `${cs.title} — campaign media ${n} poster`, ""));
  });
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

  // ---- Extended narrative sections (doc-sourced; all optional) --------------
  // Each block follows the established pattern: the data array in
  // data/caseStudies.ts fixes the count, keys are 1-based `…{n}`, and a study
  // without the section registers no keys at all (so the section hides and
  // nothing appears in the edit UI).
  //
  // NOT registered on purpose: metricsNote / resultsNote (the projected-sample
  // honesty labels — non-editable so they can't be casually deleted),
  // MixCategory.percent (drives the CSS bar width; must stay numeric), and
  // funnelLabel (section eyebrow, consistent with other hardcoded labels).

  /** Registers a BulletBlock's heading/intro/items/outro/quote as fields. */
  const block = (
    name: string,
    label: string,
    b?: { heading?: string; intro?: string; items: string[]; outro?: string; quote?: string },
  ) => {
    if (!b) return;
    if (b.heading) fields.push(t(k(`${name}.heading`), p, `${cs.title} — ${label} heading`, MAX.h3, b.heading));
    if (b.intro) fields.push(t(k(`${name}.intro`), p, `${cs.title} — ${label} intro`, MAX.body, b.intro, true));
    b.items.forEach((s, i) =>
      fields.push(t(k(`${name}.${i + 1}`), p, `${cs.title} — ${label} ${i + 1}`, MAX.bullet, s)),
    );
    if (b.outro) fields.push(t(k(`${name}.outro`), p, `${cs.title} — ${label} closing`, MAX.body, b.outro, true));
    if (b.quote) fields.push(t(k(`${name}.quote`), p, `${cs.title} — ${label} quote`, MAX.quote, b.quote));
  };

  block("challenge", "challenge", cs.challenge);
  block("objectives", "objective", cs.objectives);
  block("local", "local marketing", cs.localMarketing);
  block("outcomes", "outcome", cs.resultsOutcomes);
  block("takeaways", "takeaway", cs.takeaways);

  if (cs.audience) {
    if (cs.audience.primaryIntro)
      fields.push(t(k("audience.intro"), p, `${cs.title} — audience intro`, MAX.short, cs.audience.primaryIntro));
    cs.audience.primary.forEach((s, i) =>
      fields.push(t(k(`audience.${i + 1}`), p, `${cs.title} — audience ${i + 1}`, MAX.bullet, s)),
    );
    if (cs.audience.secondary)
      fields.push(t(k("audience.secondary"), p, `${cs.title} — secondary audience`, MAX.body, cs.audience.secondary, true));
  }
  if (cs.persona) {
    fields.push(
      t(k("persona.name"), p, `${cs.title} — persona name`, MAX.name, cs.persona.name),
      t(k("persona.body"), p, `${cs.title} — persona story`, MAX.body, cs.persona.body, true),
    );
  }
  if (cs.positioning)
    fields.push(t(k("positioning"), p, `${cs.title} — positioning statement`, MAX.quote, cs.positioning, true));
  if (cs.pillarsIntro)
    fields.push(t(k("pillars.intro"), p, `${cs.title} — pillars intro`, MAX.lead, cs.pillarsIntro));
  (cs.pillars ?? []).forEach((pl, i) => {
    const n = i + 1;
    fields.push(t(k(`pillar.${n}.title`), p, `${cs.title} — pillar ${n} title`, MAX.h3, pl.title));
    if (pl.description)
      fields.push(t(k(`pillar.${n}.desc`), p, `${cs.title} — pillar ${n} description`, MAX.pillarDesc, pl.description, true));
  });
  (cs.photography ?? []).forEach((s, i) =>
    fields.push(t(k(`photography.${i + 1}`), p, `${cs.title} — photography style ${i + 1}`, MAX.bullet, s)),
  );
  (cs.strategySections ?? []).forEach((sec, i) => {
    const n = i + 1;
    fields.push(t(k(`strat.${n}.title`), p, `${cs.title} — strategy ${n} title`, MAX.h3, sec.title));
    if (sec.intro)
      fields.push(t(k(`strat.${n}.intro`), p, `${cs.title} — strategy ${n} intro`, MAX.body, sec.intro, true));
    (sec.items ?? []).forEach((s, j) =>
      fields.push(t(k(`strat.${n}.item.${j + 1}`), p, `${cs.title} — strategy ${n} item ${j + 1}`, MAX.bullet, s)),
    );
    if (sec.outro)
      fields.push(t(k(`strat.${n}.outro`), p, `${cs.title} — strategy ${n} closing`, MAX.body, sec.outro, true));
  });
  (cs.deliverableGroups ?? []).forEach((g, i) => {
    const n = i + 1;
    fields.push(t(k(`delivgroup.${n}.title`), p, `${cs.title} — deliverable group ${n} title`, MAX.h3, g.title));
    g.items.forEach((s, j) =>
      fields.push(t(k(`delivgroup.${n}.item.${j + 1}`), p, `${cs.title} — ${g.title} item ${j + 1}`, MAX.item, s)),
    );
  });
  if (cs.contentMixIntro)
    fields.push(t(k("mix.intro"), p, `${cs.title} — content mix intro`, MAX.body, cs.contentMixIntro, true));
  (cs.contentMix ?? []).forEach((m, i) => {
    const n = i + 1;
    fields.push(t(k(`mix.${n}.label`), p, `${cs.title} — content mix ${n} label`, MAX.short, m.label));
    m.items.forEach((s, j) =>
      fields.push(t(k(`mix.${n}.item.${j + 1}`), p, `${cs.title} — content mix ${n} item ${j + 1}`, MAX.bullet, s)),
    );
  });
  if (cs.campaignInfo) {
    // Keys use the `featured.` prefix, NOT the retired `campaign.*` keys — a
    // stale "case.natural-beauty.campaign.cta" override still sits in the
    // store, and re-registering that key would silently resurrect it.
    fields.push(t(k("featured.title"), p, `${cs.title} — campaign title`, MAX.h3, cs.campaignInfo.title));
    if (cs.campaignInfo.description)
      fields.push(t(k("featured.desc"), p, `${cs.title} — campaign description`, MAX.body, cs.campaignInfo.description, true));
    (cs.campaignInfo.items ?? []).forEach((s, i) =>
      fields.push(t(k(`featured.item.${i + 1}`), p, `${cs.title} — campaign element ${i + 1}`, MAX.bullet, s)),
    );
    if (cs.campaignInfo.outro)
      fields.push(t(k("featured.outro"), p, `${cs.title} — campaign closing`, MAX.body, cs.campaignInfo.outro, true));
  }
  (cs.funnel ?? []).forEach((st, i) => {
    const n = i + 1;
    fields.push(t(k(`funnel.${n}.title`), p, `${cs.title} — funnel stage ${n}`, MAX.stageTitle, st.title));
    st.items.forEach((s, j) =>
      fields.push(t(k(`funnel.${n}.item.${j + 1}`), p, `${cs.title} — funnel stage ${n} item ${j + 1}`, MAX.bullet, s)),
    );
  });
  (cs.metrics ?? []).forEach((r, i) => {
    const n = i + 1;
    fields.push(
      t(k(`metric.${n}.label`), p, `${cs.title} — metric ${n} label`, MAX.metricLabel, r.label),
      t(k(`metric.${n}.before`), p, `${cs.title} — metric ${n} before`, MAX.metricValue, r.before),
      t(k(`metric.${n}.after`), p, `${cs.title} — metric ${n} after`, MAX.metricValue, r.after),
    );
  });
  if (cs.resultsIntro)
    fields.push(t(k("results.intro"), p, `${cs.title} — results intro`, MAX.body, cs.resultsIntro, true));
  (cs.skills ?? []).forEach((s, i) =>
    fields.push(t(k(`skill.${i + 1}`), p, `${cs.title} — skill ${i + 1}`, MAX.item, s)),
  );
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
