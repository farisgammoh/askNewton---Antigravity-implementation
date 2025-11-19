import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Layout from "@/components/marketing/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Star, Users, Heart, Shield } from "lucide-react";

interface Persona {
  id: string;
  name: string;
  title: string;
  personality: string;
  expertise: string;
  specialties: string[];
  targetPersonas: string[];
  imageUrl?: string;
  newtonianValues: {
    reliability: number;
    reassurance: number;
    relevance: number;
    simplicity: number;
    timeliness: number;
    knowledgeability: number;
    fairValue: number;
  };
}

interface PersonaSelectionForm {
  email: string;
  name: string;
  phone?: string;
  notes?: string;
  personaId: string;
}

const PersonaCard = ({ persona, onSelect }: { persona: Persona; onSelect: (persona: Persona) => void }) => {
  const getPersonaIcon = (targetPersonas: string[]) => {
    if (targetPersonas.includes('nomad')) return <Users className="h-5 w-5 text-blue-600" />;
    if (targetPersonas.includes('student')) return <Shield className="h-5 w-5 text-green-600" />;
    return <Heart className="h-5 w-5 text-purple-600" />;
  };

  const getPersonaTypeLabel = (targetPersonas: string[]) => {
    if (targetPersonas.includes('nomad')) return 'Remote Workers & Digital Nomads';
    if (targetPersonas.includes('student')) return 'Students & Visa Holders';
    if (targetPersonas.includes('traveler')) return 'Short-term Travelers';
    return 'Health Insurance Expert';
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-300" 
          onClick={() => onSelect(persona)}
          data-testid={`card-persona-${persona.id}`}>
      <CardHeader className="text-center pb-4">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center overflow-hidden">
          {persona.imageUrl ? (
            <img 
              src={persona.imageUrl} 
              alt={persona.name}
              className="w-full h-full object-cover"
              data-testid={`img-persona-${persona.id}`}
            />
          ) : (
            <div className="text-4xl font-bold text-blue-600" data-testid={`placeholder-persona-${persona.id}`}>
              {persona.name.charAt(0)}
            </div>
          )}
        </div>
        <CardTitle className="text-xl mb-1" data-testid={`text-name-${persona.id}`}>{persona.name}</CardTitle>
        <CardDescription className="text-sm font-medium" data-testid={`text-title-${persona.id}`}>{persona.title}</CardDescription>
        <div className="flex items-center justify-center gap-2 mt-2">
          {getPersonaIcon(persona.targetPersonas)}
          <span className="text-xs text-gray-600" data-testid={`text-type-${persona.id}`}>
            {getPersonaTypeLabel(persona.targetPersonas)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Expertise & Personality</h4>
          <p className="text-sm text-gray-600 mb-3" data-testid={`text-personality-${persona.id}`}>
            {persona.personality}
          </p>
          <p className="text-sm text-blue-700 font-medium" data-testid={`text-expertise-${persona.id}`}>
            {persona.expertise}
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Specialties</h4>
          <div className="flex flex-wrap gap-1">
            {persona.specialties.slice(0, 3).map((specialty, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs" data-testid={`badge-specialty-${persona.id}-${idx}`}>
                {specialty}
              </Badge>
            ))}
            {persona.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{persona.specialties.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Newtonian Values</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span>Reliability: {persona.newtonianValues.reliability}/10</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-green-500" />
              <span>Reassurance: {persona.newtonianValues.reassurance}/10</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-red-500" />
              <span>Relevance: {persona.newtonianValues.relevance}/10</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-blue-500" />
              <span>Simplicity: {persona.newtonianValues.simplicity}/10</span>
            </div>
          </div>
        </div>

        <Button 
          className="w-full group-hover:bg-blue-600 transition-colors"
          data-testid={`button-select-${persona.id}`}
        >
          Select This Expert
        </Button>
      </CardContent>
    </Card>
  );
};

const PersonaSelectionDialog = ({ 
  persona, 
  isOpen, 
  onClose 
}: { 
  persona: Persona | null; 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState<PersonaSelectionForm>({
    email: '',
    name: '',
    phone: '',
    notes: '',
    personaId: persona?.id || ''
  });
  const { toast } = useToast();

  const selectPersonaMutation = useMutation({
    mutationFn: async (data: PersonaSelectionForm) => {
      const response = await fetch('/api/persona-selections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to select persona');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `You've successfully selected ${persona?.name}. We'll be in touch soon!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/persona-selections'] });
      onClose();
      setFormData({
        email: '',
        name: '',
        phone: '',
        notes: '',
        personaId: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Selection Failed",
        description: error.message || "Failed to select persona. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (persona) {
      selectPersonaMutation.mutate({
        ...formData,
        personaId: persona.id
      });
    }
  };

  if (!persona) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-persona-selection">
        <DialogHeader>
          <DialogTitle data-testid="text-dialog-title">
            Connect with {persona.name}
          </DialogTitle>
          <DialogDescription data-testid="text-dialog-description">
            You can only select one expert. Once you submit, this will be your dedicated health insurance guide.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              data-testid="input-email"
            />
          </div>

          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              required
              placeholder="Your full name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              data-testid="input-name"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(optional)"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              data-testid="input-phone"
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Tell us about your specific needs or questions..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="min-h-[80px]"
              data-testid="textarea-notes"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={selectPersonaMutation.isPending}
              data-testid="button-submit"
            >
              {selectPersonaMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Select {persona.name}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

function PersonasPage() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: personas, isLoading } = useQuery<Persona[]>({
    queryKey: ['/api/personas']
  });

  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    setIsDialogOpen(true);
  };


  return (
    <Layout
      title="AI Insurance Experts - AskNewton"
      description="Meet our specially trained AI insurance experts. Choose the perfect specialist for your health insurance needs in California."
      canonical="https://asknewton.com/personas"
    >
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 -mx-4 -my-8 px-4 py-12">
        <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="text-page-title">
            Meet Your Health Insurance Experts
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6" data-testid="text-page-description">
            Choose from our specially trained AI experts, each designed to help different types of newcomers to California. 
            Each expert combines deep insurance knowledge with the Newtonian principles of Speed, Information, and Communication.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-yellow-800 font-medium" data-testid="text-selection-notice">
              ⚠️ Important: You can only select one expert per email address. Choose wisely!
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12" data-testid="loading-personas">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading experts...</span>
          </div>
        ) : personas && personas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {personas.map((persona) => (
              <PersonaCard 
                key={persona.id} 
                persona={persona}
                onSelect={handleSelectPersona}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12" data-testid="no-personas">
            <p className="text-gray-600">No experts available at this time.</p>
          </div>
        )}

        <PersonaSelectionDialog
          persona={selectedPersona}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
        </div>
      </div>
    </Layout>
  );
}

export default PersonasPage;