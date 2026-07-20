import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import Field from "@/components/edit/Field";
import ImageField from "@/components/edit/ImageField";
import { getText } from "@/lib/content";
import { getPageTheme, getPreset, DEFAULT_PRESET_ID } from "@/lib/theme";
import type { CaseStudy } from "@/data/caseStudies";
import AtAGlanceCard from "./AtAGlanceCard";
import PaletteSwatchRow from "./PaletteSwatchRow";
import TypographyDisplay from "./TypographyDisplay";
import StatCard from "./StatCard";
import DeliverablesChecklist from "./DeliverablesChecklist";
import SpotlightCallout from "./SpotlightCallout";
import ProcessSteps from "./ProcessSteps";
import CaseBulletList from "./CaseBulletList";
import AudiencePersona from "./AudiencePersona";
import BrandPillars from "./BrandPillars";
import ContentMixBars from "./ContentMixBars";
import MarketingFunnel from "./MarketingFunnel";
import MetricsTable from "./MetricsTable";
import SkillsChips from "./SkillsChips";
import StrategySections from "./StrategySections";
import { IconBag, IconCursor, IconHeart, IconUsers } from "./icons";

const STAT_ICONS: ReactNode[] = [
  <IconUsers key="u" />,
  <IconHeart key="h" />,
  <IconCursor key="c" />,
  <IconBag key="b" />,
];

function SectionLabel({ children }: { children: ReactNode }) {
  // Deliberately dark/60 rather than the vivid accent — accent colors measured
  // below WCAG 3:1 in every project's palette (see CASE_STUDY_PALETTES.md), so
  // eyebrow text always uses the contrast-safe `text` role instead.
  return <p className="eyebrow text-[var(--cs-text,#1F2A19)]/60">{children}</p>;
}

/** One entry in the visible-section list (see alternation note below). */
type Section = {
  key: string;
  node: ReactNode;
  /** Anchor id + scroll offset (used by the Results section). */
  id?: string;
  /** Header manages its own inner Reveals — skip the outer wrapper. */
  bare?: boolean;
};

/**
 * Richer case-study layout. Structure borrowed from the reference one-pagers,
 * re-skinned in either the site's default tokens or — when `study.theme` is
 * present — that project's own accent palette (CASE_STUDY_PALETTES.md).
 *
 * Theming is scoped via CSS custom properties on the wrapper below; every
 * themed class uses `var(--cs-*, <site-default-hex>)` so a study with no theme
 * (e.g. Dunkin) still renders correctly on site defaults. Nothing here touches
 * DESIGN_TOKENS.md / globals.css, so it can never leak into site chrome
 * (header/footer/nav) or other pages.
 *
 * SECTION MODEL: most sections are OPTIONAL — a study without the matching
 * data (see data/caseStudies.ts) contributes nothing to the list, so there are
 * never empty headings or blank padded bands. The tint/card background
 * alternation is computed from the list of sections actually VISIBLE (index
 * parity), not hardcoded per section — with this many optional sections, a
 * positional scheme would put two same-coloured bands next to each other
 * whenever one hides (Perfected Flower hides several; Dunkin most of them).
 *
 * All text/images remain inline editable (same `case.<slug>.*` keys); only the
 * palette swatches, the theme colors, the content-mix percentages and the
 * projected-metrics honesty labels are static (the last two on purpose — see
 * MetricsTable / ContentMixBars).
 */
export default async function RichCaseStudy({
  slug,
  study,
}: {
  slug: string;
  study: CaseStudy;
}) {
  const [title, t] = await Promise.all([
    getText(`case.${slug}.title`),
    getPageTheme(slug, study.theme ?? getPreset(DEFAULT_PRESET_ID)!.colors),
  ]);
  const cssVars = {
    "--cs-tint": t.tint,
    "--cs-card": t.card,
    "--cs-accent": t.accent,
    "--cs-text": t.text,
    "--cs-dark": t.dark,
    "--cs-on-dark": t.onDark,
  } as CSSProperties;

  const sections: Section[] = [];

  // Header + At a glance (always)
  sections.push({
    key: "header",
    bare: true,
    node: (
      <>
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1.5 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[var(--cs-text,#1F2A19)]/60 transition-colors hover:text-[var(--cs-text,#1F2A19)]"
        >
          <span aria-hidden>←</span> Back to portfolio
        </Link>

        <div className="mt-8">
          <SectionLabel>Case Study</SectionLabel>
          <Field
            id={`case.${slug}.title`}
            as="h1"
            className="mt-4 font-display text-display font-semibold text-[var(--cs-text,#1F2A19)]"
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[8fr_5fr] lg:gap-10 lg:mt-10">
          <Reveal>
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[16px] bg-[var(--cs-card,#FFFAF4)]">
              <ImageField
                id={`case.${slug}.image`}
                alt={title}
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
                lightbox={`case:${slug}`}
              />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <AtAGlanceCard slug={slug} />
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="mt-10 lg:mt-12">
            <Field
              id={`case.${slug}.category`}
              as="p"
              className="eyebrow text-[var(--cs-text,#1F2A19)]/60"
            />
            <Field
              id={`case.${slug}.intro`}
              as="p"
              className="mt-6 whitespace-pre-line text-lead text-[var(--cs-text,#1F2A19)]/70"
            />
          </div>
        </Reveal>
      </>
    ),
  });

  // Skills demonstrated
  if (study.skills && study.skills.length > 0) {
    sections.push({
      key: "skills",
      node: (
        <>
          <SectionLabel>Skills demonstrated</SectionLabel>
          <SkillsChips slug={slug} count={study.skills.length} />
        </>
      ),
    });
  }

  // The challenge
  if (study.challenge) {
    sections.push({
      key: "challenge",
      node: (
        <>
          <SectionLabel>The challenge</SectionLabel>
          <CaseBulletList
            slug={slug}
            name="challenge"
            count={study.challenge.items.length}
            hasIntro={!!study.challenge.intro}
            hasOutro={!!study.challenge.outro}
          />
        </>
      ),
    });
  }

  // Objectives
  if (study.objectives) {
    sections.push({
      key: "objectives",
      node: (
        <>
          <SectionLabel>Objectives</SectionLabel>
          <CaseBulletList
            slug={slug}
            name="objectives"
            count={study.objectives.items.length}
            hasIntro={!!study.objectives.intro}
            hasOutro={!!study.objectives.outro}
          />
        </>
      ),
    });
  }

  // Target audience + customer persona
  if (study.audience || study.persona) {
    sections.push({
      key: "audience",
      node: (
        <>
          <SectionLabel>Target audience</SectionLabel>
          <AudiencePersona slug={slug} audience={study.audience} persona={study.persona} />
        </>
      ),
    });
  }

  // Brand positioning / pillars
  if (study.positioning || (study.pillars && study.pillars.length > 0)) {
    sections.push({
      key: "pillars",
      node: (
        <>
          <SectionLabel>Brand positioning</SectionLabel>
          <BrandPillars
            slug={slug}
            positioning={study.positioning}
            hasIntro={!!study.pillarsIntro}
            pillars={study.pillars}
          />
        </>
      ),
    });
  }

  // Visual identity — palette + typography (+ doc photography-style list)
  if (
    (study.palette && study.palette.length > 0) ||
    (study.fonts && study.fonts.length > 0) ||
    (study.photography && study.photography.length > 0)
  ) {
    sections.push({
      key: "identity",
      node: (
        <>
          <SectionLabel>Visual identity</SectionLabel>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_auto] lg:gap-16">
            {study.palette && study.palette.length > 0 && (
              <div>
                <p className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[var(--cs-text,#1F2A19)]/45">
                  Palette
                </p>
                <div className="mt-5">
                  <PaletteSwatchRow palette={study.palette} />
                </div>
              </div>
            )}
            {study.fonts && study.fonts.length > 0 && (
              <div className="lg:border-l lg:border-[var(--cs-text,#1F2A19)]/10 lg:pl-16">
                <p className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[var(--cs-text,#1F2A19)]/45">
                  Typography
                </p>
                <div className="mt-5">
                  <TypographyDisplay slug={slug} fonts={study.fonts} />
                </div>
              </div>
            )}
          </div>
          {study.photography && study.photography.length > 0 && (
            <div className="mt-10">
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[var(--cs-text,#1F2A19)]/45">
                Photography style
              </p>
              <ul className="mt-4 flex max-w-3xl flex-wrap gap-x-7 gap-y-2.5">
                {study.photography.map((_, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-[var(--cs-text,#1F2A19)]/80">
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--cs-accent,#6F8B5F)]"
                    />
                    <Field id={`case.${slug}.photography.${i + 1}`} as="span" />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ),
    });
  }

  // Strategy — rich numbered subsections (PF) or the legacy flat bullets (Dunkin)
  if (study.strategySections && study.strategySections.length > 0) {
    sections.push({
      key: "strategy",
      node: (
        <>
          <SectionLabel>Strategy</SectionLabel>
          <StrategySections slug={slug} sections={study.strategySections} />
        </>
      ),
    });
  } else if (study.strategy.length > 0) {
    sections.push({
      key: "strategy",
      node: (
        <>
          <SectionLabel>Strategy</SectionLabel>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {study.strategy.map((_, i) => (
              <li key={i} className="flex gap-3 text-lead text-[var(--cs-text,#1F2A19)]/80">
                <span
                  aria-hidden
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--cs-accent,#6F8B5F)]"
                />
                <Field id={`case.${slug}.strategy.${i + 1}`} as="span" />
              </li>
            ))}
          </ul>
        </>
      ),
    });
  }

  // Process (always)
  sections.push({
    key: "process",
    node: (
      <>
        <SectionLabel>Process</SectionLabel>
        <div className="mt-10">
          <ProcessSteps slug={slug} count={study.designProcess.length} />
        </div>
      </>
    ),
  });

  // Deliverables — grouped (doc) or flat (legacy); hides when a study has neither
  if (
    (study.deliverableGroups && study.deliverableGroups.length > 0) ||
    study.deliverables.length > 0
  ) {
    sections.push({
      key: "deliverables",
      node: (
        <>
          <SectionLabel>Deliverables</SectionLabel>
          <div className="mt-8 max-w-3xl">
            <DeliverablesChecklist
              slug={slug}
              count={study.deliverables.length}
              groups={study.deliverableGroups?.map((g) => g.items.length)}
            />
          </div>
        </>
      ),
    });
  }

  // Content mix
  if (study.contentMix && study.contentMix.length > 0) {
    sections.push({
      key: "mix",
      node: (
        <>
          <SectionLabel>Content mix</SectionLabel>
          <ContentMixBars slug={slug} mix={study.contentMix} hasIntro={!!study.contentMixIntro} />
        </>
      ),
    });
  }

  // Campaign spotlight (always — carries doc campaign copy when present)
  sections.push({
    key: "spotlight",
    node: <SpotlightCallout slug={slug} info={study.campaignInfo} />,
  });

  // Local marketing (Throwback)
  if (study.localMarketing) {
    sections.push({
      key: "local",
      node: (
        <>
          <SectionLabel>Local marketing</SectionLabel>
          <CaseBulletList
            slug={slug}
            name="local"
            count={study.localMarketing.items.length}
            hasHeading={!!study.localMarketing.heading}
            hasIntro={!!study.localMarketing.intro}
            hasOutro={!!study.localMarketing.outro}
          />
        </>
      ),
    });
  }

  // Marketing funnel / customer journey
  if (study.funnel && study.funnel.length > 0) {
    sections.push({
      key: "funnel",
      node: (
        <>
          <SectionLabel>{study.funnelLabel ?? "Marketing funnel"}</SectionLabel>
          <MarketingFunnel slug={slug} stages={study.funnel} />
        </>
      ),
    });
  }

  // Performance metrics (Before/After table, labeled projected)
  if (study.metrics && study.metrics.length > 0) {
    sections.push({
      key: "metrics",
      node: (
        <>
          <SectionLabel>Sample performance metrics</SectionLabel>
          <MetricsTable slug={slug} rows={study.metrics} note={study.metricsNote} />
        </>
      ),
    });
  }

  // Results (always). Stat-card grid width adapts to the per-study card count —
  // the doc yields 1 (NB), 2 (TP) or 4 (PF/Dunkin) explicit figures.
  const statGrid =
    study.results.length === 1
      ? "mx-auto mt-8 grid max-w-xs grid-cols-1 gap-5"
      : study.results.length === 2
        ? "mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2"
        : "mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4";
  sections.push({
    key: "results",
    id: "results",
    node: (
      <>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <SectionLabel>Results</SectionLabel>
          {study.resultsNote && (
            // Non-editable honesty label (e.g. PF's "Sample portfolio metrics")
            <span className="text-xs italic text-[var(--cs-text,#1F2A19)]/50">
              {study.resultsNote}
            </span>
          )}
        </div>
        {study.resultsIntro && (
          <Field
            id={`case.${slug}.results.intro`}
            as="p"
            className="mt-6 max-w-3xl whitespace-pre-line text-lead text-[var(--cs-text,#1F2A19)]/75"
          />
        )}
        <div className={statGrid}>
          {study.results.map((_, i) => (
            <StatCard key={i} slug={slug} index={i} icon={STAT_ICONS[i % STAT_ICONS.length]} />
          ))}
        </div>
        {study.resultsOutcomes && (
          <div className="mt-10">
            <CaseBulletList
              slug={slug}
              name="outcomes"
              count={study.resultsOutcomes.items.length}
              hasIntro={!!study.resultsOutcomes.intro}
              hasOutro={!!study.resultsOutcomes.outro}
            />
          </div>
        )}
        <Field
          id={`case.${slug}.results.caption`}
          as="p"
          className="mx-auto mt-8 max-w-2xl whitespace-pre-line text-center text-sm text-[var(--cs-text,#1F2A19)]/55"
        />
      </>
    ),
  });

  // Key takeaways (PF)
  if (study.takeaways) {
    sections.push({
      key: "takeaways",
      node: (
        <>
          <SectionLabel>Key takeaways</SectionLabel>
          <CaseBulletList
            slug={slug}
            name="takeaways"
            count={study.takeaways.items.length}
            hasIntro={!!study.takeaways.intro}
            hasOutro={!!study.takeaways.outro}
            hasQuote={!!study.takeaways.quote}
          />
        </>
      ),
    });
  }

  // Reflection / what I learned (always)
  sections.push({
    key: "reflection",
    node: (
      <>
        <SectionLabel>What I learned</SectionLabel>
        <Field
          id={`case.${slug}.reflection`}
          as="p"
          className="mt-6 max-w-[72ch] whitespace-pre-line font-display text-h3 leading-snug text-[var(--cs-text,#1F2A19)]"
        />
      </>
    ),
  });

  return (
    <div style={cssVars} data-cs-theme-root>
      {sections.map((s, i) => (
        <section
          key={s.key}
          id={s.id}
          // --cs-surface is always the OPPOSITE of this band's fill, so card-styled
          // children (StatCard, pillar cards, checklist rows, table header, strategy
          // cards) stay visible no matter which band the alternation assigns them.
          style={
            {
              "--cs-surface":
                i % 2 === 0 ? "var(--cs-card,#FFFAF4)" : "var(--cs-tint,#FBF7F1)",
            } as CSSProperties
          }
          className={`${s.id ? "scroll-mt-20 " : ""}${
            i % 2 === 0 ? "bg-[var(--cs-tint,#FBF7F1)]" : "bg-[var(--cs-card,#FFFAF4)]"
          }`}
        >
          <Container className="py-14 sm:py-20">
            {s.bare ? s.node : <Reveal>{s.node}</Reveal>}
          </Container>
        </section>
      ))}
    </div>
  );
}
