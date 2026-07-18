/**
 * TEMPORARY test-image seeder — fills every empty image slot with a labeled
 * gradient block so the site can be reviewed with images in place.
 *
 *   node scripts/test-images.mjs seed     → generate + seed all empty slots
 *   node scripts/test-images.mjs remove   → strip every test image back out
 *
 * How it stays removable:
 *  - Images live ONLY in public/images/test/ (nothing else writes there).
 *  - Seeding just points content-store keys at those files; the styled
 *    placeholder components are untouched, so `remove` (which deletes the
 *    keys + the folder) cleanly reveals the placeholders again.
 *  - Slots that already hold a REAL value (e.g. an uploaded photo, or the
 *    gallery's two default images) are never overwritten, and `remove` only
 *    deletes keys whose value points into /images/test/.
 *
 * Colors are the site's own DESIGN_TOKENS.md values so the blocks don't clash.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const TEST_DIR = path.join(root, "public", "images", "test");
const STORE = path.join(root, ".content-store", "content.json");
const FONT = "C:/Windows/Fonts/arial.ttf";

// Site tokens (DESIGN_TOKENS.md) — gradient pairs + label color.
const GRADIENTS = [
  ["#FBF7F1", "#EFB8C7"], // cream → blush
  ["#FFFAF4", "#6F8B5F"], // ivory → sage
  ["#EFB8C7", "#FFFAF4"], // blush → ivory
  ["#FBF7F1", "#6F8B5F"], // cream → sage
];
const LABEL = "#182312"; // forest-deep

const SLUGS = {
  "the-perfected-flower": "TPF",
  "natural-beauty": "NB",
  "throwback-pizza": "TP",
  "dunkin-scholarly-study": "Dunkin",
};
const STEPS = ["Mood Board", "Sketches", "Logo Concepts", "Final Brand"];

/** Every seedable slot: key, two label lines, and pixel size (slot ratio). */
function slots() {
  const out = [];
  // Gallery slots 1–2 carry REAL default images via the content registry (the
  // store can't see registry defaults), so only the empty generated slots are
  // seeded. Extend this list if GALLERY_SLOT_COUNT grows.
  for (const n of [3, 4]) {
    out.push({ key: `portfolio.illus.${n}.image`, l1: "TEST", l2: `Gallery ${n}`, w: 800, h: 800 });
  }
  for (const [slug, tag] of Object.entries(SLUGS)) {
    for (let n = 1; n <= 4; n++) {
      out.push({
        key: `case.${slug}.process.${n}.image`,
        l1: `TEST — ${tag}`,
        l2: `Process ${n} · ${STEPS[n - 1]}`,
        w: 800,
        h: 800,
      });
    }
    for (let n = 1; n <= 3; n++) {
      out.push({
        key: `case.${slug}.spotlight.${n}.image`,
        l1: `TEST — ${tag}`,
        l2: `Campaign photo ${n}`,
        w: 800,
        h: 1000, // spotlight slots render aspect-[4/5]
      });
    }
  }
  return out;
}

async function readStore() {
  try {
    return JSON.parse(await fs.readFile(STORE, "utf8"));
  } catch {
    return {};
  }
}
async function writeStore(data) {
  await fs.mkdir(path.dirname(STORE), { recursive: true });
  await fs.writeFile(STORE, JSON.stringify(data, null, 2), "utf8");
}

async function makeImage({ l1, l2, w, h }, gradIdx, file) {
  const [from, to] = GRADIENTS[gradIdx % GRADIENTS.length];
  const svg = Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
      </linearGradient></defs>
      <rect width="${w}" height="${h}" fill="url(#g)"/>
    </svg>`,
  );
  const text = async (str, size) =>
    sharp({
      text: {
        text: `<span foreground="${LABEL}">${str}</span>`,
        font: `sans bold ${size}`,
        fontfile: FONT,
        rgba: true,
        dpi: 150,
      },
    })
      .png()
      .toBuffer();
  const [t1, t2] = await Promise.all([text(l1, 34), text(l2, 20)]);
  const m1 = await sharp(t1).metadata();
  await sharp(svg)
    .composite([
      { input: t1, top: Math.round(h / 2) - m1.height - 6, left: 60 },
      { input: t2, top: Math.round(h / 2) + 10, left: 60 },
    ])
    .png({ compressionLevel: 9, palette: true })
    .toFile(file);
}

const cmd = process.argv[2];

if (cmd === "seed") {
  await fs.mkdir(TEST_DIR, { recursive: true });
  const store = await readStore();
  let made = 0,
    skipped = 0;
  const defs = slots();
  for (let i = 0; i < defs.length; i++) {
    const s = defs[i];
    // Never clobber a slot that already holds a real (non-test) value —
    // the gallery's two default images count as real via registry defaults,
    // so only truly EMPTY slots (no store override, empty registry default)
    // get seeded. Store overrides pointing at /images/test/ are re-seedable.
    const current = store[s.key] ?? "";
    if (current && !current.startsWith("/images/test/")) {
      skipped++;
      continue;
    }
    const file = `${s.key.replace(/[^a-z0-9.-]/gi, "_")}.png`;
    await makeImage(s, i, path.join(TEST_DIR, file));
    store[s.key] = `/images/test/${file}`;
    made++;
  }
  await writeStore(store);
  console.log(`seeded ${made} test images (${skipped} slots already had real photos — untouched)`);
  console.log(`remove them later with: node scripts/test-images.mjs remove`);
} else if (cmd === "remove") {
  const store = await readStore();
  let removed = 0;
  for (const [k, v] of Object.entries(store)) {
    if (typeof v === "string" && v.startsWith("/images/test/")) {
      delete store[k];
      removed++;
    }
  }
  await writeStore(store);
  await fs.rm(TEST_DIR, { recursive: true, force: true });
  console.log(`removed ${removed} seeded keys + deleted public/images/test/ — placeholders restored`);
} else {
  console.log("usage: node scripts/test-images.mjs seed|remove");
  process.exit(1);
}
