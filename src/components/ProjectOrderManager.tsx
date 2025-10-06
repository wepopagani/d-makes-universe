import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Order, OrderItem, FileInfo, Project, UserProfileData } from '@/types/user';
import { Plus, FileText } from 'lucide-react';

interface ProjectOrderManagerProps {
  projectId: string;
}

const ProjectOrderManager: React.FC<ProjectOrderManagerProps> = ({ projectId }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<UserProfileData | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  
  // New order state
  const [newOrderItems, setNewOrderItems] = useState<Partial<OrderItem>[]>([]);
  const [orderNotes, setOrderNotes] = useState('');
  
  // Materials and options
  const materials = ['PLA', 'PETG', 'ABS', 'TPU', 'Resina Standard', 'Resina Engineering'];
  const colors = ['Bianco', 'Nero', 'Grigio', 'Rosso', 'Blu', 'Verde', 'Giallo', 'Arancione', 'Trasparente'];
  const resolutions = ['0.1mm', '0.2mm', '0.3mm', '0.05mm (Resina)'];
  
  // Load project data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch project
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        
        if (!projectDoc.exists()) {
          toast({
            title: t('common.error'),
            description: t('projects.projectNotFound'),
            variant: "destructive"
          });
          return;
        }
        
        const projectData = projectDoc.data();
        const project: Project = {
          id: projectDoc.id,
          name: projectData.name,
          description: projectData.description,
          status: projectData.status,
          userId: projectData.userId,
          files: projectData.files || [],
          thumbnailUrl: projectData.thumbnailUrl,
          notes: projectData.notes,
          paymentStatus: projectData.paymentStatus || 'pending',
          createdAt: projectData.createdAt instanceof Timestamp ? projectData.createdAt.toDate() : new Date(),
          updatedAt: projectData.updatedAt instanceof Timestamp ? projectData.updatedAt.toDate() : new Date(),
        };
        
        setProject(project);
        
        // Fetch client
        const clientDoc = await getDoc(doc(db, 'users', project.userId));
        if (clientDoc.exists()) {
          setClient({ id: clientDoc.id, ...clientDoc.data() } as UserProfileData);
        }
        
        // Fetch project files
        const filesData: FileInfo[] = [];
        
        for (const fileId of project.files) {
          const fileDoc = await getDoc(doc(db, 'files', fileId));
          if (fileDoc.exists()) {
            const data = fileDoc.data();
            filesData.push({
              id: fileDoc.id,
              name: data.originalName || data.name,
              type: data.type,
              url: data.url,
              thumbnailUrl: data.thumbnailUrl,
              storagePath: data.storagePath,
              uploadedAt: data.uploadedAt instanceof Timestamp ? data.uploadedAt.toDate() : new Date(),
              userId: data.userId
            });
          }
        }
        
        setFiles(filesData);
        
        // Initialize a new order item for each STL file
        const initialOrderItems = filesData
          .filter(file => file.type === '3d')
          .map(file => ({
            fileId: file.id,
            fileName: file.name,
            fileUrl: file.url,
            quantity: 1,
            material: 'PLA',
            color: t('common.white'),
            resolution: '0.2mm',
            price: 0,
          }));
        
        setNewOrderItems(initialOrderItems);
        
        // Fetch orders related to this project
        const ordersQuery = query(
          collection(db, 'orders'),
          where('projectId', '==', projectId)
        );
        
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersList: Order[] = [];
        
        ordersSnapshot.forEach((doc) => {
          const data = doc.data();
          ordersList.push({
            id: doc.id,
            userId: data.userId,
            status: data.status,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
            items: data.items,
            totalAmount: data.totalAmount,
            paymentStatus: data.paymentStatus,
            shippingAddress: data.shippingAddress,
          });
        });
        
        setOrders(ordersList);
      } catch (error) {
        console.error("Error fetching project data:", error);
        toast({
          title: t('common.error'),
          description: t('common.errorLoadingData'),
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, toast, t]);
  
  // Handle item price change
  const handleItemPriceChange = (index: number, price: string) => {
    const numPrice = parseFloat(price);
    
    setNewOrderItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        price: isNaN(numPrice) ? 0 : numPrice
      };
      return updated;
    });
  };
  
  // Handle item quantity change
  const handleItemQuantityChange = (index: number, quantity: string) => {
    const numQuantity = parseInt(quantity);
    
    setNewOrderItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        quantity: isNaN(numQuantity) ? 1 : Math.max(1, numQuantity)
      };
      return updated;
    });
  };
  
  // Calculate total order amount
  const calculateTotal = () => {
    return newOrderItems.reduce((total, item) => {
      return total + ((item.price || 0) * (item.quantity || 1));
    }, 0);
  };
  
  // Create a new order
  const handleCreateOrder = async () => {
    if (!project || !client || newOrderItems.length === 0) {
      toast({
        title: t('common.error'),
        description: t('orders.missingDataError'),
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Ensure all required fields are present
      const finalOrderItems: OrderItem[] = newOrderItems.map((item, index) => ({
        id: `item-${index}`,
        fileId: item.fileId || '',
        fileName: item.fileName || '',
        fileUrl: item.fileUrl || '',
        quantity: item.quantity || 1,
        material: item.material || 'PLA',
        color: item.color || t('common.white'),
        resolution: item.resolution || '0.2mm',
        price: item.price || 0,
        notes: item.notes
      }));
      
      // Create shipping address from client data
      const shippingAddress = {
        nome: client.nome,
        cognome: client.cognome,
        indirizzo: client.indirizzo,
        citta: client.citta,
        cap: client.cap,
        telefono: client.telefono
      };
      
      // Calculate total amount
      const totalAmount = finalOrderItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
      
      // Create order document
      const orderDoc = await addDoc(collection(db, 'orders'), {
        userId: project.userId,
        projectId: project.id,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        items: finalOrderItems,
        totalAmount,
        paymentStatus: 'pending',
        shippingAddress,
        notes: orderNotes
      });
      
      // Add the new order to state
      const newOrder: Order = {
        id: orderDoc.id,
        userId: project.userId,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        items: finalOrderItems,
        totalAmount,
        paymentStatus: 'pending',
        shippingAddress
      };
      
      setOrders([...orders, newOrder]);
      
      // Reset form
      setOrderNotes('');
      
      // Close dialog
      setIsCreateOrderOpen(false);
      
      toast({
        title: t('orders.orderCreated'),
        description: t('orders.orderCreatedSuccess')
      });
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: t('common.error'),
        description: t('orders.errorCreatingOrder'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };
  
  // Get status badge class
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get payment status badge class
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('orders.projectOrders')}</CardTitle>
          <CardDescription>
            {t('orders.manageProjectOrders')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{project?.name}</h3>
                  <p className="text-sm text-gray-500">
                    {t('orders.client')}: {client ? `${client.nome} ${client.cognome}` : t('projects.notSpecified')}
                  </p>
                </div>
                <Button onClick={() => setIsCreateOrderOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('orders.newOrder')}
                </Button>
              </div>
              
              {orders.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('orders.orderNumber')}</TableHead>
                        <TableHead>{t('common.date')}</TableHead>
                        <TableHead>{t('orders.status')}</TableHead>
                        <TableHead>{t('orders.payment')}</TableHead>
                        <TableHead>{t('orders.total')}</TableHead>
                        <TableHead>{t('common.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(order.status)}`}>
                              {t(`status.${order.status}`)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusBadge(order.paymentStatus)}`}>
                              {t(`status.${order.paymentStatus}`)}
                            </span>
                          </TableCell>
                          <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              {t('orders.orderDetails')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 border rounded-md">
                  <FileText className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <h3 className="font-medium text-lg mb-2">{t('orders.noOrdersFound')}</h3>
                  <p className="text-gray-500 mb-4">
                    {t('orders.noOrdersDescription')}
                  </p>
                  <Button onClick={() => setIsCreateOrderOpen(true)}>
                    {t('orders.createNewOrder')}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Create Order Dialog */}
      <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('orders.newOrder')}</DialogTitle>
            <DialogDescription>
              {t('orders.createOrderDescription')} {project?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-3 max-h-[600px] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <div>
                <p className="font-medium">{t('orders.client')}</p>
                <p className="text-gray-500">
                  {client ? `${client.nome} ${client.cognome}` : t('projects.notSpecified')}
                </p>
              </div>
              <div>
                <p className="font-medium">{t('contact.info.address')}</p>
                <p className="text-gray-500">
                  {client ? `${client.indirizzo}, ${client.citta} ${client.cap}` : t('projects.notSpecified')}
                </p>
              </div>
            </div>
            
            {/* Files/Items Table */}
            <div>
              <h3 className="text-lg font-medium mb-3">{t('orders.itemsToPrint')}</h3>
              
              {newOrderItems.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('orders.stlFile')}</TableHead>
                        <TableHead>{t('calculator.material')}</TableHead>
                        <TableHead>{t('orders.color')}</TableHead>
                        <TableHead>{t('orders.resolution')}</TableHead>
                        <TableHead>{t('calculator.quantity')}</TableHead>
                        <TableHead>{t('orders.priceCHF')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newOrderItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.fileName}</TableCell>
                          <TableCell>
                            <Select 
                              value={item.material}
                              onValueChange={(value) => {
                                const updated = [...newOrderItems];
                                updated[index] = {...updated[index], material: value};
                                setNewOrderItems(updated);
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('common.select')} />
                              </SelectTrigger>
                              <SelectContent>
                                {materials.map((material) => (
                                  <SelectItem key={material} value={material}>
                                    {material}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={item.color}
                              onValueChange={(value) => {
                                const updated = [...newOrderItems];
                                updated[index] = {...updated[index], color: value};
                                setNewOrderItems(updated);
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('common.select')} />
                              </SelectTrigger>
                              <SelectContent>
                                {colors.map((color) => (
                                  <SelectItem key={color} value={color}>
                                    {color}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={item.resolution}
                              onValueChange={(value) => {
                                const updated = [...newOrderItems];
                                updated[index] = {...updated[index], resolution: value};
                                setNewOrderItems(updated);
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('common.select')} />
                              </SelectTrigger>
                              <SelectContent>
                                {resolutions.map((resolution) => (
                                  <SelectItem key={resolution} value={resolution}>
                                    {resolution}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              min="1"
                              value={item.quantity || 1}
                              onChange={(e) => handleItemQuantityChange(index, e.target.value)}
                              className="w-16"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price || 0}
                              onChange={(e) => handleItemPriceChange(index, e.target.value)}
                              className="w-24"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-bold">
                          {t('orders.total')}:
                        </TableCell>
                        <TableCell colSpan={2} className="font-bold">
                          {formatCurrency(calculateTotal())}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 border rounded-md bg-gray-50">
                  <p className="text-gray-500">
                    {t('orders.noStlFiles')}
                  </p>
                </div>
              )}
            </div>
            
            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="order-notes">{t('projects.notes')}</Label>
              <Textarea
                id="order-notes"
                placeholder={t('orders.addProductionNotes')}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOrderOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreateOrder} disabled={loading || newOrderItems.length === 0}>
              {t('orders.createOrder')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectOrderManager; 