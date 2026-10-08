'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import HamburgerMenu from '../Components/HamburgerMenu';
import Footer from '../Components/Footer';
import '../../styling/Dashboard.css';

// How often the dashboard re-checks /api/stats while auto-refresh is on.
const REFRESH_MS = 10_000;

type ActivityType = 'wordle' | 'wordsearch';


type Stats = {
    health: { status: 'ok' };
    totals: {
        wordLists: number;
        words: number;
        activitySettings: number;
    };
    generation: {
        total: number;
        success: number;
        failed: number;
        byType: Record<ActivityType, number>;
        mostUsedType: ActivityType | null;
    };
    timeOnPage: {
    averageSeconds: number | null;
    };
    warnings: {
        emptyWordLists: { id: number; name: string }[];
        wordsWithoutPhonemes: {
        id: number;
        english: string;
        wordListId: number;
        wordListName: string | null;
        }[];
        recentFailures: {
        id: number;
        activityType: ActivityType;
        failureReason: string | null;
        wordListId: number | null;
        wordListName: string | null;
        createdAt: string;
    }[];
};
};

type Severity = 'ok' | 'warning' | 'error';

const ACTIVITY_LABELS: Record<ActivityType, string> = {
    wordle: 'Wordle',
    wordsearch: 'Word Search',
};

const SEVERITY_LABELS: Record<Severity, string> = {
ok: 'All good',
warning: 'Warning',
error: 'Error',
};

const formatDuration = (seconds: number): string => {
const whole = Math.round(seconds);
const minutes = Math.floor(whole / 60);
const rest = whole % 60;
return minutes > 0 ? `${minutes}m ${rest}s` : `${rest}s`;
};

const plural = (count: number, singular: string, pluralForm = `${singular}s`) =>
`${count} ${count === 1 ? singular : pluralForm}`;

export default function Dashboard() {

const [stats, setStats] = useState<Stats | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
const [autoRefresh, setAutoRefresh] = useState(true);
const inFlight = useRef(false);

const loadStats = useCallback(async () => {

    if (inFlight.current) return;
    inFlight.current = true;
    try {
    const res = await fetch('/api/stats', { cache: 'no-store' });

    if (!res.ok) throw new Error(`Stats request failed (${res.status})`);
    const data: Stats = await res.json();
    setStats(data);
    setError(null);
    setUpdatedAt(new Date());
    } catch (err) {
    console.error('Error fetching stats:', err);
    setError(err instanceof Error ? err.message : 'Could not load stats');
    } finally {
    inFlight.current = false;
    setLoading(false);
    }
}, []);

useEffect(() => {

    const id = setTimeout(loadStats, 0);
    return () => clearTimeout(id);
}, [loadStats]);

useEffect(() => {
    if (!autoRefresh) return;


    const tick = () => {
    if (!document.hidden) loadStats();
    };
    const id = setInterval(tick, REFRESH_MS);
    document.addEventListener('visibilitychange', tick);
    return () => {
    clearInterval(id);
    document.removeEventListener('visibilitychange', tick);
    };
}, [autoRefresh, loadStats]);


const issueCount = stats
    ? stats.warnings.emptyWordLists.length + stats.warnings.wordsWithoutPhonemes.length
    : 0;
const severity: Severity = error ? 'error' : issueCount > 0 ? 'warning' : 'ok';

const severityMessage =
    severity === 'error'
    ? error
    : severity === 'warning'
        ? `${plural(issueCount, 'issue')} need${issueCount === 1 ? 's' : ''} attention`
        : 'API healthy and no data issues';

const successRate = stats && stats.generation.total > 0
    ? Math.round((stats.generation.success / stats.generation.total) * 100)
    : null;

const typeTotal = stats ? stats.generation.byType.wordle + stats.generation.byType.wordsearch : 0;

const mostUsedText = !stats
    ? ''
    : stats.generation.mostUsedType
    ? `Most used: ${ACTIVITY_LABELS[stats.generation.mostUsedType]}`
    : typeTotal === 0
        ? 'No activity generated yet'
        : 'No single most-used activity (tie)';

return (
    <div className="page">
    <div className="header-dashboard">
        <h1 style={{ fontSize: 32 }}>Assessment 2: Backend API - Dashboard</h1>
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

    <div className="dashboard">

        <div className="dashboard-toolbar">
        <span className="dashboard-updated">
            {updatedAt ? `Last updated ${updatedAt.toLocaleTimeString()}` : 'Not updated yet'}
        </span>
        <label className="dashboard-toggle">
            <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh every {REFRESH_MS / 1000}s
        </label>
        <button className="btn" onClick={loadStats}>Refresh now</button>
        </div>

        {loading && <p className="dashboard-message">Loading stats...</p>}

        {!loading && !stats && error && (
        <div className="dashboard-section">
            <div className={`dashboard-status status-error`} role="status">
            <span className="dashboard-badge">{SEVERITY_LABELS.error}</span>
            <span>Could not load stats: {error}</span>
            </div>
        </div>
        )}

        {stats && (
        <>
            <section className="dashboard-section">
            <h2>Status</h2>
            <div className={`dashboard-status status-${severity}`} role="status">
                <span className="dashboard-badge">{SEVERITY_LABELS[severity]}</span>
                <span>{severityMessage}</span>
            </div>
            {error && updatedAt && (
                <p className="dashboard-stale">
                Showing the last good data from {updatedAt.toLocaleTimeString()}.
                </p>
            )}
            <p className="dashboard-note">API health: {error ? 'unreachable' : stats.health.status}</p>
        </section>

            <section className="dashboard-section">
                <h2>Totals</h2>
                <div className="dashboard-cards">
                <div className="dashboard-card">
                    <span className="dashboard-card-value">{stats.totals.wordLists}</span>
                    <span className="dashboard-card-label">Word lists</span>
                </div>
                <div className="dashboard-card">
                    <span className="dashboard-card-value">{stats.totals.words}</span>
                    <span className="dashboard-card-label">Words</span>
                </div>
                <div className="dashboard-card">
                    <span className="dashboard-card-value">{stats.totals.activitySettings}</span>
                <span className="dashboard-card-label">Activity settings</span>
                </div>
            </div>
            </section>

            <section className="dashboard-section">
            <h2>Generation</h2>
            <div className="dashboard-cards">
                <div className="dashboard-card">
                <span className="dashboard-card-value">{successRate === null ? '-' : `${successRate}%`}</span>
                <span className="dashboard-card-label">Success rate</span>
                </div>
                <div className="dashboard-card">
                <span className="dashboard-card-value">{stats.generation.total}</span>
                <span className="dashboard-card-label">Total</span>
                </div>
                <div className="dashboard-card">
                <span className="dashboard-card-value">{stats.generation.success}</span>
                <span className="dashboard-card-label">Succeeded</span>
                </div>
                <div className="dashboard-card">
                <span className="dashboard-card-value">{stats.generation.failed}</span>
                <span className="dashboard-card-label">Failed</span>
                </div>
            </div>

            <h3>By activity</h3>
            <ul className="dashboard-bars">
                {(Object.keys(ACTIVITY_LABELS) as ActivityType[]).map((type) => {
                const count = stats.generation.byType[type];
                  const share = typeTotal > 0 ? (count / typeTotal) * 100 : 0;
                return (
                    <li key={type} className="dashboard-bar-row">
                    <span className="dashboard-bar-label">{ACTIVITY_LABELS[type]}</span>
                    <div
                        className="dashboard-bar-track"
                        role="img"
                        aria-label={`${ACTIVITY_LABELS[type]}: ${count} of ${typeTotal}`}
                    >
                        <div className="dashboard-bar-fill" style={{ width: `${share}%` }} />
                    </div>
                    <span className="dashboard-bar-count">{count}</span>
                    </li>
                );
                })}
            </ul>
            <p className="dashboard-note">{mostUsedText}</p>
            </section>

            <section className="dashboard-section">
            <h2>Time on page</h2>
            {stats.timeOnPage.averageSeconds === null ? (
                <p className="dashboard-note">No page visits recorded yet.</p>
            ) : (
                <div className="dashboard-cards">
                <div className="dashboard-card">
                    <span className="dashboard-card-value">{formatDuration(stats.timeOnPage.averageSeconds)}</span>
                    <span className="dashboard-card-label">Average per visit ({stats.timeOnPage.averageSeconds}s)</span>
                </div>
                </div>
            )}
            </section>

            <section className="dashboard-section">
            <h2>Warnings</h2>

            {issueCount === 0 && (
                <p className="dashboard-note">No empty word lists or words without phonemes.</p>
            )}

            {stats.warnings.emptyWordLists.length > 0 && (
                <ul className="dashboard-list">
                {stats.warnings.emptyWordLists.map((list) => (
                    <li key={`list-${list.id}`} className="dashboard-list-item warning-item">
                    <span>Word list &lsquo;{list.name}&rsquo; has no words</span>
                    <Link href="/manage" className="dashboard-link">Fix in Manage</Link>
                    </li>
                ))}
                </ul>
            )}

            {stats.warnings.wordsWithoutPhonemes.length > 0 && (
                <ul className="dashboard-list">
                {stats.warnings.wordsWithoutPhonemes.map((word) => (
                    <li key={`word-${word.id}`} className="dashboard-list-item warning-item">
                    <span>
                        Word &lsquo;{word.english}&rsquo;
                        {word.wordListName ? <> in &lsquo;{word.wordListName}&rsquo;</> : null} has no phonemes
                    </span>
                    <Link href="/manage" className="dashboard-link">Fix in Manage</Link>
                    </li>
                ))}
                </ul>
            )}

            <h3>Recent failures</h3>
            {stats.warnings.recentFailures.length === 0 ? (
                <p className="dashboard-note">No failed generations.</p>
            ) : (
                <ul className="dashboard-list">
                {stats.warnings.recentFailures.map((failure) => (
                    <li key={`failure-${failure.id}`} className="dashboard-list-item">
                    <span>
                        {ACTIVITY_LABELS[failure.activityType]} failed
                        {' '}on {failure.wordListName ? <>&lsquo;{failure.wordListName}&rsquo;</> : 'a deleted word list'}
                        {failure.failureReason ? `: ${failure.failureReason}` : ''}
                    </span>
                    <span className="dashboard-when">{new Date(failure.createdAt).toLocaleString()}</span>
                    </li>
                ))}
                </ul>
            )}
            </section>
        </>
        )}

    </div>

    <Footer />

    </div>
    );
}
