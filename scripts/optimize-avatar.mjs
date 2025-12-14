import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const isStrict = process.argv.includes("--strict") || process.env.AVATAR_STRICT === "1";

const SOURCE_CANDIDATES = [
  path.join(repoRoot, "public", "avatar.png"),
  path.join(repoRoot, "public", "avatar.jpg"),
  path.join(repoRoot, "public", "avatar.jpeg"),
];

// The avatar element is capped by Tailwind classes in ResumeHeader:
// - max-w-32  => 128px
// - md:max-w-60 => 240px
// We generate 1x and 2x for both breakpoints.
const TARGET_SIZES = [128, 256, 240, 480];

const OUT_DIR = path.join(repoRoot, "public", "avatars");

function pickFirstExisting(paths) {
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function main() {
  const srcPath = pickFirstExisting(SOURCE_CANDIDATES);
  if (!srcPath) {
    console.log(
      "[optimize-avatar] No public/avatar.(png|jpg|jpeg) found. Skipping."
    );
    return;
  }

  let sharp;
  try {
    // sharp is available via @nuxt/image dependency.
    const mod = await import("sharp");
    sharp = mod.default || mod;
  } catch (e) {
    const msg =
      e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    const hint =
      "sharp not available. Ensure dependencies are installed (pnpm install).";
    if (isStrict) throw new Error(`[optimize-avatar] ${msg}. ${hint}`);
    console.warn(`[optimize-avatar] ${msg}. ${hint} Skipping.`);
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const srcRel = path.relative(repoRoot, srcPath);
  console.log(`[optimize-avatar] Using source: ${srcRel}`);

  // Keep encodes deterministic.
  const encodeJobs = [];

  for (const size of TARGET_SIZES) {
    const base = path.join(OUT_DIR, `avatar-${size}`);

    // AVIF
    encodeJobs.push(
      sharp(srcPath)
        .resize(size, size, { fit: "cover" })
        .avif({ quality: 45, effort: 6 })
        .toFile(`${base}.avif`)
    );

    // WebP
    encodeJobs.push(
      sharp(srcPath)
        .resize(size, size, { fit: "cover" })
        .webp({ quality: 82 })
        .toFile(`${base}.webp`)
    );
  }

  try {
    await Promise.all(encodeJobs);
  } catch (e) {
    const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    if (isStrict) throw new Error(`[optimize-avatar] Failed: ${msg}`);
    console.warn(`[optimize-avatar] Failed: ${msg}. Keeping any existing outputs.`);
    return;
  }

  const meta = {
    generatedAt: new Date().toISOString(),
    source: `/${path.basename(srcPath)}`,
    sizes: TARGET_SIZES,
    formats: ["avif", "webp"],
  };
  fs.writeFileSync(
    path.join(OUT_DIR, "meta.json"),
    JSON.stringify(meta, null, 2) + "\n",
    "utf8"
  );

  console.log(
    `[optimize-avatar] Wrote ${path.relative(repoRoot, OUT_DIR)} (and meta.json)`
  );
}

await main();
