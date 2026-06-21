'use client';

import React, { useState } from 'react';
import { useTranslation } from '../../lib/i18n/LanguageContext';
import { runInsuranceBrain } from '../../lib/brain/rules';
import { Profile, BrainResult, RankedPlan } from '../../lib/brain/types';
import { 
  Calendar, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw, 
  Mail, 
  Phone, 
  CheckCircle,
  Database,
  ArrowRightCircle
} from 'lucide-react';

export default function GuidePage() {
  const { dictionary, language } = useTranslation();
  
  // Form stepper state
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Profile Form States
  const [state, setState] = useState('California');
  const [isNewcomer, setIsNewcomer] = useState(false);
  const [householdSize, setHouseholdSize] = useState(1);
  const [incomeBand, setIncomeBand] = useState<'low' | 'mid' | 'high'>('mid');
  const [hasEmployerCoverage, setHasEmployerCoverage] = useState(false);
  const [needs, setNeeds] = useState<string[]>([]);
  const [age, setAge] = useState(30);
  const [consentGranted, setConsentGranted] = useState(false);

  // Result States
  const [loading, setLoading] = useState(false);
  const [brainResult, setBrainResult] = useState<BrainResult | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  // Waitlist/Reminder States
  const [reminderEmail, setReminderEmail] = useState('');
  const [reminderPhone, setReminderPhone] = useState('');
  const [reminderChannel, setReminderChannel] = useState<'email' | 'whatsapp'>('email');
  const [reminderConsent, setReminderConsent] = useState(false);
  const [reminderSuccess, setReminderSuccess] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);

  // Tooltip helper
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const toggleNeed = (need: string) => {
    if (needs.includes(need)) {
      setNeeds(needs.filter(n => n !== need));
    } else {
      setNeeds([...needs, need]);
    }
  };

  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGranted) {
      alert('You must grant consent to process your profile guidelines before continuing.');
      return;
    }

    setLoading(true);
    try {
      // 1. Run deterministic Insurance Brain locally
      const profile: Profile = {
        state,
        language,
        isNewcomer,
        householdSize,
        incomeBand,
        hasEmployerCoverage,
        needs,
        age
      };
      
      const brainRes = runInsuranceBrain(profile);
      setBrainResult(brainRes);

      // 2. Query AI Explanation layer API
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brainResult: brainRes, language })
      });
      const data = await res.json();
      
      setAiExplanation(data.explanation);
      setIsFallback(data.isFallback);
      
      // Move past stepper into result display
      setStep(4);
    } catch (err) {
      console.error(err);
      alert('An error occurred while evaluating your profile. Please check console logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderConsent) {
      alert('Explicit consent is required to store contact information.');
      return;
    }
    if (reminderChannel === 'email' && !reminderEmail) {
      alert('Please provide an email address.');
      return;
    }
    if (reminderChannel === 'whatsapp' && !reminderPhone) {
      alert('Please provide a WhatsApp phone number.');
      return;
    }

    setReminderLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: reminderEmail || `${reminderPhone.replace(/\D/g, '')}@whatsapp.asknewton.com`,
          phone: reminderPhone || undefined,
          language,
          state,
          consentToContact: reminderConsent,
          sourcePage: 'Guide Result Reminders',
          registerReminder: true,
          windowType: brainResult?.window.type,
          deadlineDate: brainResult?.window.deadline,
          reminderChannel
        })
      });
      if (res.ok) {
        setReminderSuccess(true);
      } else {
        alert('Failed to register reminder. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error registering reminder.');
    } finally {
      setReminderLoading(false);
    }
  };

  const resetGuide = () => {
    setStep(1);
    setBrainResult(null);
    setAiExplanation(null);
    setReminderSuccess(false);
    setReminderEmail('');
    setReminderPhone('');
    setReminderConsent(false);
  };

  const usStates = [
    'California', 'Texas', 'New York', 'Florida', 'Illinois', 
    'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina', 'Michigan', 
    'Washington', 'Arizona', 'Massachusetts', 'Colorado', 'Virginia'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header section */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground font-sans">
          {dictionary.guide.title}
        </h1>
        <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto">
          {dictionary.guide.subtitle}
        </p>
      </div>

      {/* Stepper progress indicator */}
      {step <= 3 && (
        <div className="w-full bg-muted-bg rounded-full h-2.5 mb-10 flex items-center justify-between overflow-hidden">
          <div 
            className="bg-accent h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      )}

      {/* Intake Wizard Card */}
      {step <= 3 && (
        <form onSubmit={handleIntakeSubmit} className="bg-white border border-border-color rounded-2xl shadow-sm p-6 sm:p-10 space-y-8">
          
          {/* STEP 1: Core parameters */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold border-b border-border-color pb-3 text-foreground">
                {dictionary.guide.step} 1: Location & Status
              </h2>

              {/* US State */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  {dictionary.guide.qState}
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full border border-border-color rounded-lg p-3 bg-white text-foreground"
                >
                  {usStates.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Age input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  {dictionary.guide.qAge}
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full border border-border-color rounded-lg p-3 bg-white text-foreground"
                />
                <p className="text-xs text-muted">
                  {dictionary.guide.qAgeDesc}
                </p>
              </div>

              {/* Newcomer status with Tooltip explanation */}
              <div className="p-4 bg-muted-bg/50 border border-border-color rounded-xl space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <input
                      type="checkbox"
                      id="newcomer"
                      checked={isNewcomer}
                      onChange={(e) => setIsNewcomer(e.target.checked)}
                      className="w-5 h-5 rounded border-border-color text-accent focus:ring-accent"
                    />
                    <label htmlFor="newcomer" className="font-semibold text-sm text-foreground cursor-pointer select-none">
                      {dictionary.guide.qNewcomer}
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTooltip(activeTooltip === 'newcomer' ? null : 'newcomer')}
                    className="text-muted hover:text-accent p-0.5"
                    aria-label="Newcomer tooltip"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-muted">
                  {dictionary.guide.qNewcomerDesc}
                </p>

                {activeTooltip === 'newcomer' && (
                  <div className="p-3 bg-white border border-accent/20 rounded-lg text-xs text-muted shadow-sm animate-fade-in">
                    <span className="font-bold text-accent block mb-1">
                      {dictionary.guide.whyWeAsk}:
                    </span>
                    {dictionary.guide.qNewcomerTooltip}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Household & Financial bands */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold border-b border-border-color pb-3 text-foreground">
                {dictionary.guide.step} 2: Dependents & Income
              </h2>

              {/* Household Size */}
              <div className="p-4 bg-muted-bg/50 border border-border-color rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-foreground">
                    {dictionary.guide.qHousehold}
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTooltip(activeTooltip === 'household' ? null : 'household')}
                    className="text-muted hover:text-accent"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </div>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={householdSize}
                  onChange={(e) => setHouseholdSize(Number(e.target.value))}
                  className="w-full border border-border-color rounded-lg p-3 bg-white text-foreground"
                />
                <p className="text-xs text-muted">
                  {dictionary.guide.qHouseholdDesc}
                </p>

                {activeTooltip === 'household' && (
                  <div className="p-3 bg-white border border-accent/20 rounded-lg text-xs text-muted shadow-sm">
                    <span className="font-bold text-accent block mb-1">
                      {dictionary.guide.whyWeAsk}:
                    </span>
                    {dictionary.guide.qHouseholdTooltip}
                  </div>
                )}
              </div>

              {/* Income band */}
              <div className="p-4 bg-muted-bg/50 border border-border-color rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-foreground">
                    {dictionary.guide.qIncome}
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTooltip(activeTooltip === 'income' ? null : 'income')}
                    className="text-muted hover:text-accent"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['low', 'mid', 'high'] as const).map((band) => (
                    <button
                      key={band}
                      type="button"
                      onClick={() => setIncomeBand(band)}
                      className={`p-3 text-sm rounded-lg border text-center font-semibold transition-smooth ${
                        incomeBand === band
                          ? 'border-accent bg-accent/5 text-accent'
                          : 'border-border-color hover:bg-muted-bg text-foreground'
                      }`}
                    >
                      {band === 'low' && dictionary.guide.incomeLow}
                      {band === 'mid' && dictionary.guide.incomeMid}
                      {band === 'high' && dictionary.guide.incomeHigh}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted">
                  {dictionary.guide.qIncomeDesc}
                </p>

                {activeTooltip === 'income' && (
                  <div className="p-3 bg-white border border-accent/20 rounded-lg text-xs text-muted shadow-sm">
                    <span className="font-bold text-accent block mb-1">
                      {dictionary.guide.whyWeAsk}:
                    </span>
                    {dictionary.guide.qIncomeTooltip}
                  </div>
                )}
              </div>

              {/* Employer Coverage status */}
              <div className="flex items-start space-x-3 rtl:space-x-reverse p-4 border border-border-color rounded-xl">
                <input
                  type="checkbox"
                  id="employer"
                  checked={hasEmployerCoverage}
                  onChange={(e) => setHasEmployerCoverage(e.target.checked)}
                  className="w-5 h-5 rounded border-border-color text-accent focus:ring-accent mt-0.5"
                />
                <div className="space-y-1">
                  <label htmlFor="employer" className="font-semibold text-sm text-foreground cursor-pointer select-none">
                    {dictionary.guide.qEmployer}
                  </label>
                  <p className="text-xs text-muted">
                    {dictionary.guide.qEmployerDesc}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Coverage specific needs & Consent */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold border-b border-border-color pb-3 text-foreground">
                {dictionary.guide.step} 3: Health Needs & Consent
              </h2>

              {/* Needs Checkboxes */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-foreground">
                  {dictionary.guide.qNeeds}
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'low-cost', label: dictionary.guide.needLowCost },
                    { id: 'chronic-condition', label: dictionary.guide.needChronic },
                    { id: 'two-kids', label: dictionary.guide.needKids },
                    { id: 'doctor-choice', label: dictionary.guide.needDoctor }
                  ].map((need) => {
                    const isChecked = needs.includes(need.id);
                    return (
                      <button
                        key={need.id}
                        type="button"
                        onClick={() => toggleNeed(need.id)}
                        className={`p-3.5 text-sm rounded-lg border text-left rtl:text-right font-medium transition-smooth hover-lift flex items-center space-x-3 rtl:space-x-reverse ${
                          isChecked
                            ? 'border-accent bg-accent/5 text-accent'
                            : 'border-border-color hover:bg-muted-bg text-foreground'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                          isChecked ? 'bg-accent border-accent text-white' : 'border-slate-300'
                        }`}>
                          {isChecked && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>
                        <span>{need.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Required Consent box */}
              <div className="p-5 bg-accent/5 border border-accent/15 rounded-xl space-y-3">
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <input
                    type="checkbox"
                    id="consent"
                    required
                    checked={consentGranted}
                    onChange={(e) => setConsentGranted(e.target.checked)}
                    className="w-5 h-5 rounded border-accent/30 text-accent focus:ring-accent mt-0.5"
                  />
                  <div className="space-y-1">
                    <label htmlFor="consent" className="font-bold text-sm text-foreground cursor-pointer select-none">
                      Consent to Process Data (Required)
                    </label>
                    <p className="text-xs text-muted leading-relaxed">
                      I agree that askNewton may process the provided parameters anonymously to evaluate insurance deadlines and plan cost-sharing indicators. No cookies or personal indicators are tracked.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Buttons footer */}
          <div className="flex items-center justify-between border-t border-border-color pt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center space-x-1.5 rtl:space-x-reverse px-5 py-2.5 border border-border-color rounded-lg text-sm font-semibold hover:bg-muted-bg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{dictionary.guide.prev}</span>
              </button>
            ) : (
              <div></div>
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center space-x-1.5 rtl:space-x-reverse px-6 py-2.5 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent-hover transition-smooth shadow"
              >
                <span>{dictionary.guide.next}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !consentGranted}
                className="flex items-center space-x-2 rtl:space-x-reverse px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-base font-bold transition-smooth shadow disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <span>{dictionary.guide.submit}</span>
                    <ArrowRightCircle className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      )}

      {/* RESULTS DISPLAY VIEW (Step 4) */}
      {step === 4 && brainResult && (
        <div className="space-y-10 animate-fade-in">
          
          {/* Restart Banner */}
          <div className="flex items-center justify-between bg-white border border-border-color rounded-xl p-4 shadow-sm">
            <div className="text-sm text-muted">
              Guide computed based on profile in <strong className="text-foreground">{state}</strong>
            </div>
            <button
              onClick={resetGuide}
              className="flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{dictionary.guide.restart}</span>
            </button>
          </div>

          {/* AI Explanation block (Primary Presentation Area) */}
          <div className="bg-white border-2 border-accent/20 rounded-2xl shadow-md p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-border-color pb-3">
              <h2 className="text-xl font-bold text-foreground flex items-center space-x-2 rtl:space-x-reverse">
                <span className="w-2.5 h-2.5 bg-accent rounded-full"></span>
                <span>Plain Language AI Explanation</span>
              </h2>
              {isFallback && (
                <span className="text-[10px] font-mono bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full">
                  Deterministic Render Fallback
                </span>
              )}
            </div>
            <div className="prose max-w-none text-foreground text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {aiExplanation}
            </div>
          </div>

          {/* Dynamic Grid for Rule Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card A: Enrollment window and Deadline */}
            <div className="bg-white border border-border-color rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-foreground flex items-center space-x-2 rtl:space-x-reverse">
                    <Calendar className="w-5 h-5 text-accent" />
                    <span>{dictionary.guide.deadlineTitle}</span>
                  </h3>
                  
                  {/* Dynamic coloring for deadlines */}
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                    brainResult.window.specialEnrollment 
                      ? 'bg-warning-bg border-warning/30 text-warning' 
                      : 'bg-success-bg border-success/30 text-success'
                  }`}>
                    {brainResult.window.specialEnrollment ? 'Action Required' : 'Standard Timeline'}
                  </span>
                </div>
                
                <div className="text-sm font-semibold p-3.5 bg-slate-50 rounded-xl border border-border-color text-center font-mono">
                  {brainResult.window.deadline}
                </div>
                
                <p className="text-xs text-muted leading-relaxed">
                  <strong>Type:</strong> {brainResult.window.type}
                </p>
              </div>
              <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
                {dictionary.guide.traceReference} {brainResult.sources[3] || brainResult.sources[0]}
              </div>
            </div>

            {/* Card B: Subsidy & FPL status */}
            <div className="bg-white border border-border-color rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="font-bold text-base text-foreground flex items-center space-x-2 rtl:space-x-reverse">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span>{dictionary.guide.subsidyTitle}</span>
                </h3>

                <div className="space-y-2">
                  {brainResult.eligibility.notes.map((note, index) => (
                    <div key={index} className="text-xs text-muted leading-relaxed flex items-start space-x-1.5 rtl:space-x-reverse">
                      <span className="text-emerald-500 mt-1 select-none">•</span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
                {dictionary.guide.traceReference} {brainResult.sources[0]}
              </div>
            </div>
          </div>

          {/* Pitfall Alert Callout Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start space-x-4 rtl:space-x-reverse">
            <div className="bg-amber-100 border border-amber-200 text-amber-700 p-2.5 rounded-xl mt-0.5 select-none">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="font-bold text-amber-900 text-sm">
                {dictionary.guide.riskTitle}
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                {brainResult.topRisk}
              </p>
            </div>
          </div>

          {/* Next Action Callout Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex items-start space-x-4 rtl:space-x-reverse">
            <div className="bg-blue-100 border border-blue-200 text-blue-700 p-2.5 rounded-xl mt-0.5 select-none">
              <ArrowRight className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="font-bold text-blue-900 text-sm">
                {dictionary.guide.actionTitle}
              </h4>
              <p className="text-xs text-blue-800 leading-relaxed">
                {brainResult.nextAction}
              </p>
            </div>
          </div>

          {/* Plans shortlist */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold tracking-tight text-foreground border-b border-border-color pb-2">
              {dictionary.guide.plansTitle}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {brainResult.plans.map((plan: RankedPlan, idx) => (
                <div key={plan.id} className="bg-white border border-border-color rounded-2xl p-6 hover-lift flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                        Rank #{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono bg-accent/10 border border-accent/25 text-accent px-2 py-0.5 rounded-full">
                        {plan.networkTier}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-foreground">
                      {plan.name}
                    </h4>

                    {/* Premium cost */}
                    <div className="py-2 border-t border-b border-slate-100">
                      <span className="text-2xl font-extrabold text-foreground">${plan.monthlyCost}</span>
                      <span className="text-xs text-muted block mt-0.5">estimated monthly</span>
                    </div>

                    {/* Benefits covers */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-emerald-600 block uppercase tracking-wider">{dictionary.guide.covers}:</span>
                      {plan.covers.slice(0, 3).map((item, index) => (
                        <div key={index} className="text-xs text-muted flex items-start space-x-1 rtl:space-x-reverse">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span className="leading-tight">{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Exclusions */}
                    <div className="space-y-1 pt-2">
                      <span className="text-[10px] font-bold text-rose-600 block uppercase tracking-wider">{dictionary.guide.excludes}:</span>
                      {plan.excludes.slice(0, 3).map((item, index) => (
                        <div key={index} className="text-xs text-muted flex items-start space-x-1 rtl:space-x-reverse">
                          <span className="text-rose-500 font-bold">•</span>
                          <span className="leading-tight">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-[9px] text-slate-400 font-mono mt-4 pt-2 border-t border-slate-100">
                    Source: Newton Database v1.0
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Reminders Capture Form */}
          <div className="bg-white border border-border-color rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-foreground flex items-center space-x-2 rtl:space-x-reverse">
                <Calendar className="w-5 h-5 text-accent" />
                <span>Receive Deadline Reminders</span>
              </h3>
              <p className="text-xs text-muted">
                Opt in to get a frequency-capped notification before the computed deadline (<strong>{brainResult.window.deadline}</strong>) closes. We strictly honor one-click opt-out.
              </p>
            </div>

            {reminderSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-3 rtl:space-x-reverse">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold">Reminder registered! We have logged your consent.</span>
              </div>
            ) : (
              <form onSubmit={handleReminderSubmit} className="space-y-4 pt-2">
                
                {/* Channel selection */}
                <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm">
                  <span className="font-semibold text-xs text-muted">Reminder Channel:</span>
                  <label className="flex items-center space-x-1.5 rtl:space-x-reverse cursor-pointer">
                    <input
                      type="radio"
                      name="channel"
                      checked={reminderChannel === 'email'}
                      onChange={() => setReminderChannel('email')}
                      className="text-accent"
                    />
                    <span>Email</span>
                  </label>
                  <label className="flex items-center space-x-1.5 rtl:space-x-reverse cursor-pointer">
                    <input
                      type="radio"
                      name="channel"
                      checked={reminderChannel === 'whatsapp'}
                      onChange={() => setReminderChannel('whatsapp')}
                      className="text-accent"
                    />
                    <span>WhatsApp</span>
                  </label>
                </div>

                {/* Direct input */}
                {reminderChannel === 'email' ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted" />
                      <input
                        type="email"
                        required
                        placeholder="you@domain.com"
                        value={reminderEmail}
                        onChange={(e) => setReminderEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-border-color rounded-lg text-foreground text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-3.5 w-5 h-5 text-muted" />
                      <input
                        type="tel"
                        required
                        placeholder="+1 (555) 000-0000"
                        value={reminderPhone}
                        onChange={(e) => setReminderPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-border-color rounded-lg text-foreground text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Explicit reminder consent */}
                <div className="p-3 bg-muted-bg rounded-lg space-y-3">
                  <div className="flex items-start space-x-2 rtl:space-x-reverse">
                    <input
                      type="checkbox"
                      id="reminder-consent"
                      required
                      checked={reminderConsent}
                      onChange={(e) => setReminderConsent(e.target.checked)}
                      className="w-4 h-4 rounded border-border-color text-accent mt-0.5"
                    />
                    <label htmlFor="reminder-consent" className="text-xs text-muted cursor-pointer select-none">
                      I consent to receive up to 3 automatic reminders before the deadline of the {brainResult.window.type}. I understand I can unsubscribe anytime.
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={reminderLoading || !reminderConsent}
                  className="w-full bg-accent hover:bg-accent-hover text-white py-3 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {reminderLoading ? 'Registering...' : 'Activate Reminders'}
                </button>
              </form>
            )}
          </div>

          {/* Trace References Section */}
          <div className="bg-white border border-border-color rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-xs text-muted uppercase tracking-wider flex items-center space-x-2 rtl:space-x-reverse">
              <Database className="w-4 h-4" />
              <span>{dictionary.guide.sourcesTitle}</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-muted">
              {brainResult.sources.map((src, idx) => (
                <li key={idx} className="flex items-center space-x-2 rtl:space-x-reverse font-mono">
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                  <span>{src}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Regulatory Disclaimer section */}
          <div className="p-4 border border-slate-200 bg-slate-50 text-slate-500 rounded-xl text-center space-y-1">
            <div className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              {dictionary.guide.disclaimerTitle}
            </div>
            <p className="text-[11px] leading-relaxed max-w-xl mx-auto">
              {dictionary.guide.disclaimerText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
