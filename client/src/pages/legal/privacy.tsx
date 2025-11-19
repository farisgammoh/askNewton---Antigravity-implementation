import { Link } from "wouter";
import Layout from "@/components/marketing/layout";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function Privacy() {
  return (
    <Layout
      title="Privacy Policy - AskNewton"
      description="Privacy Policy for AskNewton health insurance guidance platform. Learn how we protect your personal information."
      canonical="https://asknewton.com/legal/privacy"
    >
      <div className="max-w-4xl mx-auto">
      <Link href="/">
        <Button variant="ghost" className="mb-6" data-testid="button-back-home">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to home
        </Button>
      </Link>
      
      <div className="prose max-w-none">
        <h1 className="text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you fill out our assessment form, contact us, or use our services. This may include:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Personal identification information (name, email address, phone number)</li>
              <li>Health insurance needs and preferences</li>
              <li>Location and visa status information</li>
              <li>Communication preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Provide personalized insurance recommendations</li>
              <li>Communicate with you about our services</li>
              <li>Improve our services and user experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Information Sharing</h2>
            <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information with:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Insurance companies when you request quotes or enrollment assistance</li>
              <li>Service providers who assist us in operating our website and conducting our business</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Your Rights</h2>
            <p>You have the right to access, update, or delete your personal information. You may also opt out of receiving communications from us at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us via WhatsApp or through our website.</p>
          </section>

          <div className="text-sm text-muted-foreground mt-8 pt-8 border-t border-border">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
}
