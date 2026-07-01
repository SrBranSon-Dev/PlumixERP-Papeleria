import "./App.css";
import Navbar from "./components/navbar/navbar";
import Footer from "./components/footer/footer";
import LoginCard from "./components/login/LoginCard";
import { Routes, Route, useLocation } from "react-router-dom"; // Asegúrate de importar useLocation aquí si da error
import Dashboard from "./pages/dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  const location = useLocation();

  // Esta variable será true solo si NO estás en la ruta raíz (Login)
  const showNavAndFooter = location.pathname !== "/";

  return (
    <div className="app">
      {/* Condicional para la Navbar */}
      {showNavAndFooter && <Navbar />}

      <Routes>
        <Route path="/" element={<LoginCard />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
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
