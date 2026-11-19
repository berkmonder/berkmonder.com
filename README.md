# berkmonder.com

My site: who I am, my lessons (Learn), my blog, my assistant (Turquoise) and the status of my services.
Astro, built to static files and served by Caddy on my VPS.

Two parts:

- **The site**: home, about, Turquoise, status (in English at `/`, in Turkish at `/tr/`) and the blog
  (Turkish). Plain Astro pages around one layout: the numbered menu on the left, the page on the right.
- **Learn** (`/learn`, Turkish): [Starlight](https://starlight.astro.build), like a documentation site.
  A dropdown picks the subject; each subject's folders are the categories in its menu; each page has its
  contents on the right.

## Changing things

| To… | Do this |
|---|---|
| Change a page's text | `src/views/<Page>.astro`: the English and Turkish text are at the top, the layout below |
| Change the menu or words on every page | `src/i18n.ts` |
| Write a blog post | add `src/content/blog/<slug>.md` with `title`, `description`, `date` and `tags: [a, b]`; `draft: true` keeps it out of the built site (it still shows in `pnpm dev`) |
| Add a lesson | add `src/content/docs/learn/<subject>/<category>/<page>.mdx` with a `title`; a new folder is a new category in the menu; `draft: true` keeps it unpublished |
| Add a subject to Learn | a folder in `src/content/docs/learn/`, and an entry in `starlightSidebarTopics` in `astro.config.ts` |
| Put a video on a page | `import { YouTube } from "@astro-community/astro-embed-youtube";` then `<YouTube id="…" />` |
| Change colors or fonts | `src/styles/site.css` (the site) and `src/styles/learn.css` (Learn): the same colors, dark first, then light |
| Replace the CV | `public/files/resume_muhammedBerkOnder.pdf` |
| Remake the link-preview image | `node scripts/og.mjs public/og.png` |

## How it's put together

```
astro.config.ts            Learn (Starlight): its subjects, llms.txt; redirects; the dev proxy
src/pages/                 the site's addresses: index, about, turquoise, status (and tr/ for Turkish),
                           blog/ (list, posts, rss.xml), 404
src/views/                 those pages' text and layout (Home, About, Turquoise, Status)
src/layouts/Site.astro     around every page of the site: <head>, the menu, the chat's script
src/components/            Rail (the menu: press 1–4 to go to a page), StatusLink (the status in the menu),
                           ThemeButton (dark/light), Status.tsx (the status board), learn/ (Learn's menu
                           with its subject dropdown, and its theme button)
src/content/blog/          blog posts
src/content/docs/learn/    Learn's pages: <subject>/<category>/<page>.mdx
src/i18n.ts                the two languages: the menu and the words every page uses
public/                    files served as they are (CV, images, favicon)
```

- **The chat** is [turquoise](https://github.com/berkmonder/turquoise), a separate app. Every page loads
  its script, `/widget/turquoise.js`, which puts the chat button in the bottom-right corner (or the chat
  itself in a `<div data-turquoise-inline>`, as on `/turquoise/`); a link to `#ask` opens it. On the
  server, `/api` and `/widget` go to turquoise (nix-dotfiles: `hosts/vps/apps.nix`). If turquoise is
  down, the site works without the chat.
- **The status** (the menu's "Normal", and `/status`): the checks are
  [Upptime](https://github.com/berkmonder/status)'s, run by GitHub every 5 minutes; the browser reads
  their history and incidents from there, and whether my GPU is on from `/api/status`.
- **`/llms.txt`** (and `llms-full.txt`): the site in plain text for language models, made by the
  starlight-llms-txt plugin from Learn's pages and the links in `astro.config.ts`.

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
minutes (nix-dotfiles: `hosts/vps/apps.nix`, `apps.berkmonder`).
