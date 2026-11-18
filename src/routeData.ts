import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

// The left menu is the flat, numbered list in astro.config.ts ([1] Home … [8] Status). Only on /learn/
// pages does Learn open into its lessons; everywhere else it is a plain link. Pages that aren't in the
// menu themselves (a blog post) mark their section (Blog) instead.
export const onRequest = defineRouteMiddleware(({ locals, url }) => {
	const route = locals.starlightRoute;
	const inLearn = /^\/learn(\/|$)/.test(url.pathname);
	const rail = route.sidebar.map((entry) =>
		entry.type === "group" && entry.label === "Learn" && !inLearn
			? {
					type: "link" as const,
					label: "Learn",
					href: "/learn/",
					isCurrent: false,
					badge: undefined,
					attrs: {},
				}
			: entry,
	);
	const inMenu = rail.some((entry) => entry.type === "link" && entry.isCurrent);
	route.sidebar =
		inLearn || inMenu
			? rail
			: rail.map((entry) =>
					entry.type === "link" &&
					entry.href !== "/" &&
					url.pathname.startsWith(entry.href)
						? { ...entry, isCurrent: true }
						: entry,
				);
});
