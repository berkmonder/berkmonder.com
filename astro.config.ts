import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

// Where `pnpm dev` sends /api and /widget: the live turquoise, or another one with
// `TURQUOISE_URL=http://… pnpm dev`.
const turquoise = process.env.TURQUOISE_URL ?? "https://berkmonder.com";

// The whole site is Starlight: every page is a Markdown/MDX file in src/content/docs (the blog's list
// and feed are in src/pages/blog). The left menu is `sidebar` below. The status board is React; the
// chat comes from turquoise (/widget/turquoise.js).
export default defineConfig({
	site: "https://berkmonder.com",
	integrations: [
		starlight({
			title: "Berk Önder",
			description:
				"AI/ML engineer: I build LLM and agent systems, run machine learning in production, and train teams to own it.",
			logo: { src: "./src/assets/mark.svg" },
			favicon: "/favicon.svg",
			social: [
				{
					icon: "linkedin",
					label: "LinkedIn",
					href: "https://www.linkedin.com/in/berkmonder",
				},
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/berkmonder",
				},
			],
			// The left menu, numbered [1]…[8]. Learn lists its lessons only on /learn/ pages; everywhere
			// else it is a plain link (src/routeData.ts).
			sidebar: [
				{ label: "Home", link: "/" },
				{ label: "Services", link: "/services/" },
				{ label: "Work", link: "/work/" },
				{ label: "Turquoise", link: "/turquoise/" },
				{ label: "Blog", link: "/blog/" },
				{ label: "Learn", items: [{ autogenerate: { directory: "learn" } }] },
				{ label: "About", link: "/about/" },
				{ label: "Status", link: "/status/" },
			],
			routeMiddleware: "./src/routeData.ts",
			tableOfContents: false, // a page can turn it on: `tableOfContents: true` in its frontmatter
			pagination: false, // no "Previous / Next" links under pages
			components: {
				ThemeSelect: "./src/components/ThemeSelect.astro", // one sun/moon button
				PageTitle: "./src/components/PageTitle.astro", // blog posts: date and tags under the title
			},
			customCss: [
				"@fontsource-variable/inter",
				"@fontsource-variable/geist-mono",
				"./src/styles/theme.css",
			],
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
				{
					tag: "link",
					attrs: {
						rel: "alternate",
						type: "application/rss+xml",
						title: "Berk Önder · Blog",
						href: "/blog/rss.xml",
					},
				},
				// The chat (turquoise): a bubble in the bottom-right corner; `<div data-turquoise-inline>`
				// shows it inside a page instead, and links to #ask open it.
				{
					tag: "script",
					attrs: { type: "module", src: "/widget/turquoise.js" },
				},
			],
		}),
		react(),
	],
	redirects: {
		"/projects": "/work/",
		"/projects/turquoise": "/turquoise/",
	},
	vite: {
		// `pnpm dev`: the chat and the status board talk to turquoise (see `turquoise` above).
		server: {
			proxy: {
				"/api": { target: turquoise, changeOrigin: true },
				"/widget": { target: turquoise, changeOrigin: true },
			},
		},
	},
});
