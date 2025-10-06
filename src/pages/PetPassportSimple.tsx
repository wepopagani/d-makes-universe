import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPetPassportByNumber } from '@/firebase/petPassportService';

// Interfaccia semplificata
interface Pet {
  animalName: string;
  breed: string;
  ownerName: string;
  phone: string;
  address: string;
}

// Dati mock per test + dati reali da Firebase
const mockData: Record<string, Pet> = {
  "146679": {
    animalName: "Tony",
    breed: "Pastore Tedesco", 
    ownerName: "Marco Pagani",
    phone: "+41791234567",
    address: "Via Example 123, 6918Lugano, Svizzera"
  },
  "123456": {
    animalName: "Luna",
    breed: "Border Collie",
    ownerName: "Elena Bianchi", 
    phone: "+41765432109",
    address: "Via Lugano 45, 6900 Lugano, Svizzera"
  }
};

export default function PetPassportSimple() {
  const { passportNumber } = useParams();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPet = async () => {
      if (!passportNumber) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Caricamento passaporto pubblico:', passportNumber);
        
        // Prima prova con Firebase (DATI REALI)
        try {
          const passportData = await getPetPassportByNumber(passportNumber);
          if (passportData) {
            console.log('✅ Passaporto trovato su Firebase:', passportData.animalName);
            setPet({
              animalName: passportData.animalName,
              breed: passportData.breed,
              ownerName: passportData.ownerName,
              phone: passportData.phone,
              address: passportData.address
            });
            setLoading(false);
            return;
          }
        } catch (firebaseError) {
          console.log('⚠️ Firebase non disponibile, uso dati mock:', firebaseError);
        }

        // Fallback: dati mock per testing
        if (mockData[passportNumber]) {
          console.log('📋 Usando dati mock per:', passportNumber);
          setPet(mockData[passportNumber]);
          setLoading(false);
          return;
        }

        console.log('❌ Passaporto non trovato:', passportNumber);
        setLoading(false);
      } catch (error) {
        console.error('💥 Errore generale nel caricamento:', error);
        setLoading(false);
      }
    };

    loadPet();
  }, [passportNumber]);

  const callOwner = () => {
    if (pet?.phone) {
      window.location.href = `tel:${pet.phone}`;
    }
  };

  const openMaps = () => {
    if (pet?.address) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pet.address)}`;
      window.open(url, '_blank');
    }
  };

  const downloadVCard = () => {
    if (!pet) return;
    
    const [firstName, ...lastNameParts] = pet.ownerName.split(' ');
    const lastName = lastNameParts.join(' ');
    
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${lastName};${firstName};;;`,
      `FN:${pet.ownerName}`,
      `TEL;TYPE=CELL:${pet.phone}`,
      `ADR:;;${pet.address};;;;`,
      `NOTE:Proprietario di ${pet.animalName} (${pet.breed})`,
      'END:VCARD'
    ].join('\r\n');
    
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pet.animalName.toLowerCase()}_contatto.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #3b82f6',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Caricamento passaporto #{passportNumber}...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ 
          maxWidth: '400px',
          background: 'white',
          padding: '32px',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>❌</div>
          <h1 style={{ margin: '0 0 8px', color: '#1f2937' }}>Passaporto non trovato</h1>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Numero: {passportNumber}
          </p>
          <a href="/" style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px'
          }}>
            ← Torna al sito
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '16px 16px 0 0',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: '0 0 8px', fontSize: '24px' }}>Passaporto Digitale</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>Animale Domestico</p>
        </div>

        {/* Content */}
        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '0 0 16px 16px',
          border: '3px solid #3b82f6',
          borderTop: 'none'
        }}>
          {/* Pet Info */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '32px', color: '#1e40af' }}>{pet.animalName}</h2>
            <p style={{ margin: 0, fontStyle: 'italic', color: '#6b7280' }}>{pet.breed}</p>
          </div>

          {/* Owner Info */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ 
              color: '#1e40af', 
              borderBottom: '2px solid #3b82f6',
              paddingBottom: '8px',
              marginBottom: '16px'
            }}>
              👤 Informazioni Proprietario
            </h3>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                background: '#f0f9ff',
                borderRadius: '8px',
                borderLeft: '4px solid #3b82f6'
              }}>
                <span style={{ marginRight: '12px', fontSize: '20px' }}>👨‍💼</span>
                <span>{pet.ownerName}</span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                background: '#f0f9ff',
                borderRadius: '8px',
                borderLeft: '4px solid #3b82f6'
              }}>
                <span style={{ marginRight: '12px', fontSize: '20px' }}>📞</span>
                <span>{pet.phone}</span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                background: '#f0f9ff',
                borderRadius: '8px',
                borderLeft: '4px solid #3b82f6'
              }}>
                <span style={{ marginRight: '12px', fontSize: '20px' }}>📍</span>
                <span style={{ flex: 1 }}>{pet.address}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'grid', gap: '12px' }}>
            <button
              onClick={callOwner}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <span style={{ marginRight: '8px' }}>📞</span>
              Chiama Proprietario
            </button>

            <button
              onClick={openMaps}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <span style={{ marginRight: '8px' }}>📍</span>
              Apri Indirizzo
            </button>

            <button
              onClick={downloadVCard}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <span style={{ marginRight: '8px' }}>💾</span>
              Scarica Contatto
            </button>
          </div>

          {/* Found Animal */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#ecfdf5',
            borderRadius: '8px',
            borderLeft: '4px solid #10b981'
          }}>
            <h4 style={{ margin: '0 0 8px', color: '#065f46' }}>🐾 Hai trovato questo animale?</h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#047857' }}>
              Contatta il proprietario usando i pulsanti sopra. Ogni aiuto è prezioso!
            </p>
          </div>
        </div>


      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        @media (max-width: 600px) {
          body { padding: 10px; }
        }
      `}</style>
    </div>
  );
} 