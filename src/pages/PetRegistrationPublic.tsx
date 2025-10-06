import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPetPassport } from '@/firebase/petPassportService';

const PetRegistrationPublic = () => {
  const [formData, setFormData] = useState({
    animalName: '',
    breed: '',
    ownerName: '',
    phone: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [generatedNumber, setGeneratedNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const requiredFields = ['animalName', 'breed', 'ownerName', 'phone', 'address'];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData].trim()) {
        setError(`Il campo ${field} è obbligatorio`);
        return false;
      }
    }

    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Inserisci un numero di telefono valido (es. +41791234567)');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log('🚀 Creazione passaporto pubblico...');
      
      const passportNumber = await createPetPassport({
        animalName: formData.animalName.trim(),
        breed: formData.breed.trim(),
        ownerName: formData.ownerName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        isActive: true
      });

      console.log('✅ Passaporto creato:', passportNumber);
      setGeneratedNumber(passportNumber);
    } catch (error) {
      console.error('💥 Errore nella creazione:', error);
      setError('Errore nella creazione del passaporto. Riprova più tardi.');
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
    setError(null);
  };

  if (generatedNumber) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ maxWidth: '500px', width: '100%' }}>
          <div style={{
            background: '#ecfdf5',
            border: '2px solid #10b981',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
            <h1 style={{ margin: '0 0 16px', color: '#065f46', fontSize: '24px' }}>
              Passaporto Creato!
            </h1>
            <p style={{ color: '#047857', marginBottom: '24px' }}>
              Il passaporto digitale è stato generato con successo
            </p>
            
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '2px solid #10b981',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📱</div>
              <p style={{ margin: '0 0 8px', color: '#6b7280', fontSize: '14px' }}>Numero Passaporto</p>
              <p style={{ margin: '0 0 16px', fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
                {generatedNumber}
              </p>
              <div style={{ 
                background: '#f3f4f6', 
                padding: '12px', 
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#374151'
              }}>
                https://3dmakes.ch/pets/{generatedNumber}
              </div>
            </div>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              <button
                onClick={() => navigate(`/pets/${generatedNumber}`)}
                style={{
                  padding: '12px 24px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🔍 Visualizza Passaporto
              </button>
              
              <button
                onClick={resetForm}
                style={{
                  padding: '12px 24px',
                  background: 'white',
                  color: '#374151',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ➕ Crea Altro Passaporto
              </button>
            </div>
          </div>
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
        <div style={{
          background: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            color: 'white',
            padding: '24px',
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '20px',
              width: '48px',
              height: '48px',
              background: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1e40af',
              fontWeight: 'bold',
              fontSize: '12px'
            }}>
              3DM
            </div>
            <h1 style={{ margin: '20px 0 8px', fontSize: '24px' }}>Registra Passaporto</h1>
            <p style={{ margin: 0, opacity: 0.9 }}>Crea un passaporto digitale pubblico</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '24px',
                color: '#dc2626'
              }}>
                ❌ {error}
              </div>
            )}

            {/* Dati Animale */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                color: '#1e40af', 
                borderBottom: '2px solid #3b82f6',
                paddingBottom: '8px',
                marginBottom: '16px'
              }}>
                🐕 Dati Animale
              </h3>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                    Nome Animale *
                  </label>
                  <input
                    name="animalName"
                    type="text"
                    value={formData.animalName}
                    onChange={handleInputChange}
                    placeholder="es. Buddy"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                    Razza *
                  </label>
                  <input
                    name="breed"
                    type="text"
                    value={formData.breed}
                    onChange={handleInputChange}
                    placeholder="es. Golden Retriever"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Dati Proprietario */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                color: '#1e40af', 
                borderBottom: '2px solid #3b82f6',
                paddingBottom: '8px',
                marginBottom: '16px'
              }}>
                👤 Dati Proprietario
              </h3>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                    Nome Completo *
                  </label>
                  <input
                    name="ownerName"
                    type="text"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    placeholder="es. Mario Rossi"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                    Numero di Telefono *
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="es. +41791234567"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                    Indirizzo Completo *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="es. Via Example 123, 6918Lugano, Svizzera"
                    rows={3}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px',
                background: isLoading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? '⏳ Creazione in corso...' : '🎯 Crea Passaporto Pubblico'}
            </button>

            <div style={{ 
              marginTop: '16px', 
              padding: '16px',
              background: '#f0f9ff',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#1e40af'
            }}>
              <p style={{ margin: '0 0 8px', fontWeight: '600' }}>🌐 Passaporto Pubblico</p>
              <p style={{ margin: 0 }}>
                Il passaporto sarà <strong>pubblicamente accessibile</strong> tramite un numero univoco.
                Perfetto per tag NFC per animali smarriti.
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '16px',
          padding: '16px',
          background: 'rgba(255,255,255,0.8)',
          borderRadius: '8px'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
            Powered by <strong style={{ color: '#3b82f6' }}>3DMAKES</strong> | 
            <a href="https://3dmakes.ch" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              3dmakes.ch
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PetRegistrationPublic; 