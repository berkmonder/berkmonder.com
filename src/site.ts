// Facts used across the site: who, how to reach me, the main navigation.
export const site = {
	name: "Berk Önder",
	fullName: "Muhammed Berk Önder",
	role: "AI/ML engineer",
	title: "Berk Önder · AI/ML engineer: consulting, builds and training",
	description:
		"I help companies build LLM and agent systems, run machine learning reliably in production, and train their teams to use and maintain it.",
	email: "berkmonder@gmail.com",
	location: "Istanbul, Turkey",
	resume: "/files/resume_muhammedBerkOnder.pdf",
};

export const socials = [
	{
		label: "LinkedIn",
		href: "https://www.linkedin.com/in/berkmonder",
		icon: "linkedin",
	},
	{ label: "GitHub", href: "https://github.com/berkmonder", icon: "github" },
] as const;

export const nav = [
	{ label: "Services", href: "/services" },
	{ label: "Work", href: "/work" },
	{ label: "Blog", href: "/blog" },
	{ label: "Learn", href: "/learn" },
	{ label: "About", href: "/about" },
] as const;

export const mailto = (subject = "Hello") =>
	`mailto:${site.email}?subject=${encodeURIComponent(subject)}`;
