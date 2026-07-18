# Making the Site Live — Step by Step

Right now this site only runs on a developer's computer. This guide walks
through everything needed to put it on the real internet with a working
"Get in touch" form and (optionally) the ability to keep editing text and
photos afterward.

Nothing here costs money — every account below has a free tier that's enough
for this site.

---

## What you'll end up with

- A real web address (like `kkbenjamin.netlify.app`, or your own domain if you
  buy one later)
- A working contact form that emails you directly
- Everything else already built (portfolio, case studies, photo/text editing)

## The four accounts, in order

| # | Account | What it's for | Cost |
|---|---|---|---|
| 1 | [Web3Forms](https://web3forms.com) | Makes "Get in touch" deliver to your email | Free |
| 2 | [GitHub](https://github.com) | Stores the website's code | Free |
| 3 | [Netlify](https://netlify.com) | Puts the site on the internet | Free |
| 4 | [Supabase](https://supabase.com) | Lets photo/text edits survive after going live | Free (optional) |

You only need to create these yourself — a developer handles connecting them.

---

## Step 1 — Web3Forms (contact form)

1. Go to **web3forms.com**.
2. Enter your email address (**kerrybenjamin@gmail.com**).
3. Check your inbox — they'll email you an **Access Key** (a short code).
4. Send that key to your developer, or add it yourself in Step 3 below.

That's it — no password, no dashboard to learn.

## Step 2 — GitHub (holds the code)

1. Go to **github.com** and sign up (free).
2. Nothing else to do here — your developer uses this to hand off the
   finished code to Netlify.

## Step 3 — Netlify (makes it live)

1. Go to **netlify.com** and sign up — you can use the **"Sign up with
   GitHub"** button so it's the same login, one less password.
2. Once your developer has connected the site's code to your Netlify account,
   you'll see a project dashboard.
3. Add the site's settings under **Site settings → Environment variables**.
   These are typed in once and just sit there — you won't touch them again
   unless something changes:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_WEB3FORMS_KEY` | the Access Key from Step 1 |
   | `ADMIN_PASSWORD_HASH` | your `/edit` login password, already prepared |
   | `SESSION_SECRET` | a security code, already prepared |
   | `NEXT_PUBLIC_SUPABASE_URL` | only if doing Step 4 |
   | `SUPABASE_SERVICE_ROLE_KEY` | only if doing Step 4 |

4. Netlify gives you a live web address right away (something like
   `random-name-123.netlify.app`). You can rename that, or point a real
   domain name you own at it later — ask your developer when you're ready.

## Step 4 — Supabase (optional, for permanent editing)

**Skip this if:** you're fine having your developer make text/photo changes
for now, or you're not ready to decide yet.

**Do this if:** you want to log in at `yoursite.com/edit` and have your
changes stick around after the site is live. Without this step, the site
still looks and works correctly — you just can't save new edits once it's on
the internet (the "edit mode" needs somewhere permanent to store what you
type and upload, and a live website doesn't have its own hard drive the way
a laptop does).

1. Go to **supabase.com** and sign up.
2. Create a new project (pick any name, e.g. "kk-benjamin-site").
3. In that project, go to **Settings → API** — you'll see a **Project URL**
   and a **service_role key**.
4. Send both to your developer, or paste them into Netlify's environment
   variables yourself (Step 3, table above).

---

## What your developer still needs to do

Creating the accounts above is the only part that's yours. After that, a
developer:
- Connects the GitHub code to Netlify
- Enters the environment variable values you collected above
- Triggers the first deploy
- Confirms the live site works: pages load, the contact form sends a real
  test email, and (if Step 4 was done) logging in and editing a photo
  actually saves

## After it's live

- **Changing the contact form key, password, or Supabase project later?**
  Update the value in Netlify's Environment Variables and redeploy — nothing
  in the code needs to change.
- **Want a custom domain** (like `kerrybenjamin.com` instead of the free
  `.netlify.app` address)? Buy the domain anywhere (Netlify can sell you one
  too), then connect it under **Domain settings** in Netlify. Ask your
  developer if you'd like help.
