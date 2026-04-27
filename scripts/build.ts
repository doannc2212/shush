import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from "node:fs";
import { join } from "node:path";
import { build } from "bun";
import sveltePlugin from "bun-plugin-svelte";

const isProduction = process.argv.includes("--production");

console.log(
  `[shush] Building (${isProduction ? "production" : "development"})...`,
);

// Generate placeholder icons if they don't exist yet
if (!existsSync("public/icons/icon16.png")) {
  console.log("[shush] Generating placeholder icons...");
  await import("./generate-icons.ts");
}

await Bun.$`rm -rf dist`;
mkdirSync("dist/icons", { recursive: true });

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
copyFileSync("manifest.json", "dist/manifest.json");

// Copy icons
if (existsSync("public/icons")) {
  for (const file of readdirSync("public/icons")) {
    const src = join("public/icons", file);
    if (statSync(src).isFile()) {
      copyFileSync(src, join("dist/icons", file));
    }
  }
}

console.log("[shush] Build complete → dist/");
