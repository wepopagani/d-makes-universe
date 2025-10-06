import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminProjectsManager from '@/components/AdminProjectsManager';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AdminOrders = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [initialTab, setInitialTab] = useState<'projects' | 'quotes'>('projects');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'quotes') {
      setInitialTab('quotes');
    }
  }, [searchParams]);

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
            <h1 className="text-3xl font-bold">Gestione Ordini</h1>
            <p className="text-gray-600 mt-1">Visualizza e gestisci tutti gli ordini e preventivi</p>
          </div>
        </div>
        
        <AdminProjectsManager initialTab={initialTab} />
      </main>
      <Footer />
    </div>
  );
};

export default AdminOrders; 