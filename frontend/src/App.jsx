import "./App.css";

import Navbar from "./components/navbar/navbar";
import Footer from "./components/footer/footer";
import LoginCard from "./components/login/LoginCard";
import Chatbot from "./components/Chatbot";

import { Routes, Route, useLocation } from "react-router-dom";

import Dashboard from "./pages/dashboard/dashboard";

import ProtectedRoute from "./routes/ProtectedRoute";

import Proveedores from "./pages/Proveedores";
import Productos from "./pages/Productos";
import Clientes from "./pages/clientes/Clientes";
import Ventas from "./pages/Ventas";

// Rutas
import RegistroEmpleados from "./pages/registro_empleados/registro_empleados";
import AuditoriaLogs from "./pages/auditoria/auditoria_logs";

function App() {
  const location = useLocation();

  const showNavAndFooter = location.pathname !== "/";

  return (
    <div className="app">

      {showNavAndFooter && <Navbar />}

      <Routes>

        {/* Login */}
        <Route
          path="/"
          element={<LoginCard />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Registro de empleados */}
        <Route
          path="/admin/registro"
          element={
            <ProtectedRoute rolesPermitidos={["Administrador (Dueño)"]}>
              <RegistroEmpleados />
            </ProtectedRoute>
          }
        />

        {/* Auditoría */}
        <Route
          path="/admin/auditoria"
          element={
            <ProtectedRoute rolesPermitidos={["Administrador (Dueño)"]}>
              <AuditoriaLogs />
            </ProtectedRoute>
          }
        />

        {/* Proveedores */}
        <Route
          path="/proveedores"
          element={
            <ProtectedRoute>
              <Proveedores />
            </ProtectedRoute>
          }
        />

        {/* Productos */}
        <Route
          path="/productos"
          element={
            <ProtectedRoute>
              <Productos />
            </ProtectedRoute>
          }
        />

        {/* Clientes */}
        <Route
          path="/clientes"
          element={
            <ProtectedRoute>
              <Clientes />
            </ProtectedRoute>
          }
        />

        {/* Ventas */}
        <Route
          path="/ventas"
          element={
            <ProtectedRoute>
              <Ventas />
            </ProtectedRoute>
          }
        />

      </Routes>

      {showNavAndFooter && <Footer />}

      <Chatbot />

    </div>
  );
}

export default App;