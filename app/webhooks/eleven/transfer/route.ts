import { NextRequest, NextResponse } from 'next/server';
import { verifyElevenLabsAuth, zapMirror } from '../../../../lib/crm';

export async function POST(req: NextRequest) {
  try {
    if (!verifyElevenLabsAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    await zapMirror('transfer_to_human', body);

    console.log(`🤝 Transfer to human requested`);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Transfer webhook error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
