/**
 * Generates extension icons from a source PNG.
 * Usage: bun run scripts/generate-icons.ts [source.png]
 * Defaults to app.png in the project root.
 * Requires ffmpeg to be installed.
 */

const src = process.argv[2] ?? "app.png";
const OUT_DIR = "public/icons";
const SIZES = [16, 32, 48, 128] as const;

const srcFile = Bun.file(src);
if (!(await srcFile.exists())) {
  console.error(`Source file not found: ${src}`);
  process.exit(1);
}

await Bun.$`mkdir -p ${OUT_DIR}`;

for (const size of SIZES) {
  const out = `${OUT_DIR}/icon${size}.png`;
  await Bun.$`ffmpeg -i ${src} -vf scale=${size}:${size} -frames:v 1 -update 1 ${out} -y 2>/dev/null`;
  console.log(`  icon${size}.png`);
}

console.log(`\nIcons written to ${OUT_DIR}/`);
