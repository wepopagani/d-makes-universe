import React, { useEffect } from 'react';
import { useAuth } from '@/firebase/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const AuthTest = () => {
  const { currentUser, userData, logOut } = useAuth();
  const navigate = useNavigate();

  // Log auth state on component mount
  useEffect(() => {
    console.log('AuthTest - Current User:', currentUser);
    console.log('AuthTest - User Data:', userData);
  }, [currentUser, userData]);

  const handleLogout = async () => {
    if (logOut) {
      await logOut();
      navigate('/login');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
          <CardDescription>Current authentication state</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <strong>Authenticated:</strong> {currentUser ? 'Yes' : 'No'}
            </div>
            {currentUser && (
              <>
                <div>
                  <strong>User ID:</strong> {currentUser.uid}
                </div>
                <div>
                  <strong>Email:</strong> {currentUser.email}
                </div>
                <div>
                  <strong>Display Name:</strong> {currentUser.displayName || 'Not set'}
                </div>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter>
          {currentUser ? (
            <Button onClick={handleLogout}>Log Out</Button>
          ) : (
            <Button onClick={() => navigate('/login')}>Log In</Button>
          )}
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>User Data</CardTitle>
          <CardDescription>User profile data from Firestore</CardDescription>
        </CardHeader>
        <CardContent>
          {userData ? (
            <div className="space-y-2">
              <div>
                <strong>Nome:</strong> {userData.nome}
              </div>
              <div>
                <strong>Cognome:</strong> {userData.cognome}
              </div>
              <div>
                <strong>Email:</strong> {userData.email}
              </div>
              <div>
                <strong>Telefono:</strong> {userData.telefono || 'Non specificato'}
              </div>
              <div>
                <strong>Indirizzo:</strong> {userData.indirizzo || 'Non specificato'}
              </div>
              <div>
                <strong>Città:</strong> {userData.citta || 'Non specificata'}
              </div>
              <div>
                <strong>CAP:</strong> {userData.cap || 'Non specificato'}
              </div>
            </div>
          ) : (
            <div className="text-yellow-600">
              User data not loaded from Firestore
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthTest; 