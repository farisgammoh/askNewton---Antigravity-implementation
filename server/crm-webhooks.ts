import type { Lead } from "@shared/schema";

// CRM Integration Examples - Choose your preferred CRM

export interface CRMIntegration {
  name: string;
  webhookUrl: string;
  headers: Record<string, string>;
  transformLead: (lead: Lead) => any;
}

// Zoho CRM Integration
export const zohoCRM: CRMIntegration = {
  name: "Zoho CRM",
  webhookUrl: "https://www.zohoapis.com/crm/v2/Leads",
  headers: {
    "Authorization": `Zoho-oauthtoken ${process.env.ZOHO_ACCESS_TOKEN}`,
    "Content-Type": "application/json"
  },
  transformLead: (lead) => ({
    data: [{
      Last_Name: lead.name,
      Email: lead.email,
      Phone: lead.phone,
      Lead_Source: `AskNewton ${lead.persona}`,
      Company: "AskNewton California",
      Lead_Status: "Not Contacted",
      Description: `Persona: ${lead.persona}\nArrival: ${lead.arrivalDate}\nStay: ${lead.stayLength}\nCoverage: ${lead.currentCoverage}\nDependents: ${lead.dependents}\nZIP: ${lead.zip}\nNotes: ${lead.notes || 'N/A'}`,
      Custom_Field_1: lead.persona, // Nomad/Traveler/Student
      Custom_Field_2: lead.currentCoverage,
      Custom_Field_3: lead.dependents,
      Zip_Code: lead.zip
    }]
  })
};

// HubSpot CRM Integration
export const hubSpotCRM: CRMIntegration = {
  name: "HubSpot CRM",
  webhookUrl: "https://api.hubapi.com/contacts/v1/contact/",
  headers: {
    "Authorization": `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
    "Content-Type": "application/json"
  },
  transformLead: (lead) => ({
    properties: [
      { property: "firstname", value: lead.name.split(' ')[0] },
      { property: "lastname", value: lead.name.split(' ').slice(1).join(' ') },
      { property: "email", value: lead.email },
      { property: "phone", value: lead.phone },
      { property: "lifecyclestage", value: "lead" },
      { property: "lead_persona", value: lead.persona },
      { property: "insurance_coverage", value: lead.currentCoverage },
      { property: "arrival_date", value: lead.arrivalDate },
      { property: "stay_length", value: lead.stayLength },
      { property: "dependents", value: lead.dependents },
      { property: "zip", value: lead.zip },
      { property: "notes", value: lead.notes || '' }
    ]
  })
};

// Salesforce Integration
export const salesforceCRM: CRMIntegration = {
  name: "Salesforce",
  webhookUrl: `${process.env.SALESFORCE_INSTANCE_URL}/services/data/v57.0/sobjects/Lead/`,
  headers: {
    "Authorization": `Bearer ${process.env.SALESFORCE_ACCESS_TOKEN}`,
    "Content-Type": "application/json"
  },
  transformLead: (lead) => ({
    LastName: lead.name,
    Email: lead.email,
    Phone: lead.phone,
    Company: "AskNewton California",
    LeadSource: `AskNewton ${lead.persona}`,
    Status: "Open - Not Contacted",
    Description: `Health insurance lead from AskNewton California\n\nPersona: ${lead.persona}\nArrival Date: ${lead.arrivalDate}\nStay Length: ${lead.stayLength}\nCurrent Coverage: ${lead.currentCoverage}\nDependents: ${lead.dependents}\nZIP: ${lead.zip}\nNotes: ${lead.notes || 'N/A'}`,
    Custom_Persona__c: lead.persona,
    Custom_Coverage__c: lead.currentCoverage,
    Custom_Dependents__c: lead.dependents,
    PostalCode: lead.zip
  })
};

// Generic Webhook for any CRM that accepts JSON
export const genericWebhook: CRMIntegration = {
  name: "Generic Webhook",
  webhookUrl: process.env.CRM_WEBHOOK_URL || "",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.CRM_API_KEY || ""
  },
  transformLead: (lead) => ({
    // Raw lead data - CRM will handle transformation
    ...lead,
    source: "AskNewton California",
    lead_type: "health_insurance",
    timestamp: new Date().toISOString()
  })
};

// Send lead to CRM
export async function sendToCRM(lead: Lead, integration: CRMIntegration): Promise<boolean> {
  try {
    const transformedData = integration.transformLead(lead);
    
    const response = await fetch(integration.webhookUrl, {
      method: 'POST',
      headers: integration.headers,
      body: JSON.stringify(transformedData)
    });

    if (!response.ok) {
      console.error(`${integration.name} API error:`, response.status, await response.text());
      return false;
    }

    console.log(`✅ Lead sent to ${integration.name}:`, lead.email);
    return true;
  } catch (error) {
    console.error(`❌ ${integration.name} integration error:`, error);
    return false;
  }
}

// Usage example:
// import { sendToCRM, zohoCRM } from './crm-webhooks';
// await sendToCRM(leadData, zohoCRM);