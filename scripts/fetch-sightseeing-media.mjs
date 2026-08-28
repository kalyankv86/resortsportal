/**
 * Downloads the freely-licensed sightseeing photographs listed in
 * sightseeing-media.json, normalises them to <=1600px wide JPEG and writes them
 * to OUT_DIR (default /opt/resorts/media/library). Idempotent.
 *
 *   node scripts/fetch-sightseeing-media.mjs [OUT_DIR]
 *
 * Requires ImageMagick `convert` (or `magick`) on PATH for res/encode; falls
 * back to writing the original bytes if neither is available.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = process.argv[2] || "/opt/resorts/media/library";
const UA = "CWETR-media-fetch/1.0 (https://wellness.cutm.ac.in; wellness@cutm.ac.in)";

const { items } = JSON.parse(
  readFileSync(join(here, "sightseeing-media.json"), "utf8"),
);

function magick(args) {
  for (const bin of ["magick", "convert"]) {
    try {
      execFileSync(bin, args, { stdio: "pipe" });
      return true;
    } catch {
      /* try next */
    }
  }
  return false;
}

mkdirSync(OUT_DIR, { recursive: true });

for (const it of items) {
  const dest = join(OUT_DIR, it.file);
  const res = await fetch(it.url, { headers: { "User-Agent": UA } });
  if (!res.ok) {
    console.error(`✗ ${it.slug}: HTTP ${res.status} for ${it.url}`);
    process.exitCode = 1;
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const tmp = join(tmpdir(), `ss-${it.slug}.src`);
  writeFileSync(tmp, buf);

  const ok = magick([
    tmp,
    "-auto-orient",
    "-resize",
    "1600x1600>",
    "-quality",
    "82",
    "-strip",
    dest,
  ]);
  if (!ok) {
    writeFileSync(dest, buf);
    console.log(`• ${it.slug}: wrote original (no ImageMagick) -> ${dest}`);
  } else {
    console.log(`✓ ${it.slug} -> ${dest}`);
  }
}

console.log(`\nDone. ${existsSync(OUT_DIR) ? OUT_DIR : "?"}`);
