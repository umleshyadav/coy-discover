# Coy Discover

Swipe-based "Discover" tab (Next.js 14 app router, API routes, JSON-file storage). Home tab is intentionally blank.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # backend logic checks
npm run reset    # wipe swipes/matches (re-seeds on next request)
```

Open on a phone-sized viewport. Drag the card right to like / left to pass, or use the buttons (arrow keys also work on desktop).

## API

| Endpoint | Behaviour |
|---|---|
| `GET /feed` | `{profiles}` not yet swiped on |
| `POST /swipe` `{id, action: "like"\|"pass"}` | `{match, profile}`; `profile` only when `match` is true. 400 bad input, 404 unknown id, 409 already swiped |
| `GET /matches` | `{matches}` mutual only, newest first |

State is stored in `data/db.json` (created on first request, git-ignored), so swipes and matches survive reloads and restarts.

**Swiped everyone and want to demo again?** Swipes persist across server restarts by design, so click **Reset demo** on the "all caught up" screen (calls `POST /reset`), or run `npm run reset` and restart.

## Privacy: "never reveal who liked you"

- 36 seeded profiles; 12 have already liked you. That fact (`likedYou`) lives only in the server-side file and is stripped from every response.
- The feed order is a fixed shuffle unrelated to `likedYou`, so ordering leaks nothing.
- A match is created only when you like someone who already liked you. Passing on them never reveals it, and a passed profile never returns.
- The only signal a client gets is `match: true` right after its own like, which is inherent to mutual matching.

## Known limits

- Single hard-coded user, no auth (per the brief). JSON file is read/written whole per request: fine for one user, move to SQLite for concurrency.
- Placeholder photos are generated SVGs (`/photo?id=N`).

## Part A: two feature suggestions

> DRAFT: written from the assignment brief, not from using the app. Sign up at app.getcoy.com, go through the flows, then edit these so they reflect what you actually felt.

1. **Anonymous nudge to a crush who hasn't joined.** Let a user send an anonymous "someone you know added you on Coy" prompt (no name, no hint) through the invite link. *Why:* a crush can only match if they are on the app, so the invite step is the main drop-off; a privacy-preserving nudge raises conversion without breaking the "never reveal unless mutual" promise.
2. **Guided first message after a match.** On "It's a match!", offer a few tappable icebreakers (from shared interests) and a gentle reminder if neither side writes within 24h. *Why:* a match that goes silent is the most common dead end in dating apps; helping people open the conversation turns a match into retention.
