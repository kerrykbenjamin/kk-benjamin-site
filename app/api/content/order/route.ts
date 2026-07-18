import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { isEditorRequest } from "@/lib/auth";
import { getStore } from "@/lib/content/store";
import { caseStudies } from "@/data/caseStudies";
import { valueProps } from "@/data/valueProps";
import { portfolioIllustrations } from "@/data/portfolioIllustrations";

/** The only collections that can be reordered, and their valid id sets. */
const COLLECTIONS: Record<string, string[]> = {
  caseStudies: caseStudies.map((c) => c.slug),
  valueProps: valueProps.map((v) => v.id),
  portfolioIllustrations: portfolioIllustrations.map((i) => i.id),
};

export async function POST(req: NextRequest) {
  if (!(await isEditorRequest())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { collection, ids } = (body ?? {}) as Record<string, unknown>;

  // Object.hasOwn (not `in`, which also matches inherited Object.prototype
  // members like "toString"/"constructor" and would let those slip through
  // or crash the handler below).
  if (typeof collection !== "string" || !Object.hasOwn(COLLECTIONS, collection)) {
    return NextResponse.json({ error: "That list can't be reordered." }, { status: 400 });
  }
  const known = COLLECTIONS[collection];

  if (
    !Array.isArray(ids) ||
    ids.length !== known.length ||
    new Set(ids).size !== known.length ||
    !ids.every((id) => typeof id === "string" && known.includes(id))
  ) {
    return NextResponse.json(
      { error: "That order doesn't match — try refreshing and reordering again." },
      { status: 400 },
    );
  }

  await getStore().setText(`order.${collection}`, ids.join(","));
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true });
}
