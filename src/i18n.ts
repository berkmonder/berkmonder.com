// The site's two languages: English (/) and Turkish (/tr/). Learn and the blog are in Turkish only.
// Words used on every page are here; each page keeps its own text at its top (src/views/).

export type Lang = "en" | "tr";

/** The same page in a language: path("/about/", "tr") → "/tr/about/". */
export const path = (page: string, lang: Lang) =>
	lang === "tr" ? `/tr${page}` : page;

export const words = {
	en: {
		menu: [
			{ label: "Learn", href: "/learn/" },
			{ label: "Blog", href: "/blog/" },
			{ label: "Turquoise", href: "/turquoise/" },
			{ label: "About", href: "/about/" },
		],
		home: "Home",
		otherLanguage: { label: "Türkçe", lang: "tr" as Lang },
		status: {
			normal: "Normal",
			degraded: "Slow",
			outage: "Outage",
			unknown: "Status",
			title: "Status of my sites",
		},
		theme: "Switch between dark and light",
		menuButton: "Menu",
		description:
			"AI/ML engineer in Istanbul: LLM systems, MLOps and the infrastructure under them.",
	},
	tr: {
		menu: [
			{ label: "Öğren", href: "/learn/" },
			{ label: "Blog", href: "/blog/" },
			{ label: "Turquoise", href: "/tr/turquoise/" },
			{ label: "Hakkımda", href: "/tr/about/" },
		],
		home: "Ana sayfa",
		otherLanguage: { label: "English", lang: "en" as Lang },
		status: {
			normal: "Normal",
			degraded: "Yavaş",
			outage: "Kesinti",
			unknown: "Durum",
			title: "Sitelerimin durumu",
		},
		theme: "Koyu ve açık tema arasında geç",
		menuButton: "Menü",
		description:
			"İstanbul'da yapay zekâ/ML mühendisi: LLM sistemleri, MLOps ve altındaki altyapı.",
	},
};
