import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { simpleOnboardingSchema, type SimpleOnboardingData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const steps = [
  {
    id: 'language',
    title: '🌐 Language Preference',
    question: 'Do you prefer to communicate in English, Arabic, or Spanish?',
    field: 'language' as const,
    emoji: '🌐'
  },
  {
    id: 'health_info',
    title: '💊 Health Information',
    question: 'Do you take any regular medications or have any health conditions we should know about?',
    field: 'health_info' as const,
    emoji: '💊'
  },
  {
    id: 'lifestyle',
    title: '🏃 Lifestyle Habits',
    question: 'Do you have any lifestyle habits we should consider, like smoking or wellness routines?',
    field: 'lifestyle' as const,
    emoji: '🏃'
  },
  {
    id: 'provider',
    title: '👨‍⚕️ Provider Preference',
    question: 'Do you have a favorite doctor or clinic you\'d like to keep seeing?',
    field: 'provider' as const,
    emoji: '👨‍⚕️'
  },
  {
    id: 'email',
    title: '📧 Contact Information',
    question: 'Finally, what\'s the best email for us to send you a welcome summary?',
    field: 'email' as const,
    emoji: '📧'
  }
];

export default function ConversationalOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isComplete, setIsComplete] = useState(false);
  
  const form = useForm<SimpleOnboardingData>({
    resolver: zodResolver(simpleOnboardingSchema),
    defaultValues: {
      language: undefined,
      health_info: "",
      lifestyle: "",
      provider: "",
      email: ""
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: SimpleOnboardingData) => {
      const response = await apiRequest('POST', '/api/simple-lead', data);
      return await response.json();
    },
    onSuccess: (data) => {
      setIsComplete(true);
      toast({
        title: "Success!",
        description: data.message,
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "⚠️ Something went wrong sending your info. Please try again.",
        variant: "destructive",
      });
    }
  });

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async () => {
    const field = currentStepData.field;
    const isValid = await form.trigger(field);
    
    if (!isValid) {
      return; // Don't proceed if current step is invalid
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final submission
      form.handleSubmit((data) => {
        submitMutation.mutate(data);
      })();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isCurrentStepValid = () => {
    const field = currentStepData.field;
    const value = form.getValues(field);
    return value && value.toString().trim() !== '';
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="pt-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-4">
              ✅ All Set!
            </h2>
            <p className="text-gray-600 mb-6">
              Thanks! We've got your info and will follow up with the best health insurance options for you.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => setLocation('/personas')} 
                className="w-full"
                data-testid="button-select-expert"
              >
                Continue to Select Your AI Expert
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/')} 
                className="w-full"
                data-testid="button-home"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center pb-2">
          <div className="mb-4">
            <div className="text-4xl mb-2">{currentStepData.emoji}</div>
            <Progress value={progress} className="w-full mb-4" data-testid="progress-bar" />
            <p className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <CardTitle className="text-xl font-bold text-gray-800">
            👋 Welcome to AskNewton!
          </CardTitle>
          <p className="text-gray-600">
            Let's find the best health insurance options for you. I'll just ask a few quick questions.
          </p>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  {currentStepData.question}
                </h3>
                
                {currentStepData.field === 'language' && (
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            data-testid="select-language"
                          >
                            <SelectTrigger className="w-full text-base py-3">
                              <SelectValue placeholder="Choose your preferred language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="English" data-testid="option-english">
                                🇺🇸 English
                              </SelectItem>
                              <SelectItem value="Arabic" data-testid="option-arabic">
                                🇸🇦 Arabic
                              </SelectItem>
                              <SelectItem value="Spanish" data-testid="option-spanish">
                                🇪🇸 Spanish
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {currentStepData.field === 'email' && (
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            {...field}
                            type="email"
                            placeholder="your.email@example.com"
                            className="text-base py-3"
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {['health_info', 'lifestyle', 'provider'].includes(currentStepData.field) && (
                  <FormField
                    control={form.control}
                    name={currentStepData.field}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            {...field}
                            placeholder="Please share any relevant information..."
                            className="text-base min-h-[100px]"
                            data-testid={`textarea-${currentStepData.field}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="flex justify-between pt-6">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center"
                  data-testid="button-previous"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                
                <Button 
                  type="button"
                  onClick={handleNext}
                  disabled={!isCurrentStepValid() || submitMutation.isPending}
                  className="flex items-center"
                  data-testid="button-next"
                >
                  {currentStep === steps.length - 1 ? (
                    submitMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Submit
                        <CheckCircle className="w-4 h-4 ml-1" />
                      </>
                    )
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}