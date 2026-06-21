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
    'Licensed AI insurance guide explaining US health insurance, enrollment deadlines, and plan eligibility in your native language before you make critical mistakes.',
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
