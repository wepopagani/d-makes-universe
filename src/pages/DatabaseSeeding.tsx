import React, { useState } from 'react';
import seedDatabase from '../scripts/seedData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const DatabaseSeeding = () => {
  const { t } = useTranslation();
  const [isSeeding, setIsSeeding] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const { toast } = useToast();

  // Intercetta i console.log per mostrarli nell'interfaccia
  const originalLog = console.log;
  const originalError = console.error;
  
  console.log = function(...args) {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    setMessages(prev => [...prev, `LOG: ${message}`]);
    originalLog.apply(console, args);
  };
  
  console.error = function(...args) {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    setMessages(prev => [...prev, `ERROR: ${message}`]);
    originalError.apply(console, args);
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setMessages([]);
    
    try {
      await seedDatabase();
      toast({
        title: t('admin.databasePopulated'),
        description: t('admin.sampleDataCreated'),
      });
    } catch (error) {
      console.error(t('admin.errorSeeding'), error);
      toast({
        title: t('common.error'),
        description: t('admin.errorSeedingDescription'),
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
      
      // Ripristina le funzioni originali
      console.log = originalLog;
      console.error = originalError;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.databaseSeeding')}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin.databaseSeeding')}</CardTitle>
            <CardDescription>
              {t('admin.sampleDataCreated')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="mb-6"
            >
              {isSeeding ? t('common.processing') : t('admin.databaseSeeding')}
            </Button>

            {messages.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Log:</h3>
                <div className="bg-gray-100 p-4 rounded-md h-60 overflow-y-auto">
                  {messages.map((message, index) => (
                    <div 
                      key={index} 
                      className={`mb-1 font-mono text-sm ${message.startsWith('ERROR') ? 'text-red-600' : 'text-gray-800'}`}
                    >
                      {message}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-yellow-800 text-sm font-medium">{t('common.attention')}:</p>
                  <p className="text-yellow-700 text-sm mt-1">
                    {t('admin.sampleDataCreated')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseSeeding; 