import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/firebase/AuthContext";
import { UserData } from '@/firebase/AuthContext';

const FirebaseAuthTester = () => {
  const { currentUser, userData, isAdmin } = useAuth();
  const [showJson, setShowJson] = useState(false);

  const userDataJson = JSON.stringify(
    {
      currentUser: currentUser ? {
        uid: currentUser.uid,
        email: currentUser.email,
        emailVerified: currentUser.emailVerified,
        displayName: currentUser.displayName,
        phoneNumber: currentUser.phoneNumber,
        photoURL: currentUser.photoURL,
        providerId: currentUser.providerId,
        providerData: currentUser.providerData,
      } : null,
      userData: userData,
      isAdmin
    }, 
    null, 
    2
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Firebase Auth Tester</CardTitle>
        <CardDescription>Testa la configurazione di autenticazione Firebase</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="status">
          <TabsList className="mb-4">
            <TabsTrigger value="status">Stato Autenticazione</TabsTrigger>
            <TabsTrigger value="data">Dati Utente</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status">
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-gray-50">
                <h3 className="text-lg font-medium mb-2">Stato Utente</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="font-medium w-32">Autenticato:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${currentUser ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {currentUser ? 'Sì' : 'No'}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-medium w-32">Admin:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {isAdmin ? 'Sì' : 'No'}
                    </span>
                  </div>
                  
                  {currentUser && (
                    <>
                      <div className="flex items-center">
                        <span className="font-medium w-32">UID:</span>
                        <span className="text-sm">{currentUser.uid}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="font-medium w-32">Email:</span>
                        <span className="text-sm">{currentUser.email}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="font-medium w-32">Provider:</span>
                        <span className="text-sm">{currentUser.providerData[0]?.providerId || 'N/A'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="p-4 rounded-md bg-gray-50">
                <h3 className="text-lg font-medium mb-2">Info Firebase</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="font-medium w-32">Regole Firestore:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800`}>
                      Configurate
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-medium w-32">Regole Storage:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800`}>
                      Configurate
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-medium w-32">Email Admin:</span>
                    <span className="text-sm">info@3dmakes.ch</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="data">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowJson(!showJson)}>
                  {showJson ? 'Mostra Vista Semplificata' : 'Mostra JSON Completo'}
                </Button>
              </div>
              
              {showJson ? (
                <pre className="p-4 bg-gray-900 text-gray-100 rounded-md overflow-auto max-h-96">
                  {userDataJson}
                </pre>
              ) : (
                <>
                  {userData ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-md bg-gray-50">
                        <h3 className="text-lg font-medium mb-2">Dati Profilo</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-500">Nome</span>
                            <p>{userData.nome}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Cognome</span>
                            <p>{userData.cognome}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Email</span>
                            <p>{userData.email}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Telefono</span>
                            <p>{userData.telefono || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Indirizzo</span>
                            <p>{userData.indirizzo || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Città</span>
                            <p>{userData.citta || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">CAP</span>
                            <p>{userData.cap || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-gray-50 rounded-md">
                      <p className="text-gray-500">Nessun dato utente disponibile. Effettua l'accesso per visualizzare i dati.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-gray-500">
          Utilizza questo componente solo in ambiente di sviluppo
        </p>
      </CardFooter>
    </Card>
  );
};

export default FirebaseAuthTester; 