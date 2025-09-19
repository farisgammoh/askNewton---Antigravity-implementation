import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, Phone, Mail, Calendar, MapPin, DollarSign, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface Lead {
  id: string;
  persona: string;
  name: string;
  email: string;
  phone?: string;
  arrivalDate: string;
  stayLength: string;
  status?: string;
  currentCoverage: string;
  preexisting: boolean;
  notes?: string;
  dependents: string;
  zip: string;
  address?: string;
  budgetOrNetwork?: string;
  consent: boolean;
  createdAt: string;
}

function Dashboard() {
  const [adminKey, setAdminKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { data: leads, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/leads'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await fetch('/api/leads', {
        headers: {
          'x-admin-key': adminKey
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      return response.json() as Promise<Lead[]>;
    },
  });

  const handleLogin = async () => {
    if (!adminKey.trim()) return;
    
    try {
      const response = await fetch('/api/leads', {
        headers: {
          'x-admin-key': adminKey
        }
      });
      if (response.ok) {
        setIsAuthenticated(true);
        refetch();
      } else {
        alert('Invalid admin key');
      }
    } catch (error) {
      alert('Failed to authenticate');
    }
  };

  const getPersonaBadgeColor = (persona: string) => {
    switch (persona.toLowerCase()) {
      case 'nomad': return 'bg-blue-500';
      case 'traveler': return 'bg-green-500';
      case 'student': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'bg-yellow-500';
      case 'contacted': return 'bg-blue-500';
      case 'qualified': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-orange-500';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              🏥 AskNewton Dashboard
            </CardTitle>
            <CardDescription>
              Enter your admin key to access lead management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Admin API Key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              data-testid="input-admin-key"
            />
            <Button 
              onClick={handleLogin} 
              className="w-full"
              disabled={!adminKey.trim()}
              data-testid="button-login"
            >
              Access Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertDescription>
            Failed to load leads. Please check your admin key and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalLeads = leads?.length || 0;
  const newLeads = leads?.filter(lead => !lead.status || lead.status === 'new').length || 0;
  const contactedLeads = leads?.filter(lead => lead.status === 'contacted').length || 0;
  const qualifiedLeads = leads?.filter(lead => lead.status === 'qualified').length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🏥 AskNewton Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage health insurance leads for California newcomers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Leads</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-total-leads">{totalLeads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-new-leads">{newLeads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Contacted</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-contacted-leads">{contactedLeads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-500 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Qualified</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-qualified-leads">{qualifiedLeads}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="leads" data-testid="tab-leads">Lead Management</TabsTrigger>
            <TabsTrigger value="broker" data-testid="tab-broker">Broker Portal</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Management</CardTitle>
                <CardDescription>
                  View and manage health insurance leads from your website
                </CardDescription>
              </CardHeader>
              <CardContent>
                {totalLeads === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No leads yet</p>
                    <p className="text-sm text-gray-400">Leads will appear here when visitors submit forms</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Persona</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Arrival</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Coverage</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leads?.map((lead) => (
                          <TableRow key={lead.id} data-testid={`row-lead-${lead.id}`}>
                            <TableCell className="font-medium">{lead.name}</TableCell>
                            <TableCell>
                              <Badge className={cn("text-white", getPersonaBadgeColor(lead.persona))}>
                                {lead.persona}
                              </Badge>
                            </TableCell>
                            <TableCell>{lead.email}</TableCell>
                            <TableCell>{lead.phone || 'N/A'}</TableCell>
                            <TableCell>{lead.arrivalDate}</TableCell>
                            <TableCell>
                              <Badge className={cn("text-white", getStatusBadgeColor(lead.status))}>
                                {lead.status || 'new'}
                              </Badge>
                            </TableCell>
                            <TableCell>{lead.currentCoverage}</TableCell>
                            <TableCell>
                              {new Date(lead.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedLead(lead)}
                                data-testid={`button-view-${lead.id}`}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="broker" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🚀 Broker Portal</CardTitle>
                <CardDescription>
                  WhatsApp AI integration coming soon...
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">WhatsApp Integration In Progress</p>
                <p className="text-sm text-gray-400">
                  Once API keys are provided, you'll be able to chat with leads via WhatsApp with AI assistance
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Lead Details: {selectedLead.name}</span>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedLead(null)}
                  data-testid="button-close-modal"
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Persona</p>
                  <Badge className={cn("text-white", getPersonaBadgeColor(selectedLead.persona))}>
                    {selectedLead.persona}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <Badge className={cn("text-white", getStatusBadgeColor(selectedLead.status))}>
                    {selectedLead.status || 'new'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </p>
                  <p className="font-medium">{selectedLead.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Phone
                  </p>
                  <p className="font-medium">{selectedLead.phone || 'Not provided'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Arrival Date
                  </p>
                  <p className="font-medium">{selectedLead.arrivalDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Stay Length</p>
                  <p className="font-medium">{selectedLead.stayLength}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Current Coverage</p>
                <p className="font-medium">{selectedLead.currentCoverage}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Dependents</p>
                  <p className="font-medium">{selectedLead.dependents}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    ZIP Code
                  </p>
                  <p className="font-medium">{selectedLead.zip}</p>
                </div>
              </div>

              {selectedLead.address && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Address</p>
                  <p className="font-medium">{selectedLead.address}</p>
                </div>
              )}

              {selectedLead.budgetOrNetwork && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Budget/Network Preference</p>
                  <p className="font-medium">{selectedLead.budgetOrNetwork}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-600">Pre-existing Conditions</p>
                <Badge variant={selectedLead.preexisting ? "destructive" : "secondary"}>
                  {selectedLead.preexisting ? 'Yes' : 'No'}
                </Badge>
              </div>

              {selectedLead.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Notes</p>
                  <p className="font-medium bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    {selectedLead.notes}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="font-medium">
                  {new Date(selectedLead.createdAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Dashboard;