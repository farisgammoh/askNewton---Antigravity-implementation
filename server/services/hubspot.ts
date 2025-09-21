import type { Lead } from "@shared/schema";

interface HubSpotContact {
  properties: {
    email: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
    company?: string;
    lifecyclestage?: string;
    hs_lead_status?: string;
    // Custom properties for AskNewton
    asknewton_persona?: string;
    asknewton_arrival_date?: string;
    asknewton_stay_length?: string;
    asknewton_current_coverage?: string;
    asknewton_dependents?: string;
    asknewton_zip?: string;
    asknewton_preexisting?: string;
    asknewton_notes?: string;
  };
}

interface HubSpotResponse {
  id: string;
  properties: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

class HubSpotService {
  private readonly apiUrl = "https://api.hubapi.com/crm/v3/objects/contacts";
  private readonly accessToken: string;

  constructor() {
    this.accessToken = process.env.HUBSPOT_ACCESS_TOKEN || "";
    
    if (!this.accessToken) {
      console.warn("⚠️ HUBSPOT_ACCESS_TOKEN not configured - HubSpot integration disabled");
    }
  }

  /**
   * Check if HubSpot integration is configured
   */
  isConfigured(): boolean {
    return !!this.accessToken;
  }

  /**
   * Transform AskNewton lead data to HubSpot contact format
   */
  private transformLead(lead: Lead): HubSpotContact {
    const nameParts = lead.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      properties: {
        email: lead.email,
        firstname: firstName,
        lastname: lastName,
        phone: lead.phone || '',
        company: 'AskNewton California Lead',
        lifecyclestage: 'lead',
        hs_lead_status: 'NEW',
        // Custom AskNewton properties
        asknewton_persona: lead.persona,
        asknewton_arrival_date: lead.arrivalDate,
        asknewton_stay_length: lead.stayLength,
        asknewton_current_coverage: lead.currentCoverage,
        asknewton_dependents: lead.dependents,
        asknewton_zip: lead.zip,
        asknewton_preexisting: lead.preexisting ? 'Yes' : 'No',
        asknewton_notes: lead.notes || '',
      }
    };
  }

  /**
   * Create a new contact in HubSpot
   */
  async createContact(lead: Lead): Promise<{ success: boolean; contactId?: string; error?: string }> {
    if (!this.isConfigured()) {
      return { 
        success: false, 
        error: "HubSpot not configured - missing HUBSPOT_ACCESS_TOKEN" 
      };
    }

    try {
      const contactData = this.transformLead(lead);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify(contactData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HubSpot API error (${response.status}):`, errorText);
        
        // Handle specific error cases
        if (response.status === 409) {
          // Contact already exists - try to update instead
          return await this.updateContactByEmail(lead);
        }
        
        return { 
          success: false, 
          error: `HubSpot API error: ${response.status} - ${errorText}` 
        };
      }

      const hubspotContact: HubSpotResponse = await response.json();
      
      console.log(`✅ HubSpot contact created: ${lead.email} (ID: ${hubspotContact.id})`);
      
      return { 
        success: true, 
        contactId: hubspotContact.id 
      };

    } catch (error) {
      console.error('HubSpot integration error:', error);
      return { 
        success: false, 
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Update existing contact by email (when create fails due to duplicate)
   */
  private async updateContactByEmail(lead: Lead): Promise<{ success: boolean; contactId?: string; error?: string }> {
    try {
      const contactData = this.transformLead(lead);
      const updateUrl = `${this.apiUrl}/${encodeURIComponent(lead.email)}?idProperty=email`;

      const response = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify(contactData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HubSpot update error (${response.status}):`, errorText);
        return { 
          success: false, 
          error: `HubSpot update error: ${response.status} - ${errorText}` 
        };
      }

      const hubspotContact: HubSpotResponse = await response.json();
      
      console.log(`✅ HubSpot contact updated: ${lead.email} (ID: ${hubspotContact.id})`);
      
      return { 
        success: true, 
        contactId: hubspotContact.id 
      };

    } catch (error) {
      console.error('HubSpot update error:', error);
      return { 
        success: false, 
        error: `Update error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Test HubSpot connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return { 
        success: false, 
        error: "HubSpot not configured" 
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}?limit=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { 
          success: false, 
          error: `HubSpot API test failed: ${response.status} - ${errorText}` 
        };
      }

      console.log('✅ HubSpot connection test successful');
      return { success: true };

    } catch (error) {
      console.error('HubSpot connection test error:', error);
      return { 
        success: false, 
        error: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

// Export singleton instance
export const hubSpotService = new HubSpotService();

// Export types for use in other modules
export type { HubSpotContact, HubSpotResponse };