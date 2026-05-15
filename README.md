# Zuriel Shanley Tanyory, Cybersecurity Portfolio

A fully static, GitHub Pages-ready personal portfolio website for Zuriel Shanley Tanyory, with an optional Cloudflare Workers AI Resume Assistant.

## Design direction

The site uses a premium dark product-page aesthetic inspired by the tone of a modern Apple product launch: cinematic hero, restrained navigation, large typography, polished spacing, dark glass panels, and high-contrast storytelling. No Apple assets, Apple branding, iPhone imagery, or copied Apple layouts are used.

## Files

```text
.
├── index.html
├── styles.css
├── script.js
├── README.md
├── assets
│   ├── ai
│   │   └── config.js
│   ├── icons
│   │   └── favicon.svg
│   ├── images
│   │   ├── hero-cyber-device.svg
│   │   └── og-card.svg
│   └── resume
│       └── Zuriel-Shanley-Tanyory-Resume.pdf
└── worker
    ├── README.md
    ├── wrangler.toml
    └── src
        └── index.js
```

## Deploy the static portfolio to GitHub Pages

1. Create a new GitHub repository.
2. Upload all files and folders in this project to the repository root.
3. Go to **Settings -> Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/root` folder.
6. Save. GitHub Pages will publish the static site.

## Optional: enable the AI Resume Assistant

The website itself remains static. The AI assistant calls a separate Cloudflare Worker at the edge.

1. Install Node.js if needed.
2. Open a terminal in the `worker` folder.
3. Log in to Cloudflare:

```bash
npx wrangler login
```

4. Check `worker/wrangler.toml` and update `ALLOWED_ORIGINS` to include your live portfolio domain, for example:

```toml
ALLOWED_ORIGINS = "https://zurielst.com,https://leiruz.github.io"
```

5. Deploy the Worker:

```bash
npx wrangler deploy
```

6. Wrangler will print a Worker URL. Add `/chat` to it, then paste it into `assets/ai/config.js`:

```js
window.ZURIEL_AI_CONFIG = {
  endpoint: "https://zuriel-portfolio-ai.your-subdomain.workers.dev/chat"
};
```

7. Commit and push the updated `assets/ai/config.js` to GitHub Pages.

Until the endpoint is added, the AI widget stays visible but shows a setup message instead of calling a model.

## Local preview

Open `index.html` directly in a browser. No build step is required for the static site.

## External libraries

The site uses these CDN libraries only for front-end animation:

- GSAP 3.12.5
- GSAP ScrollTrigger 3.12.5

The optional AI feature uses Cloudflare Workers AI through the Worker in `/worker`. No OpenAI key is required for the default implementation.

## Content source

The uploaded resume is the source of truth for employment history, education, projects, certifications, publications, leadership, and metrics. Public links are included only where they are already listed in the resume or publicly verifiable.

## Privacy

The phone number from the resume is intentionally omitted because this is a public portfolio designed for GitHub Pages. Public contact methods are email, GitHub, LinkedIn, personal website, and downloadable resume. The AI Worker is also instructed not to reveal or infer a mobile number.

## Editing tips

- Update copy directly in `index.html`.
- Update colors and spacing in `styles.css`.
- Update carousel and AI widget behavior in `script.js`.
- Update the AI Worker knowledge base in `worker/src/index.js` when your resume changes.
- Replace `assets/resume/Zuriel-Shanley-Tanyory-Resume.pdf` with a newer resume using the same filename to keep the download link working.

## Verification checklist

- Static portfolio remains GitHub Pages compatible.
- Optional AI capability is isolated in a Cloudflare Worker.
- No API key is exposed in browser JavaScript.
- Paragraphs use justified text styling in CSS.
- Projects section uses an accessible carousel with scroll-snap, buttons, dots, keyboard support, and touch/trackpad support.
- Navbar stays reduced to five items: Overview, Work, Projects, Credentials, Contact.
- Mobile number is not displayed.
- Resume facts are preserved without invented achievements.
