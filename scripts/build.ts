import { build } from "bun";
import sveltePlugin from "bun-plugin-svelte";

const isProduction = process.argv.includes("--production");

console.log(
  `[shush] Building (${isProduction ? "production" : "development"})...`,
);

// Generate placeholder icons if they don't exist yet
if (!(await Bun.file("public/icons/icon16.png").exists())) {
  console.log("[shush] Generating placeholder icons...");
  await import("./generate-icons.ts");
}

await Bun.$`rm -rf dist && mkdir -p dist/icons`;

// Build popup (Svelte app)
const popupBuild = await build({
  entrypoints: ["src/popup/popup.html"],
  outdir: "dist",
  minify: isProduction,
  sourcemap: isProduction ? "none" : "inline",
  plugins: [sveltePlugin],
});

if (!popupBuild.success) {
  console.error("[shush] Popup build failed:");
  for (const log of popupBuild.logs) console.error(log);
  process.exit(1);
}

// Build service worker (single bundled file, no module imports at runtime)
const swBuild = await build({
  entrypoints: ["src/background/service-worker.ts"],
  outdir: "dist",
  target: "browser",
  minify: isProduction,
  sourcemap: isProduction ? "none" : "inline",
});

if (!swBuild.success) {
  console.error("[shush] Service worker build failed:");
  for (const log of swBuild.logs) console.error(log);
  process.exit(1);
}

// Copy manifest
await Bun.write("dist/manifest.json", Bun.file("manifest.json"));

// Copy icons
for await (const file of new Bun.Glob("public/icons/*").scan({
  onlyFiles: true,
})) {
  await Bun.write(`dist/icons/${file.split("/").pop()}`, Bun.file(file));
}

console.log("[shush] Build complete → dist/");
