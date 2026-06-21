import { NextRequest, NextResponse } from 'next/server';
import { verifyElevenLabsAuth, zapMirror, hsUpsertContact } from '../../../../lib/crm';

export async function POST(req: NextRequest) {
  try {
    if (!verifyElevenLabsAuth(req)) {
      console.warn('[webhooks] Unauthorized conversation-start request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    await zapMirror('conversation_start', body);

    const email = body?.user?.email || body?.customer?.email || undefined;
    const phone = body?.user?.phone || body?.customer?.phone || body?.caller?.phone || undefined;
    const firstname = body?.user?.first_name || body?.customer?.first_name || body?.caller?.name || 'Lead';
    const lastname = body?.user?.last_name || body?.customer?.last_name || '';

    console.log(`🎙️ Conversation started with ${firstname} ${lastname} (${email || phone || 'unknown'})`);

    const upsert = await hsUpsertContact({
      email,
      phone,
      firstname,
      lastname,
      lang: body?.language || 'en'
    });

    return NextResponse.json({ ok: true, hubspot: upsert });
  } catch (error: any) {
    console.error('Conversation start webhook error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
