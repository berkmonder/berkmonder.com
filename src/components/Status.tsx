// The status board (/status, /en/status). The checks are Upptime's (github.com/berkmonder/status):
// GitHub runs them every 5 minutes, from outside my servers, and keeps their history there. This reads
// it live: one bar per day for 30 days (hover for the day, click a red one for its incident), whether
// my GPU is on (/api/status), and past incidents (Upptime opens a GitHub issue for each).

import { useEffect, useState } from "react";
import "./status.css";

const DATA = "https://raw.githubusercontent.com/berkmonder/status/master";
const ISSUES =
	"https://api.github.com/repos/berkmonder/status/issues?state=all&per_page=20";
const DAYS = 30;

const WORDS = {
	en: {
		updated: "Updated",
		allUp: "All systems operational",
		someDown: "Some systems are down",
		checking: "Checking…",
		unavailable: "Status unavailable",
		summaryUp: "berkmonder.com and Turquoise are running normally.",
		summaryDown: "Something isn't answering. Details below.",
		groups: { website: "Website", turquoise: "Turquoise" },
		about: {
			"berkmonder-com": "The website",
			"turquoise-api": "The assistant's API",
		} as Record<string, string>,
		gpu: "Model on my GPU",
		gpuAbout: "When it's off, the assistant answers from search",
		gpuOn: "On",
		gpuOff: "Off: quick answers",
		live: "Live, not recorded",
		ago: `${DAYS} days ago`,
		today: "Today",
		up: "Operational",
		degraded: "Degraded",
		down: "Outage",
		none: "No data",
		minutesDown: (m: string) => `${m} down`,
		incidents: "Past incidents",
		noIncidents: "None recorded.",
		resolved: (d: string) => `resolved after ${d}`,
		ongoing: "ongoing",
		locale: "en-GB",
	},
	tr: {
		updated: "Güncellendi",
		allUp: "Tüm sistemler çalışıyor",
		someDown: "Bazı sistemler çalışmıyor",
		checking: "Kontrol ediliyor…",
		unavailable: "Durum alınamadı",
		summaryUp: "berkmonder.com ve Turquoise normal çalışıyor.",
		summaryDown: "Bir şey cevap vermiyor. Ayrıntılar aşağıda.",
		groups: { website: "Web sitesi", turquoise: "Turquoise" },
		about: {
			"berkmonder-com": "Web sitesi",
			"turquoise-api": "Asistanın API'si",
		} as Record<string, string>,
		gpu: "GPU'mdaki model",
		gpuAbout: "Kapalıyken asistan aramayla cevap verir",
		gpuOn: "Açık",
		gpuOff: "Kapalı: hızlı cevaplar",
		live: "Anlık, kaydedilmiyor",
		ago: `${DAYS} gün önce`,
		today: "Bugün",
		up: "Çalışıyor",
		degraded: "Yavaş",
		down: "Kesinti",
		none: "Veri yok",
		minutesDown: (m: string) => `${m} kesinti`,
		incidents: "Geçmiş olaylar",
		noIncidents: "Kayıt yok.",
		resolved: (d: string) => `${d} sonra çözüldü`,
		ongoing: "sürüyor",
		locale: "tr-TR",
	},
};

type Site = {
	name: string;
	slug: string;
	status: "up" | "down" | "degraded";
	time: number;
	dailyMinutesDown: Record<string, number>;
	start?: string;
};
type Incident = {
	id: number;
	title: string;
	url: string;
	opened: string;
	closed: string | null;
};

const day = (offset: number) =>
	new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10);
const duration = (minutes: number) =>
	minutes < 60
		? `${Math.round(minutes)} min`
		: `${Math.floor(minutes / 60)} h ${Math.round(minutes % 60)} min`;

export default function Status({ lang = "en" }: { lang?: "en" | "tr" }) {
	const w = WORDS[lang];
	const [sites, setSites] = useState<Site[] | null>(null);
	const [failed, setFailed] = useState(false);
	const [incidents, setIncidents] = useState<Incident[]>([]);
	const [gpu, setGpu] = useState<"on" | "off" | "unknown" | null>(null);
	const [updated, setUpdated] = useState<Date | null>(null);
	const date = (iso: string, withYear = true) =>
		new Date(iso).toLocaleDateString(w.locale, {
			day: "numeric",
			month: "short",
			...(withYear && { year: "numeric" }),
		});

	useEffect(() => {
		fetch(`${DATA}/history/summary.json`)
			.then((r) => r.json() as Promise<Site[]>)
			.then(async (list) => {
				// Each check's first day, so the days before it show as "no data".
				const starts = await Promise.all(
					list.map((s) =>
						fetch(`${DATA}/history/${s.slug}.yml`)
							.then((r) => r.text())
							.then((yml) => yml.match(/startTime:\s*(\S+)/)?.[1]?.slice(0, 10))
							.catch(() => undefined),
					),
				);
				setSites(list.map((s, i) => ({ ...s, start: starts[i] })));
				setUpdated(new Date());
			})
			.catch(() => setFailed(true));
		fetch(ISSUES)
			.then((r) => (r.ok ? r.json() : []))
			.then((issues: any[]) =>
				setIncidents(
					issues
						.filter((i) => !i.pull_request)
						.map((i) => ({
							id: i.number,
							title: i.title.replace(/^\W+/u, ""),
							url: i.html_url,
							opened: i.created_at,
							closed: i.closed_at,
						})),
				),
			)
			.catch(() => {});
		fetch("/api/status")
			.then((r) => (r.ok ? r.json() : Promise.reject()))
			.then((s) => setGpu(s.gpu?.llm?.available ? "on" : "off"))
			.catch(() => setGpu("unknown"));
	}, []);

	const down = sites?.some((s) => s.status === "down");
	const headline = sites
		? down
			? w.someDown
			: w.allUp
		: failed
			? w.unavailable
			: w.checking;
	const incidentOn = (site: Site, d: string) =>
		incidents.find(
			(i) =>
				i.opened.slice(0, 10) === d &&
				i.title.toLowerCase().includes(site.name.toLowerCase()),
		);
	const groups = [
		{
			name: w.groups.website,
			sites: sites?.filter((s) => !s.slug.includes("turquoise")) ?? [],
		},
		{
			name: w.groups.turquoise,
			sites: sites?.filter((s) => s.slug.includes("turquoise")) ?? [],
			gpu: true,
		},
	];
	const days = Array.from({ length: DAYS }, (_, i) => day(DAYS - 1 - i));

	return (
		<div className="status">
			<p className="status-updated">
				<span
					className={`dot ${sites ? (down ? "down" : "up") : ""}`}
					aria-hidden="true"
				/>
				{updated
					? `${w.updated} ${updated.toLocaleTimeString(w.locale, { hour: "2-digit", minute: "2-digit" })}`
					: " "}
			</p>
			<h1>{headline}</h1>
			{sites && (
				<p className="status-summary">{down ? w.summaryDown : w.summaryUp}</p>
			)}

			{groups.map((group) => (
				<section className="status-group" key={group.name}>
					<div className="status-row status-head">
						<span>{group.name}</span>
						<span className="range">
							<span>{w.ago}</span>
							<span>{w.today}</span>
						</span>
						<span />
					</div>
					{group.sites.map((site) => (
						<div className="status-row" key={site.slug}>
							<div className="name">
								<strong>{site.name}</strong>
								<small>{w.about[site.slug] ?? site.slug}</small>
							</div>
							<div className="bars">
								{days.map((d) => {
									const minutes = site.dailyMinutesDown[d] ?? 0;
									const kind =
										site.start && d < site.start
											? "none"
											: minutes === 0
												? "up"
												: minutes < 60
													? "degraded"
													: "down";
									const tip = `${date(d, false)} · ${kind === "none" ? w.none : minutes ? w.minutesDown(duration(minutes)) : w.up}`;
									const incident = incidentOn(site, d);
									return incident ? (
										<a
											key={d}
											className={`bar ${kind}`}
											data-tip={tip}
											href={`#incident-${incident.id}`}
										>
											<span className="sr-only">{tip}</span>
										</a>
									) : (
										<span key={d} className={`bar ${kind}`} data-tip={tip} />
									);
								})}
							</div>
							<div className="state">
								<span className={`label ${site.status}`}>{w[site.status]}</span>
								<small>{site.time} ms</small>
							</div>
						</div>
					))}
					{group.gpu && (
						<div className="status-row">
							<div className="name">
								<strong>{w.gpu}</strong>
								<small>{w.gpuAbout}</small>
							</div>
							<div className="live">{w.live}</div>
							<div className="state">
								<span
									className={`label ${gpu === "on" ? "up" : gpu === "off" ? "degraded" : "none"}`}
								>
									{gpu === "on" ? w.gpuOn : gpu === "off" ? w.gpuOff : "…"}
								</span>
							</div>
						</div>
					)}
				</section>
			))}

			<p className="status-legend">
				<span className="none" /> {w.none} <span className="down" /> {w.down}{" "}
				<span className="degraded" /> {w.degraded} <span className="up" />{" "}
				{w.up}
			</p>

			<h2 className="status-incidents-title">{w.incidents}</h2>
			{incidents.length === 0 ? (
				<p className="status-empty">{w.noIncidents}</p>
			) : (
				<ol className="status-incidents">
					{incidents.map((i) => (
						<li key={i.id} id={`incident-${i.id}`}>
							<time dateTime={i.opened}>{date(i.opened)}</time>
							<div>
								<a href={i.url} target="_blank" rel="noopener">
									{i.title}
								</a>
								<small>
									{i.closed
										? w.resolved(
												duration(
													(Date.parse(i.closed) - Date.parse(i.opened)) /
														60_000,
												),
											)
										: w.ongoing}
								</small>
							</div>
						</li>
					))}
				</ol>
			)}
		</div>
	);
}
