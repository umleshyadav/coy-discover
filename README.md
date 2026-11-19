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

