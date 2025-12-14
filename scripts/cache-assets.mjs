const args = process.argv.slice(2);
const strict = args.includes("--strict");

function withStrict(script) {
  return strict ? [script, "--strict"] : [script];
}

async function run(scriptRelPath) {
  const { spawn } = await import("node:child_process");
  const path = await import("node:path");

  const scriptPath = path.join(process.cwd(), scriptRelPath);
  const argv = withStrict(scriptPath);

  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, argv, {
      stdio: "inherit",
      env: process.env,
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${scriptRelPath} exited with code ${code}`));
    });
  });
}

// Keep these in a single place so build/dev/generate behave consistently.
await run("scripts/optimize-avatar.mjs");
await run("scripts/cache-badges.mjs");
await run("scripts/cache-github-heatmap.mjs");
