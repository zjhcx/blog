import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const homepage = await readFile(new URL("../../dist/index.html", import.meta.url), "utf8");
const root = fileURLToPath(new URL("../../", import.meta.url));
const eagerMedia = [...homepage.matchAll(/<(?:audio|video)\b[^>]*\bpreload=["']?(?:auto|metadata)\b/gi)];

if (eagerMedia.length > 0) {
	console.error(`Performance budget failed: found ${eagerMedia.length} eagerly preloaded media element(s) on the homepage.`);
	process.exit(1);
}

if (/--page-bg-image:\s*url\([^)]*\/bg\.jpg/i.test(homepage)) {
	console.error("Performance budget failed: the homepage references the unoptimized JPEG background.");
	process.exit(1);
}

const background = await stat(new URL("../../public/bg.webp", import.meta.url));
if (background.size > 100_000) {
	console.error(`Performance budget failed: bg.webp is ${background.size} bytes (limit: 100000).`);
	process.exit(1);
}

if (homepage.includes("/avatar.jpg")) {
	console.error("Performance budget failed: the homepage references the unoptimized JPEG avatar.");
	process.exit(1);
}

const avatar = await stat(new URL("../../public/avatar.webp", import.meta.url));
if (avatar.size > 6_000) {
	console.error(`Performance budget failed: avatar.webp is ${avatar.size} bytes (limit: 6000).`);
	process.exit(1);
}

const stylesheets = [...homepage.matchAll(/<link\b[^>]*>/gi)]
	.map((match) => match[0])
	.filter((tag) => /\brel=["']?stylesheet\b/i.test(tag))
	.map((tag) => tag.match(/\bhref=["']?([^"'\s>]+)/i)?.[1] ?? "")
	.filter((href) => href.startsWith("/"));
const stylesheetBytes = (
	await Promise.all(stylesheets.map((href) => stat(path.join(root, "dist", href))))
).reduce((total, file) => total + file.size, 0);
if (stylesheets.length > 30 || stylesheetBytes > 200_000) {
	console.error(`Performance budget failed: ${stylesheets.length} stylesheets / ${stylesheetBytes} bytes (limits: 30 / 200000).`);
	process.exit(1);
}

async function directorySize(directory) {
	let total = 0;
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const target = path.join(directory, entry.name);
		total += entry.isDirectory() ? await directorySize(target) : (await stat(target)).size;
	}
	return total;
}

const distBytes = await directorySize(path.join(root, "dist"));
if (distBytes > 12_000_000) {
	console.error(`Performance budget failed: dist is ${distBytes} bytes (limit: 12000000).`);
	process.exit(1);
}

const katexFonts = await readdir(path.join(root, "dist/vendor/katex/fonts"));
const legacyKatexFonts = katexFonts.filter((file) => /\.(?:woff|ttf)$/i.test(file));
if (legacyKatexFonts.length > 0) {
	console.error(`Performance budget failed: legacy KaTeX fonts found: ${legacyKatexFonts.join(", ")}`);
	process.exit(1);
}

const forbiddenPagefindAssets = [
	"pagefind-component-ui.js",
	"pagefind-component-ui.css",
	"pagefind-ui.js",
	"pagefind-ui.css",
	"pagefind-modular-ui.js",
	"pagefind-modular-ui.css",
	"pagefind-highlight.js",
];
const pagefindAssets = new Set(await readdir(path.join(root, "dist/pagefind")));
const unexpectedPagefindAssets = forbiddenPagefindAssets.filter((file) => pagefindAssets.has(file));
if (unexpectedPagefindAssets.length > 0) {
	console.error(`Performance budget failed: unused Pagefind UI assets found: ${unexpectedPagefindAssets.join(", ")}`);
	process.exit(1);
}

console.log(`Performance budget passed: dist ${distBytes}; no media preload; images ${background.size}/${avatar.size}; CSS ${stylesheets.length}/${stylesheetBytes}.`);
