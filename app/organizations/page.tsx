'use client';

import React, { useState } from 'react';
import { useTranslation } from '../../lib/i18n/LanguageContext';
import { Users, Mail, Building, Briefcase, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function OrganizationsPage() {
  const { dictionary, language } = useTranslation();
  
  // Form state
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [email, setEmail] = useState('');
  const [size, setSize] = useState('10-50');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      alert('You must consent to being contacted by Newton Insurance.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone: undefined,
          language,
          state: 'Corporate / Org Request',
          consentToContact: consent,
          sourcePage: 'Organizations Partnership Page',
          registerReminder: false,
          // Custom extra message can be concatenated for storage
          message: `Contact: ${name}, Org: ${org}, Est Size: ${size}, Message: ${message}`
        })
      });

      if (res.ok) {
        setSuccess(true);
        setName('');
        setOrg('');
        setEmail('');
        setMessage('');
        setConsent(false);
      } else {
        alert('Failed to submit interest. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting organization inquiry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground font-sans">
          {dictionary.orgs.title}
        </h1>
        <p className="text-muted text-base sm:text-lg">
          {dictionary.orgs.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Info list */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Why partner with askNewton?</h2>
            <p className="text-sm text-muted leading-relaxed">
              We work with top employers, universities, and expatriate groups to ensure members get coverage and comply with US regulatory deadlines.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-3.5 rtl:space-x-reverse">
              <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Custom Group Onboarding</h4>
                <p className="text-xs text-muted leading-relaxed mt-1">
                  Private co-branded landing pages for your employees or students with dedicated state rules.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 rtl:space-x-reverse">
              <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Regulated & Compliant</h4>
                <p className="text-xs text-muted leading-relaxed mt-1">
                  Fully supported by Newton Insurance. No software-only compliance gaps.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 rtl:space-x-reverse">
              <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">HR Dashboard Integration</h4>
                <p className="text-xs text-muted leading-relaxed mt-1">
                  Monitor enrollment percentages and upcoming Special Enrollment Period deadlines anonymously.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className="bg-white border border-border-color rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
          <h3 className="font-bold text-lg text-foreground border-b border-border-color pb-3">
            {dictionary.orgs.formTitle}
          </h3>

          {success ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl space-y-3 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-base">Inquiry Submitted Successfully</h4>
              <p className="text-xs text-emerald-700 leading-relaxed">
                {dictionary.orgs.successMessage}
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-2 text-xs font-bold text-accent hover:underline"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-foreground">
                  {dictionary.orgs.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Faris Gammoh"
                  className="w-full border border-border-color rounded-lg p-2.5 bg-white text-foreground text-sm"
                />
              </div>

              {/* Org Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-foreground">
                  {dictionary.orgs.orgLabel}
                </label>
                <input
                  type="text"
                  required
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  placeholder="Acme International"
                  className="w-full border border-border-color rounded-lg p-2.5 bg-white text-foreground text-sm"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-foreground">
                  {dictionary.orgs.emailLabel}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hr@acme.com"
                  className="w-full border border-border-color rounded-lg p-2.5 bg-white text-foreground text-sm"
                />
              </div>

              {/* Size */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-foreground">
                  {dictionary.orgs.sizeLabel}
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full border border-border-color rounded-lg p-2.5 bg-white text-foreground text-sm"
                >
                  <option value="10-50">10 - 50</option>
                  <option value="50-200">50 - 200</option>
                  <option value="200-500">200 - 500</option>
                  <option value="500+">500+</option>
                </select>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-foreground">
                  {dictionary.orgs.messageLabel}
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your student or expat intake details..."
                  className="w-full border border-border-color rounded-lg p-2.5 bg-white text-foreground text-sm focus:ring-accent"
                />
              </div>

              {/* Consent check */}
              <div className="p-3 bg-muted-bg rounded-lg space-y-2">
                <div className="flex items-start space-x-2.5 rtl:space-x-reverse">
                  <input
                    type="checkbox"
                    id="org-consent"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="w-4 h-4 rounded border-border-color text-accent mt-0.5"
                  />
                  <label htmlFor="org-consent" className="text-xs text-muted cursor-pointer select-none">
                    I consent to Newton Insurance contacting me to provide partnership quotes and coordinate group setups.
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !consent}
                className="w-full bg-accent hover:bg-accent-hover text-white py-3 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <span>{dictionary.orgs.submitButton}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
