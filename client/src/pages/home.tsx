import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PersonaCard from "@/components/PersonaCard";
import FAQ from "@/components/FAQ";
import { Check, Laptop, Globe, GraduationCap } from "lucide-react";

export default function Home() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "14157697858";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi%20AskNewton%2C%20I%20just%20landed%20in%20CA.`;

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-semibold text-foreground mb-6">
          Health insurance for newcomers to California.
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          If you are a <strong>Nomad</strong>, <strong>Traveler</strong>, or <strong>Student</strong> and want
          <strong> clear, fast coverage guidance</strong> with <strong>human help</strong>, start here.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link href="/start">
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-3"
              data-testid="button-hero-get-options"
            >
              Get my options
            </Button>
          </Link>
          <a 
            href={whatsappUrl}
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-3 flex items-center space-x-2"
              data-testid="button-hero-whatsapp"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 2.079.549 4.035 1.522 5.736L0 24l6.573-1.727c1.62.87 3.447 1.364 5.444 1.364 6.621 0 11.99-5.367 11.99-11.99C23.971 5.367 18.638.001 12.017.001zm5.568 16.787c-.269.75-1.336 1.393-2.175 1.607-.578.149-1.335.134-2.149-.083-.493-.132-1.126-.308-1.938-.539-3.395-1.008-5.618-4.429-5.786-4.634-.168-.205-1.368-1.820-1.368-3.472 0-1.652.863-2.463 1.17-2.801.307-.339.671-.423.895-.423s.448.002.643.013c.206.01.482-.08.753.574.27.654.924 2.260.009.46.184.9.419 1.307.235.407.039.066.039.132-.079.197-.118.323-.237.486-.118.164-.248.365-.355.49-.118.155-.241.32-.103.628.138.308.614 1.013 1.316 1.64.904.806 1.668 1.056 1.903 1.174.235.118.372.099.508-.06.136-.158.582-.677.736-.91.154-.234.309-.195.52-.117.212.078 1.344.634 1.573.749.229.115.382.173.436.270.054.097.054.563-.215 1.313z"/>
              </svg>
              <span>Chat on WhatsApp</span>
            </Button>
          </a>
        </div>
      </section>

      {/* Feature Banner */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gradient-to-r from-primary/10 to-accent/10 p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Trusted by California Newcomers
                </h2>
                <p className="text-lg text-muted-foreground">
                  Join thousands of nomads, travelers, and students who've found the right health insurance coverage in California.
                </p>
                <div className="flex gap-4">
                  <Link href="/start">
                    <Button 
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      data-testid="button-banner-start"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="/feature-banner.jpeg" 
                  alt="AskNewton success story"
                  className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
                  data-testid="img-feature-banner"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-8 border-t border-border">
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-accent" />
            <span>Licensed insurance professionals</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-accent" />
            <span>No-cost guidance</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-accent" />
            <span>California specialists</span>
          </div>
        </div>
      </section>

      {/* Persona Cards */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Who are you?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get personalized guidance based on your situation and visa status.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <PersonaCard
            persona="nomad"
            title="Nomad"
            description="For remote workers/founders staying 3–12+ months who want bridge coverage until residency or employer benefits."
            icon={<Laptop className="w-8 h-8 text-white" />}
            gradientFrom="from-primary"
            gradientTo="to-accent"
          />
          
          <PersonaCard
            persona="traveler"
            title="Traveler"
            description="For 1–6 month visitors who want simple protection that actually works in U.S. hospitals."
            icon={<Globe className="w-8 h-8 text-white" />}
            gradientFrom="from-secondary"
            gradientTo="to-accent"
          />
          
          <PersonaCard
            persona="student"
            title="Student"
            description="For F-1/J-1 students who want waiver-ready plans and dependent options."
            icon={<GraduationCap className="w-8 h-8 text-white" />}
            gradientFrom="from-accent"
            gradientTo="to-primary"
          />
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />
    </div>
  );
}
