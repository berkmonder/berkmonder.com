// What I offer. The home page shows the short version, /services the whole of it.
export const services = [
	{
		id: "llm",
		verb: "Build",
		icon: "bot",
		title: "LLM & agent systems",
		short:
			"Assistants that answer from your own data and agents that use your tools, with evaluation and tracing from day one. On cloud APIs or models you host yourself.",
		points: [
			"Retrieval-augmented assistants over your documents and databases",
			"Agents that call your internal tools and APIs, with guardrails",
			"Evaluation sets, tracing and feedback, so quality is measured, not guessed",
			"Choosing between cloud APIs and self-hosted models (privacy, latency, cost)",
		],
		fit: "You have a promising prototype that isn't reliable enough to ship, or you want to start the right way.",
	},
	{
		id: "mlops",
		verb: "Run",
		icon: "server-cog",
		title: "ML infrastructure & MLOps",
		short:
			"Pipelines, experiment tracking, CI/CD for models, serving and monitoring, so models keep working after launch, at a cost you can see.",
		points: [
			"Data and training pipelines (Airflow, Dataform, Prefect) on GCP or your own servers",
			"Experiment tracking and a model registry with MLflow",
			"CI/CD that turns every model into a versioned, reproducible artifact",
			"Serving, monitoring and alerting; GPU and cloud cost under control",
		],
		fit: "Your models work in notebooks, but getting them to production is manual, fragile or expensive.",
	},
	{
		id: "training",
		verb: "Teach",
		icon: "graduation-cap",
		title: "Training for your team",
		short:
			"Hands-on workshops on NLP, LLMs and agents for engineers, and practical AI for everyone else. In Turkish or English, remote or on-site.",
		points: [
			"LLMs and NLP for engineers: embeddings, retrieval, evaluation",
			"Building agents: tools, memory, safety, from scratch to production",
			"Practical AI for every team: using assistants well and safely",
			"MLOps fundamentals for data and ML teams",
		],
		fit: "You want your people to use and build with AI confidently, on your own use cases.",
	},
] as const;

export const steps = [
	{
		title: "Intro call",
		text: "Thirty minutes, free. You tell me where you are and what you need; I tell you honestly whether I can help.",
	},
	{
		title: "Proposal",
		text: "A short written plan: scope, deliverables, timeline and a fixed price, so there are no surprises.",
	},
	{
		title: "Build or teach",
		text: "Work in small steps with regular check-ins. You see progress early and can steer.",
	},
	{
		title: "Handover",
		text: "Documentation and a walkthrough, so your team can run and change what we built without me.",
	},
];

export const faq = [
	{
		q: "Do you work remotely?",
		a: "Yes, with teams anywhere. For workshops in Istanbul I'm also happy to come on-site.",
	},
	{
		q: "Which cloud or stack do you work with?",
		a: "Most of my production work is on GCP and Linux servers, with Python, Docker and the usual open-source tools. I'll work with what you already run rather than ask you to switch.",
	},
	{
		q: "Our data is sensitive. Can the models run on our own servers?",
		a: "Yes. I run open models on my own hardware every day, and can set up the same on your servers so that no data leaves them.",
	},
	{
		q: "Can trainings be in Turkish?",
		a: "Yes: Turkish (native) or English, whichever your team prefers.",
	},
	{
		q: "Will you sign an NDA?",
		a: "Of course.",
	},
];
