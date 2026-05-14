# Zuriel Shanley Tanyory , Cybersecurity Portfolio

A fully static, GitHub Pages-ready personal portfolio website for Zuriel Shanley Tanyory. This version tightens the hero copy, restores the version 2 landing visual with improved background blending, improves spacing, and keeps the five-item navigation.

## Design direction

The site uses a premium dark product-page aesthetic inspired by the tone of a modern Apple product launch: cinematic hero, restrained navigation, large typography, polished spacing, dark glass panels, and high-contrast storytelling. No Apple assets, Apple branding, iPhone imagery, or copied Apple layouts are used.

## Files

```text
.
├── index.html
├── styles.css
├── script.js
├── README.md
└── assets
    ├── icons
    │   └── favicon.svg
    ├── images
    │   ├── hero-cyber-device.svg
    │   └── og-card.svg
    └── resume
        └── Zuriel-Shanley-Tanyory-Resume.pdf
```

## Deploy to GitHub Pages

1. Create a new GitHub repository.
2. Upload all files and folders in this project to the repository root.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/root` folder.
6. Save. GitHub Pages will publish the static site.

## Local preview

Open `index.html` directly in a browser. No build step is required.

## External libraries

The site uses these CDN libraries only for front-end animation:

- GSAP 3.12.5
- GSAP ScrollTrigger 3.12.5

The website still works as a static site. If the CDN is unavailable, the content remains accessible and the fallback script shows all sections without animation.

## Content source

The uploaded resume is the source of truth for employment history, education, projects, certifications, publications, leadership, and metrics. Public links are included only where they are already listed in the resume or publicly verifiable.

## Privacy

The phone number from the resume is intentionally omitted because this is a public portfolio designed for GitHub Pages. Public contact methods are email, GitHub, LinkedIn, personal website, and downloadable resume.

## Editing tips

- Update copy directly in `index.html`.
- Update colors and spacing in `styles.css`; the latest refinement blocks at the bottom control hero blending, spacing, and carousel polish.
- Update carousel behavior in `script.js`.
- Replace `assets/resume/Zuriel-Shanley-Tanyory-Resume.pdf` with a newer resume using the same filename to keep the download link working.

## Verification checklist

- Fully static front-end only.
- GitHub Pages compatible.
- No backend, database, API keys, authentication, paid service, or build step.
- Paragraphs use justified text styling in CSS.
- Projects section uses an accessible carousel with scroll-snap, buttons, dots, keyboard support, and touch/trackpad support.
- Navbar stays reduced to five items: Overview, Work, Projects, Credentials, Contact.
- Carousel no longer uses generated project artwork or a visible horizontal scrollbar, and arrow controls loop between first and last cards.
- Mobile number is not displayed.
- Resume facts are preserved without invented achievements.


## v7 update

- Fixed hero headline/name spacing to prevent overlap.
- Kept the existing Highlights, Work, Capabilities, and Contact sections.
- Reordered project carousel cards by date from newest to oldest.
- Removed requested Resume buttons from project cards.
- Renamed CiTaDel SOC Architecture to CiTaDel SOC and changed its action to Website.
- Changed Ngee Ann Badminton action to Website.
- Renamed the publication action to Publications while preserving the original redirect.
- Added more spacing inside Leadership & Community.
