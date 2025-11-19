import { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
}

export default function Layout({
  children,
  title = "AskNewton — Health Insurance for Newcomers to California",
  description = "Simple health insurance guidance for California newcomers. Get clear, fast coverage options for Nomads, Travelers, and Students.",
  canonical,
  ogImage = "https://asknewton.com/og-image.png"
}: LayoutProps) {
  const fullTitle = title.includes("AskNewton") ? title : `${title} | AskNewton`;
  const canonicalUrl = canonical || "https://asknewton.com/";

  return (
    <>
      <Helmet>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={canonicalUrl} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
        data-testid="skip-to-content"
      >
        Skip to main content
      </a>

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main id="main" className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
