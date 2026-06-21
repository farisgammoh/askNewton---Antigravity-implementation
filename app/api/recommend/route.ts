import { NextRequest, NextResponse } from 'next/server';
import { InsuranceBrain } from '../../../lib/engine/engine';
import { Profile } from '../../../lib/engine/types';
import plansData from '../../../lib/engine/plans.json';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        // Simple profile validation
        const profile = body as Profile;
        if (!profile || typeof profile !== 'object') {
            return NextResponse.json({ error: 'Invalid profile data provided' }, { status: 400 });
        }
        
        if (!profile.language) {
            profile.language = 'en';
        }

        // Initialize InsuranceBrain with static plan dataset
        const brain = new InsuranceBrain(plansData as any);
        const result = brain.process(profile);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error running deterministic Insurance Brain:', error);
        return NextResponse.json(
            { error: 'Internal server error while executing rules engine', details: error.message },
            { status: 500 }
        );
    }
}
