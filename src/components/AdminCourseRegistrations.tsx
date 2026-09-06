import React, { useState, useEffect } from 'react';
import { 
  getAllCourseRegistrations, 
  updateCourseRegistration, 
  deleteCourseRegistration,
  CourseRegistration 
} from '@/services/courseRegistrationService';
import { Timestamp } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Mail, Phone, Building, Calendar, MessageSquare, RefreshCw } from "lucide-react";
import { sendCourseRegistrationConfirmationEmail } from "@/utils/emailService";
import { COURSE_SLOTS, formatCourseSlotLabel } from "@/data/courseSlots";

const AdminCourseRegistrations = () => {
  const [registrations, setRegistrations] = useState<CourseRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<CourseRegistration | null>(null);
  const [editData, setEditData] = useState<CourseRegistration | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const { toast } = useToast();

  const timeSlots = COURSE_SLOTS.map((slot) => ({
    value: slot.value,
    label: formatCourseSlotLabel(slot, "it"),
  }));

  const paymentOptions = [
    "Bonifico bancario",
    "TWINT",
    "Contanti in sede",
  ];

  // Carica le iscrizioni
  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const data = await getAllCourseRegistrations();
      setRegistrations(data);
    } catch (error) {
      console.error('Errore nel caricamento delle iscrizioni:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le iscrizioni ai corsi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Apri dialog di modifica
  const handleEdit = (registration: CourseRegistration) => {
    setSelectedRegistration(registration);
    setEditData({ ...registration });
    setEditDialogOpen(true);
  };

  // Salva modifiche
  const handleSaveEdit = async () => {
    if (!editData || !editData.id) return;
    if (!editData.paymentMethod || !paymentOptions.includes(editData.paymentMethod)) {
      toast({
        title: "Pagamento obbligatorio",
        description: "Seleziona un metodo di pagamento valido prima di salvare.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateCourseRegistration(editData.id, {
        firstName: editData.firstName,
        lastName: editData.lastName,
        email: editData.email,
        phone: editData.phone,
        company: editData.company,
        timeSlot: editData.timeSlot,
        paymentMethod: editData.paymentMethod,
        message: editData.message,
        status: editData.status,
      });

      toast({
        title: "Successo",
        description: "Iscrizione aggiornata con successo.",
      });

      setEditDialogOpen(false);
      fetchRegistrations();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare l'iscrizione.",
        variant: "destructive",
      });
    }
  };

  // Apri dialog di eliminazione
  const handleDelete = (registration: CourseRegistration) => {
    setSelectedRegistration(registration);
    setDeleteDialogOpen(true);
  };

  // Conferma eliminazione
  const handleConfirmDelete = async () => {
    if (!selectedRegistration?.id) return;

    try {
      await deleteCourseRegistration(selectedRegistration.id);

      toast({
        title: "Successo",
        description: "Iscrizione eliminata con successo.",
      });

      setDeleteDialogOpen(false);
      fetchRegistrations();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'iscrizione.",
        variant: "destructive",
      });
    }
  };

  // Formatta data
  const formatDate = (date: Date | Timestamp) => {
    const d = date instanceof Timestamp ? date.toDate() : date;
    return d.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Invia o reinvia email di conferma/reminder al singolo studente
  const handleSendConfirmationEmail = async (registration: CourseRegistration) => {
    if (!registration.id) return;

    try {
      setSendingEmailId(registration.id);

      const slotLabel = timeSlots.find((s) => s.value === registration.timeSlot)?.label || registration.timeSlot;

      await sendCourseRegistrationConfirmationEmail({
        userEmail: registration.email,
        firstName: registration.firstName,
        lastName: registration.lastName,
        timeSlot: slotLabel,
        paymentMethod: registration.paymentMethod || "Da definire",
        registrationId: registration.id,
      });

      toast({
        title: "Email inviata",
        description: `Conferma/Reminder inviata a ${registration.firstName} ${registration.lastName}.`,
      });
    } catch (error) {
      console.error("Errore invio email conferma corso:", error);
      toast({
        title: "Errore invio email",
        description: "Non è stato possibile inviare la conferma. Riprova tra qualche secondo.",
        variant: "destructive",
      });
    } finally {
      setSendingEmailId(null);
    }
  };

  // Badge per lo stato
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confermato</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annullato</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline">In Attesa</Badge>;
    }
  };

  // Conta iscrizioni per slot
  const getSlotCount = (slotValue: string) => {
    return registrations.filter(r => r.timeSlot === slotValue && r.status !== 'cancelled').length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con statistiche */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Iscrizioni Corsi</h2>
          <p className="text-gray-600">Gestisci le iscrizioni al Corso Base di Stampa 3D</p>
        </div>
        <Button onClick={fetchRegistrations} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Ricarica
        </Button>
      </div>

      {/* Card con statistiche slot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {timeSlots.map((slot) => {
          const count = getSlotCount(slot.value);
          const isFull = count >= 6;
          return (
            <Card key={slot.value}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {slot.label.split(' (')[0]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-3xl font-bold ${isFull ? 'text-red-600' : 'text-green-600'}`}>
                    {count}
                  </span>
                  <span className="text-gray-500">/ 6 posti</span>
                </div>
                {isFull && <Badge variant="destructive" className="mt-2">Completo</Badge>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabella iscrizioni */}
      <Card>
        <CardHeader>
          <CardTitle>Tutte le Iscrizioni ({registrations.length})</CardTitle>
          <CardDescription>
            Visualizza e gestisci tutte le iscrizioni ricevute
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registrations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nessuna iscrizione trovata
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contatti</TableHead>
                    <TableHead>Azienda</TableHead>
                    <TableHead>Slot Selezionato</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Data Iscrizione</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell className="font-medium">
                        {registration.firstName} {registration.lastName}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <a href={`mailto:${registration.email}`} className="hover:underline text-blue-600">
                              {registration.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <a href={`tel:${registration.phone}`} className="hover:underline">
                              {registration.phone}
                            </a>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {registration.company ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Building className="w-3 h-3 text-gray-400" />
                            {registration.company}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {timeSlots.find(s => s.value === registration.timeSlot)?.label || registration.timeSlot}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {registration.paymentMethod ? (
                          registration.paymentMethod
                        ) : (
                          <Badge variant="outline" className="text-amber-700 border-amber-300">
                            Da definire
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(registration.status)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(registration.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendConfirmationEmail(registration)}
                            disabled={sendingEmailId === registration.id}
                            title="Invia conferma/reminder"
                          >
                            {sendingEmailId === registration.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Mail className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(registration)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(registration)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog di modifica */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifica Iscrizione</DialogTitle>
            <DialogDescription>
              Modifica i dati dell'iscrizione al corso
            </DialogDescription>
          </DialogHeader>
          {editData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">Nome</Label>
                  <Input
                    id="edit-firstName"
                    value={editData.firstName}
                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Cognome</Label>
                  <Input
                    id="edit-lastName"
                    value={editData.lastName}
                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Telefono</Label>
                  <Input
                    id="edit-phone"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-company">Azienda</Label>
                <Input
                  id="edit-company"
                  value={editData.company || ''}
                  onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-timeSlot">Slot Orario</Label>
                <Select
                  value={editData.timeSlot}
                  onValueChange={(value) => setEditData({ ...editData, timeSlot: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-paymentMethod">Modalità di pagamento</Label>
                <Select
                  value={editData.paymentMethod || ''}
                  onValueChange={(value) => setEditData({ ...editData, paymentMethod: value })}
                >
                  <SelectTrigger id="edit-paymentMethod">
                    <SelectValue placeholder="Seleziona metodo di pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Stato</Label>
                <Select
                  value={editData.status}
                  onValueChange={(value: any) => setEditData({ ...editData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">In Attesa</SelectItem>
                    <SelectItem value="confirmed">Confermato</SelectItem>
                    <SelectItem value="cancelled">Annullato</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-message">Note/Messaggio</Label>
                <Textarea
                  id="edit-message"
                  value={editData.message || ''}
                  onChange={(e) => setEditData({ ...editData, message: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleSaveEdit}>Salva Modifiche</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog di eliminazione */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma Eliminazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare l'iscrizione di{' '}
              <strong>
                {selectedRegistration?.firstName} {selectedRegistration?.lastName}
              </strong>
              ? Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annulla
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCourseRegistrations;
