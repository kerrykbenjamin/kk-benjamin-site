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

/**
 * Richer case-study layout. Structure borrowed from the reference one-pagers,
 * re-skinned in either the site's default tokens or — when `study.theme` is
 * present — that project's own accent palette (CASE_STUDY_PALETTES.md).
 *
 * Theming is scoped via CSS custom properties on the wrapper below; every
 * themed class uses `var(--cs-*, <site-default-hex>)` so a study with no theme
 * (e.g. Dunkin, which stays on the plain template) or a future rich page added
 * without a theme still renders correctly on site defaults. Nothing here
 * touches DESIGN_TOKENS.md / globals.css, so it can never leak into site chrome
 * (header/footer/nav) or other pages.
 *
 * The editor can override this project's default theme with a preset or
 * custom colors via the edit dashboard's color panel (per-page scope) — that
 * override is resolved here and falls back to the project's own built-in
 * theme (never the site's Classic default) if nothing's been saved.
 *
 * All text/images remain inline editable (same `case.<slug>.*` keys); only the
 * palette swatches and the theme colors themselves are static.
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

  return (
    <div style={cssVars} data-cs-theme-root>

      {/* Header + At a glance */}
      <section className="bg-[var(--cs-tint,#FBF7F1)]">
        <Container className="py-14 sm:py-20">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1.5 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[var(--cs-text,#1F2A19)]/60 transition-colors hover:text-[var(--cs-text,#1F2A19)]"
          >
            <span aria-hidden>←</span> Back to portfolio
          </Link>

          <div className="mt-8 max-w-3xl">
            <SectionLabel>Case Study</SectionLabel>
            <Field
              id={`case.${slug}.title`}
              as="h1"
              className="mt-4 font-display text-display font-semibold text-[var(--cs-text,#1F2A19)]"
            />
            <Field
              id={`case.${slug}.category`}
              as="p"
              className="mt-4 eyebrow text-[var(--cs-text,#1F2A19)]/60"
            />
            <Field
              id={`case.${slug}.intro`}
              as="p"
              className="mt-6 whitespace-pre-line text-lead text-[var(--cs-text,#1F2A19)]/70"
            />
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-3 lg:gap-10">
            <Reveal className="lg:col-span-2">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[16px] bg-[var(--cs-card,#FFFAF4)]">
                <ImageField
                  id={`case.${slug}.image`}
                  alt={title}
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                  lightbox={`case:${slug}`}
                />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <AtAGlanceCard slug={slug} />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Visual identity — brand palette + typography, side by side on desktop.
          Hidden entirely when a project has neither (e.g. Dunkin). */}
      {((study.palette && study.palette.length > 0) ||
        (study.fonts && study.fonts.length > 0)) && (
        <section className="bg-[var(--cs-card,#FFFAF4)]">
          <Container className="py-14 sm:py-20">
            <Reveal>
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
            </Reveal>
          </Container>
        </section>
      )}

      {/* Strategy */}
      <section className="bg-[var(--cs-tint,#FBF7F1)]">
        <Container className="py-14 sm:py-20">
          <Reveal>
            <SectionLabel>Strategy</SectionLabel>
            <ul className="mt-8 grid gap-4 md:grid-cols-2">
              {study.strategy.map((_, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-lead text-[var(--cs-text,#1F2A19)]/80"
                >
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--cs-accent,#6F8B5F)]"
                  />
                  <Field id={`case.${slug}.strategy.${i + 1}`} as="span" />
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>

      {/* Process */}
      <section className="bg-[var(--cs-card,#FFFAF4)]">
        <Container className="py-14 sm:py-20">
          <Reveal>
            <SectionLabel>Process</SectionLabel>
            <div className="mt-10">
              <ProcessSteps slug={slug} count={study.designProcess.length} />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Deliverables */}
      <section className="bg-[var(--cs-tint,#FBF7F1)]">
        <Container className="py-14 sm:py-20">
          <Reveal>
            <SectionLabel>Deliverables</SectionLabel>
            <div className="mt-8 max-w-3xl">
              <DeliverablesChecklist slug={slug} count={study.deliverables.length} />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Campaign spotlight */}
      <section className="bg-[var(--cs-card,#FFFAF4)]">
        <Container className="py-14 sm:py-20">
          <Reveal>
            <SpotlightCallout slug={slug} />
          </Reveal>
        </Container>
      </section>

      {/* Results */}
      <section id="results" className="scroll-mt-20 bg-[var(--cs-tint,#FBF7F1)]">
        <Container className="py-14 sm:py-20">
          <Reveal>
            <SectionLabel>Results</SectionLabel>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {study.results.map((_, i) => (
                <StatCard
                  key={i}
                  slug={slug}
                  index={i}
                  icon={STAT_ICONS[i % STAT_ICONS.length]}
                />
              ))}
            </div>
            <Field
              id={`case.${slug}.results.caption`}
              as="p"
              className="mx-auto mt-8 max-w-2xl whitespace-pre-line text-center text-sm text-[var(--cs-text,#1F2A19)]/55"
            />
          </Reveal>
        </Container>
      </section>

      {/* Reflection */}
      <section className="bg-[var(--cs-card,#FFFAF4)]">
        <Container className="py-14 sm:py-20">
          <Reveal>
            <SectionLabel>Reflection</SectionLabel>
            <Field
              id={`case.${slug}.reflection`}
              as="p"
              className="mt-6 max-w-3xl whitespace-pre-line font-display text-h3 leading-snug text-[var(--cs-text,#1F2A19)]"
            />
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
