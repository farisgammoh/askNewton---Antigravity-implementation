import { NextRequest, NextResponse } from 'next/server';
import { runInsuranceBrain } from '../../../lib/brain/rules';
import { Profile } from '../../../lib/brain/types';

/**
 * The single server-side entry point for the deterministic Insurance Brain.
 * Clients must never compute a BrainResult themselves — they POST a Profile
 * here and receive back a result they cannot forge or alter, which is then
 * the only thing /api/explain is allowed to narrate.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const profile = body as Profile;
        if (!profile || typeof profile !== 'object') {
            return NextResponse.json({ error: 'Invalid profile data provided' }, { status: 400 });
        }

        if (!profile.language) {
            profile.language = 'en';
        }

        const result = runInsuranceBrain(profile);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error running deterministic Insurance Brain:', error);
        return NextResponse.json(
            { error: 'Internal server error while executing rules engine', details: error.message },
            { status: 500 }
        );
    }
}
