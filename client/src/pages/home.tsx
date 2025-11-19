import { Link } from "wouter";
import Layout from "@/components/marketing/layout";
import Hero from "@/components/marketing/hero";
import CTA from "@/components/marketing/cta";
import FAQ from "@/components/FAQ";
import PersonaCard from "@/components/PersonaCard";
import { Check, Laptop, Globe, GraduationCap } from "lucide-react";

export default function Home() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "14157697858";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi AskNewton, I just landed in CA.")}`;

  return (
    <Layout
      title="AskNewton — Health Insurance for Newcomers to California"
      description="Simple health insurance guidance for California newcomers. Get clear, fast coverage options for Nomads, Travelers, and Students."
      canonical="https://asknewton.com"
    >
      <div className="space-y-10">
        <Hero
          title="Health insurance for newcomers to California."
          description={
            <>
              If you are a <strong>Nomad</strong>, <strong>Traveler</strong>, or <strong>Student</strong> and want
              <strong> clear, fast coverage guidance</strong> with <strong>human help</strong>, start here.
            </>
          }
        >
          <CTA
            variant="primary"
            href="/start"
            size="lg"
            testId="button-hero-get-options"
          >
            Get my options
          </CTA>
          <CTA
            variant="whatsapp"
            href={whatsappUrl}
            external
            size="lg"
            testId="button-hero-whatsapp"
            ariaLabel="Chat with us on WhatsApp"
          >
            Chat on WhatsApp
          </CTA>
        </Hero>

        <section className="py-12 px-4" aria-labelledby="trust-heading">
          <div className="max-w-6xl mx-auto">
            <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gradient-to-r from-primary/10 to-accent/10 p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h2 id="trust-heading" className="text-2xl md:text-3xl font-bold text-foreground">
                    Trusted by California Newcomers
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Join thousands of nomads, travelers, and students who've found the right health insurance coverage in California.
                  </p>
                  <div className="flex gap-4">
                    <CTA
                      variant="primary"
                      href="/start"
                      testId="button-banner-start"
                    >
                      Get Started
                    </CTA>
                  </div>
                </div>
                <div className="relative">
                  <img 
                    src="/feature-banner.jpeg" 
                    alt="Happy California newcomers who found health insurance coverage with AskNewton"
                    width="600"
                    height="400"
                    className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
                    data-testid="img-feature-banner"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" aria-hidden="true"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-6 px-4" aria-labelledby="music-heading">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-accent/5 to-primary/5 rounded-2xl p-6 border border-border/50">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full" aria-hidden="true">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 17.568c-.22.365-.688.48-1.041.26-2.851-1.74-6.437-2.133-10.656-1.167-.415.094-.831-.167-.925-.583-.094-.415.167-.831.583-.925 4.633-1.061 8.617-.615 11.814 1.354.364.221.479.688.26 1.041l-.035.02zm1.484-3.297c-.277.458-.862.607-1.32.33-3.264-2.009-8.238-2.587-12.097-1.413-.513.156-1.055-.126-1.211-.639-.156-.513.126-1.055.639-1.211 4.417-1.344 9.969-.692 13.655 1.613.458.277.607.862.33 1.32h.004zm.128-3.432c-3.915-2.324-10.371-2.538-14.111-1.405-.615.186-1.265-.164-1.451-.779-.186-.615.164-1.265.779-1.451 4.283-1.297 11.368-1.047 15.902 1.621.595.349.794 1.114.445 1.709-.35.595-1.114.794-1.709.445l.145-.14z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 id="music-heading" className="font-semibold text-foreground">Vibe with us</h3>
                    <p className="text-sm text-muted-foreground">Listen while you explore your options</p>
                  </div>
                </div>
                <a 
                  href="https://open.spotify.com/track/3bHhUEOTIbezeZ856R0BX5?si=mKxM7PNySgK84z5ee2Gbgg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                  aria-label="Listen to our playlist on Spotify"
                >
                  <CTA
                    variant="whatsapp"
                    testId="button-spotify-play"
                    className="bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    Play on Spotify
                  </CTA>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 border-t border-border" aria-label="Trust indicators">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-accent" aria-hidden="true" />
              <span>Licensed insurance professionals</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-accent" aria-hidden="true" />
              <span>No-cost guidance</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-accent" aria-hidden="true" />
              <span>California specialists</span>
            </div>
          </div>
        </section>

        <section className="py-16" aria-labelledby="personas-heading">
          <div className="text-center mb-12">
            <h2 id="personas-heading" className="text-3xl font-bold text-foreground mb-4">Who are you?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get personalized guidance based on your situation and visa status.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <PersonaCard
              persona="nomad"
              title="Nomad"
              description="For remote workers/founders staying 3–12+ months who want bridge coverage until residency or employer benefits."
              icon={<Laptop className="w-8 h-8 text-white" aria-hidden="true" />}
              gradientFrom="from-primary"
              gradientTo="to-accent"
            />
            
            <PersonaCard
              persona="traveler"
              title="Traveler"
              description="For 1–6 month visitors who want simple protection that actually works in U.S. hospitals."
              icon={<Globe className="w-8 h-8 text-white" aria-hidden="true" />}
              gradientFrom="from-secondary"
              gradientTo="to-accent"
            />
            
            <PersonaCard
              persona="student"
              title="Student"
              description="For F-1/J-1 students who want waiver-ready plans and dependent options."
              icon={<GraduationCap className="w-8 h-8 text-white" aria-hidden="true" />}
              gradientFrom="from-accent"
              gradientTo="to-primary"
            />
          </div>
        </section>

        <FAQ />
      </div>
    </Layout>
  );
}
