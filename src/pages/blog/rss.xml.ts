import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getPosts } from "../../blog";

// The blog's feed, /blog/rss.xml: rewritten on every build; feed readers check it for new posts.
export async function GET(context: APIContext) {
	const posts = await getPosts();
	return rss({
		title: "Berk Önder · Blog",
		description:
			"Notes from building and running AI systems: LLMs, agents, MLOps and self-hosting.",
		site: new URL("/blog/", context.site), // the feed's home: the blog
		items: posts.map((post) => ({
			title: post.title,
			description: post.description,
			pubDate: post.date,
			link: post.url,
			categories: post.tags,
		})),
	});
}
