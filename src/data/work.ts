// Selected work. `featured` ones are on the home page. Employer work is described at the level my CV does.
export type Work = {
	title: string;
	where: string;
	summary: string;
	result?: string;
	stack: string[];
	link?: { label: string; href: string };
	kind: "employer" | "own";
	featured?: boolean;
};

export const work: Work[] = [
	{
		title: "A production LLM service on my own GPU",
		where: "Own infrastructure",
		summary:
			"An open model served by llama.cpp behind LiteLLM, with a key per client, every request traced in MLflow, speech in and out, and a chat interface. This site's assistant reaches it over a private network and falls back to search when the GPU is busy.",
		stack: [
			"llama.cpp",
			"LiteLLM",
			"MLflow",
			"Postgres",
			"Open WebUI",
			"NixOS",
			"Tailscale",
		],
		link: {
			label: "Try the assistant",
			href: "https://turquoise.berkmonder.com/ask",
		},
		kind: "own",
		featured: true,
	},
	{
		title: "RAG assistant over internal data",
		where: "Teknasyon",
		summary:
			"A modular retrieval-augmented assistant on Open WebUI, with custom Python pipelines and tool integrations for precise answers from structured internal data.",
		stack: ["LangChain", "Open WebUI", "Python"],
		kind: "employer",
		featured: true,
	},
	{
		title: "Anomaly detection on streaming data",
		where: "P.I. Works · Teknasyon",
		summary:
			"Multivariate anomaly detection on streaming telecom time series using clustering; later, automated detection pipelines on GCP for high-cardinality app event data.",
		stack: ["Python", "scikit-learn", "Airflow", "Dataform", "GCP"],
		link: {
			label: "Watch it live",
			href: "https://turquoise.berkmonder.com/anomaly",
		},
		kind: "employer",
		featured: true,
	},
	{
		title: "Telco LLM assistant",
		where: "P.I. Works",
		summary:
			"One interface to ask the knowledge base, query network data in SQL, and get the analysis and charts back.",
		stack: ["LangChain", "SQL", "Python"],
		kind: "employer",
	},
	{
		title: "Network traffic forecasts from football fixtures",
		where: "P.I. Works",
		summary:
			"Regression models that predict network traffic heatmaps around football matches, so capacity can be planned ahead.",
		result: "Aggregate error from 77% down to 0.75%",
		stack: ["Python", "scikit-learn"],
		kind: "employer",
	},
	{
		title: "Faster, cheaper fine-tuning of 30B models",
		where: "Teknasyon",
		summary:
			"Fine-tuning ~30B-parameter Qwen models on rented GPUs with better utilization, cutting both training time and cost.",
		stack: ["PyTorch", "Hugging Face", "RunPod"],
		kind: "employer",
	},
	{
		title: "Spam detection at scale",
		where: "Teknasyon",
		summary:
			"Re-segmented a production pipeline that processes millions of records a week, removing its memory bottlenecks so it runs reliably.",
		stack: ["Python", "GCP"],
		kind: "employer",
	},
	{
		title: "Reproducible model delivery",
		where: "Teknasyon",
		summary:
			"MLflow tracking inside Airflow pipelines and CI/CD with Cloud Build and Docker, so every model is a versioned artifact that can be rebuilt.",
		stack: ["MLflow", "Airflow", "Cloud Build", "Docker"],
		kind: "employer",
	},
	{
		title: "Three machines, one repository",
		where: "Own infrastructure",
		summary:
			"A laptop, a GPU workstation and a cloud server, all configured as code: pull-based deploys, encrypted secrets, nightly off-site backups and uptime checks.",
		stack: ["NixOS", "nix-darwin", "sops", "Terraform", "GitHub Actions"],
		link: { label: "Status page", href: "https://status.berkmonder.com" },
		kind: "own",
	},
	{
		title: "Hive",
		where: "Open source",
		summary:
			"A desktop command center for AI coding agents: Claude Code, Codex and Gemini side by side, each in its own terminal and git worktree, with review, commit and merge in one place.",
		stack: ["Agents", "Git worktrees", "Desktop app"],
		link: { label: "GitHub", href: "https://github.com/berkmonder/hive" },
		kind: "own",
	},
];
