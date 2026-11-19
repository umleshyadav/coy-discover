import fs from 'node:fs';
import path from 'node:path';
import { seedProfiles } from './seed.mjs';

// Everything lives in one JSON file that is read and written whole on each call.
// That is fine for a single user; use SQLite if this ever needs concurrent users.
const file = () => process.env.DB_FILE || path.join(process.cwd(), 'data', 'db.json');

function save(db) {
  const f = file();
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f + '.tmp', JSON.stringify(db));
  fs.renameSync(f + '.tmp', f); // atomic replace: a crash never leaves half a file
}

function load() {
  if (!fs.existsSync(file())) save({ profiles: seedProfiles(), swipes: {}, matches: {} });
  // Profiles always come from the seed file, so editing it never leaves stale data in an old db.json.
  return { ...JSON.parse(fs.readFileSync(file(), 'utf8')), profiles: seedProfiles() };
}

// Demo helper: forget all swipes/matches and re-seed (same effect as `npm run reset`).
export function resetDemo() {
  save({ profiles: seedProfiles(), swipes: {}, matches: {} });
}

// Strips the server-only `likedYou` flag. Every response goes through this.
const pub = ({ likedYou, ...p }) => p;

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function getFeed() {
  const db = load();
  return db.profiles.filter((p) => !(p.id in db.swipes)).map(pub);
}

export function swipe(id, action) {
  if (!Number.isInteger(id)) throw new HttpError(400, 'id must be an integer');
  if (action !== 'like' && action !== 'pass') throw new HttpError(400, "action must be 'like' or 'pass'");
  const db = load();
  const profile = db.profiles.find((p) => p.id === id);
  if (!profile) throw new HttpError(404, 'profile not found');
  if (id in db.swipes) throw new HttpError(409, 'already swiped');

  db.swipes[id] = action;
  // Match only when we like them AND they already liked us.
  const match = action === 'like' && profile.likedYou;
  if (match) db.matches[id] = new Date().toISOString();
  save(db);
  return { match, profile: match ? pub(profile) : null };
}

export function getMatches() {
  const db = load();
  return Object.entries(db.matches)
    .sort((a, b) => b[1].localeCompare(a[1])) // newest first
    .map(([id, matchedAt]) => ({ ...pub(db.profiles.find((p) => p.id === +id)), matchedAt }));
}
