import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

// On blog pages, the blog plugin replaces the left menu with its own (all posts, recent posts, tags).
// This keeps the site's menu and puts the blog's under "Blog" instead.
export const onRequest = defineRouteMiddleware(async ({ locals }, next) => {
	const site = locals.starlightRoute.sidebar;
	await next(); // the blog plugin runs here
	const blog = locals.starlightRoute.sidebar;
	if (blog === site) return; // not a blog page
	locals.starlightRoute.sidebar = site.map((entry) =>
		entry.type === "link" && entry.label === "Blog"
			? {
					type: "group",
					label: "Blog",
					entries: blog,
					collapsed: false,
					badge: undefined,
				}
			: entry,
	);
});
