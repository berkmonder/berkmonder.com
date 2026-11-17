import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { site } from "../site";

export async function GET(context: APIContext) {
	const posts = (await getCollection("blog", (p) => !p.data.draft)).sort(
		(a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
	);
	return rss({
		title: `${site.name}: blog`,
		description: "Notes on LLMs, agents, MLOps and running AI in production.",
		site: context.site!,
		items: posts.map((p) => ({
			title: p.data.title,
			description: p.data.description,
			pubDate: p.data.date,
			link: `/blog/${p.id}/`,
		})),
	});
}
