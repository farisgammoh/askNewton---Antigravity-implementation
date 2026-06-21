import { NextRequest, NextResponse } from 'next/server';
import { verifyElevenLabsAuth, hsLogCall, zapMirror } from '../../../lib/crm';

export async function POST(req: NextRequest) {
  try {
    if (!verifyElevenLabsAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { contactId, summary, outcome, durationSeconds = 0, direction = 'OUTBOUND' } = body;

    if (!contactId) {
      return NextResponse.json({ error: 'contactId is required' }, { status: 400 });
    }

    const logged = await hsLogCall({
      contactId,
      summary,
      durationSeconds,
      direction,
      status: outcome || 'COMPLETED'
    });

    await zapMirror('log_call_manual', { contactId, summary, outcome, durationSeconds, direction });

    console.log(`📝 Manual call logged for contact ${contactId}`);
    return NextResponse.json({ ok: true, hubspot: logged });
  } catch (error: any) {
    console.error('Manual call log error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
