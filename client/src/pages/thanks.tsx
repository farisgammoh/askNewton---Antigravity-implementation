import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import Layout from "@/components/marketing/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Brain, ArrowRight } from "lucide-react";

export default function Thanks() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "14157697858";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi%20AskNewton%2C%20I%20just%20completed%20the%20assessment`;
  const [, setLocation] = useLocation();
  const [leadId, setLeadId] = useState<string>("");

  // Get leadId from localStorage (set during form submission)
  useEffect(() => {
    const storedLeadId = localStorage.getItem('lastLeadId');
    if (storedLeadId) {
      setLeadId(storedLeadId);
    }
  }, []);

  const handleGetRecommendations = () => {
    if (leadId) {
      setLocation(`/recommendation/${leadId}`);
    }
  };

  return (
    <Layout
      title="Thank You - AskNewton"
      description="Your health insurance assessment is complete. We're preparing your personalized recommendations."
      canonical="https://asknewton.com/thanks"
    >
      <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-accent-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">Thank you!</h1>
        <p className="text-lg text-muted-foreground">Your assessment is complete. We're preparing your personalized recommendations.</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>What happens next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-primary-foreground text-sm font-medium">1</span>
            </div>
            <div className="text-left">
              <h3 className="font-medium text-foreground">Review your responses</h3>
              <p className="text-sm text-muted-foreground">Our team will analyze your situation and research the best options for your specific needs.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-primary-foreground text-sm font-medium">2</span>
            </div>
            <div className="text-left">
              <h3 className="font-medium text-foreground">Get AI recommendations instantly</h3>
              <p className="text-sm text-muted-foreground">Get personalized insurance recommendations from our AI specialists right now, or wait for your detailed email report within 24 hours.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-primary-foreground text-sm font-medium">3</span>
            </div>
            <div className="text-left">
              <h3 className="font-medium text-foreground">Free consultation (optional)</h3>
              <p className="text-sm text-muted-foreground">Book a 15-minute call to discuss your options and get help with enrollment if needed.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {leadId && (
        <div className="mb-6">
          <Button 
            onClick={handleGetRecommendations}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
            data-testid="button-get-ai-recommendations"
          >
            <Brain className="w-5 h-5" />
            <span>Get AI Recommendations Now</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a 
          href={whatsappUrl}
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Button 
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 flex items-center space-x-2"
            data-testid="button-whatsapp"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 2.079.549 4.035 1.522 5.736L0 24l6.573-1.727c1.62.87 3.447 1.364 5.444 1.364 6.621 0 11.90-5.367 11.99-11.99C23.971 5.367 18.638.001 12.017.001zm5.568 16.787c-.269.75-1.336 1.393-2.175 1.607-.578.149-1.335.134-2.149-.083-.493-.132-1.126-.308-1.938-.539-3.395-1.008-5.618-4.429-5.786-4.634-.168-.205-1.368-1.820-1.368-3.472 0-1.652.863-2.463 1.17-2.801.307-.339.671-.423.895-.423s.448.002.643.013c.206.01.482-.08.753.574.27.654.924 2.260.009.46.184.9.419 1.307.235.407.039.066.039.132-.079.197-.118.323-.237.486-.118.164-.248.365-.355.49-.118.155-.241.32-.103.628.138.308.614 1.013 1.316 1.64.904.806 1.668 1.056 1.903 1.174.235.118.372.099.508-.06.136-.158.582-.677.736-.91.154-.234.309-.195.52-.117.212.078 1.344.634 1.573.749.229.115.382.173.436.270.054.097.054.563-.215 1.313z"/>
            </svg>
            <span>Chat with us on WhatsApp</span>
          </Button>
        </a>
        <Link href="/">
          <Button 
            variant="outline"
            data-testid="button-back-home"
          >
            Back to home
          </Button>
        </Link>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Didn't receive our email? Check your spam folder or{" "}
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="underline">
            message us
          </a>.
        </p>
      </div>
      </div>
    </Layout>
  );
}
