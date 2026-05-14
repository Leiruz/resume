# Zuriel Shanley Tanyory - Cybersecurity Portfolio

A fully static personal resume / portfolio website designed for GitHub Pages. The site uses a premium dark cybersecurity aesthetic with subtle neon accents, terminal-inspired UI, dashboard-style highlights, responsive layouts, accessible navigation, and vanilla JavaScript enhancements.

## Design concept

The design positions Zuriel as a technical cybersecurity candidate with founder energy and hands-on security operations experience. The visual language combines:

- Dark, high-trust cybersecurity dashboard styling
- Subtle green, cyan, blue, and purple neon accents
- Terminal-inspired hero content and command-line navigation
- Recruiter-friendly content hierarchy for experience, education, projects, skills, certifications, publications, leadership, and contact
- Smooth scroll reveal animations that respect `prefers-reduced-motion`
- Accessible contrast, keyboard focus states, semantic HTML, and a mobile hamburger menu

## Project structure

```text
zuriel-cyber-portfolio/
├── index.html
├── styles.css
├── script.js
├── README.md
└── assets/
    ├── favicon.svg
    ├── og-image.svg
    └── site.webmanifest
```

## How to run locally

Open `index.html` directly in a browser. No build step is required.

For a local static server, run:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## GitHub Pages deployment

1. Create a new GitHub repository, or use an existing portfolio repository.
2. Upload `index.html`, `styles.css`, `script.js`, `README.md`, and the `assets/` folder to the repository root.
3. Commit and push to the `main` branch.
4. In GitHub, go to **Settings > Pages**.
5. Under **Build and deployment**, set:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
6. Save. GitHub Pages will publish the site from the static files.

## Custom domain notes

The HTML currently uses `https://zurielst.com/` as the canonical and Open Graph URL because that website is listed in the resume and was publicly reachable. For a different GitHub Pages URL or custom domain, update these tags in `index.html`:

```html
<link rel="canonical" href="https://zurielst.com/">
<meta property="og:url" content="https://zurielst.com/">
```

## Privacy notes

- The mobile number from the resume is intentionally not displayed.
- The included contact methods are email, GitHub, LinkedIn, and personal website.
- This package does not include the resume PDF because the uploaded resume contains a mobile number. To add a downloadable public resume, place a redacted PDF in `assets/resume.pdf` and add a button linking to that file.

## External assets, fonts, icons, and libraries

None. The site uses:

- System fonts only
- Inline/static SVG assets created for this project
- Vanilla JavaScript only
- No API keys
- No backend
- No database
- No external CSS or JS dependencies

## Content sources used

Primary source: the attached resume PDF.

Public links used for verification/context:

- Personal site: `https://zurielst.com/`
- GitHub profile: `https://github.com/Leiruz`
- Cinderella Shoes repository: `https://github.com/Leiruz/Project-Cinderella`
- Ngee Ann Badminton page: `https://ngeeannbadminton.zurielst.com/`

The LinkedIn link is included from the resume. The publication link is included from the resume as `https://bit.ly/DeepLearning2020`; confirm the short link destination before production use if link verification is required.

## Assumptions

- The resume is the source of truth for roles, dates, metrics, certifications, education, activities, and publications.
- The public GitHub and website links belong to Zuriel because they are listed in the resume and/or publicly associated with the same profile name.
- The Fortinet certification date is displayed as a date range, not as currently active, because the listed validity ended on 20 Oct 2025.
- Project Xynthea has no public link provided, so the site displays a non-clickable note instead of a placeholder link.

## Information intentionally excluded or shortened

- Mobile phone number: excluded for public privacy.
- Long resume bullets: rewritten and shortened for web readability while preserving factual meaning.
- Language information: included briefly in the contact section rather than as a separate section.
- Publication details: kept concise because the resume lists titles and a shared short link but does not provide full venue metadata.
- Some certification descriptions: grouped into readable categories to avoid clutter.
