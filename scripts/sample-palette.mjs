import sharp from "sharp";

const DIR =
  "C:\\Users\\beehi\\OneDrive - Community College of Rhode Island\\Pictures\\Kerry's website logo\\";

function toHex(r, g, b) {
  return (
    "#" +
    [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase()
  );
}

async function pixel(file, x, y) {
  const { data, info } = await sharp(DIR + file)
    .extract({ left: x - 2, top: y - 2, width: 5, height: 5 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let r = 0,
    g = 0,
    b = 0;
  const n = data.length / info.channels;
  for (let i = 0; i < data.length; i += info.channels) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  return toHex(Math.round(r / n), Math.round(g / n), Math.round(b / n));
}

const mode = process.argv[2];

if (mode === "nb") {
  const labels = ["Sage Green", "Cream", "Warm Beige", "Soft Gold", "Charcoal"];
  const y = 810;
  for (let i = 0; i < 5; i++) {
    const x = 470 + 28 + i * 56;
    console.log(labels[i], x, await pixel("NaturalBeauty.png", x, y));
  }
}

if (mode === "pf") {
  const labels = ["Olive", "Pink", "Orange", "Peach", "Cream", "Dark Olive-Brown"];
  const y = 700;
  const w = 340 / 6;
  for (let i = 0; i < 6; i++) {
    const x = Math.round(540 + w / 2 + i * w);
    console.log(labels[i], x, await pixel("perfectedflower.png", x, y));
  }
}
