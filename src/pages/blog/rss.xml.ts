// The blog's RSS feed: /blog/rss.xml, rebuilt with the site. Feed readers check it for new posts.

import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
	const posts = (await getCollection("blog", (p) => !p.data.draft)).sort(
		(a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
	);
	return rss({
		title: "Berk Önder: Blog",
		description: "Yapay zekâ sistemleri kurarken ve işletirken öğrendiklerim.",
		site: context.site!,
		customData: "<language>tr</language>",
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.date,
			categories: post.data.tags,
			link: `/blog/${post.id}/`,
		})),
	});
}
