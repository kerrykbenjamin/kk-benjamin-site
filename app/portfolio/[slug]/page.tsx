import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { caseStudies, getCaseStudy } from "@/data/caseStudies";
import { getText } from "@/lib/content";
import RichCaseStudy from "@/components/case-study/RichCaseStudy";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!getCaseStudy(slug)) return {};
  const [title, intro] = await Promise.all([
    getText(`case.${slug}.title`),
    getText(`case.${slug}.intro`),
  ]);
  return { title, description: intro };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  // All case studies render the rich template now (the plain 04–09 layout was
  // retired). A study without a `theme` (e.g. Dunkin) falls back to the site's
  // default DESIGN_TOKENS.md tokens inside RichCaseStudy.
  return <RichCaseStudy slug={slug} study={study} />;
}
