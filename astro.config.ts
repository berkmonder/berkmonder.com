import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightLlmsTxt from "starlight-llms-txt";
import starlightSidebarTopics from "starlight-sidebar-topics";

// Two parts:
// - the site itself (home, about, turquoise, status, blog): plain Astro pages in src/pages, around
//   src/layouts/Site.astro;
// - Learn (/learn): Starlight, in Turkish. Its pages are src/content/docs/learn/<subject>/; each
//   subfolder of a subject is a category in its menu.

// The chat (turquoise, a separate app) and, when developing, where its files come from.
const turquoise = process.env.TURQUOISE_URL ?? "https://berkmonder.com";
const chat = {
	tag: "script",
	attrs: { type: "module", src: "/widget/turquoise.js" },
} as const;

export default defineConfig({
	site: "https://berkmonder.com",
	integrations: [
		starlight({
			title: "Berk Önder",
			description: "Türkçe dersler: LLM'ler ve ajanlar, MLOps, altyapı.",
			locales: { root: { label: "Türkçe", lang: "tr" } },
			logo: { src: "./src/assets/mark.svg" },
			favicon: "/favicon.svg",
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/berkmonder",
				},
				{
					icon: "linkedin",
					label: "LinkedIn",
					href: "https://www.linkedin.com/in/berkmonder",
				},
			],
			plugins: [
				// The subjects: the dropdown at the top of Learn's menu (src/components/learn/Sidebar.astro).
				starlightSidebarTopics(
					[
						{
							label: "LLM'ler ve ajanlar",
							link: "/learn/llm/",
							items: [{ autogenerate: { directory: "learn/llm" } }], // its folders are the categories
						},
						{
							label: "MLOps",
							link: "/learn/mlops/",
							items: [{ autogenerate: { directory: "learn/mlops" } }], // its folders are the categories
						},
						{
							label: "Altyapı",
							link: "/learn/altyapi/",
							items: [{ autogenerate: { directory: "learn/altyapi" } }], // its folders are the categories
						},
					],
					{ exclude: ["/learn"] }, // Learn's front page lists the subjects instead
				),
				// /llms.txt (and -full, -small): the site in plain text, for language models.
				starlightLlmsTxt({
					projectName: "Berk Önder",
					description:
						"Berk Önder is an AI/ML engineer in Istanbul. This site has his lessons (Learn, in Turkish), blog, an assistant (Turquoise) and the status of his services.",
					optionalLinks: [
						{
							label: "About",
							url: "https://berkmonder.com/about/",
							description: "Experience, education, skills, CV",
						},
						{
							label: "Turquoise",
							url: "https://berkmonder.com/turquoise/",
							description: "Berk's assistant, an agent with tools and RAG",
						},
						{
							label: "Blog",
							url: "https://berkmonder.com/blog/",
							description: "Posts, in Turkish (RSS: /blog/rss.xml)",
						},
					],
				}),
			],
			components: {
				Header: "./src/components/learn/Header.astro",
				Sidebar: "./src/components/learn/Sidebar.astro",
				ThemeSelect: "./src/components/learn/ThemeSelect.astro",
			},
			customCss: [
				"@fontsource-variable/inter",
				"@fontsource-variable/geist-mono",
				"./src/styles/learn.css",
			],
			disable404Route: true, // the site's own 404 page (src/pages/404.astro)
			head: [
				chat,
				{
					tag: "meta",
					attrs: {
						property: "og:image",
						content: "https://berkmonder.com/og.png",
					},
				},
			],
		}),
		react(),
	],
	redirects: {
		"/services": "/",
		"/work": "/about/",
		"/projects": "/about/",
		"/projects/turquoise": "/turquoise/",
	},
	vite: {
		// `pnpm dev`: the chat and the status board talk to the live turquoise (or TURQUOISE_URL's).
		server: {
			proxy: {
				"/api": { target: turquoise, changeOrigin: true },
				"/widget": { target: turquoise, changeOrigin: true },
			},
		},
	},
});
