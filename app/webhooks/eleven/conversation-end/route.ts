import { NextRequest, NextResponse } from 'next/server';
import { verifyElevenLabsAuth, zapMirror, hsLogCall } from '../../../../lib/crm';

export async function POST(req: NextRequest) {
  try {
    if (!verifyElevenLabsAuth(req)) {
      console.warn('[webhooks] Unauthorized conversation-end request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    await zapMirror('conversation_end', body);

    const contactId = body?.integrations?.hubspot?.contactId || body?.contactId || body?.user?.hubspot_id;
    const secs = Number(body?.metrics?.duration_seconds || body?.duration || 0);
    const summary = body?.summary || body?.notes || 'Call ended';
    const direction = body?.direction?.toUpperCase?.() || 'OUTBOUND';

    console.log(`📞 Conversation ended: ${secs}s duration, ${direction}`);

    const logged = await hsLogCall({
      contactId,
      durationSeconds: secs,
      summary,
      status: 'COMPLETED',
      direction
    });

    return NextResponse.json({ ok: true, hubspot: logged });
  } catch (error: any) {
    console.error('Conversation end webhook error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
