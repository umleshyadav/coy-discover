import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.DB_FILE = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'coy-')), 'db.json');
const { getFeed, swipe, getMatches, resetDemo } = await import('../lib/store.mjs');
const { seedProfiles } = await import('../lib/seed.mjs');

const raw = seedProfiles();
const likers = raw.filter((p) => p.likedYou).map((p) => p.id);
const others = raw.filter((p) => !p.likedYou).map((p) => p.id);
const status = (fn) => { try { fn(); } catch (e) { return e.status; } };

// seed: >= 30 profiles, some already like the user
assert.ok(raw.length >= 30 && likers.length >= 5 && others.length >= 5);

// privacy: the feed never exposes who liked the user, and no one is matched up front
const feed = getFeed();
assert.equal(feed.length, raw.length);
assert.ok(feed.every((p) => !('likedYou' in p)));
assert.equal(getMatches().length, 0);

// like a liker -> match; response profile also has no likedYou
const r1 = swipe(likers[0], 'like');
assert.equal(r1.match, true);
assert.ok(!('likedYou' in r1.profile));

// like a non-liker -> no match, and nothing leaks about them
const r2 = swipe(others[0], 'like');
assert.deepEqual(r2, { match: false, profile: null });

// pass on a liker -> no match, and they never become a match later
assert.equal(swipe(likers[1], 'pass').match, false);

// swiped profiles never reappear
const ids = getFeed().map((p) => p.id);
for (const id of [likers[0], others[0], likers[1]]) assert.ok(!ids.includes(id));
assert.equal(ids.length, raw.length - 3);

// matches: only mutual likes
assert.deepEqual(getMatches().map((m) => m.id), [likers[0]]);
assert.ok(getMatches().every((m) => !('likedYou' in m)));

// validation + double swipe
assert.equal(status(() => swipe(likers[0], 'like')), 409);
assert.equal(status(() => swipe(999, 'like')), 404);
assert.equal(status(() => swipe('1', 'like')), 400);
assert.equal(status(() => swipe(others[1], 'superlike')), 400);

// persistence: state lives in the file, not in memory
const saved = JSON.parse(fs.readFileSync(process.env.DB_FILE, 'utf8'));
assert.equal(Object.keys(saved.swipes).length, 3);
assert.deepEqual(Object.keys(saved.matches), [String(likers[0])]);

// demo reset: everyone is unseen again and matches are cleared
resetDemo();
assert.equal(getFeed().length, raw.length);
assert.equal(getMatches().length, 0);

console.log('all store tests passed');
