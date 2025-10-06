import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, getDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { FileInfo, UserProfileData } from '@/types/user';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { File, FileText, ArrowLeft, Download, Box, Image } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const UserFiles = () => {
  const { t } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);

  useEffect(() => {
    const fetchUserAndFiles = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        
        // Fetch user data
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfileData;
          setUser({
            id: userDoc.id,
            ...userData
          });
        } else {
          toast({
            title: t('common.error'),
            description: t('userFiles.userNotFound'),
            variant: "destructive",
          });
          navigate('/admin');
          return;
        }

        // Fetch user files
        const filesQuery = query(
          collection(db, 'files'),
          where('userId', '==', userId),
          orderBy('uploadedAt', 'desc')
        );
        
        const filesSnapshot = await getDocs(filesQuery);
        const filesData: FileInfo[] = [];
        
        filesSnapshot.forEach((doc) => {
          const data = doc.data();
          filesData.push({
            id: doc.id,
            name: data.originalName || data.name,
            type: data.type,
            url: data.url,
            thumbnailUrl: data.thumbnailUrl,
            storagePath: data.storagePath,
            uploadedAt: data.uploadedAt.toDate(),
            userId: data.userId
          });
        });
        
        setFiles(filesData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: t('common.error'),
          description: t('userFiles.unableToLoadData'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndFiles();
  }, [userId, navigate, toast, t]);

  // Format date
  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType === 'image') {
      return <Image className="h-4 w-4" />;
    } else if (fileType === '3d') {
      return <Box className="h-4 w-4" />;
    } else {
      return <FileText className="h-4 w-4" />;
    }
  };

  // Preview file
  const handlePreviewFile = (file: FileInfo) => {
    window.open(file.url, '_blank');
  };

  // Download file
  const handleDownloadFile = (file: FileInfo) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getFileTypeDisplay = (fileType: string) => {
    if (fileType === 'image') {
      return t('userFiles.fileTypes.image');
    } else if (fileType === '3d') {
      return t('userFiles.fileTypes.model3d');
    } else {
      return t('userFiles.fileTypes.document');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-accent mx-auto mb-4"></div>
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 md:py-10" style={{backgroundColor: '#E4DDD4'}}>
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> {t('userFiles.backToUserList')}
            </Button>
            
            {loading ? (
              <div className="h-8 w-80 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <h1 className="text-2xl font-bold">
                {t('userFiles.title', { 
                  userName: user?.isAzienda ? user.azienda : `${user?.nome} ${user?.cognome}` 
                })}
              </h1>
            )}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('userFiles.uploadedFiles')}</CardTitle>
              <CardDescription>
                {t('userFiles.viewUploadedFiles')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-60 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-10">
                  <Box className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {t('userFiles.noFiles')}
                  </h3>
                  <p className="text-gray-500">
                    {t('userFiles.noFilesDescription')}
                  </p>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableCaption>{t('userFiles.totalFiles', { count: files.length })}</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('userFiles.table.fileName')}</TableHead>
                        <TableHead>{t('userFiles.table.type')}</TableHead>
                        <TableHead>{t('userFiles.table.uploadDate')}</TableHead>
                        <TableHead className="text-right">{t('userFiles.table.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {files.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              {getFileIcon(file.type)}
                              <span className="ml-2">{file.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getFileTypeDisplay(file.type)}
                          </TableCell>
                          <TableCell>
                            {formatDate(file.uploadedAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handlePreviewFile(file)}
                              >
                                {t('userFiles.actions.preview')}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDownloadFile(file)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                {t('userFiles.actions.download')}
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserFiles; 