'use client';
import { useState } from 'react';
import Discover from './Discover';

export default function Page() {
  const [tab, setTab] = useState('discover');
  return (
    <div className="app">
      <main className="screen">{tab === 'discover' ? <Discover /> : null /* Home is intentionally blank */}</main>
      <nav className="tabbar" aria-label="Main">
        {[
          ['home', 'Home'],
          ['discover', 'Discover'],
        ].map(([key, label]) => (
          <button key={key} className={tab === key ? 'on' : ''} aria-current={tab === key ? 'page' : undefined} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
