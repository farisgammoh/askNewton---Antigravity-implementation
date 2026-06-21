'use client';

import React, { useState } from 'react';
import RegulatoryDisclosure from './RegulatoryDisclosure';
import { useTranslation } from '../lib/i18n/LanguageContext';

const STATES = [
  'California', 'Texas', 'New York', 'Florida', 'Illinois', 'Pennsylvania',
  'Ohio', 'Georgia', 'North Carolina', 'Michigan', 'Washington', 'Arizona',
  'Massachusetts', 'Colorado', 'Virginia', 'Tennessee', 'Indiana', 'Missouri',
  'Maryland', 'Wisconsin', 'Minnesota', 'South Carolina', 'Alabama', 'Louisiana',
  'Kentucky', 'Oregon', 'Oklahoma', 'Connecticut', 'Utah', 'Iowa', 'Nevada',
  'Arkansas', 'Mississippi', 'Kansas', 'New Mexico', 'Nebraska', 'West Virginia',
  'Idaho', 'Hawaii', 'New Hampshire', 'Maine', 'Montana', 'Rhode Island',
  'Delaware', 'South Dakota', 'North Dakota', 'Alaska', 'Vermont', 'Wyoming',
];

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'ar', label: 'العربية' },
];

type Status = 'idle' | 'loading' | 'done' | 'error';

export default function WaitlistForm({ source = 'home' }: { source?: string }) {
  const { dictionary, language: currentLang } = useTranslation();
  const [email, setEmail] = useState('');
  const [state, setState] = useState('');
  const [language, setLanguage] = useState(currentLang || 'en');
  const [newcomer, setNewcomer] = useState<'yes' | 'no' | ''>('');
  const [company, setCompany] = useState(''); // honeypot
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          state,
          language,
          newcomer: newcomer === 'yes',
          company,
          source
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Something went wrong.');
      setStatus('done');
    } catch (e: any) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  };

  if (status === 'done') {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-emerald-200 bg-emerald-50/30 p-8 text-center shadow-md animate-fade-in" data-testid="waitlist-success">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900">You're on the list</h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          We'll reach out the moment proactive, multilingual coverage guidance opens in your state.
        </p>
      </div>
    );
  }

  const fieldClass =
    'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 ' +
    'outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/15';

  return (
    <div dir={dir} id="waitlist" className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg hover:shadow-xl transition-shadow duration-300" data-testid="waitlist-form">
      <h3 className="text-xl font-extrabold text-slate-900">Join the Waitlist</h3>
      <p className="mt-2 text-sm text-slate-500 leading-relaxed">
        Be first to get proactive, multilingual coverage guidance when askNewton opens in your state.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Email</label>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={fieldClass}
            data-testid="waitlist-email"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">State (optional)</label>
          <select value={state} onChange={(e) => setState(e.target.value)} className={fieldClass} data-testid="waitlist-state">
            <option value="">Select your state…</option>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Preferred language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className={fieldClass} data-testid="waitlist-language">
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            New to the US healthcare system? (optional)
          </label>
          <div className="flex gap-2">
            {(['yes', 'no'] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setNewcomer(newcomer === opt ? '' : opt)}
                className={
                  'flex-1 rounded-lg border py-2.5 text-sm font-semibold capitalize transition-all duration-200 ' +
                  (newcomer === opt
                    ? 'border-accent bg-accent/5 text-accent shadow-sm'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-accent')
                }
                data-testid={`waitlist-newcomer-${opt}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Honeypot: visually hidden, off-screen, not announced to screen readers. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Company
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              data-testid="waitlist-company"
            />
          </label>
        </div>

        {error && <p className="text-xs font-semibold text-rose-600 mt-1" data-testid="waitlist-error">{error}</p>}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded-lg bg-accent hover:bg-accent-hover text-white py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2 hover-lift"
          data-testid="waitlist-submit"
        >
          {status === 'loading' ? 'Joining…' : 'Join the waitlist'}
        </button>

        <RegulatoryDisclosure />
      </form>
    </div>
  );
}
