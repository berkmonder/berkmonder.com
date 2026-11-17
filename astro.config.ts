import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

// The site is static (Caddy serves it, see Containerfile). Starlight runs only the lessons under /learn;
// every other page uses src/layouts/Base.astro. Interactive parts are React islands.
export default defineConfig({
	site: "https://berkmonder.com",
	output: "static",
	trailingSlash: "ignore",
	integrations: [
		starlight({
			title: "Berk Önder",
			description:
				"Free lessons on LLMs, agents and MLOps, with videos, notes and code.",
			favicon: "/favicon.svg",
			disable404Route: true, // the site's own 404 page serves everything
			head: [
				{
					tag: "meta",
					attrs: {
						property: "og:image",
						content: "https://berkmonder.com/og.png",
					},
				},
				{
					tag: "meta",
					attrs: { name: "twitter:card", content: "summary_large_image" },
				},
			],
			// Starlight's header shows the site's name and main navigation (the same as every other page).
			components: {
				SiteTitle: "./src/components/starlight/SiteTitle.astro",
				SocialIcons: "./src/components/starlight/SiteNav.astro",
			},
			customCss: [
				"@fontsource-variable/inter",
				"@fontsource-variable/bricolage-grotesque",
				"@fontsource-variable/jetbrains-mono",
				"./src/styles/starlight.css",
			],
			sidebar: [
				{ label: "Lessons", items: [{ autogenerate: { directory: "learn" } }] },
			],
			lastUpdated: true,
		}),
		mdx(),
		react(),
		sitemap(),
	],
	redirects: {
		"/projects": "/work",
		"/projects/turquoise": "/work",
	},
});
