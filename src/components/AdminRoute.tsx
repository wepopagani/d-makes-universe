import { Navigate } from "react-router-dom";
import { useAuth } from "@/firebase/AuthContext";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { currentUser, isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }
  
  // Check if user is not authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // Check if the user is an admin using the context property
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  // If the user is an admin, render the protected content
  return <>{children}</>;
};

export default AdminRoute; 