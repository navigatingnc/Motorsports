/**
 * DebriefPage.tsx — Phase 26
 *
 * AI-Powered Lap Time Coaching & Debrief interface.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────────┐
 *   │  Page header                                        │
 *   │  Lap selector (dropdown of all recorded laps)       │
 *   ├──────────────────┬──────────────────────────────────┤
 *   │  History sidebar │  Chat panel                      │
 *   │  (past debriefs) │  (messages + input)              │
 *   └──────────────────┴──────────────────────────────────┘
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';
import {
  analyzeDebrief,
  getDebriefsByLap,
  getDebriefById,
  deleteDebrief,
} from '../services/debriefService';
import type { LapTime } from '../types/laptime';
import type { Debrief, DebriefSummary, DebriefMessage } from '../types/debrief';

// ── Helpers ───────────────────────────────────────────────────────────────────

const msToLapTime = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
};

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// ── Sub-components ────────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: DebriefMessage;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  if (message.role === 'system') return null;

  const isUser = message.role === 'user';
  return (
    <div className={`debrief-message debrief-message--${message.role}`}>
      <div className="debrief-message__avatar">
        {isUser ? 'You' : 'AI'}
      </div>
      <div className="debrief-message__bubble">
        {message.content}
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="debrief-typing">
    <div className="debrief-message__avatar" style={{ background: 'var(--success-color, #2a9d8f)', color: '#fff', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>
      AI
    </div>
    <div className="debrief-typing__dots">
      <span className="debrief-typing__dot" />
      <span className="debrief-typing__dot" />
      <span className="debrief-typing__dot" />
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────

const DebriefPage = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [lapTimes, setLapTimes] = useState<LapTime[]>([]);
  const [selectedLapId, setSelectedLapId] = useState<string>('');
  const [debriefHistory, setDebriefHistory] = useState<DebriefSummary[]>([]);
  const [activeDebrief, setActiveDebrief] = useState<Debrief | null>(null);
  const [messages, setMessages] = useState<DebriefMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLaps, setIsLoadingLaps] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Effects ────────────────────────────────────────────────────────────────

  // Load all lap times on mount
  useEffect(() => {
    const fetchLaps = async () => {
      try {
        setIsLoadingLaps(true);
        const laps = await analyticsService.getLapTimes();
        setLapTimes(laps);
        if (laps.length > 0 && laps[0]) {
          setSelectedLapId(laps[0].id);
        }
      } catch {
        setError('Failed to load lap times. Please refresh the page.');
      } finally {
        setIsLoadingLaps(false);
      }
    };
    fetchLaps();
  }, []);

  // Load debrief history whenever the selected lap changes
  useEffect(() => {
    if (!selectedLapId) return;
    const fetchHistory = async () => {
      try {
        setIsLoadingHistory(true);
        setActiveDebrief(null);
        setMessages([]);
        const history = await getDebriefsByLap(selectedLapId);
        setDebriefHistory(history);
      } catch {
        setDebriefHistory([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [selectedLapId]);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSelectDebrief = useCallback(async (summary: DebriefSummary) => {
    try {
      setIsLoading(true);
      setError(null);
      const full = await getDebriefById(summary.id);
      setActiveDebrief(full);
      // Filter out system messages for display
      setMessages(full.messages.filter((m) => m.role !== 'system'));
    } catch {
      setError('Failed to load the selected debrief.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleNewDebrief = useCallback(async () => {
    if (!selectedLapId) return;
    try {
      setIsLoading(true);
      setError(null);
      setActiveDebrief(null);
      setMessages([]);

      const result = await analyzeDebrief({ lapTimeId: selectedLapId });

      // Refresh history
      const history = await getDebriefsByLap(selectedLapId);
      setDebriefHistory(history);

      // Load the new debrief
      const full = await getDebriefById(result.id);
      setActiveDebrief(full);
      setMessages(full.messages.filter((m) => m.role !== 'system'));
    } catch {
      setError('Failed to generate debrief. The AI service may be temporarily unavailable.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedLapId]);

  const handleSendMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text || !activeDebrief || isLoading) return;

    // Optimistically add the user message
    const userMsg: DebriefMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeDebrief({
        lapTimeId: selectedLapId,
        debriefId: activeDebrief.id,
        userMessage: text,
      });

      // Refresh the full debrief to get the updated messages
      const full = await getDebriefById(result.id);
      setActiveDebrief(full);
      setMessages(full.messages.filter((m) => m.role !== 'system'));
    } catch {
      setError('Failed to send message. Please try again.');
      // Remove the optimistic user message on failure
      setMessages((prev) => prev.filter((m) => m !== userMsg));
    } finally {
      setIsLoading(false);
    }
  }, [inputText, activeDebrief, isLoading, selectedLapId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteDebrief = useCallback(async () => {
    if (!activeDebrief) return;
    if (!window.confirm('Delete this debrief session? This cannot be undone.')) return;
    try {
      await deleteDebrief(activeDebrief.id);
      setActiveDebrief(null);
      setMessages([]);
      const history = await getDebriefsByLap(selectedLapId);
      setDebriefHistory(history);
    } catch {
      setError('Failed to delete the debrief.');
    }
  }, [activeDebrief, selectedLapId]);

  // ── Render helpers ─────────────────────────────────────────────────────────

  const selectedLap = lapTimes.find((l) => l.id === selectedLapId);

  const lapLabel = (lap: LapTime) =>
    `Lap ${lap.lapNumber} — ${msToLapTime(lap.lapTimeMs)} — ${lap.sessionType} @ ${lap.event.venue} (${lap.driver.user.firstName} ${lap.driver.user.lastName})`;

  // ── JSX ────────────────────────────────────────────────────────────────────

  return (
    <div className="debrief-page">
      {/* ── Header ── */}
      <div className="debrief-page__header">
        <h1 className="debrief-page__title">AI Lap Coaching &amp; Debrief</h1>
        <p className="debrief-page__subtitle">
          Select a recorded lap to generate an AI-powered coaching report and ask follow-up questions.
        </p>
      </div>

      {error && <div className="debrief-error">{error}</div>}

      {/* ── Lap selector ── */}
      <div className="debrief-lap-selector">
        <label className="debrief-lap-selector__label" htmlFor="lap-select">
          Select Lap
        </label>
        {isLoadingLaps ? (
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary, #666)' }}>
            Loading laps…
          </p>
        ) : lapTimes.length === 0 ? (
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary, #666)' }}>
            No lap times recorded yet. Record a lap in the Analytics section first.
          </p>
        ) : (
          <select
            id="lap-select"
            className="debrief-lap-selector__select"
            value={selectedLapId}
            onChange={(e) => setSelectedLapId(e.target.value)}
          >
            {lapTimes.map((lap) => (
              <option key={lap.id} value={lap.id}>
                {lapLabel(lap)}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ── Main layout ── */}
      {selectedLapId && (
        <div className="debrief-layout">
          {/* ── History sidebar ── */}
          <aside className="debrief-history">
            <div className="debrief-history__heading">Past Debriefs</div>

            {isLoadingHistory ? (
              <p className="debrief-history__empty">Loading…</p>
            ) : debriefHistory.length === 0 ? (
              <p className="debrief-history__empty">No debriefs yet for this lap.</p>
            ) : (
              <ul className="debrief-history__list">
                {debriefHistory.map((d) => (
                  <li
                    key={d.id}
                    className={`debrief-history__item${activeDebrief?.id === d.id ? ' debrief-history__item--active' : ''}`}
                    onClick={() => handleSelectDebrief(d)}
                  >
                    <p className="debrief-history__item-title">{d.title}</p>
                    <p className="debrief-history__item-date">{formatDate(d.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}

            <button
              className="debrief-history__new-btn"
              onClick={handleNewDebrief}
              disabled={isLoading || !selectedLapId}
            >
              {isLoading && !activeDebrief ? '⏳ Analysing…' : '+ New Debrief'}
            </button>
          </aside>

          {/* ── Chat panel ── */}
          <section className="debrief-chat">
            {/* Chat header */}
            <div className="debrief-chat__header">
              <h2 className="debrief-chat__title">
                {activeDebrief
                  ? activeDebrief.title
                  : selectedLap
                  ? `Lap ${selectedLap.lapNumber} — ${selectedLap.sessionType}`
                  : 'Debrief'}
              </h2>
              {activeDebrief && (
                <button
                  className="debrief-chat__delete-btn"
                  onClick={handleDeleteDebrief}
                  title="Delete this debrief session"
                >
                  Delete
                </button>
              )}
            </div>

            {/* Messages */}
            {!activeDebrief && messages.length === 0 ? (
              <div className="debrief-chat__empty">
                <div className="debrief-chat__empty-icon">🏎️</div>
                <h3 className="debrief-chat__empty-title">Ready to analyse your lap</h3>
                <p className="debrief-chat__empty-text">
                  Click <strong>+ New Debrief</strong> to generate an AI coaching report for the
                  selected lap, or choose a past debrief from the sidebar.
                </p>
                <button
                  className="debrief-analyze-btn"
                  onClick={handleNewDebrief}
                  disabled={isLoading}
                >
                  {isLoading ? '⏳ Analysing…' : '🤖 Analyse This Lap'}
                </button>
              </div>
            ) : (
              <div className="debrief-chat__messages">
                {messages.map((msg, idx) => (
                  <MessageBubble key={idx} message={msg} />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input area — only shown when a debrief is active */}
            {activeDebrief && (
              <div className="debrief-chat__input-area">
                <textarea
                  ref={inputRef}
                  className="debrief-chat__input"
                  placeholder="Ask a follow-up question… (Enter to send, Shift+Enter for new line)"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  rows={1}
                />
                <button
                  className="debrief-chat__send-btn"
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputText.trim()}
                >
                  Send
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default DebriefPage;
