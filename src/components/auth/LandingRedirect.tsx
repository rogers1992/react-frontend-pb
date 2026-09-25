import { Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { resolveLandingPath } from "../../utils/landing";

export default function LandingRedirect() {
  const { user } = useAuth();
  return <Navigate to={resolveLandingPath(user?.role?.permissions)} replace />;
}