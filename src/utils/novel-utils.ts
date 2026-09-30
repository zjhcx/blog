import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";

export type NovelEntry = CollectionEntry<"novels">;
export type CharacterEntry = CollectionEntry<"characters">;

export interface NovelMeta {
	slug: string;
	title: string;
	description: string;
	series?: string;
	seriesOrder?: number;
	wordCount: number;
	chapterCount: number;
	chapters: NovelEntry[];
}

export function computeNovelWordCount(body?: string): number {
	if (!body) return 0;
	const plain = body
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`[^`]*`|!??\[[^\]]*\]\([^)]*\)|<[^>]+>|[#>*_~|=-]/g, " ");
	const cjk = plain.match(/[\u3400-\u9fff\uf900-\ufaff\u3040-\u30ff\uac00-\ud7af]/g)?.length ?? 0;
	const words = plain
		.replace(/[\u3400-\u9fff\uf900-\ufaff\u3040-\u30ff\uac00-\ud7af]/g, " ")
		.match(/[\p{L}\p{N}]+/gu)?.length ?? 0;
	return cjk + words;
}

export function getNovelSlug(entry: NovelEntry): string {
	return entry.id.replace(/\.mdx?$/, "").split("/")[0] ?? entry.id;
}

export async function getAllNovelEntries(): Promise<NovelEntry[]> {
	return getCollection("novels", ({ data }) =>
		import.meta.env.PROD ? data.draft !== true : true,
	);
}

export async function getNovelChapters(slug: string): Promise<NovelEntry[]> {
	const entries = await getAllNovelEntries();
	return entries
		.filter((entry) => getNovelSlug(entry) === slug && entry.data.chapter !== undefined)
		.sort((a, b) => (a.data.chapter ?? 0) - (b.data.chapter ?? 0));
}

export async function getNovelIndex(slug: string): Promise<NovelEntry | undefined> {
	const entries = await getAllNovelEntries();
	return entries.find((entry) => getNovelSlug(entry) === slug && entry.data.chapter === undefined);
}

export async function getNovelMetas(): Promise<NovelMeta[]> {
	const entries = await getAllNovelEntries();
	const indexes = entries.filter((entry) => entry.data.chapter === undefined);
	const metas = await Promise.all(indexes.map(async (index) => {
		const slug = getNovelSlug(index);
		const chapters = await getNovelChapters(slug);
		return {
			slug,
			title: index.data.novelTitle || index.data.title,
			description: index.data.description,
			series: index.data.series,
			seriesOrder: index.data.seriesOrder,
			wordCount: chapters.reduce((sum, chapter) => sum + computeNovelWordCount(chapter.body), 0),
			chapterCount: chapters.length,
			chapters,
		};
	}));
	return metas.sort((a, b) => (a.seriesOrder ?? 999) - (b.seriesOrder ?? 999));
}

export async function getAllCharacters(): Promise<CharacterEntry[]> {
	return getCollection("characters");
}

export async function getCharactersByNovel(slug: string): Promise<CharacterEntry[]> {
	const characters = await getAllCharacters();
	return characters.filter((character) => character.data.novel.toLowerCase() === slug.toLowerCase());
}

export function getSeriesList(metas: NovelMeta[]) {
	const grouped = new Map<string, NovelMeta[]>();
	for (const meta of metas) {
		const name = meta.series || i18n(I18nKey.uncategorized);
		grouped.set(name, [...(grouped.get(name) ?? []), meta]);
	}
	return Array.from(grouped, ([name, novels]) => ({ name, novels }));
}
