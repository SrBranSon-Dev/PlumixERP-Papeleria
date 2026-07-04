import "./App.css";
import Navbar from "./components/navbar/navbar";
import Footer from "./components/footer/footer";
import LoginCard from "./components/login/LoginCard";
import { Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./pages/dashboard/dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";

// Rutas apuntando exactamente a tus subcarpetas
import RegistroEmpleados from "./pages/registro_empleados/registro_empleados";
import AuditoriaLogs from "./pages/auditoria/auditoria_logs";

function App() {
  const location = useLocation();

  // CORREGIDO: Compara contra "/" que es la ruta URL raíz del login en la web
  const showNavAndFooter = location.pathname !== "/";

  return (
    <div className="app">
      {/* Condicional para la Navbar */}
      {showNavAndFooter && <Navbar />}

      <Routes>
        {/* Ruta Pública de Acceso */}
        <Route path="/" element={<LoginCard />} />

        {/* Ruta Protegida General (Entran Dueño y Empleado) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* 🔒 Rutas Exclusivas para el Dueño de la papelería */}
        <Route
          path="/admin/registro"
          element={
            <ProtectedRoute rolesPermitidos={["Administrador (Dueño)"]}>
              <RegistroEmpleados />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/auditoria"
          element={
            <ProtectedRoute rolesPermitidos={["Administrador (Dueño)"]}>
              <AuditoriaLogs />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Condicional para el Footer */}
      {showNavAndFooter && <Footer />}
    </div>
  );
}

export default App;
