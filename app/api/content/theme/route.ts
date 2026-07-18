import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { isEditorRequest } from "@/lib/auth";
import { getStore } from "@/lib/content/store";
import { isValidHex, checkContrast } from "@/lib/color";
import { getPreset } from "@/lib/theme/presets";
import { caseStudies } from "@/data/caseStudies";

const VALID_SCOPES = new Set(["global", ...caseStudies.map((c) => `case.${c.slug}`)]);

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
  const { scope, mode, presetId, bg, accent } = (body ?? {}) as Record<string, unknown>;

  if (typeof scope !== "string" || !VALID_SCOPES.has(scope)) {
    return NextResponse.json({ error: "That page can't be themed." }, { status: 400 });
  }

  const store = getStore();

  if (mode === "default") {
    await store.setText(`theme.${scope}.mode`, "default");
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  }

  if (mode === "preset") {
    if (typeof presetId !== "string" || !getPreset(presetId)) {
      return NextResponse.json({ error: "That preset doesn't exist." }, { status: 400 });
    }
    // Presets are pre-validated (COLOR_PRESETS.md) — no contrast check needed, that's the point of a preset.
    await store.setText(`theme.${scope}.mode`, "preset");
    await store.setText(`theme.${scope}.presetId`, presetId);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  }

  if (mode === "custom") {
    if (typeof bg !== "string" || typeof accent !== "string" || !isValidHex(bg) || !isValidHex(accent)) {
      return NextResponse.json({ error: "Please pick two valid colors." }, { status: 400 });
    }
    // The one mandatory gate: accent doubles as the heading/text color, so it
    // must read clearly on the chosen background. Re-checked here regardless
    // of any client-side preview check — this is the source of truth.
    const check = checkContrast(accent, bg, "text");
    if (!check.ok) {
      return NextResponse.json({ error: check.message }, { status: 400 });
    }
    await store.setText(`theme.${scope}.mode`, "custom");
    await store.setText(`theme.${scope}.bg`, bg);
    await store.setText(`theme.${scope}.accent`, accent);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unrecognized color mode." }, { status: 400 });
}
