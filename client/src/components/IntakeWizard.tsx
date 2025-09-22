import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { leadSchema, type LeadFormData } from "@/lib/validation";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { title: "Let's start with the basics", fields: ["persona", "name", "email", "phone"] },
  { title: "Tell us about your stay", fields: ["arrivalDate", "stayLength", "status", "zip"] },
  { title: "Current insurance situation", fields: ["currentCoverage", "preexisting"] },
  { title: "Family coverage", fields: ["dependents", "address"] },
  { title: "Your preferences", fields: ["budgetOrNetwork", "notes"] },
  { title: "Almost done!", fields: ["consent"] },
];

export default function IntakeWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      persona: "nomad",
      name: "",
      email: "",
      phone: "",
      arrivalDate: new Date().toISOString().split('T')[0],
      stayLength: "lt90",
      status: "Other",
      currentCoverage: "none",
      preexisting: false,
      notes: "",
      dependents: "none",
      zip: "",
      address: "",
      budgetOrNetwork: "",
      consent: false
    }
  });

  // Get persona from URL params if available
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const persona = urlParams.get('persona');
    if (persona && ['nomad', 'traveler', 'student'].includes(persona)) {
      form.setValue('persona', persona as LeadFormData['persona']);
    }
  }, [form]);

  const submitMutation = useMutation({
    mutationFn: async (data: LeadFormData) => {
      return apiRequest('POST', '/api/lead', data);
    },
    onSuccess: (response: any) => {
      // Store leadId for AI recommendation flow
      if (response?.leadId) {
        localStorage.setItem('lastLeadId', response.leadId);
        console.log('✅ Lead ID stored:', response.leadId);
      }
      
      toast({
        title: "Assessment submitted!",
        description: "We'll email you your personalized recommendations within 24 hours.",
      });
      setLocation('/thanks');
    },
    onError: (error: any) => {
      toast({
        title: "Submission failed",
        description: error.message || "Please try again or contact us for help.",
        variant: "destructive",
      });
    }
  });

  const nextStep = async () => {
    const currentFields = steps[currentStep].fields;
    const result = await form.trigger(currentFields as any);
    
    if (result && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: LeadFormData) => {
    submitMutation.mutate(data);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" data-testid="wizard-progress" />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Get your personalized options</h1>
        <p className="text-muted-foreground">This takes about 3 minutes. We'll email you a personalized report with your best options.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep].title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 0 && (
                <>
                  <FormField
                    control={form.control}
                    name="persona"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Which describes you best?</FormLabel>
                        <FormControl>
                          <RadioGroup 
                            value={field.value} 
                            onValueChange={field.onChange}
                            className="grid gap-3"
                            data-testid="input-persona"
                          >
                            <div className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
                              <RadioGroupItem value="nomad" className="mr-3" />
                              <div>
                                <div className="font-medium text-foreground">Nomad</div>
                                <div className="text-sm text-muted-foreground">Remote worker, founder, contractor</div>
                              </div>
                            </div>
                            <div className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
                              <RadioGroupItem value="traveler" className="mr-3" />
                              <div>
                                <div className="font-medium text-foreground">Traveler</div>
                                <div className="text-sm text-muted-foreground">Visiting for 1-6 months</div>
                              </div>
                            </div>
                            <div className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
                              <RadioGroupItem value="student" className="mr-3" />
                              <div>
                                <div className="font-medium text-foreground">Student</div>
                                <div className="text-sm text-muted-foreground">F-1, J-1, or transferring</div>
                              </div>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} data-testid="input-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone number (optional)</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+1 (555) 123-4567" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Step 2: Timing & Status */}
              {currentStep === 1 && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="arrivalDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>When do you arrive? *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-arrival-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stayLength"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How long will you stay? *</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger data-testid="select-stay-length">
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="lt90">Less than 3 months</SelectItem>
                              <SelectItem value="3to6">3-6 months</SelectItem>
                              <SelectItem value="6to12">6-12 months</SelectItem>
                              <SelectItem value="12plus">12+ months</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What's your visa status?</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger data-testid="select-visa-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ESTA">ESTA/Visa Waiver</SelectItem>
                            <SelectItem value="B1">B-1 (Business)</SelectItem>
                            <SelectItem value="B2">B-2 (Tourist)</SelectItem>
                            <SelectItem value="F1">F-1 (Student)</SelectItem>
                            <SelectItem value="J1">J-1 (Exchange)</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP code where you'll be staying *</FormLabel>
                        <FormControl>
                          <Input placeholder="90210" maxLength={10} {...field} data-testid="input-zip" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Step 3: Current Coverage */}
              {currentStep === 2 && (
                <>
                  <FormField
                    control={form.control}
                    name="currentCoverage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Do you currently have health insurance? *</FormLabel>
                        <FormControl>
                          <RadioGroup 
                            value={field.value} 
                            onValueChange={field.onChange}
                            className="grid gap-3"
                            data-testid="input-current-coverage"
                          >
                            <div className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
                              <RadioGroupItem value="none" className="mr-3" />
                              <span>No coverage</span>
                            </div>
                            <div className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
                              <RadioGroupItem value="travel" className="mr-3" />
                              <span>Travel insurance</span>
                            </div>
                            <div className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
                              <RadioGroupItem value="employer" className="mr-3" />
                              <span>Employer plan (home country)</span>
                            </div>
                            <div className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
                              <RadioGroupItem value="university" className="mr-3" />
                              <span>University plan</span>
                            </div>
                            <div className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
                              <RadioGroupItem value="marketplace" className="mr-3" />
                              <span>US marketplace plan</span>
                            </div>
                            <div className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
                              <RadioGroupItem value="other" className="mr-3" />
                              <span>Other</span>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preexisting"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => field.onChange(checked === true)}
                            data-testid="checkbox-preexisting"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I have pre-existing medical conditions that require ongoing treatment
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Step 4: Dependents */}
              {currentStep === 3 && (
                <>
                  <FormField
                    control={form.control}
                    name="dependents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Who needs coverage? *</FormLabel>
                        <FormControl>
                          <RadioGroup 
                            value={field.value} 
                            onValueChange={field.onChange}
                            className="grid gap-3"
                            data-testid="input-dependents"
                          >
                            <div className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
                              <RadioGroupItem value="none" className="mr-3" />
                              <span>Just me</span>
                            </div>
                            <div className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
                              <RadioGroupItem value="spouse" className="mr-3" />
                              <span>Me + spouse/partner</span>
                            </div>
                            <div className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
                              <RadioGroupItem value="children" className="mr-3" />
                              <span>Me + children</span>
                            </div>
                            <div className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
                              <RadioGroupItem value="both" className="mr-3" />
                              <span>Me + spouse + children</span>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address in California (optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Street address, city, state" 
                            rows={3}
                            {...field} 
                            data-testid="input-address"
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">Helps us recommend nearby providers</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Step 5: Preferences */}
              {currentStep === 4 && (
                <>
                  <FormField
                    control={form.control}
                    name="budgetOrNetwork"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget or provider preferences</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g., 'Budget under $200/month' or 'Need access to UCSF doctors'" 
                            rows={3}
                            {...field} 
                            data-testid="input-budget-network"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anything else we should know?</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Special circumstances, concerns, questions..." 
                            rows={3}
                            {...field} 
                            data-testid="input-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Step 6: Consent */}
              {currentStep === 5 && (
                <>
                  <div className="bg-muted rounded-lg p-6">
                    <h3 className="font-medium text-foreground mb-3">What happens next?</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• We'll email you a personalized report within 24 hours</li>
                      <li>• Our recommendations will include specific plans and pricing</li>
                      <li>• You can book a free consultation to discuss options</li>
                      <li>• We'll help you enroll if you choose a plan through us</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="consent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => field.onChange(checked === true)}
                              data-testid="checkbox-consent"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I agree to receive my personalized insurance recommendations via email and understand that AskNewton is not an insurance company but provides guidance and enrollment assistance. *
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <p className="text-xs text-muted-foreground">
                      By submitting this form, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className={currentStep === 0 ? "invisible" : ""}
              data-testid="button-previous"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button 
                type="button" 
                onClick={nextStep}
                data-testid="button-next"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={submitMutation.isPending}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                data-testid="button-submit"
              >
                {submitMutation.isPending ? "Submitting..." : "Get my recommendations"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
