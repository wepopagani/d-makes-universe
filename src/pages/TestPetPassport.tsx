import React, { useState, useEffect } from 'react';
import { getAllPetPassports } from '@/firebase/petPassportService';

const TestPetPassport = () => {
  const [passports, setPassports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('🧪 Testing Firestore connection...');
        const allPassports = await getAllPetPassports();
        
        console.log('✅ Successfully connected! Found passports:', allPassports);
        setPassports(allPassports);
      } catch (err) {
        console.error('❌ Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  if (loading) return <div className="p-8">🔄 Testing connection...</div>;
  
  if (error) return (
    <div className="p-8">
      <h1 className="text-red-600">❌ Error: {error}</h1>
    </div>
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">🧪 Test Passaporti</h1>
      <p className="mb-4">Trovati {passports.length} passaporti:</p>
      
      {passports.map((passport, index) => (
        <div key={index} className="border p-4 mb-2 rounded">
          <p><strong>Numero:</strong> {passport.passportNumber}</p>
          <p><strong>Animale:</strong> {passport.animalName}</p>
          <p><strong>Proprietario:</strong> {passport.ownerName}</p>
          <p><strong>Attivo:</strong> {passport.isActive ? '✅' : '❌'}</p>
          <a 
            href={`/pets/${passport.passportNumber}`}
            className="text-blue-600 hover:underline"
          >
            → Vai al passaporto
          </a>
        </div>
      ))}
    </div>
  );
};

export default TestPetPassport; 