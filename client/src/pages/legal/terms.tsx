import { Link } from "wouter";
import Layout from "@/components/marketing/layout";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function Terms() {
  return (
    <Layout
      title="Terms of Service - AskNewton"
      description="Terms of Service for AskNewton health insurance guidance platform for California newcomers."
      canonical="https://asknewton.com/legal/terms"
    >
      <div className="max-w-4xl mx-auto">
      <Link href="/">
        <Button variant="ghost" className="mb-6" data-testid="button-back-home">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to home
        </Button>
      </Link>
      
      <div className="prose max-w-none">
        <h1 className="text-3xl font-bold text-foreground mb-8">Terms of Service</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using AskNewton's services, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Service Description</h2>
            <p>AskNewton provides information and guidance regarding health insurance options for individuals arriving in California. We are not an insurance company and do not provide insurance coverage directly.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Limitations of Liability</h2>
            <p>The information provided is for general guidance only and should not be considered as professional advice. We recommend consulting with licensed professionals for specific insurance decisions.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Privacy and Data Protection</h2>
            <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Contact Information</h2>
            <p>If you have any questions about these Terms of Service, please contact us via WhatsApp or through our website.</p>
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
