import { Link } from "wouter";
import { Linkedin, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">AN</span>
              </div>
              <span className="font-semibold text-foreground">AskNewton</span>
            </div>
            <p className="text-sm text-muted-foreground">Simple health insurance guidance for California newcomers.</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-3">Personas</h3>
            <div className="space-y-2 text-sm">
              <Link href="/nomad" className="block text-muted-foreground hover:text-foreground" data-testid="footer-nomad">
                Nomad
              </Link>
              <Link href="/traveler" className="block text-muted-foreground hover:text-foreground" data-testid="footer-traveler">
                Traveler
              </Link>
              <Link href="/student" className="block text-muted-foreground hover:text-foreground" data-testid="footer-student">
                Student
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-3">Legal</h3>
            <div className="space-y-2 text-sm">
              <Link href="/legal/terms" className="block text-muted-foreground hover:text-foreground" data-testid="footer-terms">
                Terms of Service
              </Link>
              <Link href="/legal/privacy" className="block text-muted-foreground hover:text-foreground" data-testid="footer-privacy">
                Privacy Policy
              </Link>
              <Link href="/legal/disclosures" className="block text-muted-foreground hover:text-foreground" data-testid="footer-disclosures">
                Disclosures
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-3">Contact</h3>
            <div className="space-y-2 text-sm">
              <a 
                href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '14157697858'}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-muted-foreground hover:text-foreground"
                data-testid="footer-whatsapp"
              >
                WhatsApp
              </a>
              <a 
                href={import.meta.env.VITE_CALENDLY_URL || 'https://calendly.com/asknewton/intro'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-muted-foreground hover:text-foreground"
                data-testid="footer-calendly"
              >
                Book a call
              </a>
            </div>
            
            <h3 className="font-semibold text-foreground mb-3 mt-6">Follow Us</h3>
            <div className="flex space-x-4">
              <a 
                href="https://www.linkedin.com/company/108558966/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="footer-linkedin"
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61581110065448" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="footer-facebook"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} AskNewton • Information only; not an insurer. If this is an emergency, call 911.</p>
        </div>
      </div>
    </footer>
  );
}
