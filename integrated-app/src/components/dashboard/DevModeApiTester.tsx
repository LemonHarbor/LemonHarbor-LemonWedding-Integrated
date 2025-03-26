import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { shouldShowDebugInfo, simulateNetworkDelay } from '@/lib/devMode';
import { AlertCircle, Check, Loader2, RefreshCw, Send, X } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import { supabase } from '../../../supabase/supabase';

interface ApiEndpoint {
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  requiresAuth: boolean;
  requestBody?: Record<string, any>;
}

const API_ENDPOINTS: ApiEndpoint[] = [
  {
    name: 'Get Guests',
    description: 'Retrieve all guests',
    method: 'GET',
    path: 'guests',
    requiresAuth: true,
  },
  {
    name: 'Get Tables',
    description: 'Retrieve all tables',
    method: 'GET',
    path: 'tables',
    requiresAuth: true,
  },
  {
    name: 'Get Tasks',
    description: 'Retrieve all tasks',
    method: 'GET',
    path: 'tasks',
    requiresAuth: true,
  },
  {
    name: 'Send RSVP Reminders',
    description: 'Send reminders to guests with pending RSVPs',
    method: 'POST',
    path: 'rpc/send_rsvp_reminders',
    requiresAuth: true,
    requestBody: { user_id: '' },
  },
];

export function DevModeApiTester() {
  const { t } = useTranslation();
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [requestBody, setRequestBody] = useState<string>('');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('endpoints');
  
  // Only show if debug info is enabled
  if (!shouldShowDebugInfo()) {
    return null;
  }
  
  const handleSelectEndpoint = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    setRequestBody(endpoint.requestBody ? JSON.stringify(endpoint.requestBody, null, 2) : '');
    setResponse(null);
    setError(null);
  };
  
  const handleSendRequest = async () => {
    if (!selectedEndpoint) return;
    
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      // Simulate network delay if enabled
      await simulateNetworkDelay();
      
      let result;
      
      // Parse request body if provided
      const parsedBody = requestBody ? JSON.parse(requestBody) : undefined;
      
      switch (selectedEndpoint.method) {
        case 'GET':
          result = await supabase.from(selectedEndpoint.path).select('*');
          break;
        case 'POST':
          if (selectedEndpoint.path.startsWith('rpc/')) {
            const functionName = selectedEndpoint.path.replace('rpc/', '');
            result = await supabase.rpc(functionName, parsedBody);
          } else {
            result = await supabase.from(selectedEndpoint.path).insert(parsedBody);
          }
          break;
        case 'PUT':
          result = await supabase.from(selectedEndpoint.path).update(parsedBody);
          break;
        case 'DELETE':
          result = await supabase.from(selectedEndpoint.path).delete();
          break;
      }
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      setResponse(result.data);
    } catch (err) {
      console.error('API request error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCustomRequest = async () => {
    // Beispiel-Implementierung für benutzerdefinierte Anfragen
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Beispiel für einen benutzerdefinierten API-Aufruf
      const result = await supabase.from('custom_table').select('*');

      if (result.error) {
        throw new Error(result.error.message);
      }

      setResponse(result.data);
    } catch (err) {
      console.error('Custom request error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-blue-300 shadow-md">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center">
          <Send className="h-5 w-5 mr-2 text-blue-600" />
          {t('API Tester')}
        </CardTitle>
        <CardDescription>
          {t('Test API endpoints and view responses')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="endpoints">
              {t('Endpoints')}
            </TabsTrigger>
            <TabsTrigger value="custom">
              {t('Custom Request')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="endpoints" className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {API_ENDPOINTS.map((endpoint) => (
                <Button
                  key={endpoint.name}
                  variant={selectedEndpoint?.name === endpoint.name ? 'default' : 'outline'}
                  size="sm"
                  className="justify-start h-auto py-2"
                  onClick={() => handleSelectEndpoint(endpoint)}
                >
                  <div className="text-left">
                    <div className="flex items-center">
                      <Badge 
                        variant="outline" 
                        className={`mr-2 ${getMethodColor(endpoint.method)}`}
                      >
                        {endpoint.method}
                      </Badge>
                      <span>{endpoint.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{endpoint.description}</p>
                  </div>
                </Button>
              ))}
            </div>
            
            {selectedEndpoint && (
              <>
                <Separator />
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">{t('Endpoint Details')}</h3>
                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="text-xs text-gray-500">{t('Method')}:</span>
                          <Badge 
                            variant="outline" 
                            className={`ml-2 ${getMethodColor(selectedEndpoint.method)}`}
                          >
                            {selectedEndpoint.method}
                          </Badge>
                        </div>
                        <div className="col-span-2">
                          <span className="text-xs text-gray-500">{t('Path')}:</span>
                          <code className="ml-2 text-xs bg-gray-100 px-1 py-0.5 rounded">
                            {selectedEndpoint.path}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {(selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT') && (
                    <div>
                      <Label htmlFor="requestBody" className="text-sm">
                        {t('Request Body')} (JSON)
                      </Label>
                      <textarea
                        id="requestBody"
                        value={requestBody}
                        onChange={(e) => setRequestBody(e.target.value)}
                        className="w-full h-32 mt-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md font-mono"
                      />
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleSendRequest} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('Sending...')}
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {t('Send Request')}
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="custom" className="p-4 space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="method">{t('Method')}</Label>
                  <select
                    id="method"
                    className="w-full h-10 mt-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="path">{t('Path')}</Label>
                  <Input
                    id="path"
                    placeholder="e.g., guests"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="customRequestBody">
                  {t('Request Body')} (JSON)
                </Label>
                <textarea
                  id="customRequestBody"
                  className="w-full h-32 mt-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md font-mono"
                  placeholder="{\n  \"key\": \"value\"\n}"
                />
              </div>
              
              <Button 
                onClick={handleCustomRequest} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('Sending...')}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {t('Send Custom Request')}
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {(response || error) && (
        <CardFooter className="flex flex-col items-stretch p-0">
          <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-sm font-medium flex items-center">
              {error ? (
                <>
                  <X className="h-4 w-4 text-red-500 mr-1" />
                  {t('Error')}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 text-green-500 mr-1" />
                  {t('Response')}
                </>
              )}
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setResponse(null);
                setError(null);
              }}
              className="h-7 px-2"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="p-3 max-h-64 overflow-auto bg-gray-900 text-gray-100 rounded-b-md">
            {error ? (
              <div className="text-red-400 text-sm font-mono">{error}</div>
            ) : (
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {JSON.stringify(response, null, 2)}
              </pre>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

// Helper function to get color for HTTP method
function getMethodColor(method: string): string {
  switch (method) {
    case 'GET':
      return 'bg-blue-100 text-blue-800';
    case 'POST':
      return 'bg-green-100 text-green-800';
    case 'PUT':
      return 'bg-amber-100 text-amber-800';
    case 'DELETE':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}