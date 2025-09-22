import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Users, Star, Zap, Shield, Clock, Target, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface Persona {
  id: string;
  name: string;
  title: string;
  personality: string;
  expertise: string;
  communicationStyle: string;
  specialties: string[];
  targetPersonas: string[];
  newtonianValues: {
    reliability: number;
    reassurance: number;
    relevance: number;
    simplicity: number;
    timeliness: number;
    knowledgeability: number;
    fairValue: number;
  };
  systemPrompt: string;
  isActive: boolean;
  createdAt: string;
}

interface Recommendation {
  id: string;
  leadId: string;
  personaId: string;
  recommendation: string;
  reasoning: string;
  confidence: {
    overall: number;
    relevance: number;
    expertise: number;
  };
  actionItems: string[];
  createdAt: string;
}

function PersonasPage() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");

  // Fetch personas
  const { data: personas, isLoading: personasLoading, refetch: refetchPersonas } = useQuery({
    queryKey: ['/api/personas'],
    queryFn: async () => {
      const response = await fetch('/api/personas');
      if (!response.ok) throw new Error('Failed to fetch personas');
      return response.json() as Promise<Persona[]>;
    },
  });

  // Fetch leads for recommendations
  const { data: leads } = useQuery({
    queryKey: ['/api/leads'],
    enabled: false, // Only fetch when needed
  });

  // Generate recommendation mutation  
  const generateRecommendation = useMutation({
    mutationFn: async ({ leadId, personaId }: { leadId: string; personaId: string }) => {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leadId, personaId }),
      });
      if (!response.ok) throw new Error('Failed to generate recommendation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
    },
  });

  const getPersonaBadgeColor = (persona: string) => {
    switch (persona.toLowerCase()) {
      case 'nomad': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'traveler': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';  
      case 'student': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCommunicationStyleIcon = (style: string) => {
    switch (style) {
      case 'warm_professional': return <Users className="h-4 w-4" />;
      case 'direct_helpful': return <Target className="h-4 w-4" />;
      case 'friendly_expert': return <Brain className="h-4 w-4" />;
      case 'reassuring_guide': return <Shield className="h-4 w-4" />;
      case 'knowledgeable_advisor': return <Star className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getNewtonianValueIcon = (value: string) => {
    switch (value) {
      case 'reliability': return <Shield className="h-4 w-4" />;
      case 'reassurance': return <Users className="h-4 w-4" />;
      case 'relevance': return <Target className="h-4 w-4" />;
      case 'simplicity': return <Zap className="h-4 w-4" />;
      case 'timeliness': return <Clock className="h-4 w-4" />;
      case 'knowledgeability': return <Brain className="h-4 w-4" />;
      case 'fairValue': return <DollarSign className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const formatCommunicationStyle = (style: string) => {
    return style.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatNewtonianValue = (key: string) => {
    switch (key) {
      case 'fairValue': return 'Fair Value';
      default: return key.charAt(0).toUpperCase() + key.slice(1);
    }
  };

  if (personasLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg">Loading AI Personas...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Insurance Personas
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Meet your AI-powered insurance specialists, each designed with <strong>Newtonian principles</strong> of excellent service: 
            Speed + Information + Communication = Quality Customer Service
          </p>
        </div>

        {/* Stats Overview */}
        {personas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{personas.length}</p>
                    <p className="text-sm text-gray-500">AI Personas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Target className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{personas.filter(p => p.targetPersonas.includes('nomad')).length}</p>
                    <p className="text-sm text-gray-500">For Nomads</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Shield className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{personas.filter(p => p.targetPersonas.includes('student')).length}</p>
                    <p className="text-sm text-gray-500">For Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Zap className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{personas.filter(p => p.targetPersonas.includes('traveler')).length}</p>
                    <p className="text-sm text-gray-500">For Travelers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Personas Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {personas?.map((persona) => (
            <Card key={persona.id} className="hover:shadow-lg transition-shadow cursor-pointer" 
                  onClick={() => setSelectedPersona(persona)}
                  data-testid={`card-persona-${persona.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg" data-testid={`text-persona-name-${persona.id}`}>
                      {persona.name}
                    </CardTitle>
                    <CardDescription className="font-medium text-blue-600" data-testid={`text-persona-title-${persona.id}`}>
                      {persona.title}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getCommunicationStyleIcon(persona.communicationStyle)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Target Personas */}
                <div className="flex flex-wrap gap-2">
                  {persona.targetPersonas.map((target) => (
                    <Badge key={target} className={cn("text-xs", getPersonaBadgeColor(target))}
                           data-testid={`badge-target-${target}-${persona.id}`}>
                      {target.charAt(0).toUpperCase() + target.slice(1)}
                    </Badge>
                  ))}
                </div>

                {/* Personality Preview */}
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3"
                   data-testid={`text-personality-${persona.id}`}>
                  {persona.personality}
                </p>

                {/* Newtonian Values (Top 3) */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Top Newtonian Values:</h4>
                  <div className="space-y-1">
                    {Object.entries(persona.newtonianValues)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 3)
                      .map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-1">
                            {getNewtonianValueIcon(key)}
                            <span className="font-medium">{formatNewtonianValue(key)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div className="bg-blue-600 h-1.5 rounded-full" 
                                   style={{width: `${(value/10)*100}%`}}></div>
                            </div>
                            <span className="text-blue-600 font-bold">{value}/10</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Specialties Preview */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Specialties:</h4>
                  <div className="flex flex-wrap gap-1">
                    {persona.specialties.slice(0, 3).map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
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
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {!personas || personas.length === 0 && (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <Brain className="h-16 w-16 text-gray-400 mx-auto" />
              <h3 className="text-2xl font-semibold text-gray-600">No AI Personas Available</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                AI personas need to be generated first. Contact your administrator to set up the AI persona system with OpenAI integration.
              </p>
            </div>
          </Card>
        )}

        {/* Persona Detail Modal (simplified for now) */}
        {selectedPersona && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
               onClick={() => setSelectedPersona(null)}>
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto" 
                  onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {selectedPersona.name}
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPersona(null)}>
                    ✕
                  </Button>
                </CardTitle>
                <CardDescription>{selectedPersona.title}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Communication Style:</h4>
                  <div className="flex items-center space-x-2">
                    {getCommunicationStyleIcon(selectedPersona.communicationStyle)}
                    <span>{formatCommunicationStyle(selectedPersona.communicationStyle)}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Personality:</h4>
                  <p className="text-gray-600 dark:text-gray-300">{selectedPersona.personality}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Expertise:</h4>
                  <p className="text-gray-600 dark:text-gray-300">{selectedPersona.expertise}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">All Newtonian Values:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(selectedPersona.newtonianValues).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getNewtonianValueIcon(key)}
                          <span className="font-medium">{formatNewtonianValue(key)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" 
                                 style={{width: `${(value/10)*100}%`}}></div>
                          </div>
                          <span className="text-blue-600 font-bold text-sm">{value}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">All Specialties:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPersona.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default PersonasPage;