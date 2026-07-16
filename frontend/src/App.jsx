import "./App.css";
import Navbar from "./components/navbar/navbar";
import Footer from "./components/footer/footer";
import LoginCard from "./components/login/LoginCard";
import { Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./pages/dashboard/dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import Proveedores from "./pages/Proveedores";

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

        <Route
          path="/"
          element={<LoginCard />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

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

        <Route
          path="/proveedores"
          element={
            <ProtectedRoute>
              <Proveedores />
            </ProtectedRoute>
          }
        />

      </Routes>

      {showNavAndFooter && <Footer />}

    </div>
  );
}

export default App;
