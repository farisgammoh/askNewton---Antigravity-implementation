'use client';

import React from 'react';
import { useTranslation } from '../../lib/i18n/LanguageContext';
import { Cpu, Languages, UserCheck, ShieldCheck } from 'lucide-react';

export default function HowItWorksPage() {
  const { dictionary } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground font-sans">
          {dictionary.howItWorks.title}
        </h1>
        <p className="text-muted text-base sm:text-lg">
          {dictionary.howItWorks.subtitle}
        </p>
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Step 1 */}
        <div className="bg-white border border-border-color rounded-2xl p-8 hover-lift space-y-4">
          <div className="w-12 h-12 flex items-center justify-center bg-blue-50 border border-blue-100 rounded-xl text-blue-500">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-foreground">
            {dictionary.howItWorks.brainTitle}
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            {dictionary.howItWorks.brainDesc}
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-white border border-border-color rounded-2xl p-8 hover-lift space-y-4">
          <div className="w-12 h-12 flex items-center justify-center bg-purple-50 border border-purple-100 rounded-xl text-purple-500">
            <Languages className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-foreground">
            {dictionary.howItWorks.explanationTitle}
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            {dictionary.howItWorks.explanationDesc}
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-white border border-border-color rounded-2xl p-8 hover-lift space-y-4">
          <div className="w-12 h-12 flex items-center justify-center bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-500">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-foreground">
            {dictionary.howItWorks.humanTitle}
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            {dictionary.howItWorks.humanDesc}
          </p>
        </div>
      </div>

      {/* Visual Separation Architecture Block */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold">Safety & Isolation Architecture</h2>
          <p className="text-xs text-slate-400">
            Calculations and AI generation are separated by design to prevent advice errors.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 max-w-3xl mx-auto pt-4">
          
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex-1 text-center space-y-2 w-full">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono">Stage 1: Input</span>
            <p className="text-xs text-slate-300">User state, newcomer status, age & optional needs preferences.</p>
          </div>

          <div className="text-2xl text-slate-700 font-bold hidden md:block">→</div>

          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex-1 text-center space-y-2 w-full">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Stage 2: Deterministic</span>
            <p className="text-xs text-slate-300">Rules Engine resolves FPL subsidy thresholds and ranks plans.</p>
          </div>

          <div className="text-2xl text-slate-700 font-bold hidden md:block">→</div>

          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex-1 text-center space-y-2 w-full">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest font-mono">Stage 3: Explanation</span>
            <p className="text-xs text-slate-300">Claude LLM translates results without fabricating details.</p>
          </div>
        </div>
      </div>

      {/* Heritage message */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 bg-accent/5 px-3 py-1.5 rounded-full text-accent text-xs font-semibold select-none">
          <ShieldCheck className="w-4 h-4" />
          <span>Regulated Moat Advantage</span>
        </div>
        <p className="text-xs text-muted max-w-md mx-auto">
          askNewton, Inc. is part of the Newton Insurance plc family. We prioritize deterministic transparency above pure software automation.
        </p>
      </div>
    </div>
  );
}
