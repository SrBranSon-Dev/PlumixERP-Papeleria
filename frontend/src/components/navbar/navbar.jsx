import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; // Tu servicio Axios configurado
import logo from "../../images/Logo.png";
import "./navbar.css";

function Navbar() {
  const { isAuthenticated, logout, userRol } = useAuth();
  const navigate = useNavigate();

  // Estado para controlar si el menú de información está abierto o cerrado
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Estado local para almacenar la información de la cuenta actual
  const [perfil, setPerfil] = useState({
    username: "",
    email: "",
    telefono: "",
  });

  // Consultar de forma automática los datos del perfil a Django
  useEffect(() => {
    if (!isAuthenticated) return;

    const cargarDatosNavbar = async () => {
      try {
        const response = await api.get("perfil/");
        if (response.data) {
          setPerfil(response.data);
        }
      } catch (error) {
        console.error(
          "Error al cargar datos en la barra de navegación:",
          error,
        );
      }
    };

    cargarDatosNavbar();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    setMenuAbierto(false);
    navigate("/");
  };

  // Función para redirigir al tablero principal
  const irAlInicio = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  };

  return (
    <nav className="navbar-topbar">
      {/*  IZQUIERDA: Logotipo (Redirige al inicio al hacer clic) */}
      <div
        className="navbar-logo-container"
        onClick={irAlInicio}
        style={{ cursor: "pointer" }}
      >
        <img src={logo} alt="Logo" className="navbar-logo-img" />
        <span className="navbar-brand-text">PlumixERP</span>
      </div>

      {/* 👤 DERECHA: Información de la Cuenta (Solo si está logueado) */}
      {isAuthenticated && (
        <div className="navbar-profile-right">
          {/* BOTÓN INTERACTIVO: Al hacer clic se abre el menú desplegable */}
          <div
            className="navbar-user-trigger"
            onClick={() => setMenuAbierto(!menuAbierto)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              cursor: "pointer",
            }}
          >
            {/* Bloque de texto con el nombre de usuario y rol asignado */}
            <div className="navbar-user-text">
              <span className="navbar-username">
                {perfil.username || "Cargando..."}
              </span>
              <span className="navbar-user-role">{userRol || "Personal"}</span>
            </div>

            {/* Círculo de avatar clásico de perfil */}
            <div className="navbar-avatar-circle">
              {userRol === "Administrador (Dueño)" ? "jefe" : "dueño"}
            </div>
          </div>

          {/*  TARJETA FLOTANTE DE INFORMACIÓN DE CUENTA (DROPDOWN) */}
          {menuAbierto && (
            <div
              className="navbar-dropdown-menu"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dropdown-header">
                <h4>Información de la Cuenta</h4>
              </div>
              <div className="dropdown-body">
                <p>
                  <strong>Usuario:</strong> {perfil.username}
                </p>
                <p>
                  <strong>Correo:</strong> {perfil.email || "No registrado"}
                </p>
                <p>
                  <strong>Teléfono:</strong>{" "}
                  {perfil.telefono || "No registrado"}
                </p>
                <p>
                  <strong>Rango:</strong> {userRol}
                </p>
              </div>
              <div className="dropdown-footer">
                {/* CORREGIDO: Se quitó el botón azul y se conserva tu botón clásico gris */}
                <button
                  className="btn-navbar-logout"
                  onClick={handleLogout}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                   Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
