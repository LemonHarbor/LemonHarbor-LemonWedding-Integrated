import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { supabase } from '../../services/supabase';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiResponse {
  status: number;
  data: any;
  error?: string;
  duration: number;
}

const DevModeApiTester: React.FC = () => {
  const { t } = useTranslation();
  const { user, role } = useAuth();
  const [endpoint, setEndpoint] = useState<string>('');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [requestBody, setRequestBody] = useState<string>('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [savedRequests, setSavedRequests] = useState<Array<{
    name: string;
    endpoint: string;
    method: HttpMethod;
    body: string;
  }>>([]);
  const [requestName, setRequestName] = useState<string>('');

  // Only allow access to admin users
  if (role !== 'admin') {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">{t('devMode.unauthorized')}</h2>
        <p>{t('devMode.adminOnly')}</p>
      </Card>
    );
  }

  const handleSendRequest = async () => {
    if (!endpoint) {
      return;
    }

    setLoading(true);
    const startTime = performance.now();

    try {
      let result;

      switch (method) {
        case 'GET':
          result = await supabase.from(endpoint).select('*');
          break;
        case 'POST':
          result = await supabase.from(endpoint).insert(JSON.parse(requestBody || '{}'));
          break;
        case 'PUT':
          result = await supabase.from(endpoint).update(JSON.parse(requestBody || '{}')).match({ id: JSON.parse(requestBody || '{}').id });
          break;
        case 'DELETE':
          result = await supabase.from(endpoint).delete().match({ id: JSON.parse(requestBody || '{}').id });
          break;
      }

      const endTime = performance.now();
      
      setResponse({
        status: result.status || 200,
        data: result.data,
        error: result.error?.message,
        duration: endTime - startTime
      });
    } catch (error: any) {
      const endTime = performance.now();
      
      setResponse({
        status: 500,
        data: null,
        error: error.message,
        duration: endTime - startTime
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRequest = () => {
    if (!requestName || !endpoint) {
      return;
    }

    setSavedRequests([
      ...savedRequests,
      {
        name: requestName,
        endpoint,
        method,
        body: requestBody
      }
    ]);

    setRequestName('');
  };

  const handleLoadRequest = (index: number) => {
    const request = savedRequests[index];
    setEndpoint(request.endpoint);
    setMethod(request.method);
    setRequestBody(request.body);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">{t('devMode.apiTester')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">{t('devMode.request')}</h3>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/3">
                <label className="block text-sm font-medium mb-1">
                  {t('devMode.method')}
                </label>
                <Select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as HttpMethod)}
                  className="w-full"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </Select>
              </div>
              
              <div className="w-2/3">
                <label className="block text-sm font-medium mb-1">
                  {t('devMode.endpoint')}
                </label>
                <Input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="table_name"
                  className="w-full"
                />
              </div>
            </div>
            
            {(method === 'POST' || method === 'PUT' || method === 'DELETE') && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('devMode.requestBody')}
                </label>
                <Textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  placeholder='{\n  "key": "value"\n}'
                />
              </div>
            )}
            
            <Button
              onClick={handleSendRequest}
              disabled={loading || !endpoint}
              className="w-full"
            >
              {loading ? t('devMode.sending') : t('devMode.sendRequest')}
            </Button>
            
            <div className="pt-4 border-t">
              <h4 className="text-md font-semibold mb-2">{t('devMode.savedRequests')}</h4>
              
              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  placeholder={t('devMode.requestName')}
                  className="flex-1"
                />
                <Button
                  onClick={handleSaveRequest}
                  disabled={!requestName || !endpoint}
                  size="sm"
                >
                  {t('devMode.save')}
                </Button>
              </div>
              
              {savedRequests.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {savedRequests.map((request, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded"
                    >
                      <div>
                        <span className="font-medium">{request.name}</span>
                        <span className="text-xs ml-2 text-gray-500">
                          {request.method} {request.endpoint}
                        </span>
                      </div>
                      <Button
                        onClick={() => handleLoadRequest(index)}
                        size="sm"
                        variant="outline"
                      >
                        {t('devMode.load')}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">{t('devMode.noSavedRequests')}</p>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">{t('devMode.response')}</h3>
          
          {response ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <div>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      response.status >= 200 && response.status < 300
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}
                  >
                    {response.status}
                  </span>
                  {response.error && (
                    <span className="ml-2 text-red-600 dark:text-red-400 text-sm">
                      {response.error}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {response.duration.toFixed(2)}ms
                </span>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96">
                <pre className="text-xs">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
              <p className="text-gray-500">{t('devMode.noResponse')}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DevModeApiTester;
