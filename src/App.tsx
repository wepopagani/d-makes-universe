import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/firebase/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import LogoSplashScreen from "@/components/LogoSplashScreen";
import SeoManager from "@/components/SeoManager";

const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Mission = lazy(() => import("./pages/Mission"));
const Services = lazy(() => import("./pages/Services"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPostPage = lazy(() => import("./pages/BlogPost"));
const Calculator = lazy(() => import("./pages/Calculator"));
const ContactSuccess = lazy(() => import("./pages/ContactSuccess"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const UserPanel = lazy(() => import("./components/UserPanel"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const FirebaseTest = lazy(() => import("./pages/FirebaseTest"));
const OrderForm = lazy(() => import("./pages/OrderForm"));
const AuthTest = lazy(() => import("./components/AuthTest"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));
const UserProjectDetails = lazy(() => import("./pages/UserProjectDetails"));
const UserFiles = lazy(() => import("./pages/UserFiles"));
const DatabaseSeeding = lazy(() => import("./pages/DatabaseSeeding"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminClients = lazy(() => import("./pages/AdminClients"));
const AdminQuotes = lazy(() => import("./pages/AdminQuotes"));
const AdminRevenue = lazy(() => import("./pages/AdminRevenue"));
const PetRegistrationPublic = lazy(() => import("./pages/PetRegistrationPublic"));
const PetAdmin = lazy(() => import("./pages/PetAdmin"));
const PetPassportSimple = lazy(() => import("./pages/PetPassportSimple"));
const TestPetPassport = lazy(() => import("./pages/TestPetPassport"));
const IscrizioneCorsi = lazy(() => import("./pages/IscrizioneCorsi"));
const DroneShop = lazy(() => import("./pages/DroneShop"));

const queryClient = new QueryClient();

const routeFallback = (
  <div className="min-h-[30vh] w-full bg-background" aria-hidden />
);

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <LogoSplashScreen />
          <Toaster />
          <Sonner />
          <SeoManager />
          <Suspense fallback={routeFallback}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/mission" element={<Mission />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:serviceId" element={<ServiceDetail />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPostPage />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/contact-success" element={<ContactSuccess />} />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route path="/firebase-test" element={<FirebaseTest />} />
              <Route path="/auth-test" element={<AuthTest />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/file"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/ordini"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/ordini/nuovo"
                element={
                  <ProtectedRoute>
                    <OrderForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/ordini/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/messaggi"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/profilo"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <UserPanel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                }
              />
              <Route
                path="/project/:id"
                element={
                  <AdminRoute>
                    <ProjectDetails />
                  </AdminRoute>
                }
              />
              <Route
                path="/user-project/:id"
                element={
                  <ProtectedRoute>
                    <UserProjectDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/new-order"
                element={
                  <ProtectedRoute>
                    <OrderForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user-files/:userId"
                element={
                  <AdminRoute>
                    <UserFiles />
                  </AdminRoute>
                }
              />
              <Route
                path="/database-seeding"
                element={
                  <AdminRoute>
                    <DatabaseSeeding />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <AdminRoute>
                    <AdminOrders />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/clients"
                element={
                  <AdminRoute>
                    <AdminClients />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/quotes"
                element={
                  <AdminRoute>
                    <AdminQuotes />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/revenue"
                element={
                  <AdminRoute>
                    <AdminRevenue />
                  </AdminRoute>
                }
              />

              <Route path="/pets" element={<PetRegistrationPublic />} />
              <Route path="/pets-admin" element={<PetAdmin />} />
              <Route path="/pets-test" element={<TestPetPassport />} />
              <Route path="/pets/:passportNumber" element={<PetPassportSimple />} />

              <Route path="/iscrizione-corsi" element={<IscrizioneCorsi />} />

              <Route path="/droni" element={<DroneShop />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
