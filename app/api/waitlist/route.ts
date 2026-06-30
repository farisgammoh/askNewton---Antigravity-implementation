import { NextRequest, NextResponse } from 'next/server';
import { upsertAirtableLead, upsertHubspotLead } from '../../../lib/crm';
import { rateLimitOrResponse } from '../../../lib/rateLimit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LANGUAGES: Record<string, string> = {
  en: 'English',
  es: 'Español',
  ar: 'العربية'
};

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimitOrResponse(req, 'waitlist', { limit: 5, windowMs: 60 * 1000 });
    if (limited) return limited;

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
    }

    if (!body) {
      return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
    }

    // Honeypot — real users never fill this. Fake success so bots learn nothing.
    if (typeof body.company === 'string' && body.company.trim() !== '') {
      return NextResponse.json({ ok: true });
    }

    const email = String(body.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const state = String(body.state || '').trim();
    const langCode = String(body.language || '').trim().toLowerCase();
    const language = LANGUAGES[langCode] || 'English';
    const newcomer = body.newcomer === true || body.newcomer === 'yes' ? 'Yes' : 'No';
    const source = String(body.source || 'site').slice(0, 120);

    const fields = {
      Email: email,
      State: state,
      Language: language,
      Newcomer: newcomer,
      Source: source,
      Status: 'New'
    };

    const [airtableResult, hubspotResult] = await Promise.allSettled([
      upsertAirtableLead(fields),
      upsertHubspotLead({ email, state, language, newcomer, source })
    ]);

    if (airtableResult.status === 'rejected') {
      console.error('Waitlist: Airtable write failed', airtableResult.reason);
      return NextResponse.json({ ok: false, error: 'Could not save your spot. Please try again.' }, { status: 502 });
    }

    if (hubspotResult.status === 'rejected') {
      console.error('Waitlist: HubSpot sync failed (lead still saved in Airtable)', hubspotResult.reason);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Waitlist: unexpected error', err);
    return NextResponse.json({ ok: false, error: 'Something went wrong.' }, { status: 500 });
  }
}
