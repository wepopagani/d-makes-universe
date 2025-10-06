import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, DollarSign, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RevenueData {
  id: string;
  clientEmail: string;
  totalAmount: number;
  paymentStatus: string;
  productionStatus: string;
  createdAt: Date;
  orderName: string;
}

const AdminRevenue = () => {
  const navigate = useNavigate();
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    paidOrders: 0,
    pendingPayments: 0,
    averageOrderValue: 0
  });

  useEffect(() => {
    fetchRevenueData();
  }, [selectedPeriod]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      
      let revenueQuery = query(
        collection(db, "orders"),
        where("isOrder", "==", true),
        where("totalAmount", ">", 0),
        orderBy("createdAt", "desc")
      );

      const revenueSnapshot = await getDocs(revenueQuery);
      const revenueList: RevenueData[] = [];
      
      let totalRevenue = 0;
      let monthlyRevenue = 0;
      let paidOrders = 0;
      let pendingPayments = 0;
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      revenueSnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
        
        // Filtro per periodo
        if (selectedPeriod !== 'all') {
          const orderMonth = createdAt.getMonth();
          const orderYear = createdAt.getFullYear();
          
          if (selectedPeriod === 'month' && (orderMonth !== currentMonth || orderYear !== currentYear)) {
            return;
          }
          
          if (selectedPeriod === 'year' && orderYear !== currentYear) {
            return;
          }
        }
        
        const revenue: RevenueData = {
          id: doc.id,
          clientEmail: data.clientEmail || data.userEmail || 'N/A',
          totalAmount: data.totalAmount || 0,
          paymentStatus: data.paymentStatus || 'da_pagare',
          productionStatus: data.productionStatus || 'non_iniziato',
          createdAt: createdAt,
          orderName: data.orderName || 'Ordine senza nome'
        };
        
        revenueList.push(revenue);
        
        // Calcola statistiche
        totalRevenue += revenue.totalAmount;
        
        if (createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear) {
          monthlyRevenue += revenue.totalAmount;
        }
        
        if (revenue.paymentStatus.includes('pagato')) {
          paidOrders++;
        } else {
          pendingPayments++;
        }
      });
      
      const averageOrderValue = revenueList.length > 0 ? totalRevenue / revenueList.length : 0;
      
      setRevenueData(revenueList);
      setStats({
        totalRevenue,
        monthlyRevenue,
        paidOrders,
        pendingPayments,
        averageOrderValue
      });
      
    } catch (error) {
      console.error('Errore durante il caricamento dei dati di fatturato:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const getPaymentStatusColor = (status: string) => {
    if (status.includes('pagato')) {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-red-100 text-red-800';
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'da_pagare':
        return 'Da pagare';
      case 'pagato_carta':
        return 'Pagato (carta)';
      case 'pagato_contanti':
        return 'Pagato (contanti)';
      case 'pagato_twint':
        return 'Pagato (Twint)';
      default:
        return 'Sconosciuto';
    }
  };

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
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Gestione Fatturato</h1>
            <p className="text-gray-600 mt-1">Visualizza e analizza i dati di fatturato e pagamenti</p>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutto</SelectItem>
              <SelectItem value="month">Questo mese</SelectItem>
              <SelectItem value="year">Quest'anno</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fatturato Totale</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                Periodo selezionato
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fatturato Mensile</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                Questo mese
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ordini Pagati</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.paidOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingPayments} in attesa di pagamento
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valore Medio Ordine</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</div>
              <p className="text-xs text-muted-foreground">
                Media per ordine
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabella dettagliata */}
        <Card>
          <CardHeader>
            <CardTitle>Dettaglio Ordini</CardTitle>
            <CardDescription>
              Elenco dettagliato di tutti gli ordini con fatturato
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div>
              </div>
            ) : revenueData.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ordine</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Importo</TableHead>
                      <TableHead>Stato Pagamento</TableHead>
                      <TableHead>Stato Produzione</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueData.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.orderName}
                        </TableCell>
                        <TableCell>
                          {order.clientEmail}
                        </TableCell>
                        <TableCell>
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {getPaymentStatusText(order.paymentStatus)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {order.productionStatus === 'non_iniziato' ? 'Da iniziare' : 
                             order.productionStatus === 'in_corso' ? 'In produzione' : 
                             order.productionStatus === 'completato' ? 'Completato' : 
                             'In attesa'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-gray-500">Nessun dato di fatturato trovato.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Gli ordini con importi confermati appariranno qui.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminRevenue; 