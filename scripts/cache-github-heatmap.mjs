import fs from "node:fs";
import path from "node:path";
import colors from "tailwindcss/colors";
import { formatHex, parse } from "culori";
import YAML from "yaml";

const repoRoot = process.cwd();
const isStrict = process.argv.includes("--strict") || process.env.HEATMAP_STRICT === "1";

function readFirstExisting(paths) {
  for (const p of paths) {
    if (fs.existsSync(p)) return fs.readFileSync(p, "utf8");
  }
  return null;
}

function extractFrontmatter(markdown) {
  // Expect standard frontmatter at file start:
  // ---\n...yaml...\n---\n
  if (!markdown.startsWith("---")) return null;
  const end = markdown.indexOf("\n---", 3);
  if (end === -1) return null;
  const fm = markdown.slice(3, end).replace(/^\r?\n/, "");
  return fm;
}

function resolveHexColor600(colorName) {
  const fallback = colors.sky[600];
  const palette = colors[colorName];

  let value = fallback;

  if (palette && typeof palette === "object" && "600" in palette) {
    value = palette[600];
  } else if (typeof palette === "string") {
    value = palette;
  }

  if (typeof value !== "string") return fallback;

  // Tailwind v4 exports many colors as OKLCH strings (e.g. "oklch(58.8% 0.158 241.966)").
  // ghchart requires a hex color string.
  if (value.startsWith("#")) return value;

  const parsed = parse(value);
  const hex = parsed ? formatHex(parsed) : null;
  return hex || fallback;
}

async function fetchText(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        // Some services are picky; set a UA to be polite.
        "user-agent": "hsresume-build/1.0 (+https://github.com)",
        accept: "image/svg+xml,text/plain,*/*",
      },
    });

    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  const candidates = [
    path.join(repoRoot, "content/resume/zh.md"),
    path.join(repoRoot, "content/resume/zh.sample.md"),
    path.join(repoRoot, "content/resume/en.md"),
    path.join(repoRoot, "content/resume/en.sample.md"),
  ];

  const md = readFirstExisting(candidates);
  if (!md) {
    console.warn(
      "[cache-github-heatmap] No resume markdown found (zh/en, real or sample). Skipping."
    );
    return;
  }

  const fmRaw = extractFrontmatter(md);
  if (!fmRaw) {
    console.warn(
      "[cache-github-heatmap] No frontmatter found in resume markdown. Skipping."
    );
    return;
  }

  let fm;
  try {
    fm = YAML.parse(fmRaw);
  } catch (e) {
    console.warn(
      `[cache-github-heatmap] Failed to parse frontmatter YAML. Skipping. Error: ${
        e instanceof Error ? e.message : String(e)
      }`
    );
    return;
  }

  const user = fm?.github?.user;
  if (!user || typeof user !== "string") {
    console.warn(
      "[cache-github-heatmap] frontmatter.github.user missing; skipping heatmap cache."
    );
    return;
  }

  const colorName =
    (typeof fm?.colors?.github === "string" && fm.colors.github) || "sky";
  const hex = resolveHexColor600(colorName);
  const hexNoHash = String(hex).replace(/^#/, "");

  const url = `https://ghchart.rshah.org/${hexNoHash}/${encodeURIComponent(user)}`;
  const outFile = path.join(repoRoot, "public/github-heatmap.svg");
  const metaFile = path.join(repoRoot, "public/github-heatmap.meta.json");

  console.log(
    `[cache-github-heatmap] Fetching GitHub heatmap SVG for ${user} (color: ${colorName} -> ${hex})`
  );

  try {
    const { ok, status, text } = await fetchText(url);

    if (!ok) {
      const msg = `[cache-github-heatmap] Fetch failed: HTTP ${status}.`;
      if (isStrict) throw new Error(msg);
      console.warn(`${msg} Keeping existing file if present.`);
      return;
    }

    if (!text.includes("<svg")) {
      const msg =
        "[cache-github-heatmap] Response does not look like SVG (missing <svg).";
      if (isStrict) throw new Error(msg);
      console.warn(`${msg} Keeping existing file if present.`);
      return;
    }

    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, text, "utf8");
    fs.writeFileSync(
      metaFile,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          sourceUrl: url,
          user,
          colorName,
          hex,
        },
        null,
        2
      ) + "\n",
      "utf8"
    );

    console.log(`[cache-github-heatmap] Wrote ${path.relative(repoRoot, outFile)}`);
  } catch (e) {
    const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    if (isStrict) {
      throw (e instanceof Error ? e : new Error(msg));
    }
    console.warn(`[cache-github-heatmap] Fetch error: ${msg}. Keeping existing file if present.`);
  }
}

await main();
