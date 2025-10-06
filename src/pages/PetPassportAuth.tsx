import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getPetPassportByNumber } from '@/firebase/petPassportService';
import { ArrowLeft, Phone, Shield, Loader2 } from 'lucide-react';

const PetPassportAuth = () => {
  const { passportNumber } = useParams<{ passportNumber: string }>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      toast({
        title: "Numero richiesto",
        description: "Inserisci il numero di telefono del proprietario",
        variant: "destructive"
      });
      return;
    }

    if (!passportNumber) {
      toast({
        title: "Errore",
        description: "Numero passaporto non valido",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔍 Verificando passaporto e numero telefono...');
      
      // Cerca il passaporto
      const passport = await getPetPassportByNumber(passportNumber);
      
      if (!passport) {
        toast({
          title: "Passaporto non trovato",
          description: "Il numero passaporto inserito non esiste o non è attivo",
          variant: "destructive"
        });
        return;
      }

      // Normalizza i numeri per il confronto
      const normalizePhone = (phone: string) => {
        return phone.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');
      };

      const inputPhone = normalizePhone(phoneNumber);
      const ownerPhone = normalizePhone(passport.phone);

      console.log('📞 Confronto numeri:', { inputPhone, ownerPhone });

             // Verifica se il numero corrisponde
       if (inputPhone === ownerPhone || ownerPhone.endsWith(inputPhone) || inputPhone.endsWith(ownerPhone)) {
         console.log('✅ Numero verificato con successo');
         
         // Salva TUTTI i dati del passaporto in localStorage per evitare problemi Firebase
         const passportData = {
           ...passport,
           createdAt: passport.createdAt.toISOString(),
           updatedAt: passport.updatedAt.toISOString(),
           authenticatedAt: new Date().toISOString(),
           authenticatedPhone: phoneNumber
         };
         
         localStorage.setItem(`passport_${passportNumber}`, JSON.stringify(passportData));
         sessionStorage.setItem(`passport_${passportNumber}_auth`, 'true');
         
         toast({
           title: "Accesso autorizzato",
           description: "Numero verificato con successo!",
         });

         // Reindirizza al passaporto
         navigate(`/pets/${passportNumber}/view`);
      } else {
        console.log('❌ Numero non corrispondente');
        toast({
          title: "Numero non corrispondente",
          description: "Il numero inserito non corrisponde a quello del proprietario",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('💥 Errore durante la verifica:', error);
      toast({
        title: "Errore di verifica",
        description: "Si è verificato un errore durante la verifica. Riprova.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna al sito
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Verifica Identità</CardTitle>
            <CardDescription>
              Inserisci il numero di telefono del proprietario per accedere al passaporto #{passportNumber}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <Label htmlFor="phone">Numero di Telefono</Label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+41 79 123 45 67"
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Inserisci il numero registrato per questo animale
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifica in corso...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Verifica e Accedi
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">🔒 Sicurezza</h3>
              <p className="text-sm text-blue-700">
                Solo il proprietario registrato può accedere al passaporto digitale. 
                Il numero viene verificato con quello salvato al momento della registrazione.
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Non sei il proprietario? Contatta direttamente il proprietario 
                o visita <a href="https://3dmakes.ch" className="text-blue-600">3dmakes.ch</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PetPassportAuth; 