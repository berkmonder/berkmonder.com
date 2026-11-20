# berkmonder.com

My site: who I am, my lessons (Learn), my blog, my assistant (Turquoise) and the status of my services.
Astro, built to static files and served by Caddy on my VPS.

Two parts:

- **The site**: home, about, Turquoise, status (in Turkish at `/`, in English at `/en/`) and the blog
  (Turkish). Plain Astro pages around one layout: the numbered menu on the left, the page on the right.
- **Learn** (`/learn`, Turkish): [Starlight](https://starlight.astro.build), like a documentation site.
  A dropdown picks the subject; each subject's folders are the categories in its menu; each page has its
  contents on the right.

## Changing things

| To… | Do this |
|---|---|
| Change a page's text | `src/views/<Page>.astro`: the Turkish and English text are at the top, the layout below |
| Change what the chat suggests on a page | `assistant` in that page's view (its suggested questions, and the button's label) |
| Change the menu or words on every page | `src/i18n.ts` |
| Write a blog post | add `src/content/blog/<slug>.md` with `title`, `description`, `date` and `tags: [a, b]`; `draft: true` keeps it out of the built site (it still shows in `pnpm dev`) |
| Add a lesson | add `src/content/docs/learn/<subject>/<category>/<page>.mdx` with a `title`; a new folder is a new category in the menu; `draft: true` keeps it unpublished |
| Add a subject to Learn | a folder in `src/content/docs/learn/`, and an entry in `starlightSidebarTopics` in `astro.config.ts` |
| Put a video on a page | `import { YouTube } from "@astro-community/astro-embed-youtube";` then `<YouTube id="…" />` |
| Change colors or fonts | `src/styles/site.css` (the site) and `src/styles/learn.css` (Learn): the same colors, dark first, then light |
| Change the CV | `cv/cv.md`; push, and the PDF is rebuilt (see [The CV](#the-cv)) |
| Remake the link-preview image | `node scripts/og.mjs public/og.png` |

## How it's put together

```
astro.config.ts            Learn (Starlight): its subjects, llms.txt; redirects; the dev proxy
src/pages/                 the site's addresses: index, about, turquoise, status (and en/ for English),
                           blog/ (list, posts, rss.xml), 404
src/views/                 those pages' text and layout (Home, About, Turquoise, Status)
src/layouts/Site.astro     around every page of the site: <head>, the menu, the chat's script
src/components/            Rail (the menu: press 1–4 to go to a page), StatusLink (the status in the menu),
                           ThemeButton (dark/light), Status.tsx (the status board), learn/ (Learn's top
                           row, menu, social links and theme button: Starlight's own, replaced)
src/content/blog/          blog posts
src/content/docs/learn/    Learn's pages: <subject>/<category>/<page>.mdx
src/content.config.ts      what a blog post's and a lesson's front matter may hold
src/i18n.ts                the two languages: the menu and the words every page uses
src/content/i18n/tr.json   Starlight's own words (search, contents…) in Turkish
cv/                        the CV: cv.md (the text), cv.css (its look), build.py (Markdown → PDF)
public/                    files served as they are (images, favicon, og.png)
scripts/og.mjs             makes the link-preview image, public/og.png
Containerfile, Caddyfile   the image: build with Node, build the CV, serve everything with Caddy
.github/workflows/         deploy.yml: on main, build the image, check it answers, publish it
```

## Addresses

| Address | What |
|---|---|
| `/`, `/en/` | home, in Turkish and English; also `about`, `turquoise`, `status` under each |
| `/blog/`, `/blog/rss.xml` | the blog (Turkish) and its feed |
| `/learn/` | Learn |
| `/files/resume_muhammedBerkOnder.pdf`, `/files/cv.md` | the CV as a PDF, and the Markdown Turquoise reads |
| `/llms.txt`, `/llms-full.txt` | the site for language models |
| `/api/*`, `/widget/*` | turquoise (its API, its chat's script): sent there by the VPS's Caddy, not part of this image |
| `/services`, `/work`, `/projects`, `/projects/turquoise` | old addresses, redirected (`redirects` in `astro.config.ts`) |

- **The chat** is [turquoise](https://github.com/berkmonder/turquoise), a separate app. Every page loads
  its script, `/widget/turquoise.js`, which puts the chat button in the bottom-right corner (or the chat
  itself in a `<div data-turquoise-inline>`, as on `/turquoise/`); a link to `#ask` opens it. It speaks the
  page's language, knows which page it's on, and takes the page's suggestions and label from
  `<meta name="turquoise:suggestions">` and `<meta name="turquoise:label">` (set by `assistant` in the views). On the
  server, `/api` and `/widget` go to turquoise (nix-dotfiles: `hosts/vps/apps.nix`). If turquoise is
  down, the site works without the chat.
- **The status** (the menu's "Normal", and `/status`): the checks are
  [Upptime](https://github.com/berkmonder/status)'s, run by GitHub every 5 minutes; the browser reads
  their history and incidents from there, and whether my GPU is on from `/api/status`.
- **`/llms.txt`** (and `llms-full.txt`): the site in plain text for language models, made by the
  starlight-llms-txt plugin from Learn's pages and the links in `astro.config.ts`.

## The CV

`cv/cv.md` is the CV, in plain Markdown: one `#` for the name, `##` for the sections, `###` for each job,
project or degree. The image builds it into `/files/resume_muhammedBerkOnder.pdf` with `cv/build.py`
(Markdown → HTML → PDF with WeasyPrint, styled by `cv/cv.css`) and serves the Markdown itself at
`/files/cv.md`, which is what Turquoise reads (every hour). So editing `cv/cv.md` and pushing updates
both.

It's written for applicant-tracking systems as much as for people: one column, standard section names, no
icons, tables or images, real text in the PDF. Keep it that way, and keep the headings as they are.

To see the PDF before pushing (Podman, or Docker with the same commands):

```bash
podman build --target cv -t berkmonder-cv .
podman create --name cv-preview berkmonder-cv x
mkdir -p cv/out
podman cp cv-preview:/resume_muhammedBerkOnder.pdf cv/out/
podman rm cv-preview
```

or, with Pango installed on your machine (`brew install pango`): `uv run --script cv/build.py`. Either
way the PDF is `cv/out/resume_muhammedBerkOnder.pdf` (not committed).

## RSS

There is nothing to set up: the site writes `/blog/rss.xml` on every build, and feed readers (Feedly,
NetNewsWire, …) check it for new posts. The "Abone ol (RSS)" button on `/blog/` links to it. An empty
feed (before the first post) shows as raw XML or downloads; that's normal. To send new posts by email
too, a service like Buttondown or follow.it can turn the feed into a newsletter.

## Run it

Astro needs Node ≥ 22.23.4 (the image uses Node 24):

```bash
pnpm install
pnpm dev     # http://localhost:4321; /api and /widget go to the live turquoise
             # (TURQUOISE_URL=http://… pnpm dev for another one)
pnpm build   # type-check, then build into dist/
```

## Deploy

Push to `main`: CI builds the image (`Containerfile`: build with Node, serve with Caddy), checks it answers,
and publishes it to `ghcr.io/berkmonder/berkmonder`. The VPS runs each new version within about 4
minutes, or goes back to the previous one if it isn't healthy (nix-dotfiles: `hosts/vps/apps.nix`,
`apps.berkmonder`). Logs: `ssh vps journalctl -u berkmonder -f` (the site), `ssh vps journalctl -u caddy`
(the front door: HTTPS, `/api`, `/widget`).
