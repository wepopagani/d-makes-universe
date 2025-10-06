import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModelViewerPreventivo } from '@/components/ModelViewer';
import { useToast } from '@/components/ui/use-toast';
import { db, storage } from '@/firebase/config';
import { deleteObject, ref } from 'firebase/storage';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { FileInfo } from '@/types/user';
import { AlertCircle, Download, Edit, Trash2 } from 'lucide-react';

interface ProjectFileViewerProps {
  file: FileInfo;
  onFileUpdated?: (updatedFile: FileInfo) => void;
  onFileDeleted?: (fileId: string) => void;
  readOnly?: boolean;
}

const ProjectFileViewer = ({ file, onFileUpdated, onFileDeleted, readOnly = false }: ProjectFileViewerProps) => {
  const { toast } = useToast();
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Split filename and extension for renaming
  const fileExtension = file.name.split('.').pop() || '';
  const fileNameWithoutExtension = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const [newFileName, setNewFileName] = useState(fileNameWithoutExtension);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileType = file.name.split('.').pop()?.toLowerCase() || '';
  const isModelFile = fileType === 'stl' || fileType === 'obj' || fileType === 'gltf' || fileType === 'glb' || fileType === '3mf';
  const isImageFile = fileType === 'jpg' || fileType === 'jpeg' || fileType === 'png' || fileType === 'gif' || fileType === 'webp';

  // Funzione per rinominare il file
  const handleRenameFile = async () => {
    if (!newFileName.trim()) {
      setError('Il nome del file non può essere vuoto');
      return;
    }

    // Create the full filename with original extension
    const fullNewFileName = `${newFileName}.${fileExtension}`;
    
    setLoading(true);
    setError(null);

    try {
      // Aggiorna il nome del file in Firestore
      await updateDoc(doc(db, 'files', file.id), {
        originalName: fullNewFileName
      });

      // Notifica la modifica
      if (onFileUpdated) {
        onFileUpdated({
          ...file,
          name: fullNewFileName
        });
      }

      toast({
        title: 'File rinominato',
        description: 'Il file è stato rinominato con successo.'
      });

      setIsRenameDialogOpen(false);
    } catch (error: any) {
      console.error('Errore durante la rinomina del file:', error);
      setError(`Errore: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Funzione per scaricare il file
  const handleDownloadFile = () => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast({
      title: 'Download avviato',
      description: 'Il download del file è stato avviato.'
    });
  };

  // Funzione per eliminare il file
  const handleDeleteFile = async () => {
    setLoading(true);

    try {
      // Elimina il file da Firebase Storage
      if (file.storagePath) {
        const storageRef = ref(storage, file.storagePath);
        await deleteObject(storageRef);
      }

      // Elimina il documento da Firestore
      await deleteDoc(doc(db, 'files', file.id));

      // Notifica l'eliminazione
      if (onFileDeleted) {
        onFileDeleted(file.id);
      }

      toast({
        title: 'File eliminato',
        description: 'Il file è stato eliminato con successo.'
      });

      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('Errore durante l\'eliminazione del file:', error);
      toast({
        title: 'Errore',
        description: `Errore: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base truncate flex justify-between items-center">
            <span className="truncate">{file.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Anteprima del file */}
          <div className="h-[250px] bg-gray-100 mb-2">
            {isModelFile ? (
              <ModelViewerPreventivo
                file={null}
                fileType={fileType}
                url={file.url}
              />
            ) : isImageFile ? (
              <div className="h-full w-full flex items-center justify-center">
                <img 
                  src={file.url} 
                  alt={file.name} 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <div className="text-center">
                  <FileIcon fileType={file.type} fileName={file.name} />
                  <p className="mt-2 text-sm text-gray-500">
                    Anteprima non disponibile
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Pulsanti azione */}
          {!readOnly && (
            <div className="flex justify-between p-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setIsRenameDialogOpen(true)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Rinomina
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handleDownloadFile}
              >
                <Download className="h-4 w-4 mr-1" />
                Scarica
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setIsDeleteDialogOpen(true)}
                style={{ color: 'var(--destructive)' }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Elimina
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog per rinominare il file */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rinomina file</DialogTitle>
            <DialogDescription>
              Inserisci il nuovo nome per il file (l'estensione .{fileExtension} rimarrà invariata)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="fileName">Nome file</Label>
            <div className="flex items-center mt-1">
              <Input 
                id="fileName" 
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="rounded-r-none"
              />
              <span className="px-3 py-2 bg-gray-100 border border-l-0 border-input rounded-r-md text-gray-500">
                .{fileExtension}
              </span>
            </div>
            {error && (
              <div className="mt-2 text-sm text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameDialogOpen(false)}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button
              onClick={handleRenameFile}
              disabled={loading}
            >
              {loading ? 'Salvataggio...' : 'Salva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog per eliminare il file */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Elimina file</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare questo file? Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteFile}
              disabled={loading}
            >
              {loading ? 'Eliminazione...' : 'Elimina'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Componente per mostrare l'icona appropriata in base al tipo di file
const FileIcon = ({ fileType, fileName }: { fileType: string, fileName: string }) => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (fileType === 'pdf' || extension === 'pdf') {
    return (
      <div className="rounded-md bg-red-100 p-3 text-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    );
  } else if (fileType === '3d' || ['stl', 'obj', '3mf', 'gltf', 'glb'].includes(extension)) {
    return (
      <div className="rounded-md bg-green-100 p-3 text-green-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
        </svg>
      </div>
    );
  } else {
    return (
      <div className="rounded-md bg-gray-100 p-3 text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }
};

export default ProjectFileViewer; 