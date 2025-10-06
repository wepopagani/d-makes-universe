import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createPetPassport } from '@/firebase/petPassportService';
import { ArrowLeft, Loader2, PawPrint, QrCode, Check } from 'lucide-react';

const PetRegistration = () => {
  const [formData, setFormData] = useState({
    animalName: '',
    breed: '',
    ownerName: '',
    phone: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [generatedNumber, setGeneratedNumber] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['animalName', 'breed', 'ownerName', 'phone', 'address'];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData].trim()) {
        toast({
          title: "Campo obbligatorio",
          description: `Il campo è richiesto.`,
          variant: "destructive"
        });
        return false;
      }
    }

    // Validazione telefono (formato base)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "Numero di telefono non valido",
        description: "Inserisci un numero di telefono valido (es. +41791234567)",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const passportNumber = await createPetPassport({
        animalName: formData.animalName.trim(),
        breed: formData.breed.trim(),
        ownerName: formData.ownerName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        isActive: true
      });

      setGeneratedNumber(passportNumber);
      
      toast({
        title: "Passaporto creato con successo!",
        description: `Numero passaporto: ${passportNumber}`,
      });
    } catch (error) {
      console.error('Errore nella creazione:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nella creazione del passaporto. Riprova.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      animalName: '',
      breed: '',
      ownerName: '',
      phone: '',
      address: ''
    });
    setGeneratedNumber(null);
  };

  if (generatedNumber) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna al sito
            </Link>
          </div>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-green-800">Passaporto Creato!</CardTitle>
              <CardDescription>Il passaporto digitale è stato generato con successo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="bg-white p-6 rounded-lg border border-green-200">
                  <QrCode className="mx-auto h-8 w-8 text-blue-600 mb-3" />
                  <p className="text-sm text-gray-600 mb-2">Numero Passaporto</p>
                  <p className="text-3xl font-bold text-gray-900">{generatedNumber}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-600 text-center">
                  <strong>URL del passaporto:</strong><br />
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    https://3dmakes.ch/pets/{generatedNumber}
                  </code>
                </p>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={() => navigate(`/pets/${generatedNumber}`)}
                    className="flex-1"
                  >
                    Visualizza Passaporto
                  </Button>
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="flex-1"
                  >
                    Crea Altro
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              <PawPrint className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Registra Passaporto Digitale</CardTitle>
            <CardDescription>Crea un passaporto digitale per il tuo animale domestico</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dati Animale */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">🐕 Dati Animale</h3>
                
                <div>
                  <Label htmlFor="animalName">Nome Animale *</Label>
                  <Input
                    id="animalName"
                    name="animalName"
                    type="text"
                    value={formData.animalName}
                    onChange={handleInputChange}
                    placeholder="es. Buddy"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="breed">Razza *</Label>
                  <Input
                    id="breed"
                    name="breed"
                    type="text"
                    value={formData.breed}
                    onChange={handleInputChange}
                    placeholder="es. Golden Retriever"
                    required
                  />
                </div>


              </div>

              {/* Dati Proprietario */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">👤 Dati Proprietario</h3>
                
                <div>
                  <Label htmlFor="ownerName">Nome Completo *</Label>
                  <Input
                    id="ownerName"
                    name="ownerName"
                    type="text"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    placeholder="es. Mario Rossi"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Numero di Telefono *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="es. +41791234567"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Indirizzo Completo *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="es. Via Example 123, 6918Lugano, Svizzera"
                    rows={3}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creazione in corso...
                  </>
                ) : (
                  'Crea Passaporto Digitale'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Il passaporto digitale sarà accessibile tramite un numero univoco.
                <br />
                Potrai collegarlo a un tag NFC per facilitare l'accesso.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PetRegistration; 