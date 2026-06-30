import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { upsertAirtableLead, upsertHubspotLead } from '../../../lib/crm';

const LANGUAGES: Record<string, string> = {
  en: 'English',
  es: 'Español',
  ar: 'العربية'
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      phone,
      language = 'en',
      state = 'Unknown',
      consentToContact = false,
      sourcePage = 'Home',
      registerReminder = false,
      windowType,
      deadlineDate,
      reminderChannel = 'email',
    } = body;

    // Consent check
    if (!consentToContact) {
      return NextResponse.json(
        { error: 'Consent to contact is required to store information.' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      );
    }

    const consentTimestamp = new Date().toISOString();

    // 1. Save Lead
    const leadId = await db.saveLead({
      email,
      phone,
      language,
      state,
      consentToContact,
      consentTimestamp,
      sourcePage,
    });

    // 2. Log General Contact Consent
    await db.saveConsentLog({
      leadId,
      purpose: 'Waitlist & general updates enrollment',
      grantedAt: consentTimestamp,
      scope: 'contact_via_email_or_phone',
    });

    // 3. Register deadline reminder if requested
    if (registerReminder && windowType && deadlineDate) {
      const optOutToken = `opt_${Math.random().toString(36).substr(2, 16)}`;
      
      await db.saveReminder({
        leadId,
        windowType,
        deadlineDate,
        channel: reminderChannel,
        optedIn: true,
        optOutToken,
      });

      // Log specific reminder consent
      await db.saveConsentLog({
        leadId,
        purpose: `Window deadline reminders for ${windowType}`,
        grantedAt: new Date().toISOString(),
        scope: `remind_via_${reminderChannel}`,
      });
    }

    // Mirror into the same CRM (Airtable + HubSpot) that the public waitlist
    // form writes to, so every lead source shares one contact record. This
    // is best-effort: the lead is already durably saved above, so a CRM
    // outage shouldn't fail the user-facing request.
    if (typeof email === 'string' && email.includes('@')) {
      const newcomer = typeof windowType === 'string' && windowType.toLowerCase().includes('newcomer') ? 'Yes' : 'No';
      const crmFields = {
        Email: email.trim().toLowerCase(),
        State: state,
        Language: LANGUAGES[String(language).toLowerCase()] || 'English',
        Newcomer: newcomer,
        Source: String(sourcePage).slice(0, 120),
        Status: 'New',
      };

      const [airtableResult, hubspotResult] = await Promise.allSettled([
        upsertAirtableLead(crmFields),
        upsertHubspotLead({
          email: crmFields.Email,
          state,
          language: crmFields.Language,
          newcomer,
          source: crmFields.Source,
        }),
      ]);

      if (airtableResult.status === 'rejected') {
        console.error('Leads: Airtable sync failed (lead still saved locally)', airtableResult.reason);
      }
      if (hubspotResult.status === 'rejected') {
        console.error('Leads: HubSpot sync failed (lead still saved locally)', hubspotResult.reason);
      }
    }

    return NextResponse.json({
      success: true,
      leadId,
      message: 'Waitlist registration successful.',
    });
  } catch (error: any) {
    console.error('Error in leads registration API:', error);
    return NextResponse.json(
      { error: 'Internal server error occurred while registering lead.' },
      { status: 500 }
    );
  }
}
