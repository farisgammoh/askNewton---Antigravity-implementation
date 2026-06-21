'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '../lib/i18n/LanguageContext';
import { Language } from '../lib/i18n';
import { Globe, Mail, ShieldCheck, Menu, X, Check } from 'lucide-react';

export const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, dictionary, dir, changeLanguage } = useTranslation();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [escalationOpen, setEscalationOpen] = useState(true);

  const navLinks = [
    { href: '/', label: dictionary.nav.home },
    { href: '/guide', label: dictionary.nav.guide },
    { href: '/explain', label: dictionary.nav.explain },
    { href: '/how', label: dictionary.nav.how },
    { href: '/organizations', label: dictionary.nav.orgs },
    { href: '/trust', label: dictionary.nav.trust },
  ];

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'ar', label: 'العربية' },
  ];

  const toggleLanguage = (code: Language) => {
    changeLanguage(code);
    setLangMenuOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-smooth selection:bg-accent/20 selection:text-accent">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-border-color">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand area */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse group">
              {/* Grid Glyph placeholder logo */}
              <div className="w-8 h-8 grid grid-cols-2 gap-0.5 p-1 bg-accent rounded transition-transform group-hover:scale-105">
                <div className="bg-white rounded-sm opacity-90"></div>
                <div className="bg-white rounded-sm opacity-60"></div>
                <div className="bg-white rounded-sm opacity-60"></div>
                <div className="bg-white rounded-sm opacity-90"></div>
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground font-sans group-hover:text-accent transition-colors">
                askNewton
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2 rtl:space-x-reverse text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'text-accent bg-accent/5 font-semibold'
                      : 'text-muted hover:text-foreground hover:bg-muted-bg/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Language Switcher and CTA Actions */}
          <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
            {/* Language dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-1.5 border border-border-color rounded-md text-sm hover:bg-muted-bg transition-colors"
                aria-label="Change language"
              >
                <Globe className="w-4 h-4 text-muted" />
                <span className="font-medium">
                  {languages.find((l) => l.code === language)?.label}
                </span>
              </button>

              {langMenuOpen && (
                <div className={`absolute ${dir === 'rtl' ? 'left-0' : 'right-0'} mt-2 w-40 rounded-md bg-white shadow-lg ring-1 ring-black/5 z-50 py-1`}>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => toggleLanguage(lang.code)}
                      className="w-full text-left rtl:text-right px-4 py-2 text-sm hover:bg-muted-bg flex items-center justify-between"
                    >
                      <span>{lang.label}</span>
                      {language === lang.code && <Check className="w-4 h-4 text-accent" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Human Escalation CTA */}
            <a
              href="#licensed-advisor"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('licensed-advisor')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center space-x-2 bg-accent text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-accent-hover transition-smooth shadow-sm hover:shadow"
            >
              <Mail className="w-4 h-4" />
              <span>{dictionary.escalation.cta}</span>
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center space-x-2 rtl:space-x-reverse">
            {/* Language Selection for mobile directly */}
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value as Language)}
              className="bg-transparent border border-border-color text-xs rounded p-1"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="ar">AR</option>
            </select>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border border-border-color rounded-md text-muted hover:text-foreground"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border-color bg-white py-3 px-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted-bg"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 pb-2 border-t border-border-color">
              <a
                href="#licensed-advisor"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  document.getElementById('licensed-advisor')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-center space-x-2 bg-accent text-white px-4 py-2.5 rounded-md text-sm font-semibold w-full"
              >
                <Mail className="w-4 h-4" />
                <span>{dictionary.escalation.cta}</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 2. Main Content Body */}
      <main className="flex-grow">{children}</main>

      {/* 3. Advisor Escalation Section (Anchored at bottom of every page or section) */}
      <section
        id="licensed-advisor"
        className="w-full bg-muted-bg border-t border-b border-border-color py-12 px-4 sm:px-6 lg:px-8 text-center"
      >
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center justify-center p-2 bg-accent/10 text-accent rounded-full mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {dictionary.escalation.text}
          </h2>
          <p className="text-muted text-base max-w-xl mx-auto">
            Plan selection and coverage details adjustments are for informational purposes only. askNewton does not sell or bind insurance.
          </p>
          <div className="pt-2">
            <a
              href="#waitlist"
              className="inline-flex items-center space-x-3 bg-accent text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-accent-hover shadow-lg hover:shadow-xl hover-lift transition-smooth"
            >
              <Mail className="w-5 h-5" />
              <span>{dictionary.escalation.cta}</span>
            </a>
          </div>
          <p className="text-xs text-muted pt-2 font-mono">
            {dictionary.escalation.disclaimer}
          </p>
        </div>
      </section>

      {/* 4. Footer Section */}
      <footer className="bg-slate-950 text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-6 h-6 grid grid-cols-2 gap-0.5 p-0.5 bg-white rounded">
                <div className="bg-slate-950 rounded-xs"></div>
                <div className="bg-slate-950 rounded-xs opacity-65"></div>
                <div className="bg-slate-950 rounded-xs opacity-65"></div>
                <div className="bg-slate-950 rounded-xs"></div>
              </div>
              <span className="text-lg font-bold font-sans">askNewton</span>
            </div>
            <p className="text-slate-400 text-sm italic">
              "{dictionary.brand.tagline1}"
            </p>
            <p className="text-slate-400 text-xs font-mono">
              {dictionary.brand.tagline2}
            </p>
          </div>

          {/* Links Col */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Navigation</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                {navLinks.slice(0, 3).map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Trust & Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                {navLinks.slice(3).map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Info Disclaimer Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Regulatory Standing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {dictionary.footer.disclaimer}
            </p>
            <p className="text-xs text-slate-500 pt-2 border-t border-slate-900">
              {dictionary.footer.rights}
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Sticky Escalation for Mobile/Desktop at bottom */}
      {escalationOpen && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border border-border-color shadow-2xl rounded-xl p-4 z-40 transition-smooth animate-fade-in flex flex-col space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-accent">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-semibold text-sm">Guidance Service</span>
            </div>
            <button
              onClick={() => setEscalationOpen(false)}
              className="text-muted hover:text-foreground p-0.5 rounded-full hover:bg-muted-bg"
              aria-label="Close float panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Have questions about health insurance guidance?
          </p>
          <a
            href="#waitlist"
            className="flex items-center justify-center space-x-2 bg-accent text-white py-2 rounded-lg text-sm font-semibold hover:bg-accent-hover transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>{dictionary.escalation.cta}</span>
          </a>
        </div>
      )}
    </div>
  );
};
export default LayoutWrapper;
