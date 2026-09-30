import rss from "@astrojs/rss";
import { siteConfig } from "../../../config";
import {
	getNovelChapters,
	getNovelIndex,
	getNovelMetas,
} from "../../../utils/novel-utils";
import { absoluteUrl, getChapterUrl, getNovelUrl } from "../../../utils/url-utils";
import type { APIContext } from "astro";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";

const markdown = new MarkdownIt();

export async function getStaticPaths() {
	return (await getNovelMetas()).map((novel) => ({
		params: { novel: novel.slug },
		props: { slug: novel.slug },
	}));
}

export async function GET(context: APIContext) {
	const slug = String(context.props.slug);
	const [index, chapters] = await Promise.all([
		getNovelIndex(slug),
		getNovelChapters(slug),
	]);
	if (!index) return new Response(null, { status: 404 });

	const items = chapters.map((chapter) => ({
		title: `${chapter.data.chapter ?? ""} ${chapter.data.title}`.trim(),
		description: chapter.data.description,
		link: getChapterUrl(slug, chapter.id),
		pubDate: chapter.data.published,
		content: sanitizeHtml(markdown.render(chapter.body ?? ""), {
			allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
		}),
	}));

	return rss({
		title: index.data.novelTitle || index.data.title,
		description: index.data.description,
		site: absoluteUrl(getNovelUrl(slug), context.site ?? undefined),
		items,
		customData: `<language>${siteConfig.lang}</language>`,
	});
}
