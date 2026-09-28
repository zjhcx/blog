import { rm, stat } from "node:fs/promises";
import path from "node:path";

const pagefindDir = path.resolve("dist/pagefind");
const unusedPagefindAssets = [
	"pagefind-component-ui.js",
	"pagefind-component-ui.css",
	"pagefind-ui.js",
	"pagefind-ui.css",
	"pagefind-modular-ui.js",
	"pagefind-modular-ui.css",
	"pagefind-highlight.js",
];

let removedBytes = 0;
for (const asset of unusedPagefindAssets) {
	const target = path.join(pagefindDir, asset);
	try {
		removedBytes += (await stat(target)).size;
		await rm(target);
	} catch (error) {
		if (error?.code !== "ENOENT") throw error;
	}
}

console.log(`Pruned ${unusedPagefindAssets.length} unused Pagefind UI assets (${removedBytes} bytes).`);

const redundantSitemapIndex = path.resolve("dist/sitemap-index.xml");
try {
	await rm(redundantSitemapIndex);
	console.log("Removed redundant sitemap-index.xml.");
} catch (error) {
	if (error?.code !== "ENOENT") throw error;
}
