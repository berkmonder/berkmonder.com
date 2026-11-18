// The status board on /status. The checks are Upptime's (github.com/berkmonder/status): GitHub runs
// them every 5 minutes, from outside my servers, and keeps the history in that repository. This reads
// it live, adds whether my GPU is on (/api/status), and lists past incidents (Upptime opens an issue
// for each).

import { useEffect, useState } from "react";
import "./status.css";

const REPO = "berkmonder/status";
const DATA = `https://raw.githubusercontent.com/${REPO}/master`;
const DAYS = 30;
// What each check is, in words (by Upptime's slug). Others show their address.
const ABOUT: Record<string, string> = {
	"berkmonder-com": "This website",
	"turquoise-api": "The assistant's API",
	"turquoise-berkmonder-com": "The old demo site's address",
};

type Site = {
	name: string;
	url: string;
	slug: string;
	status: "up" | "down" | "degraded";
	uptimeMonth: string;
	time: number;
	dailyMinutesDown: Record<string, number>;
	start?: string;
};
type Incident = {
	title: string;
	url: string;
	opened: string;
	closed: string | null;
};
type Gpu = "checking" | "on" | "off" | "unknown";

const day = (offset: number) =>
	new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10);
const duration = (ms: number) => {
	const minutes = Math.round(ms / 60_000);
	return minutes < 60
		? `${minutes} min`
		: `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
};
const date = (iso: string) =>
	new Date(iso).toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});

function Bars({ site }: { site: Site }) {
	const days = Array.from({ length: DAYS }, (_, i) => day(DAYS - 1 - i));
	return (
		<div className="status-bars">
			{days.map((d) => {
				const down = site.dailyMinutesDown[d] ?? 0;
				const kind =
					site.start && d < site.start
						? "none"
						: down === 0
							? "up"
							: down < 60
								? "partial"
								: "down";
				const label =
					kind === "none"
						? "no data"
						: down
							? `${duration(down * 60_000)} down`
							: "no downtime";
				return <span key={d} className={kind} title={`${date(d)}: ${label}`} />;
			})}
		</div>
	);
}

export default function Status() {
	const [sites, setSites] = useState<Site[] | null>(null);
	const [incidents, setIncidents] = useState<Incident[]>([]);
	const [gpu, setGpu] = useState<Gpu>("checking");
	const [failed, setFailed] = useState(false);

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
			})
			.catch(() => setFailed(true));
		fetch(`https://api.github.com/repos/${REPO}/issues?state=all&per_page=10`)
			.then((r) => (r.ok ? r.json() : []))
			.then((issues: any[]) =>
				setIncidents(
					issues
						.filter((i) => !i.pull_request)
						.map((i) => ({
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

	const down = sites?.filter((s) => s.status !== "up") ?? [];
	const headline = !sites
		? failed
			? "Status unavailable"
			: "Checking…"
		: down.length
			? `${down.map((s) => s.name).join(", ")}: down`
			: "All systems operational";

	return (
		<div className="status not-content">
			<p
				className={`status-headline ${!sites ? "" : down.length ? "is-down" : "is-up"}`}
			>
				<span aria-hidden="true" />
				{headline}
			</p>

			<div className="status-table">
				<div className="status-row status-head">
					<span>Service</span>
					<span className="status-range">
						<span>{DAYS} days ago</span>
						<span>Today</span>
					</span>
					<span />
				</div>
				{sites?.map((s) => (
					<div className="status-row" key={s.slug}>
						<div>
							<strong>{s.name}</strong>
							<small>{ABOUT[s.slug] ?? new URL(s.url).host}</small>
						</div>
						<Bars site={s} />
						<div className="status-state">
							<span className={s.status === "up" ? "up" : "down"}>
								{s.status === "up" ? "Operational" : "Down"}
							</span>
							<small>
								{s.uptimeMonth} · {s.time} ms
							</small>
						</div>
					</div>
				))}
				<div className="status-row">
					<div>
						<strong>Assistant model</strong>
						<small>
							The LLM on my own GPU. When it's off, the assistant answers from
							my CV.
						</small>
					</div>
					<div className="status-note">Live, not recorded</div>
					<div className="status-state">
						<span
							className={
								gpu === "on" ? "up" : gpu === "off" ? "partial" : "none"
							}
						>
							{
								{
									checking: "Checking…",
									on: "Online",
									off: "Off: quick answers",
									unknown: "Unknown",
								}[gpu]
							}
						</span>
					</div>
				</div>
			</div>

			<p className="status-legend">
				<span className="up" /> No downtime <span className="partial" /> Under
				an hour down <span className="down" /> An hour or more{" "}
				<span className="none" /> No data
			</p>

			<h2>Past incidents</h2>
			{incidents.length === 0 ? (
				<p className="status-empty">None recorded.</p>
			) : (
				<ul className="status-incidents">
					{incidents.map((i) => (
						<li key={i.url}>
							<time dateTime={i.opened}>{date(i.opened)}</time>
							<a href={i.url}>{i.title}</a>
							<span>
								{i.closed
									? `resolved after ${duration(Date.parse(i.closed) - Date.parse(i.opened))}`
									: "ongoing"}
							</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
