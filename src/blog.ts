import { getCollection } from "astro:content";

// The blog's posts (src/content/docs/blog/*.mdx), newest first, for the list on /blog/ and the feed.
// Drafts (`draft: true`) show in `pnpm dev` only, as Starlight does for the pages themselves.
export async function getPosts() {
	const entries = await getCollection(
		"docs",
		({ id, data }) =>
			id.startsWith("blog/") &&
			(import.meta.env.MODE !== "production" || !data.draft),
	);
	const posts = entries.map(({ id, filePath, data }) => {
		if (!data.date) throw new Error(`${filePath}: a blog post needs a date`);
		return {
			url: `/${id}/`,
			title: data.title,
			description: data.description,
			date: data.date,
			tags: data.tags,
			draft: data.draft,
		};
	});
	return posts.sort((a, b) => b.date.valueOf() - a.date.valueOf());
}

/** "29 Dec 2024" */
export const formatDate = (date: Date) =>
	date.toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	});
