// Email service using SendGrid - based on javascript_sendgrid integration
import { MailService } from '@sendgrid/mail';

// Initialize SendGrid service
let mailService: MailService | null = null;

function getMailService(): MailService | null {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SENDGRID_API_KEY not configured - email notifications disabled');
    return null;
  }

  if (!mailService) {
    mailService = new MailService();
    mailService.setApiKey(process.env.SENDGRID_API_KEY);
  }

  return mailService;
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  const service = getMailService();
  if (!service) {
    console.log('Email notification skipped - SendGrid not configured');
    return false;
  }

  try {
    const mail: any = {
      to: params.to,
      from: params.from,
      subject: params.subject,
    };
    
    if (params.text) {
      mail.text = params.text;
    }
    if (params.html) {
      mail.html = params.html;
    }
    
    await service.send(mail);
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export interface LeadNotificationData {
  id: string;
  persona: string;
  name: string;
  email: string;
  phone: string | null;
  arrivalDate: string;
  stayLength: string;
  currentCoverage: string;
  preexisting: boolean;
  notes?: string | null;
  createdAt: string | Date | null;
}

export async function sendLeadNotification(leadData: LeadNotificationData): Promise<boolean> {
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@asknewton.com';
  const toEmail = process.env.NOTIFICATION_EMAIL || 'leads@asknewton.com';

  const emailContent = {
    to: toEmail,
    from: fromEmail,
    subject: `New AskNewton Lead: ${leadData.persona.toUpperCase()} - ${leadData.name}`,
    text: generateLeadEmailText(leadData),
    html: generateLeadEmailHtml(leadData)
  };

  return await sendEmail(emailContent);
}

function generateLeadEmailText(lead: LeadNotificationData): string {
  return `
New Lead Submission - AskNewton California

Lead Details:
- ID: ${lead.id}
- Persona: ${lead.persona.toUpperCase()}
- Name: ${lead.name}
- Email: ${lead.email}
- Phone: ${lead.phone || 'Not provided'}
- Arrival Date: ${lead.arrivalDate}
- Stay Length: ${lead.stayLength}
- Current Coverage: ${lead.currentCoverage}
- Pre-existing Conditions: ${lead.preexisting ? 'Yes' : 'No'}
- Notes: ${lead.notes || 'None'}
- Submitted: ${lead.createdAt ? new Date(lead.createdAt).toLocaleString() : 'Unknown'}

Follow up with this lead promptly!
  `.trim();
}

function generateLeadEmailHtml(lead: LeadNotificationData): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            New Lead - AskNewton California
          </h1>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1e40af; margin-top: 0;">Lead Information</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold;">Lead ID:</td><td style="padding: 8px 0;">${lead.id}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Persona:</td><td style="padding: 8px 0; text-transform: uppercase; color: #2563eb;">${lead.persona}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Name:</td><td style="padding: 8px 0;">${lead.name}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td style="padding: 8px 0;">${lead.phone ? `<a href="tel:${lead.phone}">${lead.phone}</a>` : 'Not provided'}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Arrival Date:</td><td style="padding: 8px 0;">${lead.arrivalDate}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Stay Length:</td><td style="padding: 8px 0;">${lead.stayLength}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Current Coverage:</td><td style="padding: 8px 0;">${lead.currentCoverage}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Pre-existing Conditions:</td><td style="padding: 8px 0;">${lead.preexisting ? 'Yes' : 'No'}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Notes:</td><td style="padding: 8px 0;">${lead.notes || 'None'}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Submitted:</td><td style="padding: 8px 0;">${lead.createdAt ? new Date(lead.createdAt).toLocaleString() : 'Unknown'}</td></tr>
            </table>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-weight: bold; color: #92400e;">
              🚀 Follow up with this lead promptly for the best conversion rate!
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Customer onboarding email interfaces and functions
export interface OnboardingEmailData {
  name: string;
  email: string;
  persona?: string | null;
  preferredLanguage?: string | null;
  healthInfo?: string | null;
  lifestyle?: string | null;
  preferredProvider?: string | null;
  arrivalDate?: string | null;
  stayLength?: string | null;
  currentCoverage?: string | null;
}

export async function sendWelcomeEmail(data: OnboardingEmailData): Promise<boolean> {
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'welcome@asknewton.com';
  
  // Graceful fallbacks for all fields
  const name = data.name || 'there';
  const persona = data.persona || 'California newcomer';
  const language = data.preferredLanguage || 'Not provided';
  const health = data.healthInfo || 'Not provided';
  const life = data.lifestyle || 'Not provided';
  const provider = data.preferredProvider || 'Not provided';
  const arrival = data.arrivalDate || 'Not provided';
  const stay = data.stayLength || 'Not provided';
  const coverage = data.currentCoverage || 'Not provided';

  const emailContent = {
    to: data.email,
    from: fromEmail,
    subject: `Welcome to AskNewton, ${name.split(' ')[0]}! 🎉`,
    text: generateWelcomeEmailText({ name, persona, language, health, life, provider, arrival, stay, coverage }),
    html: generateWelcomeEmailHtml({ name, persona, language, health, life, provider, arrival, stay, coverage })
  };

  return await sendEmail(emailContent);
}

function generateWelcomeEmailText(data: {
  name: string;
  persona: string;
  language: string;
  health: string;
  life: string;
  provider: string;
  arrival: string;
  stay: string;
  coverage: string;
}): string {
  return `
Hi ${data.name},

Welcome to AskNewton! We're thrilled to have you on board.

You're joining hundreds of ${data.persona}s who have found the perfect health insurance coverage in California. We're here to make your transition smooth and stress-free.

Here's a quick summary of what you shared with us:

- Preferred Language: ${data.language}
- Health Information: ${data.health}
- Lifestyle: ${data.life}
- Preferred Provider: ${data.provider}
- Arrival Date: ${data.arrival}
- Stay Length: ${data.stay}
- Current Coverage: ${data.coverage}

What happens next?

1. We're reviewing your information right now
2. Our team will reach out within 24 hours with personalized insurance recommendations
3. You'll receive a custom plan comparison tailored to your needs
4. We'll help you enroll in the coverage that works best for you

In the meantime, feel free to:
- Reply to this email with any questions
- Schedule a consultation: https://calendly.com/asknewton
- Visit our website: https://asknewton.com

We're here to help make health insurance simple and affordable for you.

Best,
The AskNewton Team

P.S. If anything changes or you have questions, just reply to this email — we're here to help!

------------------------------------------------------------
AskNewton California | Health Insurance Made Simple
Helping newcomers find the perfect coverage since 2024
  `.trim();
}

function generateWelcomeEmailHtml(data: {
  name: string;
  persona: string;
  language: string;
  health: string;
  life: string;
  provider: string;
  arrival: string;
  stay: string;
  coverage: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 600; letter-spacing: -0.5px;">
                      Welcome to AskNewton!
                    </h1>
                    <p style="margin: 12px 0 0; color: rgba(255,255,255,0.9); font-size: 18px;">
                      Your health insurance journey starts here
                    </p>
                  </td>
                </tr>

                <!-- Greeting -->
                <tr>
                  <td style="padding: 40px 40px 20px;">
                    <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #333;">
                      Hi <strong>${data.name}</strong>,
                    </p>
                    <p style="margin: 16px 0 0; font-size: 16px; line-height: 1.6; color: #333;">
                      We're thrilled to have you on board! You're joining hundreds of <strong>${data.persona}s</strong> who have found the perfect health insurance coverage in California.
                    </p>
                  </td>
                </tr>

                <!-- Your Information Card -->
                <tr>
                  <td style="padding: 20px 40px;">
                    <div style="background-color: #f8fafc; padding: 24px; border-radius: 8px; border-left: 4px solid #2563eb;">
                      <h2 style="margin: 0 0 16px; color: #1e40af; font-size: 18px; font-weight: 600;">
                        📋 Your Information
                      </h2>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-size: 14px; width: 40%;">Preferred Language:</td>
                          <td style="padding: 6px 0; color: #333; font-size: 14px; font-weight: 500;">${data.language}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Health Information:</td>
                          <td style="padding: 6px 0; color: #333; font-size: 14px; font-weight: 500;">${data.health}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Lifestyle:</td>
                          <td style="padding: 6px 0; color: #333; font-size: 14px; font-weight: 500;">${data.life}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Preferred Provider:</td>
                          <td style="padding: 6px 0; color: #333; font-size: 14px; font-weight: 500;">${data.provider}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Arrival Date:</td>
                          <td style="padding: 6px 0; color: #333; font-size: 14px; font-weight: 500;">${data.arrival}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Stay Length:</td>
                          <td style="padding: 6px 0; color: #333; font-size: 14px; font-weight: 500;">${data.stay}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Current Coverage:</td>
                          <td style="padding: 6px 0; color: #333; font-size: 14px; font-weight: 500;">${data.coverage}</td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- Next Steps -->
                <tr>
                  <td style="padding: 20px 40px;">
                    <h2 style="margin: 0 0 16px; color: #1e40af; font-size: 18px; font-weight: 600;">
                      🚀 What happens next?
                    </h2>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 12px 0; vertical-align: top;">
                          <div style="background-color: #2563eb; color: white; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 14px; font-weight: 600; display: inline-block; margin-right: 12px;">1</div>
                          <span style="color: #333; font-size: 15px; line-height: 1.6;">We're reviewing your information right now</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; vertical-align: top;">
                          <div style="background-color: #2563eb; color: white; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 14px; font-weight: 600; display: inline-block; margin-right: 12px;">2</div>
                          <span style="color: #333; font-size: 15px; line-height: 1.6;">Our team will reach out within 24 hours</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; vertical-align: top;">
                          <div style="background-color: #2563eb; color: white; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 14px; font-weight: 600; display: inline-block; margin-right: 12px;">3</div>
                          <span style="color: #333; font-size: 15px; line-height: 1.6;">You'll receive personalized insurance recommendations</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; vertical-align: top;">
                          <div style="background-color: #2563eb; color: white; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 14px; font-weight: 600; display: inline-block; margin-right: 12px;">4</div>
                          <span style="color: #333; font-size: 15px; line-height: 1.6;">We'll help you enroll in the perfect plan</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td style="padding: 20px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://calendly.com/asknewton" style="background-color: #2563eb; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
                            Schedule a Consultation
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Help Section -->
                <tr>
                  <td style="padding: 20px 40px 40px;">
                    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                        <strong>Need help?</strong> Just reply to this email or visit <a href="https://asknewton.com" style="color: #2563eb;">asknewton.com</a>. We're here to answer all your questions!
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                      <strong style="color: #1e40af;">The AskNewton Team</strong><br>
                      Health Insurance Made Simple
                    </p>
                    <p style="margin: 16px 0 0; color: #94a3b8; font-size: 12px;">
                      Helping California newcomers find the perfect coverage since 2024
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}