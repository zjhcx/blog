import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { siteConfig } from "@/config";
import I18nKey from "@/i18n/i18nKey";
import { i18n } from "@/i18n/translation";
import { absoluteUrl } from "@/utils/url-utils";

function inline(value: string): string {
	return value.replace(/\s+/g, " ").trim().replace(/[\\`*_[\]<>]/g, "\\$&");
}

export const GET: APIRoute = async ({ site }) => {
	const posts = await getCollection("posts", ({ data }) => !data.draft);
	posts.sort((a, b) => b.data.published.getTime() - a.data.published.getTime());
	const link = (path: string) => absoluteUrl(path, site ?? undefined);
	const lines = [
		`# ${inline(siteConfig.title)}`,
		"",
		`> ${inline(siteConfig.subtitle || siteConfig.title)}`,
		"",
		`## ${i18n(I18nKey.archive)}`,
		"",
		`- [${i18n(I18nKey.archive)}](${link("/archive/")})`,
		`- [${i18n(I18nKey.about)}](${link("/about/")})`,
		"",
		...posts.map((post) => {
			const description = inline(post.data.description);
			return `- [${inline(post.data.title)}](${link(`/posts/${post.id}/index.md`)})${description ? `: ${description}` : ""}`;
		}),
		"",
	];
	return new Response(lines.join("\n"), {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
};
