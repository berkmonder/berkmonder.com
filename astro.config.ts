import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightBlog from "starlight-blog";

// The whole site is Starlight: every page is a Markdown/MDX file in src/content/docs.
// The left menu is `sidebar` below. Interactive parts (the assistant, the status board) are React.
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
				{ icon: "email", label: "Email", href: "mailto:berkmonder@gmail.com" },
			],
			sidebar: [
				{ label: "Home", link: "/" },
				{ label: "Services", link: "/services/" },
				{ label: "Work", link: "/work/" },
				{ label: "About", link: "/about/" },
				{ label: "Blog", link: "/blog/" },
				{ label: "Learn", items: [{ autogenerate: { directory: "learn" } }] },
				{ label: "Status", link: "/status/" },
			],
			tableOfContents: false, // a page can turn it on: `tableOfContents: true` in its frontmatter
			pagination: false, // no "Previous / Next" links under pages
			plugins: [
				starlightBlog({
					navigation: "none", // the left menu links to it
					authors: {
						berk: { name: "Berk Önder", url: "https://berkmonder.com/about/" },
					},
				}),
			],
			routeMiddleware: "./src/routeData.ts", // keeps the site's menu on blog pages
			components: {
				// Starlight's footer, plus the assistant (bottom-right) on every page.
				Footer: "./src/components/Footer.astro",
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
			],
		}),
		react(),
	],
	redirects: {
		"/projects": "/work/",
		"/projects/turquoise": "/work/",
	},
	vite: {
		// `pnpm dev`: the assistant and the status board talk to the live API.
		server: {
			proxy: {
				"/api": {
					target: "https://turquoise.berkmonder.com",
					changeOrigin: true,
				},
			},
		},
	},
});
