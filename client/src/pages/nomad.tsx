import { Link } from "wouter";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import Layout from "@/components/marketing/layout";
import Hero from "@/components/marketing/hero";
import Section from "@/components/marketing/section";
import FeatureList from "@/components/marketing/feature-list";
import CTA from "@/components/marketing/cta";
import FAQ from "@/components/FAQ";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPersonaData } from "@/data/personas";

export default function Nomad() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "14157697858";
  const persona = getPersonaData("nomad")!;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(persona.whatsappMessage)}`;

  return (
    <Layout
      title="Health Insurance for Digital Nomads in California"
      description={persona.metaDescription}
      canonical="https://asknewton.com/nomad"
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
              If you're a remote worker or founder and want <strong>straight answers on travel vs short-term vs marketplace</strong>, start here.
            </>
          }
        >
          <CTA
            variant="primary"
            href="/start?persona=nomad"
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

        <Section title="Insurance options overview" id="options">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">Travel Medical Insurance</h3>
                <p className="text-muted-foreground text-sm mb-3">Best for: Short stays (under 6 months)</p>
                <ul className="text-sm text-muted-foreground space-y-1" role="list">
                  <li>Emergency coverage only</li>
                  <li>No preventive care</li>
                  <li>Limited provider networks</li>
                  <li>$50-200/month typically</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">Short-term Medical</h3>
                <p className="text-muted-foreground text-sm mb-3">Best for: 3-12 month stays</p>
                <ul className="text-sm text-muted-foreground space-y-1" role="list">
                  <li>Major medical coverage</li>
                  <li>Some preventive benefits</li>
                  <li>Pre-existing exclusions</li>
                  <li>$150-400/month typically</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-3">ACA Marketplace Plans</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Best for: California residents or those establishing residency
              </p>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Requirements:</strong> Must have California address and intent to remain</p>
                <p><strong>Benefits:</strong> Full medical coverage, preventive care, prescription drugs</p>
                <p><strong>Gotcha:</strong> Premium tax credits require tax filing as California resident</p>
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section title="Common gotchas" id="gotchas">
          <div className="space-y-4">
            <div className="border-l-4 border-destructive pl-4" role="alert">
              <h4 className="font-medium text-foreground flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-destructive" aria-hidden="true" />
                Provider networks
              </h4>
              <p className="text-sm text-muted-foreground">
                Travel insurance may not cover your preferred doctors or hospitals
              </p>
            </div>
            <div className="border-l-4 border-destructive pl-4" role="alert">
              <h4 className="font-medium text-foreground flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-destructive" aria-hidden="true" />
                Pre-existing conditions
              </h4>
              <p className="text-sm text-muted-foreground">
                Most short-term plans exclude pre-existing conditions entirely
              </p>
            </div>
            <div className="border-l-4 border-destructive pl-4" role="alert">
              <h4 className="font-medium text-foreground flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-destructive" aria-hidden="true" />
                ER costs
              </h4>
              <p className="text-sm text-muted-foreground">
                Even with insurance, California ER visits can cost $1,000+ out of pocket
              </p>
            </div>
            <div className="border-l-4 border-destructive pl-4" role="alert">
              <h4 className="font-medium text-foreground flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-destructive" aria-hidden="true" />
                Proof of address
              </h4>
              <p className="text-sm text-muted-foreground">
                Marketplace plans require California residency documentation
              </p>
            </div>
          </div>
        </Section>

        <Section variant="muted">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CTA
              variant="primary"
              href="/start?persona=nomad"
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

        <FAQ persona="nomad" />
      </div>
    </Layout>
  );
}
