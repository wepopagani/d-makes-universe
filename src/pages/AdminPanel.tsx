import React from 'react';
import AdminPanel from '@/components/AdminPanel';
import { useAuth } from '@/firebase/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AdminPanelPage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <AdminPanel />
      </main>
      <Footer />
    </div>
  );
};

export default AdminPanelPage;

