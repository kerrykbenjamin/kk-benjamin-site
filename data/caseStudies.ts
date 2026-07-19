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

// ---- Extended narrative sections (all optional — a study without one hides
// ---- that section cleanly; see RichCaseStudy). Content sourced verbatim from
// ---- the client's notes doc (REDO HERE(KkWEBSITE NOTES).docx); nothing invented.

/** Generic intro + bullets + optional closing block (challenge, objectives, outcomes…). */
export type BulletBlock = {
  heading?: string;
  intro?: string;
  items: string[];
  outro?: string;
  /** Optional pull-quote rendered after the outro (e.g. PF's marketing principle). */
  quote?: string;
};
/** Brand pillar — `description` optional: NB has described pillars, Throwback plain ones. */
export type Pillar = { title: string; description?: string };
export type Persona = { name: string; body: string };
export type Audience = { primaryIntro?: string; primary: string[]; secondary?: string };
/** One numbered strategy subsection (Perfected Flower's five-part strategy). */
export type StrategySection = { title: string; intro?: string; items?: string[]; outro?: string };
/** Weighted content-mix category. `percent` drives the CSS bar width (not editable). */
export type MixCategory = { percent: number; label: string; items: string[] };
export type FunnelStage = { title: string; items: string[] };
export type MetricRow = { label: string; before: string; after: string };
export type DeliverableGroup = { title: string; items: string[] };
/** Featured/sample campaign copy shown inside the campaign-spotlight card. */
export type CampaignInfo = {
  /** Section eyebrow, e.g. "Sample campaign" / "Featured campaign" (doc wording). */
  label: string;
  title: string;
  description?: string;
  items?: string[];
  outro?: string;
};

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
  /** Legacy home-page campaign copy — retired from the template; kept only so
   *  Dunkin's untouched sharedBody still typechecks. */
  campaign?: { headline: string; sub: string; cta: string };
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

  // ---- Optional doc-sourced sections (each hides cleanly when absent) ----
  challenge?: BulletBlock;
  objectives?: BulletBlock;
  audience?: Audience;
  persona?: Persona;
  /** Positioning statement, stored verbatim including the doc's quote marks. */
  positioning?: string;
  pillarsIntro?: string;
  pillars?: Pillar[];
  /** Photography-style list appended to the Visual identity section. */
  photography?: string[];
  /** Rich numbered strategy subsections (used instead of flat `strategy`). */
  strategySections?: StrategySection[];
  /** Grouped deliverables (used instead of flat `deliverables` when present). */
  deliverableGroups?: DeliverableGroup[];
  contentMixIntro?: string;
  contentMix?: MixCategory[];
  campaignInfo?: CampaignInfo;
  /** Throwback's community-partnership block. */
  localMarketing?: BulletBlock;
  /** Section label for the funnel — doc uses "Marketing Funnel" (NB) vs "Customer Journey" (TP). */
  funnelLabel?: string;
  funnel?: FunnelStage[];
  /**
   * Before/After table. NON-EDITABLE honesty note (`metricsNote`) renders beside
   * it verbatim from the doc — deliberately not an editable field so the
   * projected/sample disclaimer can't be casually deleted in edit mode.
   */
  metrics?: MetricRow[];
  metricsNote?: string;
  /** Small non-editable note next to the Results label (PF: "Sample portfolio metrics"). */
  resultsNote?: string;
  resultsIntro?: string;
  resultsOutcomes?: BulletBlock;
  takeaways?: BulletBlock;
  skills?: string[];
};

/*
  NOTE: Dunkin Scholarly Study still renders this shared placeholder body — its
  real content hasn't been supplied yet. The other three studies now carry their
  own full content transcribed from the client's notes doc. Nothing here was
  invented; see the doc for the source of every line.
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

/** Shared 4-step design process — the notes doc supplies no process steps, so
 *  every study keeps the existing slots (photos stay editable per project). */
const sharedProcess = ["Mood Board", "Sketches", "Logo Concepts", "Final Brand"];

export const caseStudies: CaseStudy[] = [
  {
    slug: "the-perfected-flower",
    title: "The Perfected Flower",
    cardTagline: "Building an inclusive beauty brand through authentic social media",
    image: "/images/perfected-flower.webp",
    // Doc gives no category line for PF — existing value kept (flagged in report).
    category: "BRAND IDENTITY & DIGITAL MARKETING",
    intro:
      "The Perfected Flower is a boutique spa specializing in waxing—particularly Brazilian waxing—along with customized facials and lash lift & tint services. While the business already had an established clientele, its online presence did not accurately reflect the welcoming, fun, and judgment-free atmosphere clients experienced in person.\n\nThe goal was to transform the brand's social media from a standard beauty page into a community-focused space that felt approachable, educational, and genuinely inclusive.",
    meta: [
      { key: "client", label: "Client", value: "The Perfected Flower" },
      {
        key: "projectType",
        label: "Project Type",
        value: "Brazilian Waxing, Full Body Waxing, Facials, Lash Lift & Tint",
      },
      { key: "role", label: "Role", value: "Social Media Manager & Content Creator" },
      { key: "timeline", label: "Timeline", value: "3 Months" },
      {
        // Doc lists no tools for PF — existing shared value kept (flagged in report).
        key: "tools",
        label: "Tools Used",
        value: "Illustrator, Photoshop, Canva, Meta Business Suite",
      },
    ],
    strategy: [], // replaced by strategySections below
    designProcess: sharedProcess,
    // Doc lists no deliverables for PF — existing shared list kept (flagged in report).
    deliverables: ["Primary Logo", "Color Palette", "Social Media Posts", "Packaging"],
    challenge: {
      intro: "The spa faced several marketing challenges:",
      items: [
        "Content lacked a consistent visual identity.",
        "Posts focused primarily on promotions rather than building trust.",
        "Educational content was limited despite client interest.",
        "Brazilian waxing can feel intimidating for first-time clients.",
        "The inclusive personality of the business wasn't visible online.",
        "Engagement rates were inconsistent despite regular posting.",
      ],
      outro:
        "The biggest opportunity wasn't simply gaining followers—it was reducing the fear surrounding intimate beauty services while showcasing the business's personality.",
    },
    objectives: {
      intro: "The marketing strategy focused on five goals:",
      items: [
        "Increase engagement across Instagram and Facebook.",
        "Build trust through educational content.",
        "Highlight the spa's welcoming and inclusive culture.",
        "Position The Perfected Flower as a local expert in waxing and skincare.",
        "Encourage appointment bookings through organic social media.",
      ],
    },
    strategySections: [
      {
        title: "Brand Personality",
        intro:
          "Rather than presenting the spa as overly luxurious or clinical, the content embraced its true personality:",
        items: ["Friendly", "Funny", "Honest", "Inclusive", "Body-positive"],
        outro: "This immediately made the brand feel more relatable to potential clients.",
      },
      {
        title: "Educational Content",
        intro:
          "Many potential clients hesitate to book Brazilian waxes because they simply don't know what to expect. Educational content included:",
        items: [
          "Brazilian Wax FAQs",
          "Before & After Care",
          "Myths vs. Facts",
          "Skin Care Tips",
          "Lash Lift Maintenance",
          "Facial Benefits",
          "Exfoliation Guides",
        ],
        outro: "By answering common questions publicly, the content lowered barriers to booking.",
      },
      {
        title: "Human-Centered Content",
        intro: "Instead of relying only on polished graphics, content highlighted:",
        items: [
          "Behind-the-scenes moments",
          "Treatment room preparation",
          "Staff personality",
          "Client testimonials",
          "Everyday humor",
          "Trending Reels",
        ],
        outro: "This made followers feel connected to the business rather than marketed to.",
      },
      {
        title: "Inclusive Messaging",
        intro:
          "One of the defining characteristics of The Perfected Flower is its welcoming environment. Content intentionally reinforced messages like:",
        items: [
          "Every body is welcome.",
          "No judgment.",
          "First-time clients are encouraged.",
          "Beauty services are for everyone.",
        ],
        outro:
          "This messaging helped differentiate the spa from competitors whose branding felt more intimidating.",
      },
      {
        title: "Consistent Visual Identity",
        intro: "A cohesive aesthetic was introduced through:",
        items: [
          "Warm neutral colors",
          "Floral accents",
          "Consistent typography",
          "Brighter imagery",
          "Playful captions",
          "Branded templates",
        ],
        outro:
          "The result was a recognizable feed that reflected the spa's personality while remaining professional.",
      },
    ],
    contentMix: [
      {
        percent: 40,
        label: "Educational",
        items: ["Wax aftercare", "Skincare advice", "Lash education", "Frequently asked questions"],
      },
      {
        percent: 30,
        label: "Entertainment",
        items: ["Trending audio", "Relatable client humor", "Behind-the-scenes videos", "Memes"],
      },
      {
        percent: 20,
        label: "Promotional",
        items: ["Service spotlights", "Seasonal offers", "Appointment reminders"],
      },
      {
        percent: 10,
        label: "Community",
        items: ["Client reviews", "Team introductions", "Local engagement", "Appreciation posts"],
      },
    ],
    results: [
      { value: "58%", label: "Instagram Engagement Increase" },
      { value: "71%", label: "Reach Increase" },
      { value: "124%", label: "Reel View Increase" },
      { value: "~32%", label: "Appointment Inquiry Increase" },
    ],
    resultsNote: "Sample portfolio metrics",
    resultsIntro: "After implementing the new strategy over three months:",
    resultsOutcomes: {
      items: [
        "Instagram engagement increased 58%",
        "Reach increased 71%",
        "Follower count grew from 680 to 770",
        "Reel views increased 124%",
        "Average comments nearly doubled",
        "Saves and shares increased through educational content",
        "Appointment inquiries from social media increased approximately 32%",
      ],
      outro:
        "More importantly, clients began referencing specific educational posts during appointments, demonstrating that content was building trust before they ever walked through the door.",
    },
    takeaways: {
      intro:
        "The strongest-performing content wasn't promotional—it was educational and personality-driven. Followers consistently engaged with posts that:",
      items: [
        "Answered common waxing questions",
        "Reduced anxiety around Brazilian waxing",
        "Showcased the spa's welcoming culture",
        "Featured relatable humor",
        "Provided skincare tips clients could immediately use",
      ],
      outro: "This reinforced an important marketing principle:",
      quote: "People don't simply buy beauty services—they buy confidence, trust, and comfort.",
    },
    skills: [
      "Social Media Strategy",
      "Brand Development",
      "Content Planning",
      "Graphic Design",
      "Copywriting",
      "Community Management",
      "Short-Form Video Strategy",
      "Audience Engagement",
      "Educational Marketing",
      "Visual Brand Consistency",
    ],
    reflection:
      "This project taught me the importance of building a brand around people rather than promotions. By combining educational content with authentic storytelling, The Perfected Flower's social media became more than a portfolio of services—it became an extension of the client experience.\n\nInstead of simply advertising appointments, the strategy focused on creating a space where potential clients felt informed, welcomed, and confident before booking their first visit.",
    template: "rich",
    // Real palette sampled from the project's reference sheet (see CASE_STUDY_PALETTES.md).
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
    resultsCaption: "*Projections based on a 3-month campaign strategy",
  },
  {
    slug: "natural-beauty",
    title: "Natural Beauty",
    cardTagline: "Branding, social media & marketing strategy",
    image: "/images/natural-beauty.jpg",
    category: "BRAND IDENTITY & DIGITAL MARKETING",
    intro:
      "Natural Beauty is a modern skincare and wellness brand focused on clean ingredients, self-care, and approachable luxury. The objective of this project was to create a cohesive visual identity and digital marketing strategy that would help the brand stand out in an increasingly competitive beauty market while appealing to environmentally conscious consumers.\n\nThis project demonstrates my ability to combine branding, graphic design, and marketing strategy into a unified customer experience.",
    meta: [
      { key: "client", label: "Client", value: "Natural Beauty" },
      {
        key: "projectType",
        label: "Project Type",
        value: "Brand Identity, Social Media Strategy, Marketing Collateral, Website Design Concept",
      },
      {
        // Doc gives no role line for NB — existing value kept (flagged in report).
        key: "role",
        label: "Role",
        value: "Brand Designer, Marketing Strategist, Content Creator",
      },
      // Doc gives no timeline for NB — existing value kept (flagged in report).
      { key: "timeline", label: "Timeline", value: "Feb 2024 – May 2024 (4 Months)" },
      {
        key: "tools",
        label: "Tools Used",
        value: "Adobe Illustrator, Adobe Photoshop, Canva, Figma, Meta Business Suite",
      },
    ],
    strategy: [], // replaced by Brand Strategy pillars below
    designProcess: sharedProcess,
    deliverables: [], // replaced by grouped deliverables below
    challenge: {
      intro:
        "The beauty industry is saturated with brands offering similar products and messaging. Natural Beauty needed an identity that communicated simplicity, trust, and premium quality while remaining approachable to younger consumers. The primary challenges included:",
      items: [
        "Creating a memorable brand identity.",
        "Building consistency across digital platforms.",
        "Developing a social media presence that encouraged engagement.",
        "Positioning the brand as clean, natural, and trustworthy.",
        "Designing marketing materials that reflected premium quality without feeling inaccessible.",
      ],
    },
    objectives: {
      items: [
        "Develop a recognizable visual identity.",
        "Increase brand awareness among women ages 20–40.",
        "Establish a consistent social media aesthetic.",
        "Improve customer trust through professional branding.",
        "Encourage repeat purchases through educational and lifestyle-focused content.",
      ],
    },
    audience: {
      primaryIntro: "Women aged 20–40 who value:",
      primary: [
        "Clean beauty",
        "Sustainable products",
        "Self-care",
        "Premium yet affordable skincare",
        "Natural ingredients",
      ],
    },
    persona: {
      name: "Emma, 29",
      body: "Emma enjoys skincare routines, follows beauty creators on Instagram and TikTok, and researches ingredients before purchasing products. She appreciates brands that feel authentic rather than overly corporate and prefers products with minimalist packaging and environmentally conscious messaging.",
    },
    pillarsIntro: "Natural Beauty was positioned around three core brand pillars:",
    pillars: [
      {
        title: "Simplicity",
        description: "Minimalist design that allows products and messaging to speak for themselves.",
      },
      {
        title: "Sustainability",
        description:
          "Earth-inspired colors, recyclable packaging concepts, and messaging focused on responsible beauty.",
      },
      {
        title: "Confidence",
        description:
          "Encouraging customers to embrace healthy skin rather than unrealistic beauty standards.",
      },
    ],
    photography: [
      "Natural lighting",
      "Organic textures",
      "Plants and botanical elements",
      "Minimal editing",
      "Neutral backgrounds",
    ],
    deliverableGroups: [
      {
        title: "Brand Identity",
        items: ["Logo Design", "Color System", "Typography Guide", "Brand Style Guide"],
      },
      {
        title: "Print Materials",
        items: ["Business Cards", "Product Packaging", "Thank You Cards", "Promotional Flyers"],
      },
      {
        title: "Digital Assets",
        items: [
          "Instagram Feed Templates",
          "Story Templates",
          "Facebook Graphics",
          "Email Newsletter Design",
          "Website Homepage Mockup",
        ],
      },
    ],
    contentMixIntro:
      "The content strategy centered around educating customers while building an emotional connection with the brand.",
    contentMix: [
      {
        percent: 40,
        label: "Educational",
        items: ["Ingredient spotlights", "Skincare tips", "Product tutorials"],
      },
      {
        percent: 30,
        label: "Lifestyle",
        items: ["Morning routines", "Behind-the-scenes", "Customer stories"],
      },
      {
        percent: 20,
        label: "Promotional",
        items: ["Product launches", "Sales", "Limited-time offers"],
      },
      {
        percent: 10,
        label: "Community",
        items: ["Polls", "Questions", "User-generated content"],
      },
    ],
    campaignInfo: {
      label: "Sample campaign",
      title: "“Glow Naturally”",
      description:
        "A month-long campaign encouraging customers to embrace healthy skin rather than perfection. Campaign elements included:",
      items: [
        "Instagram Reels",
        "Before-and-after testimonials",
        "Product bundles",
        "Giveaway campaign",
        "Email newsletter series",
        "Influencer partnerships with micro-creators",
      ],
    },
    funnelLabel: "Marketing funnel",
    funnel: [
      {
        title: "Awareness",
        items: ["Instagram Reels", "Pinterest Pins", "TikTok videos", "SEO blog articles"],
      },
      {
        title: "Consideration",
        items: ["Educational carousel posts", "Ingredient comparisons", "Customer testimonials"],
      },
      {
        title: "Conversion",
        items: ["First-purchase discount", "Product bundles", "Limited-time promotions"],
      },
      {
        title: "Retention",
        items: ["Loyalty rewards", "Email marketing", "Seasonal product recommendations"],
      },
    ],
    metricsNote:
      "The following metrics represent projected campaign outcomes for portfolio demonstration purposes.",
    metrics: [
      { label: "Instagram Followers", before: "2,400", after: "4,100" },
      { label: "Average Engagement Rate", before: "2.7%", after: "6.5%" },
      { label: "Website Conversion Rate", before: "1.8%", after: "3.9%" },
      { label: "Email Open Rate", before: "24%", after: "42%" },
      { label: "Repeat Customer Rate", before: "19%", after: "33%" },
      { label: "Average Monthly Website Visitors", before: "3,200", after: "6,900" },
    ],
    results: [{ value: "71%", label: "Social Media Audience Increase" }],
    resultsIntro:
      "The proposed strategy successfully created a premium yet approachable brand identity that resonated with the target audience.",
    resultsOutcomes: {
      intro: "Projected outcomes included:",
      items: [
        "71% increase in social media audience",
        "More than doubled engagement rate",
        "Stronger brand consistency across all touchpoints",
        "Improved customer trust through cohesive design",
        "Higher projected conversion and retention rates through educational content and lifecycle marketing",
      ],
    },
    skills: [
      "Brand Strategy",
      "Graphic Design",
      "Visual Identity Development",
      "Marketing Campaign Planning",
      "Social Media Strategy",
      "Content Marketing",
      "Customer Persona Development",
      "Digital Marketing",
      "Adobe Creative Suite",
      "Canva",
      "Figma",
      "Marketing Analytics",
    ],
    reflection:
      "This project strengthened my understanding of how branding and marketing work together to influence customer perception. I learned that visual consistency alone isn't enough—successful brands combine thoughtful design with a strategic content plan that educates, builds trust, and creates lasting relationships.\n\nIt also reinforced the importance of designing every customer touchpoint with the same voice, style, and purpose to deliver a cohesive brand experience.",
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
    category: "BRAND REFRESH & COMMUNITY MARKETING",
    intro:
      "Throwback Pizza is a neighborhood pizzeria inspired by the nostalgia of the 1980s and 1990s, blending classic arcade culture, vintage aesthetics, and handcrafted pizza into a fun dining experience. The goal of this project was to modernize the brand while preserving its nostalgic personality, creating a marketing strategy that would increase local awareness, encourage repeat visits, and strengthen community engagement.\n\nThis project highlights my ability to combine branding, graphic design, and strategic marketing into a cohesive campaign designed for a local business.",
    meta: [
      { key: "client", label: "Client", value: "Throwback Pizza" },
      {
        key: "projectType",
        label: "Project Type",
        value: "Brand Refresh, Social Media Marketing, Promotional Design, Local Marketing Strategy",
      },
      {
        // Doc gives no role line for TP — existing value kept (flagged in report).
        key: "role",
        label: "Role",
        value: "Brand Designer, Marketing Strategist, Content Creator",
      },
      // Doc gives no timeline for TP — existing value kept (flagged in report).
      { key: "timeline", label: "Timeline", value: "Feb 2024 – May 2024 (4 Months)" },
      {
        key: "tools",
        label: "Tools Used",
        value: "Adobe Illustrator, Adobe Photoshop, Canva, Figma, Meta Business Suite",
      },
    ],
    strategy: [], // replaced by Brand Positioning pillars below
    designProcess: sharedProcess,
    deliverables: [], // replaced by grouped deliverables below
    challenge: {
      intro:
        "While Throwback Pizza offered quality food and a memorable dining experience, its branding lacked consistency across print and digital platforms. Social media posting was inconsistent, promotions blended in with competitors, and the restaurant wasn't fully capitalizing on its unique retro theme. Key challenges included:",
      items: [
        "Modernizing the visual identity without losing its nostalgic charm.",
        "Increasing local brand awareness.",
        "Creating consistent marketing materials.",
        "Encouraging repeat customers.",
        "Expanding social media engagement.",
      ],
    },
    objectives: {
      items: [
        "Refresh the visual identity while maintaining the retro personality.",
        "Increase local recognition.",
        "Improve engagement on Instagram and Facebook.",
        "Promote dine-in experiences alongside takeout.",
        "Build customer loyalty through community-focused marketing.",
      ],
    },
    audience: {
      primary: [
        "Adults ages 25–45",
        "Families",
        "Young professionals",
        "Nostalgia lovers",
        "Local residents",
        "Casual diners",
      ],
      secondary:
        "High school and college students looking for affordable meals, game nights, and local hangout spots.",
    },
    persona: {
      name: "Mike, 34",
      body: "Mike enjoys supporting local businesses, frequently orders takeout on weekends, and enjoys restaurants with personality rather than large chains. He's active on Instagram and Facebook, often choosing restaurants based on online reviews and photos.",
    },
    positioning:
      "“Your favorite neighborhood pizza shop—with the fun of yesterday and the flavors of today.”",
    pillarsIntro: "Core brand pillars:",
    pillars: [
      { title: "Nostalgia" },
      { title: "Community" },
      { title: "Family" },
      { title: "Fun" },
      { title: "Handmade Quality" },
    ],
    photography: [
      "Fresh pizzas",
      "Cheese pulls",
      "Families sharing meals",
      "Arcade games",
      "Warm lighting",
      "Close-up food photography",
    ],
    deliverableGroups: [
      {
        title: "Brand Identity",
        items: ["Logo Refresh", "Color Palette", "Typography System", "Brand Guidelines"],
      },
      {
        title: "Print Materials",
        items: [
          "Menu Design",
          "Pizza Box Graphics",
          "Loyalty Punch Card",
          "Window Posters",
          "Table Tents",
          "Gift Card Design",
        ],
      },
      {
        title: "Digital Marketing",
        items: [
          "Instagram Templates",
          "Facebook Graphics",
          "Story Templates",
          "Email Newsletter",
          "Website Landing Page",
          "Google Business Profile Assets",
        ],
      },
    ],
    contentMixIntro:
      "The strategy emphasized personality, nostalgia, and community involvement rather than simply posting menu items.",
    contentMix: [
      {
        percent: 30,
        label: "Food Photography",
        items: ["Signature pizzas", "Limited-time specials", "Behind-the-scenes kitchen content"],
      },
      {
        percent: 30,
        label: "Community",
        items: ["Local events", "Staff highlights", "Customer spotlights"],
      },
      {
        percent: 20,
        label: "Entertainment",
        items: ["Retro trivia", "90s throwback posts", "Arcade game nostalgia", "Pizza polls"],
      },
      {
        percent: 20,
        label: "Promotions",
        items: ["Family meal bundles", "Lunch specials", "Seasonal promotions", "Giveaway contests"],
      },
    ],
    campaignInfo: {
      label: "Featured campaign",
      title: "“Flashback Fridays”",
      description:
        "Every Friday customers who wore vintage clothing or merchandise from the 80s, 90s, or early 2000s received:",
      items: [
        "Free fountain drink",
        "Discounted specialty pizza",
        "Entry into a monthly gift card giveaway",
      ],
      outro:
        "Social media encouraged customers to share photos using #ThrowbackFriday. The campaign helped create user-generated content while reinforcing the restaurant's nostalgic identity.",
    },
    localMarketing: {
      heading: "Community Partnerships",
      items: [
        "Sponsor local youth sports teams.",
        "Partner with nearby schools for fundraising nights.",
        "Participate in community festivals.",
        "Offer discounts to teachers and first responders.",
      ],
    },
    funnelLabel: "Customer journey",
    funnel: [
      {
        title: "Awareness",
        items: ["Facebook Ads", "Instagram Reels", "Google Business Profile", "Community sponsorships"],
      },
      {
        title: "Consideration",
        items: ["Online reviews", "Food photography", "Customer testimonials", "Menu previews"],
      },
      {
        title: "Purchase",
        items: ["Easy online ordering", "Family meal bundles", "Limited-time offers"],
      },
      {
        title: "Loyalty",
        items: ["Rewards program", "Birthday coupons", "Email newsletter", "Seasonal promotions"],
      },
    ],
    metricsNote:
      "The following results are projected outcomes for portfolio demonstration purposes.",
    metrics: [
      { label: "Instagram Followers", before: "1,200", after: "2,900" },
      { label: "Facebook Reach", before: "8,500/month", after: "19,400/month" },
      { label: "Engagement Rate", before: "3.1%", after: "7.2%" },
      { label: "Website Visits", before: "1,900/month", after: "4,800/month" },
      // Doc anomaly: source lists "+38%" in the Before column with After empty.
      // Rendered as a change figure per the doc's own Key Results wording
      // ("38% increase in online ordering") — decision approved 2026-07-19.
      { label: "Online Orders", before: "—", after: "+38%" },
      { label: "Repeat Customers", before: "27%", after: "44%" },
      { label: "Loyalty Program Members", before: "0", after: "720" },
    ],
    results: [
      { value: "142%", label: "Instagram Following Growth" },
      { value: "38%", label: "Online Ordering Increase" },
    ],
    resultsIntro:
      "The proposed strategy successfully repositioned Throwback Pizza as more than a restaurant—it became a community gathering place with a recognizable personality.",
    resultsOutcomes: {
      intro: "Projected results included:",
      items: [
        "142% growth in Instagram following",
        "More than doubled engagement across social media",
        "38% increase in online ordering",
        "Significant increase in customer loyalty",
        "Stronger community recognition through local partnerships and themed events",
      ],
    },
    skills: [
      "Brand Strategy",
      "Restaurant Marketing",
      "Graphic Design",
      "Promotional Campaign Development",
      "Social Media Marketing",
      "Community Marketing",
      "Local SEO Planning",
      "Content Strategy",
      "Customer Journey Mapping",
      "Adobe Creative Suite",
      "Canva",
      "Figma",
      "Marketing Analytics",
    ],
    reflection:
      "This project reinforced how effective local marketing goes beyond advertising. Successful neighborhood restaurants thrive by creating memorable experiences that encourage customers to return and recommend the business to others.\n\nBy combining nostalgic branding, community engagement, and consistent visual design, the restaurant developed a stronger emotional connection with its audience while differentiating itself from national pizza chains.",
    template: "rich",
    // Palette names updated to the doc's wording (hexes unchanged — doc names colors, not values).
    palette: [
      { hex: "#D62828", name: "Cherry Red" },
      { hex: "#F4E8D0", name: "Cream" },
      { hex: "#FFC857", name: "Mustard Yellow" },
      { hex: "#0D3B66", name: "Deep Navy" },
      { hex: "#2A9D8F", name: "Vintage Teal" },
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
    // placeholder. Not covered by the notes doc — content untouched until the
    // client supplies it.
    template: "rich",
    resultsCaption: "*Projections based on a 3-month campaign strategy",
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
