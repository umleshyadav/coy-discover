'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

const THRESHOLD = 100; // px of drag that counts as a swipe
const FLY_MS = 250;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (n) => Math.max(0, Math.min(1, n));

async function api(url, opts) {
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Something went wrong'), { status: res.status });
  return data;
}

function Card({ p, style, children, ...rest }) {
  return (
    <article className="card" style={style} {...rest}>
      <img src={p.photo} alt={`${p.name}`} draggable={false} />
      <div className="info">
        <h2>
          {p.name}, {p.age}
        </h2>
        <p className="place">{p.place}</p>
        <p className="bio">{p.bio}</p>
        <ul>
          {p.interests.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </div>
      {children}
    </article>
  );
}

export default function Discover() {
  const [view, setView] = useState('swipe');
  const [feed, setFeed] = useState(null);
  const [matches, setMatches] = useState(null);
  const [matched, setMatched] = useState(null);
  const [error, setError] = useState('');
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const busy = useRef(false);
  const dragRef = useRef(null); // {startX, dx}: a ref, so fast flicks never read stale React state

  const loadFeed = useCallback(() => api('/feed').then((d) => setFeed(d.profiles)).catch((e) => setError(e.message)), []);
  const loadMatches = useCallback(() => api('/matches').then((d) => setMatches(d.matches)).catch((e) => setError(e.message)), []);

  useEffect(() => {
    loadFeed();
    loadMatches();
  }, [loadFeed, loadMatches]);
  useEffect(() => {
    if (view === 'matches') loadMatches();
  }, [view, loadMatches]);

  const top = feed?.[0];

  // Demo helper: start over after swiping everyone (state is persisted on the server, so a restart alone won't).
  async function resetDemo() {
    try {
      setError('');
      await api('/reset', { method: 'POST' });
      setMatches([]);
      await loadFeed();
    } catch (e) {
      setError(e.message);
    }
  }

  async function decide(dir) {
    if (!top || busy.current || matched) return;
    busy.current = true;
    setError('');
    setDragging(false);
    setX(dir * 700); // fly off-screen; CSS transition animates it
    try {
      const body = JSON.stringify({ id: top.id, action: dir > 0 ? 'like' : 'pass' });
      const [res] = await Promise.all([
        api('/swipe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }).catch((e) => {
          if (e.status === 409) return { match: false }; // already swiped elsewhere: just drop the card
          throw e;
        }),
        sleep(FLY_MS),
      ]);
      setFeed((f) => f.filter((p) => p.id !== top.id));
      setX(0);
      if (res.match) {
        setMatched(res.profile);
        loadMatches();
      }
    } catch (e) {
      setX(0); // swipe failed: card slides back, nothing was recorded
      setError(e.message);
    } finally {
      busy.current = false;
    }
  }

  // Desktop: arrow keys mirror the buttons.
  useEffect(() => {
    const onKey = (e) => {
      if (view !== 'swipe') return;
      if (e.key === 'ArrowRight') decide(1);
      if (e.key === 'ArrowLeft') decide(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const drag = {
    onPointerDown: (e) => {
      if (busy.current) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = { startX: e.clientX, dx: 0 };
      setDragging(true);
    },
    onPointerMove: (e) => {
      const d = dragRef.current;
      if (!d) return;
      d.dx = e.clientX - d.startX;
      setX(d.dx);
    },
    onPointerUp: () => {
      const d = dragRef.current;
      if (!d) return;
      dragRef.current = null;
      if (Math.abs(d.dx) > THRESHOLD) decide(Math.sign(d.dx));
      else {
        setDragging(false);
        setX(0);
      }
    },
    onPointerCancel: () => {
      dragRef.current = null;
      setDragging(false);
      setX(0);
    },
  };

  const cardStyle = {
    transform: `translateX(${x}px) rotate(${x / 18}deg)`,
    transition: dragging ? 'none' : `transform ${FLY_MS}ms ease-out`,
  };

  return (
    <section className="discover">
      <header className="seg" role="tablist">
        <button role="tab" aria-selected={view === 'swipe'} className={view === 'swipe' ? 'on' : ''} onClick={() => setView('swipe')}>
          Discover
        </button>
        <button role="tab" aria-selected={view === 'matches'} className={view === 'matches' ? 'on' : ''} onClick={() => setView('matches')}>
          Matches{matches?.length ? ` (${matches.length})` : ''}
        </button>
      </header>

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      {view === 'swipe' ? (
        feed === null ? (
          <p className="center">{error ? <button onClick={loadFeed}>Retry</button> : 'Loading…'}</p>
        ) : feed.length === 0 ? (
          <div className="center empty">
            <h2>You&apos;re all caught up</h2>
            <p>No more profiles right now. Check back later, or see who you matched with.</p>
            <button onClick={() => setView('matches')}>View matches</button>
            <button className="ghost" onClick={resetDemo}>
              Reset demo
            </button>          </div>
        ) : (
          <>
            <div className="stack">
              {feed[1] && <Card key={feed[1].id} p={feed[1]} style={{ transform: 'scale(.95)' }} aria-hidden="true" />}
              <Card key={top.id} p={top} style={cardStyle} {...drag}>
                <span className="stamp like" style={{ opacity: clamp(x / THRESHOLD) }}>
                  LIKE
                </span>
                <span className="stamp nope" style={{ opacity: clamp(-x / THRESHOLD) }}>
                  NOPE
                </span>
              </Card>
            </div>
            <div className="actions">
              <button className="pass" aria-label="Pass" onClick={() => decide(-1)}>
                ✕
              </button>
              <button className="like" aria-label="Like" onClick={() => decide(1)}>
                ♥
              </button>
            </div>
          </>
        )
      ) : matches === null ? (
        <p className="center">Loading…</p>
      ) : matches.length === 0 ? (
        <div className="center empty">
          <h2>No matches yet</h2>
          <p>When you and someone else both like each other, they&apos;ll show up here.</p>
        </div>
      ) : (
        <ul className="grid">
          {matches.map((m) => (
            <li key={m.id}>
              <img src={m.photo} alt={m.name} />
              <div>
                <strong>
                  {m.name}, {m.age}
                </strong>
                <span>{m.place}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {matched && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="It's a match">
          <h1>It&apos;s a match!</h1>
          <p>You and {matched.name} liked each other.</p>
          <img src={matched.photo} alt={matched.name} />
          <button
            onClick={() => {
              setMatched(null);
              setView('matches');
            }}
          >
            View matches
          </button>
          <button className="ghost" onClick={() => setMatched(null)}>
            Keep swiping
          </button>
        </div>
      )}
    </section>
  );
}
