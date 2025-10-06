import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  getPetPassportByNumber, 
  getAllPetPassports, 
  searchPetPassports,
  deactivatePetPassport,
  reactivatePetPassport,
  type PetPassport 
} from '@/firebase/petPassportService';
import { 
  ArrowLeft, 
  Search, 
  Eye, 
  UserMinus, 
  UserCheck, 
  Phone, 
  MapPin,
  Calendar,
  PawPrint,
  QrCode 
} from 'lucide-react';
import { useAuth } from '@/firebase/AuthContext';

const PetAdmin = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<PetPassport[]>([]);
  const [allPassports, setAllPassports] = useState<PetPassport[]>([]);
  const [selectedPassport, setSelectedPassport] = useState<PetPassport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const { toast } = useToast();
  const { currentUser, isAdmin } = useAuth();

  // Carica tutti i passaporti all'avvio (solo per admin)
  useEffect(() => {
    if (isAdmin) {
      loadAllPassports();
    }
  }, [isAdmin]);

  const loadAllPassports = async () => {
    try {
      setIsLoadingAll(true);
      const passports = await getAllPetPassports();
      setAllPassports(passports);
    } catch (error) {
      console.error('Errore nel caricamento:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i passaporti.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAll(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Inserisci un termine di ricerca",
        description: "Cerca per numero passaporto, nome animale o proprietario.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Se è un numero di 6 cifre, cerca direttamente per numero
      if (/^\d{6}$/.test(searchTerm.trim())) {
        const passport = await getPetPassportByNumber(searchTerm.trim());
        setSearchResults(passport ? [passport] : []);
      } else {
        // Altrimenti cerca per nome
        const results = await searchPetPassports(searchTerm.trim());
        setSearchResults(results);
      }
      
      if (searchResults.length === 0) {
        toast({
          title: "Nessun risultato",
          description: "Nessun passaporto trovato per la ricerca effettuata.",
        });
      }
    } catch (error) {
      console.error('Errore nella ricerca:', error);
      toast({
        title: "Errore",
        description: "Errore nella ricerca. Riprova.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (passport: PetPassport) => {
    try {
      if (passport.isActive) {
        await deactivatePetPassport(passport.id!);
        toast({
          title: "Passaporto disattivato",
          description: `Il passaporto di ${passport.animalName} è stato disattivato.`,
        });
      } else {
        await reactivatePetPassport(passport.id!);
        toast({
          title: "Passaporto riattivato",
          description: `Il passaporto di ${passport.animalName} è stato riattivato.`,
        });
      }
      
      // Ricarica i dati
      await loadAllPassports();
      
      // Aggiorna i risultati di ricerca se presenti
      if (searchResults.length > 0) {
        handleSearch();
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare lo stato del passaporto.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const PassportCard = ({ passport }: { passport: PetPassport }) => (
    <Card className={`${!passport.isActive ? 'opacity-60 border-red-200' : 'border-green-200'}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PawPrint className="h-5 w-5" />
              {passport.animalName}
            </CardTitle>
            <CardDescription>{passport.breed}</CardDescription>
          </div>
          <div className="text-right">
            <Badge variant={passport.isActive ? "default" : "destructive"}>
              {passport.isActive ? "Attivo" : "Disattivato"}
            </Badge>
            <p className="text-sm text-gray-500 mt-1">#{passport.passportNumber}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">👤 Proprietario:</span>
            <span>{passport.ownerName}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4" />
            <span>{passport.phone}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            <span className="flex-1">{passport.address}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Creato: {formatDate(passport.createdAt)}</span>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`/pets/${passport.passportNumber}`, '_blank')}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              Visualizza
            </Button>
            
            {isAdmin && (
              <Button
                size="sm"
                variant={passport.isActive ? "destructive" : "default"}
                onClick={() => handleToggleStatus(passport)}
                className="flex-1"
              >
                {passport.isActive ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-1" />
                    Disattiva
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-1" />
                    Riattiva
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Accesso Richiesto</CardTitle>
            <CardDescription>Devi essere autenticato per accedere a questa pagina.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login">
              <Button>Accedi</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna al sito
          </Link>
        </div>

        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <QrCode className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Gestione Passaporti Digitali</CardTitle>
            <CardDescription>
              Cerca e gestisci i passaporti digitali degli animali
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">Cerca passaporto</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Numero passaporto, nome animale o proprietario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? 'Ricerca...' : 'Cerca'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Risultati di ricerca */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Risultati di ricerca ({searchResults.length})</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {searchResults.map((passport) => (
                <PassportCard key={passport.id} passport={passport} />
              ))}
            </div>
          </div>
        )}

        {/* Lista completa (solo per admin) */}
        {isAdmin && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Tutti i Passaporti ({allPassports.length})
            </h2>
            {isLoadingAll ? (
              <div className="text-center py-8">
                <p>Caricamento passaporti...</p>
              </div>
            ) : allPassports.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">Nessun passaporto registrato.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {allPassports.map((passport) => (
                  <PassportCard key={passport.id} passport={passport} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PetAdmin; 