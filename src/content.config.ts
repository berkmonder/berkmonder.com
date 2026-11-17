import { defineCollection } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Blog posts: src/content/blog/<slug>.mdx → /blog/<slug>. `draft: true` keeps a post out of the build.
const blog = defineCollection({
	loader: glob({ base: "src/content/blog", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		updated: z.coerce.date().optional(),
		tags: z.array(z.string()).default([]),
		// A YouTube video that goes with the post (its id), shown at the top.
		youtube: z.string().optional(),
		draft: z.boolean().default(false),
	}),
});

// Lessons (Starlight): src/content/docs/learn/<slug>.mdx → /learn/<slug>.
const docs = defineCollection({ loader: docsLoader(), schema: docsSchema() });

export const collections = { blog, docs };
