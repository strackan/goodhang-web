'use client';

import { useState, useCallback } from 'react';

interface PasskeyGateProps {
  onAuthenticated: (slug: string) => void;
  loading: boolean;
  error: string | null;
}

export default function PasskeyGate({ onAuthenticated, loading, error }: PasskeyGateProps) {
  const [slug, setSlug] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (slug.trim() && !loading) {
      onAuthenticated(slug.trim());
    }
  }, [slug, loading, onAuthenticated]);

  return (
    <div className="pu-gate">
      <div className="pu-gate-content">
        <h1>BENEATH <em>Prague</em></h1>
        <p className="pu-gate-subtitle">Enter your passkey to descend</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="pu-gate-input"
            placeholder="your passkey"
            value={slug}
            onChange={e => setSlug(e.target.value)}
            autoFocus
            disabled={loading}
          />
          <div>
            <button
              type="submit"
              className="pu-gate-submit"
              disabled={!slug.trim() || loading}
            >
              {loading ? 'Descending\u2026' : 'Enter'}
            </button>
          </div>
          {error ? <p className="pu-gate-error">{error}</p> : null}
        </form>
      </div>
    </div>
  );
}
