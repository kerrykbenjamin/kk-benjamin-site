# KK Benjamin — Portfolio Site

A Next.js portfolio site with built-in inline editing (text + photos), per-case-study
accent theming, a click-to-enlarge lightbox, and a contact-form modal.

**Want to put this site on the internet?** See **[GOING-LIVE.md](GOING-LIVE.md)**
for a plain-language, step-by-step guide (no coding required).

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The site runs with built-in
default content out of the box — no environment setup required to browse it.

## Editing content

See **[EDITING-GUIDE.md](EDITING-GUIDE.md)** for how to log in at `/edit` and
change text, photos, colors, and card ordering.

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in values as needed —
each block in that file explains what it's for and how to get it. Nothing is
required to run the site locally; variables only matter once you're ready to
turn on saved editing, the contact form, or go live (see GOING-LIVE.md).

## Other docs

- `DESIGN_TOKENS.md` — the site's color/type/spacing system
- `CASE_STUDY_PALETTES.md` — per-project accent colors for case study pages
- `REGRESSION_CHECKLIST.md` — the manual QA pass run after any change
- `AGENTS.md` / `CLAUDE.md` — notes for AI coding agents working in this repo

## Tech

Next.js (App Router) · React · Tailwind CSS v4 · Supabase (optional, for
persisted content) · Web3Forms (contact form delivery)
