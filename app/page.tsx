'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '../lib/i18n/LanguageContext';
import { ShieldCheck, CalendarRange, Clock, UsersRound, MessageSquareOff } from 'lucide-react';
import WaitlistForm from '../components/WaitlistForm';

export default function Home() {
  const { dictionary } = useTranslation();

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            
            {/* Regulated status badge */}
            <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold select-none">
              <ShieldCheck className="w-4 h-4" />
              <span>Insurance Guidance Service</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground font-sans leading-tight">
              {dictionary.landing.heroTitle}
            </h1>

            <p className="text-lg sm:text-xl text-muted leading-relaxed max-w-3xl mx-auto">
              {dictionary.landing.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              <Link
                href="/guide"
                className="w-full sm:w-auto px-8 py-4 bg-accent hover:bg-accent-hover text-white text-lg font-bold rounded-lg transition-smooth shadow-md hover:shadow-lg hover-lift text-center"
              >
                {dictionary.landing.ctaButton}
              </Link>
              <Link
                href="/how"
                className="w-full sm:w-auto px-8 py-4 border border-border-color hover:bg-muted-bg text-foreground text-lg font-semibold rounded-lg transition-smooth text-center"
              >
                {dictionary.nav.how}
              </Link>
            </div>
            
            <p className="text-xs text-muted max-w-md mx-auto">
              No medical histories or Social Security numbers required to start. Safe and anonymous — no account needed to start.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Core Positioning: Not a Chatbot */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {dictionary.landing.whyTitle}
          </h2>
          <p className="text-muted text-base">
            {dictionary.landing.whySubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Not a Chatbot */}
          <div className="bg-white border border-border-color rounded-2xl p-8 hover-lift space-y-4">
            <div className="w-12 h-12 flex items-center justify-center bg-rose-50 border border-rose-100 rounded-xl text-rose-500">
              <MessageSquareOff className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {dictionary.landing.notChatbotTitle}
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              {dictionary.landing.notChatbotDesc} askNewton initiates clear recommendations *the moment before* you make enrollment mistakes.
            </p>
          </div>

          {/* Card 2: Regulated Insurer Backed */}
          <div className="bg-white border border-border-color rounded-2xl p-8 hover-lift space-y-4">
            <div className="w-12 h-12 flex items-center justify-center bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {dictionary.landing.licensedTitle}
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              {dictionary.landing.licensedDesc}
            </p>
          </div>

          {/* Card 3: t-1 Principle Proactivity */}
          <div className="bg-white border border-border-color rounded-2xl p-8 hover-lift space-y-4">
            <div className="w-12 h-12 flex items-center justify-center bg-blue-50 border border-blue-100 rounded-xl text-blue-500">
              <CalendarRange className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              The t-1 Principle
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              We help you avoid missing deadlines or selecting the wrong plan. We map your state boundaries and eligibility requirements.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Dynamic Interactive Brand Equation */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 rounded-3xl max-w-7xl mx-auto border border-slate-800 shadow-xl">
        <div className="max-w-5xl mx-auto space-y-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {dictionary.landing.equationTitle}
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Our framework balances clean parameters, robust logic rules, and human governance.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-4 p-8 bg-slate-950/60 rounded-2xl border border-slate-800/80 max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-3">
              <span className="font-semibold text-accent text-sm">Clean Data</span>
              <span className="text-xs text-slate-500 mt-1">Coarse inputs</span>
            </div>
            <span className="text-xl text-slate-700 font-bold sm:block hidden">+</span>
            <div className="flex flex-col items-center p-3">
              <span className="font-semibold text-accent text-sm">Proactive Agents</span>
              <span className="text-xs text-slate-500 mt-1">Rules-driven alert</span>
            </div>
            <span className="text-xl text-slate-700 font-bold sm:block hidden">+</span>
            <div className="flex flex-col items-center p-3">
              <span className="font-semibold text-accent text-sm">Human Judgment</span>
              <span className="text-xs text-slate-500 mt-1">Expert review</span>
            </div>
            <span className="text-xl text-slate-700 font-bold sm:block hidden">+</span>
            <div className="flex flex-col items-center p-3">
              <span className="font-semibold text-accent text-sm">Trust Governance</span>
              <span className="text-xs text-slate-500 mt-1">Minimal PII</span>
            </div>
            <span className="text-xl text-slate-700 font-bold sm:col-span-1 col-span-full py-2">=</span>
            <div className="sm:col-span-5 col-span-full border-t border-slate-800 pt-4 flex flex-col items-center">
              <span className="text-base font-bold text-emerald-400 tracking-wider">
                {dictionary.brand.equation}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <WaitlistForm source="home_bottom" />
      </section>

      {/* 4. Heritage taglines banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <p className="text-muted font-mono uppercase tracking-widest text-xs">
          heritage insurance values
        </p>
        <p className="text-xl font-medium max-w-2xl mx-auto italic text-foreground">
          "{dictionary.brand.tagline1}"
        </p>
        <p className="text-xs text-muted">
          {dictionary.brand.tagline2}
        </p>
      </section>
    </div>
  );
}
