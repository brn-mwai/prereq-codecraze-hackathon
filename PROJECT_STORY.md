# Prereq - Project Story

## Inspiration

I've sat through countless meetings where I knew nothing about the person across from me. You Google them, skim their LinkedIn, maybe find an old tweet - and you're still walking in cold.

As someone who juggles physics, code, and building companies, I don't have 30 minutes to research every person I meet. But I also hate small talk that goes nowhere.

So I built Prereq - a tool that turns any LinkedIn profile into a meeting brief in about 30 seconds.

## What it does

Paste a LinkedIn URL, pick your meeting goal (networking, sales, hiring, or investor), and get back:
- A quick summary of who they are
- Talking points that actually matter
- Common ground between you and them
- Icebreakers that don't feel forced
- Smart questions to ask

There's also a Chrome extension that works directly on LinkedIn - one click and you're prepped.

## How I built it

The stack is pretty straightforward:
- **Frontend:** Next.js 15 with React 19 and TypeScript
- **Styling:** Tailwind CSS with a custom design system
- **Auth:** Clerk (handles all the login complexity)
- **Database:** Supabase (PostgreSQL under the hood)
- **AI:** Claude API for generating the briefs
- **LinkedIn Data:** RapidAPI's LinkedIn scraper
- **Hosting:** Vercel
- **Extension:** Chrome Manifest V3

The architecture is simple: user signs in, pastes a LinkedIn URL, we fetch the profile data, send it to Claude with context about the meeting goal, and return a structured brief. The extension just makes this flow seamless when you're already browsing LinkedIn.

## Challenges

**LinkedIn is a walled garden.** Getting reliable profile data without violating terms of service meant finding the right API provider and handling rate limits gracefully.

**AI output consistency.** Getting Claude to return structured, useful briefs every time - not too long, not too generic - took a lot of prompt iteration. The brief needed to feel like a smart friend giving you the rundown, not a Wikipedia summary.

**Chrome Extension auth.** Syncing authentication between the web app and extension was trickier than expected. Bearer tokens, CORS headers, and Chrome's security model don't always play nice together.

**Making it actually useful.** The hardest part wasn't the code - it was figuring out what information actually helps before a meeting. I talked to salespeople, recruiters, and founders to understand what they really need.

## What I learned

Building something people actually use is different from building something that works. The features I thought were important weren't. The tiny UX details I almost skipped ended up mattering most.

Also: physics taught me to break down complex problems. That skill transfers directly to debugging Chrome extension authentication at 2am.

## What's next

- More meeting goal types
- Team features for sales teams
- Calendar integration to auto-prep before meetings
- Mobile app

The goal is simple: never walk into a meeting unprepared again.

---

## Built With

- Next.js
- React
- TypeScript
- Tailwind CSS
- Clerk
- Supabase
- PostgreSQL
- Claude API (Anthropic)
- RapidAPI
- Vercel
- Chrome Extension (Manifest V3)

---

## Links

- **Live App:** https://prereq.brianmwai.com
- **GitHub:** https://github.com/brn-mwai/prereq
- **Chrome Extension:** *(Coming soon to Chrome Web Store)*

---

## Author

**Brian Mwai**
Physics Major | Self-taught Software Engineer | Founder

---

*Know anyone in 30 seconds.*
