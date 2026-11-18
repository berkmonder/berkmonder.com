# berkmonder.com

My site: what I offer (consulting, builds and training for AI in production), my work, the blog, free
lessons, and the status of my services. The whole site is [Starlight](https://starlight.astro.build)
(Astro), built to static files and served by Caddy on my VPS.

## Changing things

| To… | Do this |
|---|---|
| Edit a page | `src/content/docs/<page>.mdx` (`index` is the home page) |
| Add a page | add `src/content/docs/<name>.mdx` with a `title`, then add it to `sidebar` in `astro.config.ts` |
| Write a blog post | add `src/content/docs/blog/<slug>.mdx` with `title`, `description`, `date` and `tags: [a, b]`; `draft: true` keeps it out of the built site (it still shows in `pnpm dev`) |
| Add a lesson | add `src/content/docs/learn/<slug>.mdx`; it shows up in the lessons menu by itself |
| Put a video on a page | `import { YouTube } from "@astro-community/astro-embed-youtube";` then `<YouTube id="…" />` |
| Put the chat inside a page | `<div data-turquoise-inline class="not-content"></div>` (as on `/turquoise/`); a link to `#ask` opens the bubble on any page |
| Change colors or fonts | `src/styles/theme.css` (Starlight's color variables, dark first, then light) |
| Change the menu, header links, title | `astro.config.ts` (`sidebar`, `social`, `title`) |
| Replace the CV | `public/files/resume_muhammedBerkOnder.pdf` |
| Remake the link-preview image | `node scripts/og.mjs public/og.png` |

Pages are Markdown with a few components: Starlight's own (`Card`, `CardGrid`, `LinkButton`, `Steps`,
`Badge`; see [its docs](https://starlight.astro.build/components/using-components/)) and one of mine,
`<Section label="…">` (a label on the left, the content on the right).

## How it's put together

```
astro.config.ts           title, header links, the menu, the chat's script, the dev proxy
src/content/docs/         every page (Markdown/MDX); blog/ the posts, learn/ the lessons
src/pages/blog/           the blog's list (index.astro) and its feed (rss.xml.ts)
src/blog.ts               the posts for both, newest first, without drafts
src/routeData.ts          the menu: Learn opens into its lessons only on /learn/ pages
src/components/           Section.astro; PageTitle.astro (a post's date and tags);
                          ThemeSelect.astro (the dark/light button); Status.tsx (the /status board)
src/styles/theme.css      the look
public/                   files served as they are (CV, images, favicon)
```

- **The chat** is [turquoise](https://github.com/berkmonder/turquoise), a separate app. Every page loads
  its script, `/widget/turquoise.js`, which puts the chat bubble in the bottom-right corner; the chat
  talks to `/api`. On the server both are routed to turquoise (nix-dotfiles: `hosts/vps/apps.nix`). If
  turquoise is down, the site works without the chat.
- **The status board** (`src/components/Status.tsx`): the checks are
  [Upptime](https://github.com/berkmonder/status)'s, run by GitHub every 5 minutes; this shows their
  history and incidents, and whether my GPU is on.

## RSS

There is nothing to set up: the site writes `/blog/rss.xml` on every build, and feed readers (Feedly,
NetNewsWire, …) check it for new posts. The "Subscribe (RSS)" button on `/blog/` links to it.

It used to look broken because there were no published posts: an empty feed shows as raw XML in the
browser, or downloads. To send new posts by email too, a service like Buttondown or follow.it can turn
the feed into a newsletter.

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
minutes (nix-dotfiles: `hosts/vps/apps.nix`, `apps.berkmonder`, which also sends `/api` and `/widget` to
turquoise).
