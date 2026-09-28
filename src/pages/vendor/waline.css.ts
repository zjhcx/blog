import { readFile } from "node:fs/promises";
import path from "node:path";
import type { APIRoute } from "astro";

const [walineCss, customCss] = await Promise.all([
	readFile(new URL(import.meta.resolve("@waline/client/style")), "utf-8"),
	readFile(path.resolve(process.cwd(), "src/assets/waline-custom.css.txt"), "utf-8"),
]);

export const GET: APIRoute = () =>
	new Response(`${walineCss}\n${customCss}`, {
		headers: {
			"Content-Type": "text/css; charset=utf-8",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
