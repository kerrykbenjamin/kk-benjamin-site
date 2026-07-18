/**
 * `key` binds this item to the fixed slot the template renders it in
 * (AtAGlanceCard.tsx hardcodes client/projectType/role/timeline/tools) — NOT the
 * array position. Keeps a future case study free to declare its own `meta` array
 * in any order without silently seeding the wrong default value under the right
 * label.
 */
export type MetaItem = { key: "client" | "projectType" | "role" | "timeline" | "tools"; label: string; value: string };
export type Stat = { value: string; label: string };
/** A client project's own brand color, shown as case-study content. */
export type PaletteColor = { hex: string; name: string };
/**
 * A typeface used in the client's brand system. `name`/`role` are editable
 * content; the specimen IMAGE is a static asset keyed to `name` (see
 * TypographyDisplay) — the actual webfont is never loaded into the site.
 */
export type FontSpec = { name: string; role: string };

/**
 * Per-project accent theme for the rich case-study template. Scoped entirely to
 * the case-study content area via CSS custom properties (see RichCaseStudy) —
 * never touches DESIGN_TOKENS.md or leaks into site chrome/other pages.
 * See CASE_STUDY_PALETTES.md for how each hex was sampled/derived and its
 * contrast verification.
 */
export type CaseStudyTheme = {
  tint: string; // section background (replaces bg-cream)
  card: string; // card/panel fill (replaces bg-ivory)
  accent: string; // decorative only — connectors, rings, dots (not text-safe)
  text: string; // headings/body text (replaces text-forest)
  dark: string; // icon-badge fill + spotlight card background
  onDark: string; // icon glyph + spotlight text + button fill on `dark`
};

export type CaseStudy = {
  slug: string;
  title: string;
  /** Tagline shown on the home/portfolio cards (differs per project). */
  cardTagline: string;
  /** Hero/card image in /public/images. */
  image: string;
  category: string;
  intro: string;
  meta: MetaItem[];
  strategy: string[];
  designProcess: string[];
  deliverables: string[];
  campaign: { headline: string; sub: string; cta: string };
  results: Stat[];
  reflection: string;
  /** Which detail layout to render. Defaults to the plain template. */
  template?: "rich" | "plain";
  /** The client project's own brand colors, shown verbatim in the palette-swatch row. */
  palette?: PaletteColor[];
  /** Accent theme applied to the rich template's content area (see CaseStudyTheme). */
  theme?: CaseStudyTheme;
  /**
   * Brand typefaces shown in the TypographyDisplay block beside the palette.
   * Omit entirely (e.g. Dunkin — no reference sheet) and the block hides cleanly.
   */
  fonts?: FontSpec[];
  /** Caption line centered beneath the Results stat cards. */
  resultsCaption?: string;
};

/*
  NOTE: The live reference site only authored ONE real case study body — Perfected
  Flower, Natural Beauty and Dunkin all reuse the identical "Natural Beauty Skincare"
  template, and Throwback Pizza's page is empty. Per the approved decision we MIRROR
  the reference exactly: every project shares this body; only slug/title/tagline/image
  differ. No copy was invented. (This pass only changes VISUAL theme + which template
  component renders it — no copy changes.)
*/
const sharedBody = {
  category: "BRAND IDENTITY & DIGITAL MARKETING",
  intro:
    "A full brand identity and marketing campaign for a clean skincare line focused on natural ingredients and self care.",
  meta: [
    { key: "client", label: "Client", value: "Natural Beauty Skincare" },
    {
      key: "projectType",
      label: "Project Type",
      value: "Brand Identity, Packaging, Social Media, Campaign",
    },
    {
      key: "role",
      label: "Role",
      value: "Brand Designer, Marketing Strategist, Content Creator",
    },
    { key: "timeline", label: "Timeline", value: "Feb 2024 – May 2024 (4 Months)" },
    {
      key: "tools",
      label: "Tools Used",
      value: "Illustrator, Photoshop, Canva, Meta Business Suite",
    },
  ] satisfies MetaItem[],
  strategy: [
    "Develop a minimal, nature-inspired brand identity",
    "Use soft, earthy tones and modern typography",
    "Educate and build trust through ingredient-led content",
    "Leverage user-generated content and reviews",
    "Build a consistent posting schedule across feeds, Reels, and Stories",
  ],
  designProcess: ["Mood Board", "Sketches", "Logo Concepts", "Final Brand"],
  deliverables: [
    "Primary Logo",
    "Color Palette",
    "Social Media Posts",
    "Packaging",
  ],
  campaign: {
    headline: "YOUR SKIN. OUR NATURE.",
    sub: "Clean ingredients. Real results.",
    cta: "SHOP NOW",
  },
  results: [
    { value: "+215%", label: "Instagram Followers" },
    { value: "+180%", label: "Engagement" },
    { value: "+68%", label: "Website Clicks" },
    { value: "+42%", label: "Online Sales" },
  ] satisfies Stat[],
  reflection:
    "This project strengthened my ability to build a brand from the ground up and create a cohesive strategy that connects visuals, messaging, and marketing. I would love to continue testing new content formats and expanding influencer collaborations in the future.",
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "the-perfected-flower",
    title: "The Perfected Flower",
    cardTagline: "Branding, social media & marketing strategy",
    image: "/images/perfected-flower.webp",
    ...sharedBody,
    template: "rich",
    // Real palette sampled from the project's reference sheet (see CASE_STUDY_PALETTES.md).
    // Replaces the earlier placeholder earthy set used during the case-study pilot.
    palette: [
      { hex: "#837B1E", name: "Olive" },
      { hex: "#E96E83", name: "Pink" },
      { hex: "#DE7A1D", name: "Orange" },
      { hex: "#F1916B", name: "Peach" },
      { hex: "#F9DFC2", name: "Cream" },
      { hex: "#846937", name: "Dark Olive-Brown" },
    ],
    theme: {
      tint: "#F9DFC2",
      card: "#F7CFB1",
      accent: "#DE7A1D",
      text: "#70592F", // accessibility-adjusted; literal swatch (#846937) kept above
      dark: "#70592F",
      onDark: "#F9DFC2",
    },
    fonts: [
      { name: "Cooper Black", role: "Headline" },
      { name: "Grotesk Rounded", role: "Body" },
    ],
    // PLACEHOLDER — the reference sheet showed no results caption for this
    // project; generic wording used until real copy is supplied.
    resultsCaption: "*Projections based on a 3-month campaign strategy",
  },
  {
    slug: "natural-beauty",
    title: "Natural Beauty",
    cardTagline: "Branding, social media & marketing strategy",
    image: "/images/natural-beauty.jpg",
    ...sharedBody,
    template: "rich",
    palette: [
      { hex: "#9CA387", name: "Sage Green" },
      { hex: "#F4EFE4", name: "Cream" },
      { hex: "#DECAAE", name: "Warm Beige" },
      { hex: "#CFB18B", name: "Soft Gold" },
      { hex: "#47463E", name: "Charcoal" },
    ],
    theme: {
      tint: "#F0EDE4",
      card: "#EBDECC",
      accent: "#9CA387",
      text: "#47463E",
      dark: "#47463E",
      onDark: "#F4EFE4",
    },
    fonts: [
      { name: "Playfair Display", role: "Headline" },
      { name: "Montserrat", role: "Body" },
    ],
    resultsCaption: "*Projections based on 3-month campaign strategy",
  },
  {
    slug: "throwback-pizza",
    title: "Throwback Pizza",
    cardTagline: "Brand identity, social media & marketing campaign",
    image: "/images/throwback-pizza.png",
    ...sharedBody,
    template: "rich",
    palette: [
      { hex: "#D62828", name: "Red" },
      { hex: "#F4E8D0", name: "Cream" },
      { hex: "#FFC857", name: "Yellow" },
      { hex: "#0D3B66", name: "Navy" },
      { hex: "#2A9D8F", name: "Teal" },
    ],
    theme: {
      tint: "#F4E8D0",
      card: "#F6E2BA",
      accent: "#2A9D8F",
      text: "#0D3B66",
      dark: "#0D3B66",
      onDark: "#F4E8D0",
    },
    fonts: [
      { name: "Bebas Neue", role: "Headline" },
      { name: "Montserrat", role: "Body" },
    ],
    resultsCaption: "*Projected outcomes based on 3-month marketing strategy",
  },
  {
    slug: "dunkin-scholarly-study",
    title: "Dunkin Scholarly Study",
    cardTagline: "Branding and marketing goals for established businesses.",
    image: "/images/dunkin.jpg",
    ...sharedBody,
    // Rich template STRUCTURE, but no reference sheet was supplied — so no accent
    // palette and no fonts. Stays on the site's default DESIGN_TOKENS.md tokens
    // (RichCaseStudy falls back to them when `theme` is absent), the palette +
    // typography blocks hide cleanly, and the results caption is a flagged
    // placeholder. Supply a reference sheet to theme + populate it.
    template: "rich",
    resultsCaption: "*Projections based on a 3-month campaign strategy",
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
