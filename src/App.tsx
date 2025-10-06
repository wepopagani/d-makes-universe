import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/firebase/AuthContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Mission from "./pages/Mission";
import Services from "./pages/Services";
import Blog from "./pages/Blog";
import BlogPostPage from "./pages/BlogPost";
import Calculator from "./pages/Calculator";
import ContactSuccess from "./pages/ContactSuccess";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import UserPanel from "./components/UserPanel";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import FirebaseTest from "./pages/FirebaseTest";
import OrderForm from "./pages/OrderForm";
import AuthTest from "./components/AuthTest";
import ProjectDetails from "./pages/ProjectDetails";
import UserProjectDetails from "./pages/UserProjectDetails";
import UserFiles from "./pages/UserFiles";
import DatabaseSeeding from "./pages/DatabaseSeeding";
import OrderDetails from "./pages/OrderDetails";
import AdminOrders from "./pages/AdminOrders";
import AdminClients from "./pages/AdminClients";
import AdminQuotes from "./pages/AdminQuotes";
import AdminRevenue from "./pages/AdminRevenue";
import PetRegistrationPublic from "./pages/PetRegistrationPublic";
import PetAdmin from "./pages/PetAdmin";
import PetPassportSimple from "./pages/PetPassportSimple";
import TestPetPassport from "./pages/TestPetPassport";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/mission" element={<Mission />} />
            <Route path="/services" element={<Services />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPostPage />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/contact-success" element={<ContactSuccess />} />
            
            {/* Authentication routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Testing routes */}
            <Route path="/firebase-test" element={<FirebaseTest />} />
            <Route path="/auth-test" element={<AuthTest />} />
            
            {/* Protected routes */}
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
            
            {/* Pet Passport routes - COMPLETAMENTE PUBBLICO */}
            <Route path="/pets" element={<PetRegistrationPublic />} />
            <Route path="/pets-admin" element={<PetAdmin />} />
            <Route path="/pets-test" element={<TestPetPassport />} />
            <Route path="/pets/:passportNumber" element={<PetPassportSimple />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
