import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, rolesPermitidos }) {
  const { isAuthenticated, userRol } = useAuth();

  // 1. Si no está logueado, lo manda al Login (Ruta URL raíz)
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 2. Si la ruta requiere roles específicos y el usuario no lo tiene,
  // lo redirige a la URL web del Dashboard
  if (rolesPermitidos && !rolesPermitidos.includes(userRol)) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Si cumple con todo, muestra la pantalla
  return children;
}

export default ProtectedRoute;
