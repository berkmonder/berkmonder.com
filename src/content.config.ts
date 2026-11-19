import { defineCollection } from "astro:content";
import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

export const collections = {
	// Learn's pages (Starlight): src/content/docs/learn/<subject>/<category>/<page>.mdx
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
	// Starlight's words in Turkish, where its own differ from what this site says (src/content/i18n/tr.json).
	i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
	// Blog posts: src/content/blog/<slug>.md → /blog/<slug>/. `draft: true` keeps one out of the built site.
	blog: defineCollection({
		loader: glob({ base: "src/content/blog", pattern: "**/*.{md,mdx}" }),
		schema: z.object({
			title: z.string(),
			description: z.string(),
			date: z.coerce.date(),
			tags: z.array(z.string()).default([]),
			draft: z.boolean().default(false),
		}),
	}),
};
