import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import "./dashboard.css";

function Dashboard() {
  const { userRol } = useAuth();
  const navigate = useNavigate();

  // Estado para controlar la sección activa
  const [seccionActual, setSeccionActual] = useState("inicio");

  return (
    <div className="dashboard-layout">

      {/* BARRA LATERAL */}
      <aside className="dashboard-sidebar">

        <nav className="sidebar-menu">

          {/* Inicio */}
          <button
            className={`sidebar-link ${
              seccionActual === "inicio" ? "active" : ""
            }`}
            onClick={() => setSeccionActual("inicio")}
          >
            <span className="sidebar-icon">🏠</span>
            Inicio
          </button>

          {/* Rutas exclusivas del administrador */}
          {userRol === "Administrador (Dueño)" && (
            <>
              <button
                className="sidebar-link"
                onClick={() => navigate("/admin/registro")}
              >
                <span className="sidebar-icon">👥</span>
                Gestión de Personal
              </button>

              <button
                className="sidebar-link"
                onClick={() => navigate("/proveedores")}
              >
                <span className="sidebar-icon">🚚</span>
                Proveedores
              </button>

              <button
                className="sidebar-link"
                onClick={() => navigate("/productos")}
              >
                <span className="sidebar-icon">📦</span>
                Productos
              </button>

              <button
                className="sidebar-link"
                onClick={() => navigate("/clientes")}
              >
                <span className="sidebar-icon">👤</span>
                Clientes
              </button>

              <button
                className="sidebar-link"
                onClick={() => navigate("/ventas")}
              >
                <span className="sidebar-icon">💰</span> Ventas
              </button>

              <button
                className="sidebar-link"
                onClick={() => navigate("/reportes")}
              >
              <span className="sidebar-icon">📊</span> Reportes
              </button>

              <button
                className="sidebar-link"
                onClick={() => navigate("/admin/auditoria")}
              >
                <span className="sidebar-icon">📝</span>
                Auditoría de Logs
              </button>
            </>
          )}

        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="dashboard-main-content">

        <main className="dashboard-body">

          {seccionActual === "inicio" && (
            <div className="welcome-view">

              {/* Encabezado */}
              <div className="dashboard-welcome">
                <h1>Bienvenido al Sistema</h1>

                <p>
                  Utiliza el menú de navegación para gestionar la información
                  de tu papelería.
                </p>
              </div>

              {/* TARJETAS DE RESUMEN */}
              <section className="dashboard-cards">

                <div className="dashboard-card">
                  <div className="dashboard-card-icon">💰</div>
                  <div>
                    <h3>Ventas del día</h3>
                    <strong>$0</strong>
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="dashboard-card-icon">📦</div>
                  <div>
                    <h3>Productos</h3>
                    <strong>0</strong>
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="dashboard-card-icon">👥</div>
                  <div>
                    <h3>Clientes</h3>
                    <strong>0</strong>
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="dashboard-card-icon">🚚</div>
                  <div>
                    <h3>Proveedores</h3>
                    <strong>0</strong>
                  </div>
                </div>

              </section>

              {/* ACCIONES RÁPIDAS */}
              <section className="dashboard-section">

                <h2>Acciones rápidas</h2>

                <div className="quick-actions">

                  <button
                    onClick={() => navigate("/ventas")}
                    className="quick-action"
                  >
                    <span>💰</span>
                    <div>
                      <strong>Registrar venta</strong>
                      <small>Crear una nueva venta</small>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate("/clientes")}
                    className="quick-action"
                  >
                    <span>👤</span>
                    <div>
                      <strong>Registrar cliente</strong>
                      <small>Gestionar clientes</small>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate("/productos")}
                    className="quick-action"
                  >
                    <span>📦</span>
                    <div>
                      <strong>Gestionar productos</strong>
                      <small>Consultar inventario</small>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate("/proveedores")}
                    className="quick-action"
                  >
                    <span>🚚</span>
                    <div>
                      <strong>Gestionar proveedores</strong>
                      <small>Consultar proveedores</small>
                    </div>
                  </button>

                </div>

              </section>

              {/* PARTE INFERIOR */}
              <section className="dashboard-bottom">

                {/* Ventas recientes */}
                <div className="dashboard-panel">

                  <div className="panel-header">
                    <h2>Ventas recientes</h2>

                    <button onClick={() => navigate("/ventas")}>
                      Ver ventas
                    </button>
                  </div>

                  <div className="empty-dashboard">
                    <span>📊</span>
                    <p>
                      Aquí aparecerán las ventas recientes.
                    </p>
                  </div>

                </div>

                {/* Alertas */}
                <div className="dashboard-panel">

                  <div className="panel-header">
                    <h2>Alertas</h2>
                  </div>

                  <div className="empty-dashboard">
                    <span>⚠️</span>
                    <p>
                      No hay alertas pendientes.
                    </p>
                  </div>

                </div>

              </section>

            </div>
          )}

        </main>
      </div>

    </div>
  );
}

export default Dashboard;
