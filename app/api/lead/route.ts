import { NextRequest, NextResponse } from 'next/server';
import { verifyElevenLabsAuth } from '../../../lib/crm';

export async function GET(req: NextRequest) {
  try {
    if (!verifyElevenLabsAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ found: false, message: 'Lead lookup not implemented' });
  } catch (error: any) {
    console.error('Lead lookup error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
