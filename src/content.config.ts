import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const postsCollection = defineCollection({
	loader: glob({
		pattern: "**/[^_]*.{md,mdx}",
		base: "./src/content/posts",
	}),
	schema: z.object({
		title: z.string(),
		published: z.coerce.date(),
		updated: z.coerce.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		lang: z.string().optional().default(""),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});

const specCollection = defineCollection({
	loader: glob({
		pattern: "**/[^_]*.{md,mdx}",
		base: "./src/content/spec",
	}),
	schema: z.object({}),
});

const novelsCollection = defineCollection({
	loader: glob({
		pattern: "**/[^_]*.{md,mdx}",
		base: "./src/content/novels",
	}),
	schema: z.object({
		title: z.string(),
		description: z.string().optional().default(""),
		published: z.coerce.date().optional(),
		updated: z.coerce.date().optional(),
		draft: z.boolean().optional().default(false),
		novel: z.string(),
		novelTitle: z.string(),
		series: z.string().optional(),
		seriesOrder: z.number().optional(),
		volume: z.number().optional(),
		volumeTitle: z.string().optional(),
		chapter: z.number().optional(),
		part: z.number().optional(),
		characters: z.array(z.string()).optional().default([]),
	}),
});

const charactersCollection = defineCollection({
	loader: glob({
		pattern: "**/[^_]*.{md,mdx}",
		base: "./src/content/characters",
	}),
	schema: z.object({
		name: z.string(),
		novel: z.string(),
		description: z.string().optional().default(""),
		avatar: z.string().optional(),
		role: z
			.enum(["protagonist", "antagonist", "supporting", "minor", "guest"])
			.optional(),
		alias: z.array(z.string()).optional().default([]),
	}),
});

export const collections = {
	posts: postsCollection,
	spec: specCollection,
	novels: novelsCollection,
	characters: charactersCollection,
};
