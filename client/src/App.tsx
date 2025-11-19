import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/home";
import Nomad from "@/pages/nomad";
import Traveler from "@/pages/traveler";
import Student from "@/pages/student";
import Start from "@/pages/start";
import SimpleStart from "@/pages/simple-start";
import Thanks from "@/pages/thanks";
import Dashboard from "@/pages/dashboard";
import PersonasPage from "@/pages/personas";
import RecommendationPage from "@/pages/recommendation";
import ChatPage from "@/pages/chat";
import Terms from "@/pages/legal/terms";
import Privacy from "./pages/legal/privacy";
import Disclosures from "./pages/legal/disclosures";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/nomad" component={Nomad} />
          <Route path="/traveler" component={Traveler} />
          <Route path="/student" component={Student} />
          <Route path="/start" component={Start} />
          <Route path="/simple-start" component={SimpleStart} />
          <Route path="/thanks" component={Thanks} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/personas" component={PersonasPage} />
          <Route path="/recommendation/:leadId" component={RecommendationPage} />
          <Route path="/chat" component={ChatPage} />
          <Route path="/legal/terms" component={Terms} />
          <Route path="/legal/privacy" component={Privacy} />
          <Route path="/legal/disclosures" component={Disclosures} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
