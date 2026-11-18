import { defineCollection } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { z } from "astro/zod";

// Every page of the site. Blog posts (src/content/docs/blog/) also have a `date` and `tags`.
// `draft: true` is Starlight's own: the page shows in `pnpm dev` but is left out of the built site.
export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				date: z.date().optional(),
				tags: z.array(z.string()).default([]),
			}),
		}),
	}),
};
