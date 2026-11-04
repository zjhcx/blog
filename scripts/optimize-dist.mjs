// Post-build optimizer: spends extra build time to shrink what ships in dist.
// - HTML: aggressive but safe minification (attribute quotes, redundant attrs, inline CSS/JS).
// - Raster images in dist root/favicon: re-encode with sharp, keep only if smaller.
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { minify } from "html-minifier-terser";
import sharp from "sharp";

const root = path.resolve("dist");
const SKIP_DIRS = new Set(["pagefind", "music", "vendor"]);

async function* walk(dir) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (dir === root && SKIP_DIRS.has(entry.name)) continue;
			yield* walk(full);
		} else {
			yield full;
		}
	}
}

const htmlOptions = {
	collapseWhitespace: true,
	conservativeCollapse: true, // keep a single space so inline layout never changes
	collapseBooleanAttributes: true,
	decodeEntities: true,
	minifyCSS: true,
	minifyJS: { compress: true, mangle: true },
	removeComments: true,
	ignoreCustomComments: [/^\s*pagefind/],
	removeRedundantAttributes: true,
	removeScriptTypeAttributes: false, // keep type="module"
	removeStyleLinkTypeAttributes: true,
	sortAttributes: true, // improves gzip/brotli ratio
	sortClassName: false, // class order can matter for some selectors/scripts
	useShortDoctype: true,
	keepClosingSlash: false,
	processScripts: ["application/ld+json"],
};

let before = 0;
let after = 0;
let images = 0;

const tasks = [];
for await (const file of walk(root)) {
	const ext = path.extname(file).toLowerCase();
	if (ext === ".html") {
		tasks.push(
			(async () => {
				const src = await readFile(file, "utf8");
				let out;
				try {
					out = await minify(src, htmlOptions);
				} catch (error) {
					console.warn(`Skip HTML minify for ${path.relative(root, file)}: ${error.message}`);
					return;
				}
				before += Buffer.byteLength(src);
				after += Buffer.byteLength(out);
				await writeFile(file, out);
			})(),
		);
	} else if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
		tasks.push(
			(async () => {
				const src = await readFile(file);
				const pipeline = sharp(src);
				const out =
					ext === ".png"
						? await pipeline.png({ compressionLevel: 9, effort: 10 }).toBuffer()
						: await pipeline.jpeg({ quality: 78, mozjpeg: true, progressive: true }).toBuffer();
				if (out.length < src.length) {
					before += src.length;
					after += out.length;
					images++;
					await writeFile(file, out);
				}
			})(),
		);
	}
}
await Promise.all(tasks);

console.log(
	`optimize-dist: ${before} -> ${after} bytes (-${before - after}, ${images} images re-encoded). dist now ${(await dirSize(root))} bytes.`,
);

async function dirSize(dir) {
	let total = 0;
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		total += entry.isDirectory() ? await dirSize(full) : (await stat(full)).size;
	}
	return total;
}
