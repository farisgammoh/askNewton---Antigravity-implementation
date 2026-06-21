import { NextRequest, NextResponse } from 'next/server';
import { verifyElevenLabsAuth, zapMirror } from '../../../../lib/crm';

export async function POST(req: NextRequest) {
  try {
    if (!verifyElevenLabsAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    await zapMirror('voicemail_detected', body);

    console.log(`📧 Voicemail detected`);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Voicemail webhook error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
