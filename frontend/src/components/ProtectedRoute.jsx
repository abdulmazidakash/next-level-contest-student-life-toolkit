
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import Loader from "./Loader";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader/>;
  if (!user?.email) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

