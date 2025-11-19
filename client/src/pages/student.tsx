import { Link } from "wouter";
import { ChevronLeft, AlertTriangle, Lightbulb } from "lucide-react";
import Layout from "@/components/marketing/layout";
import Hero from "@/components/marketing/hero";
import Section from "@/components/marketing/section";
import FeatureList from "@/components/marketing/feature-list";
import CTA from "@/components/marketing/cta";
import FAQ from "@/components/FAQ";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPersonaData } from "@/data/personas";

export default function Student() {
  const calendlyUrl = import.meta.env.VITE_CALENDLY_URL || "https://calendly.com/asknewton/intro";
  const persona = getPersonaData("student")!;

  return (
    <Layout
      title="Student Health Insurance in California - SHIP vs Private Plans"
      description={persona.metaDescription}
      canonical="https://asknewton.com/student"
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
              If you want <strong>waiver-ready coverage</strong> and <strong>dependent options</strong>, start here.
            </>
          }
        >
          <CTA
            variant="primary"
            href="/start?persona=student"
            size="lg"
            testId="button-start-wizard"
          >
            Start assessment wizard
          </CTA>
          <CTA
            variant="calendly"
            href={calendlyUrl}
            external
            size="lg"
            testId="button-hero-calendly"
            ariaLabel="Book a call with our insurance advisor"
          >
            Book a call
          </CTA>
        </Hero>

        <Section>
          <FeatureList features={persona.features} />
        </Section>

        <Section title="Insurance options" id="options">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">School SHIP (Student Health Insurance Plan)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-accent mb-2">Pros</h4>
                    <ul className="text-sm text-muted-foreground space-y-1" role="list">
                      <li>Meets all university requirements</li>
                      <li>Campus health center access</li>
                      <li>Student-specific networks</li>
                      <li>No waiver paperwork</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-destructive mb-2">Cons</h4>
                    <ul className="text-sm text-muted-foreground space-y-1" role="list">
                      <li>Often more expensive</li>
                      <li>Limited provider choices</li>
                      <li>Semester-based billing</li>
                      <li>May not cover dependents well</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Private insurance with waiver</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-accent mb-2">Pros</h4>
                    <ul className="text-sm text-muted-foreground space-y-1" role="list">
                      <li>Often significantly cheaper</li>
                      <li>Broader provider networks</li>
                      <li>Monthly payments</li>
                      <li>Better dependent coverage</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-destructive mb-2">Cons</h4>
                    <ul className="text-sm text-muted-foreground space-y-1" role="list">
                      <li>Waiver application required</li>
                      <li>Must meet specific criteria</li>
                      <li>Limited campus health access</li>
                      <li>Deadlines to navigate</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section title="Waiver requirements" id="waiver">
          <Card className="mb-8">
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">
                Most California universities require your insurance to meet these minimums:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Coverage minimums</h4>
                  <ul className="text-sm text-muted-foreground space-y-1" role="list">
                    <li>$100,000+ medical maximum</li>
                    <li>$500,000+ major medical</li>
                    <li>Mental health parity</li>
                    <li>Prescription drug coverage</li>
                    <li>Preventive care</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Common deadlines</h4>
                  <ul className="text-sm text-muted-foreground space-y-1" role="list">
                    <li>Fall semester: Late August</li>
                    <li>Spring semester: Late December</li>
                    <li>Late fees if you miss deadlines</li>
                    <li>Can't waive after semester starts</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="border-l-4 border-accent pl-4" role="note">
              <h4 className="font-medium text-foreground flex items-center">
                <Lightbulb className="w-4 h-4 mr-2 text-accent" aria-hidden="true" />
                Pro tip: Start early
              </h4>
              <p className="text-sm text-muted-foreground">
                Waiver applications can take 2-3 weeks to process. Start researching plans at least 6 weeks before the deadline.
              </p>
            </div>
            <div className="border-l-4 border-destructive pl-4" role="alert">
              <h4 className="font-medium text-foreground flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-destructive" aria-hidden="true" />
                Common waiver mistakes
              </h4>
              <p className="text-sm text-muted-foreground">
                Wrong coverage dates, insufficient coverage limits, missing immunization records, or incomplete forms
              </p>
            </div>
          </div>
        </Section>

        <Section variant="muted">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CTA
              variant="primary"
              href="/start?persona=student"
              size="lg"
              testId="button-cta-start"
            >
              Get my options
            </CTA>
            <CTA
              variant="calendly"
              href={calendlyUrl}
              external
              size="lg"
              testId="button-cta-calendly"
              ariaLabel="Book a call with our insurance advisor"
            >
              Book a call
            </CTA>
          </div>
        </Section>

        <FAQ persona="student" />
      </div>
    </Layout>
  );
}
