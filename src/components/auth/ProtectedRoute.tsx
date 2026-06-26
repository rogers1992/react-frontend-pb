import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-brand-500">Cargando.....</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to sign-in page if not authenticated
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
