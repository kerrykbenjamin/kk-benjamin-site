import sharp from "sharp";

const DIR =
  "C:\\Users\\beehi\\OneDrive - Community College of Rhode Island\\Pictures\\Kerry's website logo\\";
const OUT = "public\\images\\_crop-check.png";

const file = process.argv[2];
const [left, top, width, height] = process.argv.slice(3).map(Number);

await sharp(DIR + file)
  .extract({ left, top, width, height })
  .png()
  .toFile(OUT);

console.log("wrote", OUT);
