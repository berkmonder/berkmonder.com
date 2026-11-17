# berkmonder.com

My site: what I offer (consulting, builds and training for AI in production), my work, the blog, and
free lessons. Astro, static, served by Caddy on my VPS.

## Where things are

| What | Where |
|---|---|
| Name, email, socials, main navigation | `src/site.ts` |
| Services, how an engagement works, FAQ | `src/data/services.ts` |
| Work (cards on `/work`; `featured` ones on the home page) | `src/data/work.ts` |
| Pages | `src/pages/` (`index`, `services`, `work`, `about`, `blog/`) |
| Blog posts | `src/content/blog/<slug>.mdx` → `/blog/<slug>`; `draft: true` keeps one unpublished, `youtube: <id>` puts a video on top |
| Lessons (Starlight) | `src/content/docs/learn/<slug>.mdx` → `/learn/<slug>`; the sidebar fills itself |
| Look (colors, fonts, buttons, cards) | `src/styles/global.css`; the same colors for the lessons in `src/styles/starlight.css` |
| Link-preview image | `public/og.png`, made by `node scripts/og.mjs public/og.png` |
| CV | `public/files/resume_muhammedBerkOnder.pdf` |

Every page except the lessons uses `src/layouts/Base.astro`. The lessons are Starlight's, with the site's
name and navigation in its header (`src/components/starlight/`). Light/dark follows the system until a
visitor picks one; the choice is shared between both.

## Run it

Astro needs Node ≥ 22.23.4 (the image uses Node 24):

```bash
pnpm install
pnpm dev     # http://localhost:4321
pnpm build   # type-check, then build into dist/
```

## Deploy

Push to `main`: CI builds the image (`Containerfile`: build with Node, serve with Caddy), checks it answers,
and publishes it to `ghcr.io/berkmonder/berkmonder`. The VPS runs each new version within about 4
minutes (nix-dotfiles: `hosts/vps/apps.nix`, `apps.berkmonder`).
