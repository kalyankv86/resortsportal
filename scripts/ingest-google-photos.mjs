#!/usr/bin/env node
/**
 * CWETR media ingest — Official CUTM Google Photos album → local media library.
 *
 * "No cloud dependency": the Google Photos album is the SOURCE. This script
 * renders the shared album in headless Chrome, collects every photo's base URL,
 * downloads each at high resolution to the local media library, and writes a
 * manifest. Production then serves only the local copies.
 *
 * Usage:
 *   node scripts/ingest-google-photos.mjs \
 *     --album "https://photos.app.goo.gl/XXXX" \
 *     --out   /opt/resorts/media/library \
 *     [--width 2560] [--chrome "/path/to/chrome"]
 *
 * Re-runnable: photos already downloaded (by id) are skipped.
 */

import { spawn } from "node:child_process";
import { mkdir, writeFile, readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).join(" ").split("--").filter(Boolean).map((s) => {
    const [k, ...v] = s.trim().split(/\s+/);
    return [k, v.join(" ") || true];
  }),
);

const ALBUM = args.album;
const OUT = args.out || "./media-library";
const WIDTH = Number(args.width || 2560);
const CHROME =
  args.chrome ||
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9250 + Math.floor(Math.random() * 200);

if (!ALBUM) {
  console.error("--album <share url> is required");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cdp() {
  const child = spawn(
    CHROME,
    [
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      `--remote-debugging-port=${PORT}`,
      "--window-size=1400,2200",
      "about:blank",
    ],
    { stdio: "ignore", detached: true },
  );
  child.unref();
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://localhost:${PORT}/json/version`);
      if (r.ok) break;
    } catch {}
    await sleep(250);
  }
  const target = await (
    await fetch(`http://localhost:${PORT}/json/new?about:blank`, { method: "PUT" })
  ).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res) => (ws.onopen = res));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) {
      pending.get(d.id)(d.result);
      pending.delete(d.id);
    }
  };
  const send = (method, params = {}) =>
    new Promise((res) => {
      const i = ++id;
      pending.set(i, res);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  return { send, kill: () => { try { process.kill(-child.pid); } catch {} ws.close(); } };
}

function baseOf(url) {
  // strip the "=w108-h72-no" style size directive
  return url.split("=")[0];
}
function idOf(base) {
  // last path segment, trimmed — stable per photo
  const seg = base.split("/").pop() || base;
  return seg.slice(0, 40).replace(/[^A-Za-z0-9_-]/g, "");
}

async function collectPhotoBases(send) {
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.navigate", { url: ALBUM });
  await sleep(9000);

  const seen = new Set();
  let stable = 0;
  for (let pass = 0; pass < 200 && stable < 6; pass++) {
    const res = await send("Runtime.evaluate", {
      expression: `JSON.stringify([...document.querySelectorAll('img')].map(i=>i.src).filter(s=>/googleusercontent\\.com\\/pw\\//.test(s)))`,
      returnByValue: true,
    });
    const before = seen.size;
    for (const u of JSON.parse(res.result.value || "[]")) seen.add(baseOf(u));
    stable = seen.size === before ? stable + 1 : 0;
    // Google Photos scrolls an inner container, not window — scroll the
    // deepest scrollable element as well as the window / last image.
    await send("Runtime.evaluate", {
      expression: `(()=>{
        window.scrollBy(0, 2000);
        document.scrollingElement && (document.scrollingElement.scrollTop += 2000);
        const sc=[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+400 && /auto|scroll/.test(getComputedStyle(e).overflowY));
        sc.forEach(e=>e.scrollTop=e.scrollHeight);
        const imgs=document.querySelectorAll('img'); imgs.length && imgs[imgs.length-1].scrollIntoView();
      })()`,
    });
    await sleep(750);
  }
  const url = await send("Runtime.evaluate", { expression: "location.href", returnByValue: true });
  return { bases: [...seen], resolved: url.result.value };
}

async function download(base, dest) {
  let lastErr;
  for (let attempt = 0; attempt < 6; attempt++) {
    if (attempt) await sleep(1500 * 2 ** attempt); // 3s, 6s, 12s, 24s, 48s
    try {
      const r = await fetch(`${base}=w${WIDTH}`, {
        headers: { "User-Agent": "Mozilla/5.0 CWETR-ingest" },
      });
      if (r.status === 429 || r.status === 503) { lastErr = new Error(`HTTP ${r.status}`); continue; }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const buf = Buffer.from(await r.arrayBuffer());
      await writeFile(dest, buf);
      return buf.length;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

function jpegSize(buf) {
  // minimal SOF0/2 scan
  let o = 2;
  while (o < buf.length) {
    if (buf[o] !== 0xff) { o++; continue; }
    const marker = buf[o + 1];
    const len = buf.readUInt16BE(o + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(o + 5), width: buf.readUInt16BE(o + 7) };
    }
    o += 2 + len;
  }
  return { width: 0, height: 0 };
}

(async () => {
  await mkdir(OUT, { recursive: true });
  console.log(`▶ rendering album…`);
  const { send, kill } = await cdp();
  let bases, resolved;
  try {
    ({ bases, resolved } = await collectPhotoBases(send));
  } finally {
    kill();
  }
  console.log(`▶ found ${bases.length} photos`);
  console.log(`  resolved: ${resolved}`);

  const manifestPath = join(OUT, "manifest.json");
  const prev = existsSync(manifestPath)
    ? JSON.parse(await readFile(manifestPath, "utf8"))
    : { album: ALBUM, resolved, generatedAt: null, items: [] };
  const byId = new Map(prev.items.map((i) => [i.id, i]));

  let done = 0;
  for (const base of bases) {
    const id = idOf(base);
    const file = `${id}.jpg`;
    const dest = join(OUT, file);
    if (existsSync(dest) && byId.has(id)) { done++; continue; }
    try {
      const bytes = await download(base, dest);
      const { width, height } = jpegSize(await readFile(dest));
      byId.set(id, { id, file, base, width, height, bytes, category: null });
      done++;
      process.stdout.write(`\r▶ downloaded ${done}/${bases.length}`);
      await sleep(900); // be gentle with googleusercontent
    } catch (e) {
      console.warn(`\n! ${id}: ${e.message}`);
    }
  }
  process.stdout.write("\n");

  const items = [...byId.values()];
  await writeFile(
    manifestPath,
    JSON.stringify(
      { album: ALBUM, resolved, generatedAt: new Date().toISOString(), count: items.length, items },
      null,
      2,
    ),
  );
  console.log(`✓ ${items.length} photos in ${OUT}`);
  console.log(`✓ manifest: ${manifestPath}`);
  console.log(`  next: assign categories in ${join(OUT, "categories.json")}`);
})();
