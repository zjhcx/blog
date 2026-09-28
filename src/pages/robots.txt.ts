import type { APIRoute } from "astro";
import { absoluteUrl } from "@/utils/url-utils";

const robotsTxt = `
User-agent: *
Allow: /

Sitemap: ${absoluteUrl("/sitemap.xml")}
`.trim();

export const GET: APIRoute = () => {
	return new Response(robotsTxt, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
};
