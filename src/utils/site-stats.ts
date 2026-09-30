import { getCollection } from "astro:content";

const markdownNoise = /(?:```[\s\S]*?```|`[^`]*`|!??\[[^\]]*\]\([^)]*\)|<[^>]+>|[#>*_~|=-])/g;
const cjkCharacter = /[\u3400-\u9fff\uf900-\ufaff\u3040-\u30ff\uac00-\ud7af]/g;
const latinWord = /[\p{L}\p{N}]+/gu;

export interface SiteStats {
	postCount: number;
	wordCount: number;
	startedAt: Date;
	lastUpdatedAt: Date;
}

export async function getSiteStats(): Promise<SiteStats> {
	const posts = await getCollection("posts", ({ data }) =>
		import.meta.env.PROD ? data.draft !== true : true,
	);
	const now = new Date();

	let startedAt = now;
	let lastUpdatedAt = now;
	let wordCount = 0;

	for (const post of posts) {
		const publishedAt = new Date(post.data.published);
		const updatedAt = new Date(post.data.updated ?? post.data.published);

		if (publishedAt < startedAt) startedAt = publishedAt;
		if (updatedAt > lastUpdatedAt || lastUpdatedAt === now) lastUpdatedAt = updatedAt;

		const plainText = (post.body ?? "").replace(markdownNoise, " ");
		const cjkCount = plainText.match(cjkCharacter)?.length ?? 0;
		const nonCjkText = plainText.replace(cjkCharacter, " ");
		const latinCount = nonCjkText.match(latinWord)?.length ?? 0;
		wordCount += cjkCount + latinCount;
	}

	return { postCount: posts.length, wordCount, startedAt, lastUpdatedAt };
}

export function formatCompactNumber(value: number): string {
	if (value < 1000) return String(value);
	return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}

export function formatDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}
