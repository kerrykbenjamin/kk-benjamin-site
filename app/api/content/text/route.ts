import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { isEditorRequest } from "@/lib/auth";
import { getField } from "@/lib/content/registry";
import { getStore } from "@/lib/content/store";

export async function POST(req: NextRequest) {
  if (!(await isEditorRequest())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  let key = "";
  let value = "";
  try {
    const body = await req.json();
    key = typeof body?.key === "string" ? body.key : "";
    value = typeof body?.value === "string" ? body.value : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const field = getField(key);
  if (!field || field.type !== "text") {
    return NextResponse.json({ error: "That field can't be edited." }, { status: 400 });
  }

  const clean = value.replace(/\r\n/g, "\n").trim();
  if (clean.length === 0) {
    return NextResponse.json({ error: "This can't be empty." }, { status: 400 });
  }
  if (field.maxLength && clean.length > field.maxLength) {
    return NextResponse.json(
      { error: `Too long — keep it under ${field.maxLength} characters (currently ${clean.length}).` },
      { status: 400 },
    );
  }

  try {
    await getStore().setText(key, clean);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Save failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, value: clean });
}
