import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Users, Star, Zap, Shield, Clock, Target, DollarSign, ArrowRight, CheckCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";

interface Lead {
  id: string;
  persona: string;
  name: string;
  email: string;
  phone?: string;
  arrivalDate: string;
  stayLength: string;
  currentCoverage: string;
  preexisting: boolean;
  notes?: string;
  dependents: string;
  zip: string;
  consent: boolean;
  createdAt: string;
}

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
  isActive: boolean;
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

function RecommendationPage() {
  const [, params] = useRoute("/recommendation/:leadId");
  const leadId = params?.leadId;
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>("");
  const [showRecommendation, setShowRecommendation] = useState(false);

  // Fetch lead data
  const { data: lead, isLoading: leadLoading } = useQuery({
    queryKey: ['/api/leads', leadId],
    queryFn: async () => {
      if (!leadId) throw new Error('No lead ID provided');
      const response = await fetch(`/api/leads/${leadId}`);
      if (!response.ok) throw new Error('Failed to fetch lead');
      return response.json() as Promise<Lead>;
    },
    enabled: !!leadId
  });

  // Fetch personas filtered by lead's persona type
  const { data: personas, isLoading: personasLoading } = useQuery({
    queryKey: ['/api/personas'],
    queryFn: async () => {
      const response = await fetch('/api/personas');
      if (!response.ok) throw new Error('Failed to fetch personas');
      const allPersonas = await response.json() as Persona[];
      // Filter personas that match the lead's persona type
      return lead ? allPersonas.filter(p => 
        p.targetPersonas.includes(lead.persona as any)
      ) : allPersonas;
    },
    enabled: !!lead
  });

  // Fetch existing recommendations for this lead
  const { data: existingRecommendations, refetch: refetchRecommendations } = useQuery({
    queryKey: ['/api/recommendations', leadId],
    queryFn: async () => {
      if (!leadId) return [];
      const response = await fetch(`/api/recommendations?leadId=${leadId}`);
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      return response.json() as Promise<Recommendation[]>;
    },
    enabled: !!leadId
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
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate recommendation');
      }
      return response.json();
    },
    onSuccess: () => {
      refetchRecommendations();
      setShowRecommendation(true);
    },
  });

  const handleGenerateRecommendation = (personaId: string) => {
    if (!leadId || !personaId) return;
    setSelectedPersonaId(personaId);
    generateRecommendation.mutate({ leadId, personaId });
  };

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

  const formatCommunicationStyle = (style: string) => {
    return style.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  if (leadLoading || personasLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg">Loading your personalized recommendations...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-gray-600">Lead Not Found</h2>
              <p className="text-gray-500">The requested lead could not be found or may have been removed.</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Show latest recommendation if exists and showRecommendation is true
  const latestRecommendation = existingRecommendations?.[0];
  const selectedPersona = personas?.find(p => p.id === selectedPersonaId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Personalized Insurance Recommendations
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            AI-powered guidance from our expert personas, tailored specifically for you
          </p>
        </div>

        {/* Lead Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span data-testid="text-lead-name">{lead.name}</span>
              <Badge className={getPersonaBadgeColor(lead.persona)} data-testid={`badge-persona-${lead.persona}`}>
                {lead.persona.charAt(0).toUpperCase() + lead.persona.slice(1)}
              </Badge>
            </CardTitle>
            <CardDescription>
              Arriving {new Date(lead.arrivalDate).toLocaleDateString()} • Stay Length: {lead.stayLength} • Current Coverage: {lead.currentCoverage}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Show Recommendation if Generated */}
        {showRecommendation && latestRecommendation && selectedPersona && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                <CheckCircle className="h-5 w-5" />
                <span data-testid="text-recommendation-title">Recommendation from {selectedPersona.name}</span>
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                {selectedPersona.title} • {formatCommunicationStyle(selectedPersona.communicationStyle)}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Confidence Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={cn("text-2xl font-bold", getConfidenceColor(latestRecommendation.confidence.overall))}>
                    {Math.round(latestRecommendation.confidence.overall * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Overall Confidence</div>
                </div>
                <div className="text-center">
                  <div className={cn("text-2xl font-bold", getConfidenceColor(latestRecommendation.confidence.relevance))}>
                    {Math.round(latestRecommendation.confidence.relevance * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Relevance</div>
                </div>
                <div className="text-center">
                  <div className={cn("text-2xl font-bold", getConfidenceColor(latestRecommendation.confidence.expertise))}>
                    {Math.round(latestRecommendation.confidence.expertise * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Expertise Match</div>
                </div>
              </div>

              {/* Recommendation */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Recommendation</span>
                </h4>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                  <p className="text-gray-800 dark:text-gray-200" data-testid="text-recommendation-content">
                    {latestRecommendation.recommendation}
                  </p>
                </div>
              </div>

              {/* Reasoning */}
              <div>
                <h4 className="font-semibold mb-2">Why This Recommendation?</h4>
                <p className="text-gray-600 dark:text-gray-300" data-testid="text-recommendation-reasoning">
                  {latestRecommendation.reasoning}
                </p>
              </div>

              {/* Action Items */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Next Steps</span>
                </h4>
                <div className="space-y-2">
                  {latestRecommendation.actionItems.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3" data-testid={`action-item-${index}`}>
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Personas Selection */}
        {!showRecommendation && (
          <>
            <div>
              <h2 className="text-2xl font-semibold mb-4">Choose Your AI Insurance Specialist</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Select an AI persona that best matches your needs. Each specialist is trained with <strong>Newtonian principles</strong> of excellent service.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {personas?.map((persona) => (
                <Card key={persona.id} className="hover:shadow-lg transition-all cursor-pointer group" 
                      data-testid={`card-persona-${persona.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors" 
                                   data-testid={`text-persona-name-${persona.id}`}>
                          {persona.name}
                        </CardTitle>
                        <CardDescription className="font-medium text-blue-600" 
                                         data-testid={`text-persona-title-${persona.id}`}>
                          {persona.title}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getCommunicationStyleIcon(persona.communicationStyle)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Personality */}
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3"
                       data-testid={`text-personality-${persona.id}`}>
                      {persona.personality}
                    </p>

                    {/* Top Specialties */}
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

                    {/* Generate Recommendation Button */}
                    <Button 
                      className="w-full" 
                      onClick={() => handleGenerateRecommendation(persona.id)}
                      disabled={generateRecommendation.isPending}
                      data-testid={`button-generate-${persona.id}`}
                    >
                      {generateRecommendation.isPending && selectedPersonaId === persona.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating Recommendation...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Get My Recommendation
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Error Display */}
        {generateRecommendation.error && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertDescription className="text-red-800 dark:text-red-200">
              {generateRecommendation.error.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {(!personas || personas.length === 0) && !personasLoading && (
          <Card className="p-8">
            <div className="text-center space-y-4">
              <Brain className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-600">No AI Personas Available</h3>
              <p className="text-gray-500">
                No AI specialists are available for your persona type yet. Please check back later or contact support.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default RecommendationPage;