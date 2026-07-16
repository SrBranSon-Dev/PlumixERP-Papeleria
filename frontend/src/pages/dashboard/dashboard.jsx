import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import "./dashboard.css"; // Archivo de estilos limpio

function Dashboard() {
  const { userRol } = useAuth();
  const navigate = useNavigate();

  // Estado para controlar la sección activa
  const [seccionActual, setSeccionActual] = useState("inicio");

  return (
    <div className="dashboard-layout">
      {/* 🧭 1. BARRA LATERAL FIJA (SIDEBAR A LA IZQUIERDA) */}
      <aside className="dashboard-sidebar">
        {/* CORREGIDO: Se eliminó el bloque de marca 'PlumixERP' en texto rojo que estaba aquí */}
        <nav className="sidebar-menu">
          {/* Botón de Inicio */}
          <button
            className={`sidebar-link ${seccionActual === "inicio" ? "active" : ""}`}
            onClick={() => setSeccionActual("inicio")}
          >
            <span className="sidebar-icon">🏠</span> Inicio
          </button>

          {/* 🔒 Rutas exclusivas del administrador */}
          {userRol === "Administrador (Dueño)" && (
            <>
              <button
                className="sidebar-link"
                onClick={() => navigate("/admin/registro")}
              >
                <span className="sidebar-icon">👥</span> Gestión de Personal
              </button>

              <button
                className="sidebar-link"
                onClick={() => navigate("/admin/auditoria")}
              >
                <span className="sidebar-icon">📝</span> Auditoría de Logs
              </button>
              <button
                className="sidebar-link"
                onClick={() => navigate("/proveedores")}
              >
                <span className="sidebar-icon">🚚</span> Proveedores
              </button>

            </>
          )}
        </nav>
      </aside>

      {/* 💻 CONTENEDOR DERECHO LIMPIO */}
      <div className="dashboard-main-content">
        {/* 🏢 ÁREA DE TRABAJO DINÁMICA */}
        <main className="dashboard-body">
          {seccionActual === "inicio" && (
            <div className="welcome-view">
              {/* CORREGIDO: Se eliminó por completo el saludo y la tarjeta con el correo, teléfono y estado */}
              <h1>Bienvenido al Sistema</h1>
              <p>
                Utiliza el menú de navegación de la izquierda para comenzar a
                trabajar en las herramientas de tu turno.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
