import { getCollection, type CollectionEntry } from "astro:content";
import type { APIRoute } from "astro";

export async function getStaticPaths() {
	const posts = await getCollection("posts", ({ data }) => !data.draft);
	return posts.map((entry) => ({
		params: { slug: entry.id },
		props: { entry },
	}));
}

export const GET: APIRoute = ({ props }) => {
	const entry = props.entry as CollectionEntry<"posts">;
	const title = entry.data.title.replace(/\s+/g, " ").trim();
	return new Response(`# ${title}\n\n${entry.body || ""}\n`, {
		headers: { "Content-Type": "text/markdown; charset=utf-8" },
	});
};
