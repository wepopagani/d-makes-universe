import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Download, Loader2, AlertCircle } from 'lucide-react';

// Dati simulati per ora - in futuro sarà un JSON file o API pubblica
const mockPassports: Record<string, any> = {
  "146679": {
    animalName: "Tony",
    breed: "Pastore Tedesco",
    ownerName: "Marco Pagani",
    phone: "+41791234567",
    address: "Via Example 123, 6918Lugano, Svizzera",
    vcardFilename: "tony_marco_contatto.vcf"
  },
  "123456": {
    animalName: "Luna", 
    breed: "Border Collie",
    ownerName: "Elena Bianchi",
    phone: "+41765432109",
    address: "Via Lugano 45, 6900 Lugano, Svizzera",
    vcardFilename: "luna_elena_contatto.vcf"
  }
};

const PetPassportPublic = () => {
  const { passportNumber } = useParams<{ passportNumber: string }>();
  const [passport, setPassport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPassport = () => {
      console.log('🌐 Loading PUBLIC passport for:', passportNumber);
      
      if (!passportNumber) {
        setError('Numero passaporto non valido');
        setIsLoading(false);
        return;
      }

      // Simula caricamento
      setTimeout(() => {
        const passportData = mockPassports[passportNumber];
        
        if (passportData) {
          console.log('✅ PUBLIC passport found:', passportData.animalName);
          setPassport(passportData);
          setError(null);
        } else {
          console.log('❌ PUBLIC passport not found for:', passportNumber);
          setError('Passaporto non trovato');
        }
        
        setIsLoading(false);
      }, 1000);
    };

    loadPassport();
  }, [passportNumber]);

  const downloadVCard = () => {
    if (!passport) return;

    const nameParts = passport.ownerName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const vcardContent = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${lastName};${firstName};;;`,
      `FN:${passport.ownerName}`,
      `TEL;TYPE=CELL:${passport.phone}`,
      `ADR:;;${passport.address};;;;`,
      `NOTE:Proprietario di ${passport.animalName} (${passport.breed})`,
      'END:VCARD'
    ].join('\r\n');

    const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = passport.vcardFilename || `${passport.animalName.toLowerCase().replace(/\s+/g, '_')}_contatto.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const openMaps = () => {
    if (!passport) return;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(passport.address)}`;
    window.open(mapsUrl, '_blank');
  };

  const callOwner = () => {
    if (!passport) return;
    window.location.href = `tel:${passport.phone}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600 mb-4" />
          <p className="text-lg text-gray-600">Caricamento passaporto...</p>
          <p className="text-sm text-gray-500 mt-2">#{passportNumber}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !passport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-200">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Passaporto non trovato</h1>
            <p className="text-gray-600 mb-4 text-sm">
              {error || 'Il passaporto richiesto non è stato trovato.'}
            </p>
            <div className="bg-gray-100 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-600">
                <strong>Numero cercato:</strong> {passportNumber}
              </p>
            </div>
            <Link 
              to="/" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna al sito
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Update page title
  useEffect(() => {
    if (passport) {
      document.title = `${passport.animalName} - Passaporto Digitale | 3DMAKES`;
    }
  }, [passport]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header del passaporto */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-2xl px-6 py-6 relative">
          <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">3DM</span>
          </div>
          <div className="text-center pt-8">
            <h1 className="text-xl font-bold mb-1">Passaporto Digitale</h1>
            <p className="text-blue-100">Animale Domestico</p>
            <p className="text-xs text-green-100 mt-2">🌐 Accesso Pubblico</p>
          </div>
        </div>

        {/* Contenuto del passaporto */}
        <div className="bg-white rounded-b-2xl shadow-lg border-x-4 border-b-4 border-blue-600 p-6">
          {/* Foto e nome animale */}
          <div className="text-center mb-6">
            <div className="mb-4">
              <div className="w-28 h-28 rounded-full border-4 border-blue-600 bg-blue-50 flex items-center justify-center mx-auto">
                <span className="text-4xl">🐕</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-blue-800 mb-1">{passport.animalName}</h2>
            <p className="text-gray-600 italic">{passport.breed}</p>
          </div>

          {/* Informazioni proprietario */}
          <div className="mb-6">
            <h3 className="font-semibold text-blue-800 mb-3 pb-2 border-b-2 border-blue-600">
              👤 Informazioni Proprietario
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                <span className="text-blue-600 mr-3">👨‍💼</span>
                <span className="font-medium">{passport.ownerName}</span>
              </div>
              
              <div className="flex items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                <Phone className="h-5 w-5 text-blue-600 mr-3" />
                <span>{passport.phone}</span>
              </div>
              
              <div className="flex items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                <span className="flex-1">{passport.address}</span>
              </div>
            </div>
          </div>

          {/* Pulsanti di azione */}
          <div className="space-y-3">
            <button
              onClick={callOwner}
              className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
            >
              <Phone className="h-5 w-5 mr-2" />
              Chiama Proprietario
            </button>

            <button
              onClick={openMaps}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
            >
              <MapPin className="h-5 w-5 mr-2" />
              Apri Indirizzo
            </button>

            <button
              onClick={downloadVCard}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-900 transition-colors shadow-md"
            >
              <Download className="h-5 w-5 mr-2" />
              Scarica Contatto
            </button>
          </div>

          {/* Info per chi trova l'animale */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <h4 className="font-semibold text-green-800 mb-2">🐾 Hai trovato questo animale?</h4>
            <p className="text-sm text-green-700">
              Contatta il proprietario usando i pulsanti sopra. Ogni aiuto è prezioso per riunire l'animale con la sua famiglia!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 p-4 bg-white/80 rounded-lg">
          <p className="text-sm text-gray-600">
            Powered by <strong className="text-blue-600">3DMAKES</strong> | 
            <a href="https://3dmakes.ch" className="text-blue-600 hover:text-blue-800 ml-1">
              3dmakes.ch
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PetPassportPublic; 