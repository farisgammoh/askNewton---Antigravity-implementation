import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { LanguageProvider } from '../lib/i18n/LanguageContext';
import LayoutWrapper from '../components/LayoutWrapper';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'askNewton | Proactive Multilingual Health Insurance Guide',
  description:
    'Proactive AI insurance guidance explaining US health insurance, enrollment deadlines, and plan eligibility in your native language before you make critical mistakes. askNewton is an informational guidance service, not a licensed insurance producer or broker.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <LanguageProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}
