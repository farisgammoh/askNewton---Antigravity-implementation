import { Link } from "wouter";
import Layout from "@/components/marketing/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, AlertTriangle } from "lucide-react";

export default function Disclosures() {
  return (
    <Layout
      title="Disclosures - AskNewton"
      description="Important disclosures about AskNewton health insurance guidance services for California newcomers."
      canonical="https://asknewton.com/legal/disclosures"
    >
      <div className="max-w-4xl mx-auto">
      <Link href="/">
        <Button variant="ghost" className="mb-6" data-testid="button-back-home">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to home
        </Button>
      </Link>
      
      <div className="prose max-w-none">
        <h1 className="text-3xl font-bold text-foreground mb-8">Disclosures</h1>
        
        <div className="space-y-6">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Important Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                AskNewton is not an insurance company. We provide information and guidance to help you understand health insurance options in California. We do not provide medical advice or insurance coverage.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Nature of Our Services</h2>
              <p>AskNewton operates as an insurance guidance service. We:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Provide educational information about health insurance options</li>
                <li>Offer personalized recommendations based on your situation</li>
                <li>Assist with enrollment in insurance plans</li>
                <li>Connect you with licensed insurance professionals</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Compensation Disclosure</h2>
              <p>Our services are provided at no cost to you. We may receive compensation from insurance companies when you enroll in a plan through our recommendations. This compensation does not affect the objectivity of our recommendations.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. License Information</h2>
              <p>Our team includes licensed insurance professionals authorized to sell insurance in California. License information is available upon request.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Limitation of Services</h2>
              <p>We do not:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Provide medical advice or treatment</li>
                <li>Guarantee acceptance into any insurance plan</li>
                <li>Process insurance claims</li>
                <li>Provide emergency medical services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Emergency Situations</h2>
              <p>If this is a medical emergency, call 911 immediately. Our services are not intended for emergency situations and should not delay seeking emergency medical care.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Accuracy of Information</h2>
              <p>While we strive to provide accurate and up-to-date information, insurance laws and regulations change frequently. We recommend verifying all information with the insurance company before making decisions.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Privacy and Confidentiality</h2>
              <p>We maintain strict confidentiality of your personal information in accordance with applicable privacy laws and our Privacy Policy.</p>
            </section>
          </div>

          <div className="text-sm text-muted-foreground mt-8 pt-8 border-t border-border">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p className="mt-2">For questions about these disclosures, please contact us via WhatsApp or through our website.</p>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
}
