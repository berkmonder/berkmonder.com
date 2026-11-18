// The assistant: a chat button in the bottom-right corner that opens a small messages window.
// It talks to turquoise's API (/api/chat streams the answer; /api/status says whether my GPU is on).
// The conversation is kept for the browser tab, so it survives moving between pages.
// Any link to "#ask" opens it.

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import "./assistant.css";

type Message = {
	role: "user" | "assistant";
	text: string;
	servedBy?: string;
	reason?: string;
};
type Saved = {
	messages: Message[];
	conversationId: string | null;
	open: boolean;
};
type Health = "checking" | "online" | "quick" | "offline";

const STORE = "assistant";
const SUGGESTIONS = [
	"What does Berk do?",
	"Can Berk train our team on LLMs?",
	"What has Berk built with LLMs?",
];
const WHY: Record<string, string> = {
	gpu_offline: "my GPU is offline right now",
	busy: "my GPU is busy",
	daily_limit: "today's GPU budget is used up",
};

function load(): Saved {
	try {
		const saved = JSON.parse(sessionStorage.getItem(STORE) ?? "null");
		if (saved?.messages) return saved;
	} catch {}
	return { messages: [], conversationId: null, open: false };
}

/** POST the question and call `onEvent` for each server-sent event of the answer. */
async function stream(
	body: unknown,
	onEvent: (e: Record<string, any>) => void,
) {
	const response = await fetch("/api/chat", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!response.ok || !response.body) {
		const detail = await response.json().then(
			(d) => d.detail,
			() => null,
		);
		throw new Error(
			typeof detail === "string"
				? detail
				: "The assistant isn't reachable right now.",
		);
	}
	const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
	let buffer = "";
	for (;;) {
		const { value, done } = await reader.read();
		if (done) break;
		buffer += value;
		for (
			let end = buffer.indexOf("\n\n");
			end >= 0;
			end = buffer.indexOf("\n\n")
		) {
			for (const line of buffer.slice(0, end).split("\n")) {
				if (line.startsWith("data: ")) onEvent(JSON.parse(line.slice(6)));
			}
			buffer = buffer.slice(end + 2);
		}
	}
}

export default function Assistant() {
	const [open, setOpen] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [draft, setDraft] = useState("");
	const [busy, setBusy] = useState(false);
	const [health, setHealth] = useState<Health>("checking");
	const [contact, setContact] = useState<
		"closed" | "open" | "sending" | "sent"
	>("closed");
	const [error, setError] = useState("");
	const list = useRef<HTMLDivElement>(null);
	const input = useRef<HTMLTextAreaElement>(null);

	// Restore this tab's conversation, and open on "#ask" links.
	useEffect(() => {
		const saved = load();
		setMessages(saved.messages);
		setConversationId(saved.conversationId);
		setOpen(saved.open);
		const onHash = () => {
			if (location.hash === "#ask") {
				setOpen(true);
				history.replaceState(null, "", location.pathname + location.search);
			}
		};
		onHash();
		addEventListener("hashchange", onHash);
		return () => removeEventListener("hashchange", onHash);
	}, []);

	useEffect(() => {
		try {
			sessionStorage.setItem(
				STORE,
				JSON.stringify({ messages, conversationId, open }),
			);
		} catch {}
	}, [messages, conversationId, open]);

	// While open: is my GPU on? (checked every 30 s)
	useEffect(() => {
		if (!open) return;
		const check = () =>
			fetch("/api/status")
				.then((r) => (r.ok ? r.json() : Promise.reject()))
				.then((s) => setHealth(s.gpu?.llm?.available ? "online" : "quick"))
				.catch(() => setHealth("offline"));
		check();
		const timer = setInterval(check, 30_000);
		input.current?.focus();
		return () => clearInterval(timer);
	}, [open]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll to the bottom whenever something is added
	useEffect(() => {
		list.current?.scrollTo({ top: list.current.scrollHeight });
	}, [messages, contact]);

	async function ask(question: string) {
		const text = question.trim();
		if (!text || busy) return;
		setDraft("");
		setError("");
		setBusy(true);
		setMessages((m) => [
			...m,
			{ role: "user", text },
			{ role: "assistant", text: "" },
		]);
		const update = (change: (last: Message) => Message) =>
			setMessages((m) => [...m.slice(0, -1), change(m[m.length - 1])]);
		try {
			await stream({ message: text, conversation_id: conversationId }, (e) => {
				if (e.type === "conversation") setConversationId(e.id);
				if (e.type === "token")
					update((last) => ({ ...last, text: last.text + e.text }));
				if (e.type === "done")
					update((last) => ({
						...last,
						servedBy: e.served_by,
						reason: e.reason,
					}));
			});
		} catch (e) {
			setMessages((m) => (m[m.length - 1].text ? m : m.slice(0, -2)));
			setError(e instanceof Error ? e.message : String(e));
			setDraft(text);
		} finally {
			setBusy(false);
		}
	}

	function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			ask(draft);
		}
	}

	async function sendContact(e: {
		preventDefault(): void;
		currentTarget: HTMLFormElement;
	}) {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		setContact("sending");
		setError("");
		const response = await fetch("/api/contact", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				...Object.fromEntries(form),
				conversation_id: conversationId,
			}),
		}).catch(() => null);
		if (response?.ok) return setContact("sent");
		setContact("open");
		const detail = await response?.json().then(
			(d) => d.detail,
			() => null,
		);
		setError(
			typeof detail === "string"
				? detail
				: "That didn't go through: check the email, or write to berkmonder@gmail.com.",
		);
	}

	const status = {
		checking: "Connecting…",
		online: "Online · running on my own GPU",
		quick: "Quick answers · my GPU is off",
		offline: "Offline right now",
	}[health];

	return (
		<div
			className="assistant"
			onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
		>
			{open && (
				<section
					className="assistant-panel"
					role="dialog"
					aria-labelledby="assistant-title"
				>
					<header>
						<span className={`assistant-dot ${health}`} aria-hidden="true" />
						<div>
							<h2 id="assistant-title">Ask about Berk</h2>
							<p>{status}</p>
						</div>
						<button
							type="button"
							className="assistant-icon"
							onClick={() => setOpen(false)}
							aria-label="Close"
						>
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path d="M6 6l12 12M18 6L6 18" />
							</svg>
						</button>
					</header>

					<div className="assistant-messages" ref={list} aria-live="polite">
						<div className="bubble assistant-says">
							Hi! I can tell you about Berk's work, services and how to get in
							touch. What would you like to know?
						</div>
						{messages.length === 0 && (
							<div className="assistant-suggestions">
								{SUGGESTIONS.map((s) => (
									<button type="button" key={s} onClick={() => ask(s)}>
										{s}
									</button>
								))}
							</div>
						)}
						{messages.map((m, i) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: messages are only ever appended
								key={i}
								className={`bubble ${m.role === "user" ? "user-says" : "assistant-says"}`}
							>
								{m.role === "user" ? (
									m.text
								) : m.text ? (
									<Markdown>{m.text}</Markdown>
								) : (
									<span className="typing">…</span>
								)}
								{m.servedBy === "fallback" && (
									<small>
										Quick answer from Berk's CV:{" "}
										{WHY[m.reason ?? ""] ?? "the model isn't reachable"}.
									</small>
								)}
							</div>
						))}
						{contact === "closed" && messages.length >= 2 && (
							<button
								type="button"
								className="assistant-link"
								onClick={() => setContact("open")}
							>
								Contact Berk: leave your email →
							</button>
						)}
						{(contact === "open" || contact === "sending") && (
							<form className="assistant-contact" onSubmit={sendContact}>
								<input
									name="name"
									required
									maxLength={100}
									placeholder="Your name"
									autoComplete="name"
								/>
								<input
									name="email"
									type="email"
									required
									maxLength={200}
									placeholder="Email"
									autoComplete="email"
								/>
								<textarea
									name="message"
									maxLength={1500}
									rows={2}
									placeholder="What's it about? (optional)"
								/>
								<button type="submit" disabled={contact === "sending"}>
									{contact === "sending" ? "Sending…" : "Send to Berk"}
								</button>
							</form>
						)}
						{contact === "sent" && (
							<div className="bubble assistant-says">
								Thanks! Berk will get back to you soon.
							</div>
						)}
						{error && <p className="assistant-error">{error}</p>}
					</div>

					<form
						className="assistant-input"
						onSubmit={(e) => {
							e.preventDefault();
							ask(draft);
						}}
					>
						<textarea
							ref={input}
							value={draft}
							onChange={(e) => setDraft(e.target.value)}
							onKeyDown={onKey}
							rows={1}
							maxLength={1000}
							placeholder="Ask a question…"
							aria-label="Your question"
						/>
						<button
							type="submit"
							className="assistant-icon send"
							disabled={busy || !draft.trim()}
							aria-label="Send"
						>
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path d="M5 12h14M13 6l6 6-6 6" />
							</svg>
						</button>
					</form>
				</section>
			)}

			<button
				type="button"
				className="assistant-launcher"
				onClick={() => setOpen(!open)}
				aria-expanded={open}
				aria-label={open ? "Close the assistant" : "Ask about Berk"}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					{open ? (
						<path d="M6 6l12 12M18 6L6 18" />
					) : (
						<path d="M4 5h16v11H9l-5 4z" />
					)}
				</svg>
				{!open && <span>Ask about me</span>}
			</button>
		</div>
	);
}
