import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const NavLinks = ({ mobile = false, onLinkClick = () => {} }) => (
    <nav className={`${mobile ? 'flex flex-col space-y-4' : 'hidden md:flex items-center space-x-6'} text-sm`}>
      <Link 
        href="/" 
        onClick={onLinkClick}
        className={`text-muted-foreground hover:text-foreground transition-colors ${location === '/' ? 'text-foreground' : ''}`}
        data-testid="nav-home"
      >
        Home
      </Link>
      <Link 
        href="/nomad" 
        onClick={onLinkClick}
        className={`text-muted-foreground hover:text-foreground transition-colors ${location === '/nomad' ? 'text-foreground' : ''}`}
        data-testid="nav-nomad"
      >
        Nomad
      </Link>
      <Link 
        href="/traveler" 
        onClick={onLinkClick}
        className={`text-muted-foreground hover:text-foreground transition-colors ${location === '/traveler' ? 'text-foreground' : ''}`}
        data-testid="nav-traveler"
      >
        Traveler
      </Link>
      <Link 
        href="/student" 
        onClick={onLinkClick}
        className={`text-muted-foreground hover:text-foreground transition-colors ${location === '/student' ? 'text-foreground' : ''}`}
        data-testid="nav-student"
      >
        Student
      </Link>
      <div className={`${mobile ? 'flex flex-col space-y-2' : 'flex space-x-2'}`}>
        <Link href="/simple-start" onClick={onLinkClick}>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" data-testid="button-simple-start">
            💬 Quick Chat
          </Button>
        </Link>
        <Link href="/start" onClick={onLinkClick}>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-get-options">
            📋 Full Form
          </Button>
        </Link>
      </div>
    </nav>
  );

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between py-4">
        <Link href="/" className="flex items-center" data-testid="link-logo">
          <img src="/asknewton-logo.svg" alt="askNewton" width="112" height="24" className="h-6" />
        </Link>
        
        <NavLinks />
        
        {/* Mobile menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="mt-6">
              <NavLinks mobile onLinkClick={() => setIsOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
