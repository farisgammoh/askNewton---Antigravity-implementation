import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API = 'https://api.airtable.com/v0';
const HUBSPOT_UPSERT = 'https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LANGUAGES: Record<string, string> = {
  en: 'English',
  es: 'Español',
  ar: 'العربية'
};

async function writeAirtable(fields: Record<string, unknown>): Promise<void> {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_WAITLIST_TABLE || 'Waitlist';

  if (!token || !baseId) {
    throw new Error('Airtable env vars missing');
  }

  const res = await fetch(`${AIRTABLE_API}/${baseId}/${encodeURIComponent(table)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      performUpsert: { fieldsToMergeOn: ['Email'] },
      records: [{ fields }],
      typecast: true
    })
  });

  if (!res.ok) {
    throw new Error(`Airtable ${res.status}: ${await res.text()}`);
  }
}

async function syncHubspot(p: {
  email: string;
  state: string;
  language: string;
  newcomer: string;
  source: string;
}): Promise<void> {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) {
    console.warn('Waitlist: HUBSPOT_TOKEN not set — skipping CRM sync');
    return;
  }

  const res = await fetch(HUBSPOT_UPSERT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: [{
        idProperty: 'email',
        id: p.email,
        properties: {
          email: p.email,
          state: p.state,
          preferred_language: p.language,
          newcomer: p.newcomer,
          lead_source: p.source,
          lifecyclestage: 'lead'
        }
      }]
    })
  });

  if (!res.ok) {
    throw new Error(`HubSpot ${res.status}: ${await res.text()}`);
  }
}

export async function POST(req: NextRequest) {
  try {
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
      writeAirtable(fields),
      syncHubspot({ email, state, language, newcomer, source })
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
