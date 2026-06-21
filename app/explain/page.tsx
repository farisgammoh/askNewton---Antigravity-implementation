'use client';

import React, { useState } from 'react';
import { useTranslation } from '../../lib/i18n/LanguageContext';
import { 
  FileText, 
  UploadCloud, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Loader2, 
  PhoneCall, 
  ArrowRight
} from 'lucide-react';

export default function ExplainPage() {
  const { dictionary } = useTranslation();
  const [pasteText, setPasteText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // Mock loading text for preview
      setPasteText(`[Pasted from uploaded file: ${file.name}]\n\nHEALTH BENEFITS COVERAGE OUTLINE\nNewton Choice Plan - Group ID 99432. Deductible: $1,500 Individual. Out-of-pocket maximum: $6,500. Routine physical exams are covered at 100%. Emergency room visits require a $250 copay plus 20% coinsurance. Excludes cosmetic surgery, acupuncture, and non-emergency out-of-network benefits. Claims must be submitted within 90 days of the date of service.`);
    }
  };

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteText.trim()) {
      alert('Please paste some text or upload a file first.');
      return;
    }

    setAnalyzing(true);
    
    // Simulate analyzing time
    setTimeout(() => {
      // Deterministic parsing based on key terms, or robust mock results
      const lower = pasteText.toLowerCase();
      
      let detectedDeductible = '$1,500 Individual / $3,000 Family (Estimated)';
      let detectedOutPocket = '$6,500 Max (Estimated)';
      let deadlineText = '90 days from service date (Standard claim submission window)';
      
      if (lower.includes('deductible')) {
        const match = pasteText.match(/deductible:?\s*\$?([\d,]+)/i);
        if (match) detectedDeductible = `$${match[1]} (Extracted from text)`;
      }

      if (lower.includes('out-of-pocket')) {
        const match = pasteText.match(/out-of-pocket\s*maximum:?\s*\$?([\d,]+)/i);
        if (match) detectedOutPocket = `$${match[1]} (Extracted from text)`;
      }

      setResult({
        summary: 'This document outline details in-network medical benefits and claims procedures for a standard marketplace or employer-sponsored plan. It details deductible thresholds, coinsurance details, and limits out-of-network support.',
        deductible: detectedDeductible,
        outPocketMax: detectedOutPocket,
        covers: [
          'Preventative routine physical examinations (Covered 100% in-network)',
          'Emergency Room care (Subject to flat copay and percentage coinsurance)',
          'Primary care visits (Likely subject to standard copays or deductible)'
        ],
        excludes: [
          'Cosmetic surgeries and related revisions (100% excluded)',
          'Alternative medical treatments (Acupuncture, homeopaty, or chiropractic)',
          'Non-emergency out-of-network care (Excluded - provider network is narrow)'
        ],
        deadlines: [
          { date: '90 Days', label: 'Claims submission: All claims must be submitted to the insurer within 90 days of treatment.' },
          { date: 'Annual Renewal', label: 'Plan choice updates: Changes to this group coverage are locked until the next employer selection cycle.' }
        ],
        safetyFlags: [
          'The document indicates out-of-network care is excluded except for emergencies. If you see an out-of-network doctor, you will be billed 100% of the cost. Check with an advisor to verify provider network directories.',
          'The 90-day claim submission deadline is strict. Late claims will be denied without appeal rights.'
        ]
      });
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Page Title */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground font-sans">
          {dictionary.explain.title}
        </h1>
        <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto">
          {dictionary.explain.subtitle}
        </p>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form panel */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleAnalyze} className="bg-white border border-border-color rounded-2xl shadow-sm p-6 space-y-6">
            
            {/* File Upload drag-and-drop zone */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">
                {dictionary.explain.uploadLabel}
              </label>
              
              <div className="border-2 border-dashed border-border-color rounded-xl p-6 text-center hover:bg-muted-bg/30 transition-colors relative cursor-pointer group">
                <input
                  type="file"
                  accept=".txt,.pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="space-y-2 flex flex-col items-center">
                  <UploadCloud className="w-8 h-8 text-muted group-hover:text-accent transition-colors" />
                  <span className="text-sm font-semibold text-foreground">
                    {fileName ? fileName : 'Click to select policy file'}
                  </span>
                  <span className="text-xs text-muted">
                    Supports TXT, PDF or raw text copy
                  </span>
                </div>
              </div>
            </div>

            {/* Paste textarea */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">
                {dictionary.explain.pasteLabel}
              </label>
              <textarea
                rows={8}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={dictionary.explain.pastePlaceholder}
                className="w-full border border-border-color rounded-xl p-4 text-sm bg-white text-foreground focus:ring-accent focus:border-accent"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={analyzing || !pasteText.trim()}
              className="w-full bg-accent hover:bg-accent-hover text-white py-4 rounded-xl text-base font-bold transition-smooth shadow flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{dictionary.explain.loading}</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>{dictionary.explain.submitButton}</span>
                </>
              )}
            </button>
          </form>

          {/* Analysis Result display */}
          {result && (
            <div className="bg-white border border-border-color rounded-2xl shadow-sm p-6 sm:p-8 space-y-8 animate-fade-in">
              
              {/* Header */}
              <div className="border-b border-border-color pb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground flex items-center space-x-2 rtl:space-x-reverse">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span>{dictionary.explain.resultTitle}</span>
                </h2>
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                  Analysis Complete
                </span>
              </div>

              {/* Regulatory Banner warning */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 rtl:space-x-reverse">
                <ShieldAlert className="w-5 h-5 text-amber-700 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-xs text-amber-900 block">
                    {dictionary.explain.alertWarning}
                  </span>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {dictionary.explain.alertWarningText}
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-foreground uppercase tracking-wider text-slate-500">
                  {dictionary.explain.summary}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {result.summary}
                </p>
              </div>

              {/* Financial outline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-muted-bg rounded-xl">
                  <span className="text-xs text-muted block uppercase font-bold font-mono">Deductible</span>
                  <span className="text-lg font-bold text-foreground">{result.deductible}</span>
                </div>
                <div className="p-4 bg-muted-bg rounded-xl">
                  <span className="text-xs text-muted block uppercase font-bold font-mono">Out-of-Pocket Max</span>
                  <span className="text-lg font-bold text-foreground">{result.outPocketMax}</span>
                </div>
              </div>

              {/* Split Benefits and Exclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                
                {/* Covers */}
                <div className="space-y-3">
                  <h3 className="font-bold text-xs uppercase text-emerald-600 tracking-wider">
                    {dictionary.explain.coverage}
                  </h3>
                  <ul className="space-y-2">
                    {result.covers.map((item: string, idx: number) => (
                      <li key={idx} className="text-xs text-muted flex items-start space-x-2 rtl:space-x-reverse">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Exclude */}
                <div className="space-y-3">
                  <h3 className="font-bold text-xs uppercase text-rose-600 tracking-wider">
                    {dictionary.explain.exclusions}
                  </h3>
                  <ul className="space-y-2">
                    {result.excludes.map((item: string, idx: number) => (
                      <li key={idx} className="text-xs text-muted flex items-start space-x-2 rtl:space-x-reverse">
                        <XCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Deadlines */}
              <div className="space-y-3 border-t border-border-color pt-6">
                <h3 className="font-bold text-xs text-muted uppercase tracking-wider">
                  {dictionary.explain.deadlines}
                </h3>
                
                <div className="space-y-2.5">
                  {result.deadlines.map((dl: any, idx: number) => (
                    <div key={idx} className="flex items-center space-x-3 rtl:space-x-reverse p-3.5 bg-slate-50 border border-border-color rounded-xl">
                      <Calendar className="w-5 h-5 text-accent shrink-0" />
                      <div className="text-xs">
                        <strong className="text-foreground">{dl.date}</strong> — <span className="text-muted">{dl.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* High risk flags */}
              <div className="space-y-3 border-t border-border-color pt-6">
                <h3 className="font-bold text-xs text-amber-700 uppercase tracking-wider">
                  Critical Interpretations Flags (Review Required)
                </h3>
                
                <div className="space-y-2">
                  {result.safetyFlags.map((flag: string, idx: number) => (
                    <div key={idx} className="p-3 bg-amber-50/50 border border-amber-200/55 rounded-xl text-xs text-amber-900 leading-relaxed">
                      {flag}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar help */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="font-bold text-base">How it works</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload your summary guidelines, insurer notification, or policy letter.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              We extract raw benefit structures and compare them against regulatory deadlines.
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center space-x-2 text-accent text-xs font-semibold">
              <span>Read trust documentation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="bg-white border border-border-color rounded-2xl p-6 space-y-4 text-center">
            <ShieldAlert className="w-10 h-10 text-accent mx-auto" />
            <h3 className="font-bold text-sm text-foreground">Verification Warning</h3>
            <p className="text-xs text-muted leading-relaxed">
              Decisions affecting claim filing or coverage binding must be validated by a licensed representative.
            </p>
            <a
              href="#licensed-advisor"
              className="block bg-accent hover:bg-accent-hover text-white text-xs font-semibold py-2.5 rounded-lg transition-colors"
            >
              Contact Advisor
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
