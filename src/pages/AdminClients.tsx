import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminUsersList from '@/components/AdminUsersList';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminClients = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna alla Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Gestione Clienti</h1>
            <p className="text-gray-600 mt-1">Visualizza e gestisci tutti i clienti registrati</p>
          </div>
        </div>
        
        <AdminUsersList />
      </main>
      <Footer />
    </div>
  );
};

export default AdminClients; 