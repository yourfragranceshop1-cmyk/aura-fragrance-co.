/**
 * Custom Vercel Build Script
 * 
 * Bridges the gap between TanStack Start's Vite plugin output
 * (dist/client + dist/server) and Vercel's Build Output API v3.
 * 
 * Output structure:
 *   .vercel/output/
 *   ├── config.json              ← routing rules
 *   ├── static/                  ← client assets (from dist/client)
 *   └── functions/
 *       └── ssr.func/            ← serverless function
 *           ├── .vc-config.json  ← runtime config
 *           ├── index.mjs        ← entry (adapts fetch handler)
 *           └── server/          ← server bundle (from dist/server)
 */

import { execSync } from "child_process";
import { cpSync, mkdirSync, writeFileSync, existsSync, rmSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const OUTPUT = join(ROOT, ".vercel", "output");

// ── 1. Run vite build ────────────────────────────────────────────────
console.log("\n🔨 Running vite build...\n");
execSync("npx vite build", { stdio: "inherit", env: { ...process.env, VERCEL: "1" } });

// ── 2. Clean previous output ─────────────────────────────────────────
if (existsSync(OUTPUT)) {
  rmSync(OUTPUT, { recursive: true, force: true });
}

// ── 3. Create directory structure ────────────────────────────────────
const STATIC_DIR = join(OUTPUT, "static");
const FUNC_DIR = join(OUTPUT, "functions", "ssr.func");
mkdirSync(STATIC_DIR, { recursive: true });
mkdirSync(FUNC_DIR, { recursive: true });

// ── 4. Copy client assets → static ──────────────────────────────────
console.log("\n📦 Copying client assets to .vercel/output/static/...");
cpSync(join(ROOT, "dist", "client"), STATIC_DIR, { recursive: true });

// ── 5. Copy server bundle → function ────────────────────────────────
console.log("📦 Copying server bundle to .vercel/output/functions/ssr.func/server/...");
cpSync(join(ROOT, "dist", "server"), join(FUNC_DIR, "server"), { recursive: true });

// ── 6. Create function entry point ──────────────────────────────────
console.log("⚡ Creating serverless function entry point...");
writeFileSync(
  join(FUNC_DIR, "index.mjs"),
  `import server from "./server/server.js";

export default async function handler(request) {
  return server.fetch(request, {}, {});
}
`
);

// ── 7. Create function config (.vc-config.json) ─────────────────────
writeFileSync(
  join(FUNC_DIR, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs20.x",
      handler: "index.mjs",
      launcherType: "Nodejs",
      supportsResponseStreaming: true,
    },
    null,
    2
  )
);

// ── 8. Create Vercel output config.json ─────────────────────────────
console.log("📝 Writing .vercel/output/config.json...\n");
writeFileSync(
  join(OUTPUT, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        // Serve static assets first (JS, CSS, images, etc.)
        { handle: "filesystem" },
        // All other requests go to the SSR function
        { src: "/(.*)", dest: "/ssr" },
      ],
    },
    null,
    2
  )
);

console.log("✅ Vercel Build Output API structure created successfully!");
console.log("   .vercel/output/static/     ← client assets");
console.log("   .vercel/output/functions/  ← SSR serverless function\n");
