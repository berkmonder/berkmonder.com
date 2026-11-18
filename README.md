# berkmonder.com

My site: what I offer (consulting, builds and training for AI in production), my work, the blog, free
lessons, and the status of my services. The whole site is [Starlight](https://starlight.astro.build)
(Astro), built to static files and served by Caddy on my VPS.

## Changing things

| To… | Do this |
|---|---|
| Edit a page | `src/content/docs/<page>.mdx` (`index` is the home page) |
| Add a page | add `src/content/docs/<name>.mdx` with a `title`, then add it to `sidebar` in `astro.config.ts` |
| Write a blog post | add `src/content/docs/blog/<slug>.mdx` with `title`, `date` and `authors: berk`; `draft: true` keeps it unpublished |
| Add a lesson | add `src/content/docs/learn/<slug>.mdx`; it shows up in the menu by itself |
| Put a video on a page | `import { YouTube } from "@astro-community/astro-embed-youtube";` then `<YouTube id="…" />` |
| Change colors or fonts | `src/styles/theme.css` (Starlight's color variables, dark first, then light) |
| Change the menu, links, title | `astro.config.ts` |
| Replace the CV | `public/files/resume_muhammedBerkOnder.pdf` |
| Remake the link-preview image | `node scripts/og.mjs public/og.png` |

Pages are Markdown with a few components: Starlight's own (`Card`, `CardGrid`, `LinkButton`, `Steps`,
`Badge`; see [its docs](https://starlight.astro.build/components/using-components/)) and one of mine,
`<Section label="…">` (a label on the left, the content on the right).

## The moving parts

- `src/components/Assistant.tsx`: the chat in the bottom-right corner (on every page, through
  `src/components/Footer.astro`). It talks to turquoise's API at `/api` (`/api/chat`, `/api/status`,
  `/api/contact`); any link to `#ask` opens it.
- `src/components/Status.tsx`: the board on `/status`. The checks themselves are
  [Upptime](https://github.com/berkmonder/status)'s, run by GitHub every 5 minutes; this shows their
  history and incidents, and whether my GPU is on.
- `src/routeData.ts`: keeps the site's menu on blog pages.

## Run it

Astro needs Node ≥ 22.23.4 (the image uses Node 24):

```bash
pnpm install
pnpm dev     # http://localhost:4321; /api goes to the live API
pnpm build   # type-check, then build into dist/
```

## Deploy

Push to `main`: CI builds the image (`Containerfile`: build with Node, serve with Caddy), checks it answers,
and publishes it to `ghcr.io/berkmonder/berkmonder`. The VPS runs each new version within about 4
minutes (nix-dotfiles: `hosts/vps/apps.nix`, `apps.berkmonder`, which also sends `/api` to turquoise).
