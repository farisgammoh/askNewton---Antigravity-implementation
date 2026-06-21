import { NextRequest } from 'next/server';

const HUBSPOT_UPSERT = 'https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert';
const HUBSPOT_CONTACTS = 'https://api.hubapi.com/crm/v3/objects/contacts';
const HUBSPOT_CALLS = 'https://api.hubapi.com/crm/v3/objects/calls';

export function verifyElevenLabsAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return false;
  
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const expectedToken = process.env.BACKEND_BEARER_TOKEN;
  
  return !!expectedToken && token === expectedToken;
}

export async function zapMirror(eventName: string, payload: any) {
  const zapierUrl = process.env.ZAPIER_HOOK_URL;
  if (!zapierUrl) return;

  try {
    const res = await fetch(zapierUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventName, payload }),
      signal: AbortSignal.timeout(10000)
    });
    if (res.ok) {
      console.log(`📡 Event ${eventName} forwarded to Zapier`);
    } else {
      console.error(`Zapier mirror failed with status ${res.status}`);
    }
  } catch (e) {
    console.error('Zapier forward error:', e);
  }
}

export async function hsUpsertContact({ email, phone, firstname, lastname, lang }: {
  email?: string;
  phone?: string;
  firstname?: string;
  lastname?: string;
  lang?: string;
}) {
  const token = process.env.HUBSPOT_TOKEN || process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) return { skipped: 'no HUBSPOT token configured' };

  try {
    const res = await fetch(HUBSPOT_CONTACTS, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          email,
          phone,
          firstname,
          lastname,
          hs_language: lang || 'en'
        }
      })
    });
    
    const data = await res.json();
    return { status: res.status, data };
  } catch (error: any) {
    console.error('HubSpot contact upsert error:', error);
    return { error: 'Failed to upsert contact', message: error.message };
  }
}

export async function hsLogCall({ contactId, direction = 'OUTBOUND', status = 'COMPLETED', durationSeconds = 0, summary = '' }: {
  contactId?: string;
  direction?: string;
  status?: string;
  durationSeconds?: number;
  summary?: string;
}) {
  const token = process.env.HUBSPOT_TOKEN || process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token || !contactId) return { skipped: 'missing token or contactId' };

  try {
    const res = await fetch(HUBSPOT_CALLS, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          hs_call_body: summary,
          hs_call_callee_object_type: 'CONTACT',
          hs_call_direction: direction,
          hs_call_disposition: status,
          hs_call_duration: durationSeconds * 1000, // ms
          hs_timestamp: new Date().toISOString()
        },
        associations: [
          { to: { id: contactId }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }] }
        ]
      })
    });

    const data = await res.json();
    return { status: res.status, data };
  } catch (error: any) {
    console.error('HubSpot call logging error:', error);
    return { error: 'Failed to log call', message: error.message };
  }
}
