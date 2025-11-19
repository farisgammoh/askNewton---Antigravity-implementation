import { Link } from "wouter";
import { ChevronLeft, Check, X, AlertTriangle } from "lucide-react";
import Layout from "@/components/marketing/layout";
import Hero from "@/components/marketing/hero";
import Section from "@/components/marketing/section";
import FeatureList from "@/components/marketing/feature-list";
import CTA from "@/components/marketing/cta";
import FAQ from "@/components/FAQ";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPersonaData } from "@/data/personas";

export default function Traveler() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "14157697858";
  const persona = getPersonaData("traveler")!;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(persona.whatsappMessage)}`;

  return (
    <Layout
      title="Travel Medical Insurance for California Visitors"
      description={persona.metaDescription}
      canonical="https://asknewton.com/traveler"
    >
      <div className="max-w-4xl mx-auto space-y-10">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back-home">
            <ChevronLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Back to home
          </Button>
        </Link>

        <Hero
          title={persona.heroTitle}
          description={
            <>
              If you want <strong>emergency-ready protection</strong> without overpaying, start here.
            </>
          }
        >
          <CTA
            variant="primary"
            href="/start?persona=traveler"
            size="lg"
            testId="button-start-wizard"
          >
            Start assessment wizard
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

        <Section>
          <FeatureList features={persona.features} />
        </Section>

        <Section title="Travel medical insurance" id="coverage">
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4">What's typically covered</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-accent mb-2 flex items-center">
                    <Check className="w-4 h-4 mr-2" aria-hidden="true" />
                    Covered
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1" role="list">
                    <li>Emergency room visits</li>
                    <li>Urgent care</li>
                    <li>Emergency dental (trauma)</li>
                    <li>Prescription drugs (acute)</li>
                    <li>Ambulance services</li>
                    <li>Emergency evacuation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-destructive mb-2 flex items-center">
                    <X className="w-4 h-4 mr-2" aria-hidden="true" />
                    Not covered
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1" role="list">
                    <li>Routine check-ups</li>
                    <li>Pre-existing conditions</li>
                    <li>Preventive care</li>
                    <li>Mental health (varies)</li>
                    <li>Pregnancy (usually)</li>
                    <li>High-risk activities</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section title="Choosing the right plan" id="choosing">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">Coverage limits</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Look for at least $100,000 coverage for California healthcare costs
                </p>
                <div className="bg-muted rounded p-3 text-sm">
                  <strong>Example:</strong> A simple ER visit for stomach pain in San Francisco can easily cost $3,000-5,000
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">Deductibles & co-pays</h3>
                <p className="text-muted-foreground text-sm">
                  Lower deductibles mean higher premiums, but less out-of-pocket cost if you need care
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">Provider networks</h3>
                <p className="text-muted-foreground text-sm">
                  Some plans require you to call for pre-approval. Know the process before you need care.
                </p>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section title="Special considerations" id="considerations">
          <div className="space-y-4">
            <div className="border-l-4 border-secondary pl-4" role="alert">
              <h4 className="font-medium text-foreground flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-secondary" aria-hidden="true" />
                Sports & adventure activities
              </h4>
              <p className="text-sm text-muted-foreground">
                Skiing, surfing, hiking—check if your planned activities are excluded
              </p>
            </div>
            <div className="border-l-4 border-secondary pl-4" role="alert">
              <h4 className="font-medium text-foreground flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-secondary" aria-hidden="true" />
                Mental health coverage
              </h4>
              <p className="text-sm text-muted-foreground">
                Varies widely between plans; important if you have ongoing treatment
              </p>
            </div>
            <div className="border-l-4 border-secondary pl-4" role="alert">
              <h4 className="font-medium text-foreground flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-secondary" aria-hidden="true" />
                Claims process
              </h4>
              <p className="text-sm text-muted-foreground">
                Understand how to file claims—some require payment upfront and reimbursement
              </p>
            </div>
          </div>
        </Section>

        <Section variant="muted">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CTA
              variant="primary"
              href="/start?persona=traveler"
              size="lg"
              testId="button-cta-start"
            >
              Get my options
            </CTA>
            <CTA
              variant="whatsapp"
              href={whatsappUrl}
              external
              size="lg"
              testId="button-cta-whatsapp"
              ariaLabel="Chat with us on WhatsApp"
            >
              Chat on WhatsApp
            </CTA>
          </div>
        </Section>

        <FAQ persona="traveler" />
      </div>
    </Layout>
  );
}
