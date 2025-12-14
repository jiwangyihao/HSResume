import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import YAML from "yaml";

const repoRoot = process.cwd();

const isStrict = process.argv.includes("--strict") || process.env.BADGES_STRICT === "1";
const isForce = process.argv.includes("--force") || process.env.BADGES_FORCE === "1";

const OUT_DIR = path.join(repoRoot, "public", "badges");
const MANIFEST_FILE = path.join(OUT_DIR, "manifest.json");
const META_FILE = path.join(OUT_DIR, "badges.meta.json");
const SIZES_FILE = path.join(OUT_DIR, "sizes.json");

// BadgePills renders svg badges at h-5 (20px). Reserve width to avoid layout shifts.
const BADGE_RENDER_HEIGHT_PX = 20;
const ATOMGIT_WIDTH_ADJUST_PX = 4;

function extractFrontmatter(markdown) {
  // Expect standard frontmatter at file start:
  // ---\n...yaml...\n---\n
  if (!markdown.startsWith("---")) return null;
  const end = markdown.indexOf("\n---", 3);
  if (end === -1) return null;
  const fm = markdown.slice(3, end).replace(/^\r?\n/, "");
  return fm;
}

function readAllExisting(paths) {
  const items = [];
  for (const p of paths) {
    if (!fs.existsSync(p)) continue;
    items.push({ path: p, text: fs.readFileSync(p, "utf8") });
  }
  return items;
}

function sha256Hex(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function safeHostDir(url) {
  try {
    return new URL(url).host.replace(/[^a-zA-Z0-9.-]/g, "_");
  } catch {
    return "invalid";
  }
}

function guessExt(contentType, buffer) {
  const ct = (contentType || "").toLowerCase();
  if (ct.includes("image/svg+xml")) return ".svg";
  if (ct.includes("image/png")) return ".png";
  if (ct.includes("image/webp")) return ".webp";
  if (ct.includes("image/avif")) return ".avif";
  if (ct.includes("image/jpeg")) return ".jpg";

  // Fallback sniffing
  const head = buffer.subarray(0, 256).toString("utf8");
  if (head.includes("<svg")) return ".svg";
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50) return ".png";
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF") return ".webp";

  return ".bin";
}

function parseSvgViewBoxSize(svgText) {
  // IMPORTANT: only inspect the *outermost* <svg ...> tag.
  // Some badge providers (e.g. AtomGit) embed another <svg> with its own viewBox.
  // If we regex the whole text, we may accidentally pick the nested viewBox (61x16)
  // instead of the real outer size (e.g. 116x20).
  const svgTag = svgText.match(/<svg\b[^>]*>/i)?.[0] ?? "";

  // Prefer viewBox: viewBox="minX minY w h"
  const m = svgTag.match(/viewBox\s*=\s*['\"]\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*['\"]/i);
  if (m) {
    const w = Number.parseFloat(m[1]);
    const h = Number.parseFloat(m[2]);
    if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) return { w, h };
  }

  // Fallback: width/height attributes
  const mw = svgTag.match(/\bwidth\s*=\s*['\"]\s*([\d.]+)(?:px)?\s*['\"]/i);
  const mh = svgTag.match(/\bheight\s*=\s*['\"]\s*([\d.]+)(?:px)?\s*['\"]/i);
  if (mw && mh) {
    const w = Number.parseFloat(mw[1]);
    const h = Number.parseFloat(mh[1]);
    if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) return { w, h };
  }

  return null;
}

function patchAtomgitSvgWidth(svgText) {
  // AtomGit badges sometimes have slightly off layout when embedded.
  // We apply a small width shrink to improve fit and avoid unexpected wrapping.
  // Make it idempotent by marking the outer <svg>.

  const outerTagMatch = svgText.match(/<svg\b[^>]*>/i);
  if (!outerTagMatch) return { patched: false, svgText };

  const outerTag = outerTagMatch[0];
  if (/data-hsresume-width-adjusted\s*=\s*['\"]atomgit-5['\"]/i.test(outerTag)) {
    return { patched: false, svgText };
  }

  const widthMatch = outerTag.match(/\bwidth\s*=\s*['\"]\s*([\d.]+)(?:px)?\s*['\"]/i);
  if (!widthMatch) return { patched: false, svgText };

  const rawWidth = Number.parseFloat(widthMatch[1]);
  if (!Number.isFinite(rawWidth) || rawWidth <= 0) return { patched: false, svgText };

  const newWidth = Math.max(1, rawWidth - ATOMGIT_WIDTH_ADJUST_PX);

  // Replace width value and inject marker attribute.
  const newOuterTag = outerTag
    .replace(widthMatch[0], `width=\"${newWidth}\"`)
    .replace(/<svg\b/i, '<svg data-hsresume-width-adjusted="atomgit-5"');

  const patched = svgText.replace(outerTag, newOuterTag);
  return { patched: true, svgText: patched };
}

function maybePatchAtomgitCachedSvgFile(filePath, hostDir) {
  if (hostDir !== "atomgit.com") return false;
  if (!String(filePath).toLowerCase().endsWith(".svg")) return false;
  try {
    const text = fs.readFileSync(filePath, "utf8");
    const { patched, svgText } = patchAtomgitSvgWidth(text);
    if (!patched) return false;
    fs.writeFileSync(filePath, svgText, "utf8");
    return true;
  } catch {
    return false;
  }
}

function parsePngSize(buffer) {
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (buffer.length < 24) return null;
  if (!(buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47)) {
    return null;
  }

  // IHDR chunk type starts at offset 12.
  const type = buffer.subarray(12, 16).toString("ascii");
  if (type !== "IHDR") return null;

  const w = buffer.readUInt32BE(16);
  const h = buffer.readUInt32BE(20);
  if (w > 0 && h > 0) return { w, h };
  return null;
}

function reservedBadgeSizeFromBuffer(buffer, ext) {
  try {
    if (ext === ".svg") {
      const text = buffer.toString("utf8");
      const size = parseSvgViewBoxSize(text);
      if (!size) return null;
      const ratio = size.w / size.h;
      const w = Math.max(1, Math.round(ratio * BADGE_RENDER_HEIGHT_PX));
      return { w, h: BADGE_RENDER_HEIGHT_PX };
    }

    if (ext === ".png") {
      const size = parsePngSize(buffer);
      if (!size) return null;
      const ratio = size.w / size.h;
      const w = Math.max(1, Math.round(ratio * BADGE_RENDER_HEIGHT_PX));
      return { w, h: BADGE_RENDER_HEIGHT_PX };
    }

    return null;
  } catch {
    return null;
  }
}

function extFromFileName(name) {
  const m = String(name).toLowerCase().match(/(\.[a-z0-9]+)$/);
  return m ? m[1] : "";
}

function reservedBadgeSizeFromFile(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    const ext = extFromFileName(filePath);
    return reservedBadgeSizeFromBuffer(buf, ext);
  } catch {
    return null;
  }
}

async function fetchBuffer(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "hsresume-build/1.0 (+https://github.com)",
        accept: "image/svg+xml,image/*,*/*",
      },
    });

    const ab = await res.arrayBuffer();
    const buf = Buffer.from(ab);

    return {
      ok: res.ok,
      status: res.status,
      contentType: res.headers.get("content-type") || "",
      buffer: buf,
    };
  } finally {
    clearTimeout(t);
  }
}

async function withConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let i = 0;

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      results[idx] = await worker(items[idx], idx);
    }
  });

  await Promise.all(runners);
  return results;
}

function collectSvgBadgeUrls(value) {
  // Schema-driven: Badge objects live in frontmatter (resume.highlights, project.highlights, etc).
  // We still traverse generically to avoid hardcoding every path.
  const urls = new Set();
  const stack = [value];

  while (stack.length) {
    const cur = stack.pop();
    if (!cur) continue;

    if (Array.isArray(cur)) {
      for (const x of cur) stack.push(x);
      continue;
    }

    if (typeof cur !== "object") continue;

    const obj = cur;
    // Badge: { kind: 'svg', url: string }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kind = (obj).kind;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const url = (obj).url;

    if (kind === "svg" && typeof url === "string" && url.startsWith("http")) {
      urls.add(url);
    }

    for (const v of Object.values(obj)) {
      if (v && (typeof v === "object" || Array.isArray(v))) stack.push(v);
    }
  }

  return Array.from(urls);
}

async function main() {
  const candidates = [
    path.join(repoRoot, "content/resume/zh.md"),
    path.join(repoRoot, "content/resume/zh.sample.md"),
    path.join(repoRoot, "content/resume/en.md"),
    path.join(repoRoot, "content/resume/en.sample.md"),
  ];

  const files = readAllExisting(candidates);
  if (files.length === 0) {
    console.warn("[cache-badges] No resume markdown found (zh/en, real or sample). Skipping.");
    return;
  }

  const frontmatters = [];
  for (const f of files) {
    const fmRaw = extractFrontmatter(f.text);
    if (!fmRaw) continue;
    try {
      frontmatters.push({ path: f.path, meta: YAML.parse(fmRaw) });
    } catch (e) {
      const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
      const out = `[cache-badges] Failed to parse frontmatter YAML: ${path.relative(repoRoot, f.path)} (${msg})`;
      if (isStrict) throw new Error(out);
      console.warn(out);
    }
  }

  if (frontmatters.length === 0) {
    console.warn("[cache-badges] No frontmatter found in resume markdown. Skipping.");
    return;
  }

  const urls = collectSvgBadgeUrls(frontmatters.map((x) => x.meta));
  if (urls.length === 0) {
    console.log("[cache-badges] No svg badges found in frontmatter. Skipping.");
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Load existing manifest to keep stable mappings when not forcing.
  /** @type {Record<string, string>} */
  let manifest = {};
  if (!isForce && fs.existsSync(MANIFEST_FILE)) {
    try {
      manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, "utf8"));
    } catch {
      manifest = {};
    }
  }

  /** @type {Record<string, {w:number, h:number}>} */
  let sizes = {};
  if (!isForce && fs.existsSync(SIZES_FILE)) {
    try {
      sizes = JSON.parse(fs.readFileSync(SIZES_FILE, "utf8"));
    } catch {
      sizes = {};
    }
  }

  console.log(`[cache-badges] Found ${urls.length} svg badge URL(s). Caching into ${path.relative(repoRoot, OUT_DIR)}.`);

  const results = await withConcurrency(urls, 6, async (url) => {
    const hostDir = safeHostDir(url);
    const id = sha256Hex(url).slice(0, 16);
    const outBaseDir = path.join(OUT_DIR, hostDir);
    fs.mkdirSync(outBaseDir, { recursive: true });

    // If manifest already points to a file that exists, keep it.
    const mapped = manifest[url];
    if (!isForce && typeof mapped === "string" && mapped.startsWith(`/badges/${hostDir}/`)) {
      const fileName = mapped.split("/").pop();
      if (fileName && fs.existsSync(path.join(outBaseDir, fileName))) {
        // Apply host-specific patch for cached files (idempotent).
        maybePatchAtomgitCachedSvgFile(path.join(outBaseDir, fileName), hostDir);

        // Always recompute from the cached file to avoid stale/incorrect entries.
        const reserved = reservedBadgeSizeFromFile(path.join(outBaseDir, fileName));
        if (reserved) sizes[url] = reserved;
        return { url, ok: true, skipped: true, publicPath: mapped };
      }
    }

    // Also support legacy presence by prefix.
    const existing = fs
      .readdirSync(outBaseDir, { withFileTypes: true })
      .filter((d) => d.isFile() && d.name.startsWith(id + "."))
      .map((d) => d.name)[0];

    if (!isForce && existing) {
      const publicPath = `/badges/${hostDir}/${existing}`;
      manifest[url] = publicPath;

      // Apply host-specific patch for cached files (idempotent).
      maybePatchAtomgitCachedSvgFile(path.join(outBaseDir, existing), hostDir);

      // Always recompute from the cached file to avoid stale/incorrect entries.
      const reserved = reservedBadgeSizeFromFile(path.join(outBaseDir, existing));
      if (reserved) sizes[url] = reserved;
      return { url, ok: true, skipped: true, publicPath };
    }

    try {
      const { ok, status, contentType, buffer } = await fetchBuffer(url);

      if (!ok) {
        const msg = `[cache-badges] Fetch failed: HTTP ${status} for ${url}`;
        if (isStrict) throw new Error(msg);
        console.warn(msg);
        return { url, ok: false, status };
      }

      const ct = (contentType || "").toLowerCase();
      if (ct.includes("application/json") || ct.includes("text/html")) {
        const msg = `[cache-badges] Unexpected content-type (${contentType}) for ${url}`;
        if (isStrict) throw new Error(msg);
        console.warn(msg);
        return { url, ok: false, status, contentType };
      }

      const ext = guessExt(contentType, buffer);
      const fileName = `${id}${ext}`;
      const outFile = path.join(outBaseDir, fileName);

      // Host-specific patch (AtomGit width tweak), applied before persisting.
      let finalBuffer = buffer;
      if (hostDir === "atomgit.com" && ext === ".svg") {
        try {
          const text = buffer.toString("utf8");
          const { svgText } = patchAtomgitSvgWidth(text);
          finalBuffer = Buffer.from(svgText, "utf8");
        } catch {
          finalBuffer = buffer;
        }
      }

      // Clean up previous variants for this id.
      for (const d of fs.readdirSync(outBaseDir, { withFileTypes: true })) {
        if (d.isFile() && d.name.startsWith(id + ".") && d.name !== fileName) {
          fs.rmSync(path.join(outBaseDir, d.name));
        }
      }

      fs.writeFileSync(outFile, finalBuffer);

      const publicPath = `/badges/${hostDir}/${fileName}`;
      manifest[url] = publicPath;

      const reserved = reservedBadgeSizeFromBuffer(finalBuffer, ext);
      if (reserved) sizes[url] = reserved;

      return { url, ok: true, skipped: false, publicPath, bytes: buffer.length };
    } catch (e) {
      const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
      if (isStrict) throw (e instanceof Error ? e : new Error(msg));
      console.warn(`[cache-badges] Fetch error for ${url}: ${msg}`);
      return { url, ok: false, error: msg };
    }
  });

  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  fs.writeFileSync(SIZES_FILE, JSON.stringify(sizes, null, 2) + "\n", "utf8");
  fs.writeFileSync(
    META_FILE,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        strict: isStrict,
        force: isForce,
        count: urls.length,
        ok: results.filter((r) => r && r.ok).length,
        skipped: results.filter((r) => r && r.ok && r.skipped).length,
        failed: results.filter((r) => r && !r.ok).length,
      },
      null,
      2
    ) + "\n",
    "utf8"
  );

  console.log(`[cache-badges] Wrote ${path.relative(repoRoot, MANIFEST_FILE)}`);
}

await main();
