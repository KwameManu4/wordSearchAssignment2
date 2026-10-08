'use client';

import Link from 'next/link'
import { useEffect, useState } from 'react';
import HamburgerMenu from './../Components/HamburgerMenu';
import Footer from './../Components/Footer';
import '../../styling/Settings.css';

type ActivityType = 'wordle' | 'wordsearch';
type Difficulty = 'easy' | 'medium' | 'hard';

type WordList = {
  id: number;
  name: string;
};

// Mirrors a row from GET /api/ActivitySetting
type ActivitySetting = {
  id: number;
  type: ActivityType;
  difficulty: Difficulty;
  hintsEnabled: boolean;
  wordListId: number | null;
  gridSize: number;
  maxGuesses: number;
};

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  wordle: 'Wordle',
  wordsearch: 'Word Search',
};

// Same limits the Word Search page uses for its grid
const MIN_GRID = 5;
const MAX_GRID = 15;
const MIN_GUESSES = 1;
const MAX_GUESSES = 10;

export default function Settings() {

  const [wordLists, setWordLists] = useState<WordList[]>([]);
  const [settings, setSettings] = useState<ActivitySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  // bumping this re-runs the fetch effect (after a create or delete)
  const [refreshKey, setRefreshKey] = useState(0);

  // form fields. Numbers stay strings so the box can be cleared while typing.
  const [type, setType] = useState<ActivityType>('wordle');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [wordListChoice, setWordListChoice] = useState('');
  const [hintsEnabled, setHintsEnabled] = useState(true);
  const [gridSize, setGridSize] = useState('10');
  const [maxGuesses, setMaxGuesses] = useState('6');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [listRes, settingRes] = await Promise.all([
          fetch('/api/wordlist'),
          fetch('/api/ActivitySetting'),
        ]);
        if (!listRes.ok || !settingRes.ok) {
          throw new Error(`Request failed (${!listRes.ok ? listRes.status : settingRes.status})`);
        }
        const lists: WordList[] = await listRes.json();
        const rows: ActivitySetting[] = await settingRes.json();
        if (cancelled) return;
        setWordLists(lists);
        setSettings(rows);
        setLoadError(null);
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading settings', error);
        setLoadError('Could not load wordlists and settings. Is the server running?');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();

    return () => { cancelled = true; };
  }, [refreshKey]);

  // default to the first list until the user picks one
  const selectedWordListId = wordListChoice || (wordLists[0] ? String(wordLists[0].id) : '');

  const listName = (id: number | null): string =>
    wordLists.find(list => list.id === id)?.name ?? 'Deleted wordlist';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const grid = Number(gridSize);
    const guesses = Number(maxGuesses);

    
    if (!selectedWordListId) {
      setMessage({ kind: 'error', text: 'Pick a wordlist first.' });
      return;
    }
    if (!Number.isInteger(grid) || grid < MIN_GRID || grid > MAX_GRID) {
      setMessage({ kind: 'error', text: `Grid size must be a whole number from ${MIN_GRID} to ${MAX_GRID}.` });
      return;
    }
    if (!Number.isInteger(guesses) || guesses < MIN_GUESSES || guesses > MAX_GUESSES) {
      setMessage({ kind: 'error', text: `Max guesses must be a whole number from ${MIN_GUESSES} to ${MAX_GUESSES}.` });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/ActivitySetting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          difficulty,
          hintsEnabled,
          wordListId: Number(selectedWordListId),
          gridSize: grid,
          maxGuesses: guesses,
        }),
      });
      if (!res.ok) {
       
        throw new Error(await res.text() || `Request failed (${res.status})`);
      }
      setMessage({ kind: 'success', text: `${ACTIVITY_LABELS[type]} setting saved.` });
      setRefreshKey(key => key + 1);
    } catch (error) {
      console.error('Error saving setting', error);
      setMessage({ kind: 'error', text: error instanceof Error ? error.message : 'Could not save the setting.' });
    } finally {
      setSaving(false);
    }
  };

  const deleteSetting = async (id: number) => {
    setMessage(null);
    try {
      const res = await fetch(`/api/ActivitySetting?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setRefreshKey(key => key + 1);
    } catch (error) {
      console.error('Error deleting setting', error);
      setMessage({ kind: 'error', text: 'Could not delete the setting.' });
    }
  };

  return (
    <div className="page">
      <div className = "header-settings">
        <h1 style={{ fontSize: 32 }}>Assessment 3: Settings</h1>
      </div>

      <div className='navbar'>



        <Link href="/"
          className="btn">
            HOME
            </Link>

        <Link href="/wordle"
        className="btn">
          WORDLE
          </Link>

        <Link href="/wordsearch"
        className="btn">
          WORD SEARCH
        </Link>

        <Link href="/manage"
        className="btn">
            MANAGE
        </Link>

        <Link href="/dashboard"
        className="btn">
            DASHBOARD
        </Link>

        <Link href="/about"
        className="btn">
          ABOUT
        </Link>

        <HamburgerMenu/>

      </div>

      <div className="settings">

        {loadError && <p className="settings-message settings-message-error" role="alert">{loadError}</p>}

        <section className="settings-section">
          <h2>Add an activity setting</h2>

          {!loading && !loadError && wordLists.length === 0 ? (
            <p className="settings-note">
              You need a wordlist before you can add a setting. <Link href="/manage" className="settings-link">Create one in Manage</Link>.
            </p>
          ) : (
            <form className="settings-form" onSubmit={handleSubmit}>

              <div className="settings-field">
                <label htmlFor="setting-type">Activity</label>
                <select id="setting-type" value={type} onChange={(e) => setType(e.target.value as ActivityType)}>
                  <option value="wordle">{ACTIVITY_LABELS.wordle}</option>
                  <option value="wordsearch">{ACTIVITY_LABELS.wordsearch}</option>
                </select>
              </div>

              <div className="settings-field">
                <label htmlFor="setting-difficulty">Difficulty</label>
                <select id="setting-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="settings-field">
                <label htmlFor="setting-wordlist">Wordlist</label>
                <select
                  id="setting-wordlist"
                  value={selectedWordListId}
                  onChange={(e) => setWordListChoice(e.target.value)}
                  disabled={wordLists.length === 0}
                >
                  {wordLists.map((list) => (
                    <option key={list.id} value={list.id}>{list.name}</option>
                  ))}
                </select>
              </div>

              <div className="settings-field">
                <label htmlFor="setting-grid">Grid size (Word Search)</label>
                <input
                  id="setting-grid"
                  type="number"
                  min={MIN_GRID}
                  max={MAX_GRID}
                  value={gridSize}
                  onChange={(e) => setGridSize(e.target.value)}
                />
              </div>

              <div className="settings-field">
                <label htmlFor="setting-guesses">Max guesses (Wordle)</label>
                <input
                  id="setting-guesses"
                  type="number"
                  min={MIN_GUESSES}
                  max={MAX_GUESSES}
                  value={maxGuesses}
                  onChange={(e) => setMaxGuesses(e.target.value)}
                />
              </div>

              <label className="settings-check">
                <input
                  type="checkbox"
                  checked={hintsEnabled}
                  onChange={(e) => setHintsEnabled(e.target.checked)}
                />
                Hints enabled
              </label>

              <button className="btn settings-submit" type="submit" disabled={saving || wordLists.length === 0}>
                {saving ? 'Saving...' : 'Save setting'}
              </button>
            </form>
          )}

          {message && (
            <p
              className={`settings-message settings-message-${message.kind}`}
              role={message.kind === 'error' ? 'alert' : 'status'}
            >
              {message.text}
            </p>
          )}
        </section>

        <section className="settings-section">
          <h2>Saved settings</h2>
          {loading ? (
            <p className="settings-note">Loading...</p>
          ) : settings.length === 0 ? (
            <p className="settings-note">No settings yet.</p>
          ) : (
            <ul className="settings-list">
              {settings.map((setting) => (
                <li key={setting.id} className="settings-list-item">
                  <span className="settings-list-text">
                    <strong>{ACTIVITY_LABELS[setting.type]}</strong>
                    {` · ${setting.difficulty} · ${listName(setting.wordListId)} · `}
                    {setting.type === 'wordsearch' ? `${setting.gridSize}x${setting.gridSize} grid` : `${setting.maxGuesses} guesses`}
                    {` · hints ${setting.hintsEnabled ? 'on' : 'off'}`}
                  </span>
                  <button className="btn" onClick={() => deleteSetting(setting.id)}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>

      <Footer />

    </div>

  );
}
