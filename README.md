# POLA Frame

Free web app that turns photos into retro instant prints: vintage film filters, paper frames, handwritten captions, collage boards and HD export. Everything runs in the browser, so photos never leave the user's device.

## Pages

| URL | File | What it is |
| --- | --- | --- |
| `/` | `index.html` | Static landing page (plain HTML + CSS, no JavaScript) for search engines and Pinterest |
| `/editor/` | `editor/index.html` → `src/` | The React photo editor |

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000 (landing) and http://localhost:3000/editor/
npm run build      # outputs to dist/
npm run lint       # type-check
```

## Deploy

Deployed on Vercel. `vercel.json` adds trailing slashes (`/editor` → `/editor/`) and long cache headers for built assets.

## Before launch on a custom domain

Replace `https://pola-frame.vercel.app` with your domain in:

- `index.html` and `editor/index.html` (canonical and `og:` tags)
- `public/robots.txt` and `public/sitemap.xml`

Then claim the domain in Pinterest (Settings → Claimed accounts) and paste the `p:domain_verify` tag into `index.html`.
