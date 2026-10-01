import { readFile } from "node:fs/promises";
import path from "node:path";
import type { APIRoute } from "astro";

const customCss = await readFile(
	path.resolve(process.cwd(), "src/assets/waline-custom.css.txt"), "utf-8",
);

export const GET: APIRoute = () =>
	new Response(customCss, {
		headers: {
			"Content-Type": "text/css; charset=utf-8",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
