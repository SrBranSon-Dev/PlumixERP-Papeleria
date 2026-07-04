import { useState } from "react";
import "./logincard.css";
import initLogo from "../../images/InitLogo.png";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function LoginCard() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 1. Enviamos las credenciales para obtener los tokens JWT
      const response = await api.post("login/", {
        username,
        password,
      });

      const { access, refresh } = response.data;

      // 2. Hacemos una petición rápida al endpoint de perfil usando el token obtenido
      // para saber si es el Dueño o un Empleado antes de cargar el Dashboard
      const perfilResponse = await api.get("perfil/", {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      const rolUsuario = perfilResponse.data.rol;

      console.log("Sesión iniciada con éxito. Rol detectado:", rolUsuario);

      // 3. Enviamos los tres datos al AuthContext actualizado para que los gestione
      login(access, refresh, rolUsuario);

      // 4. Redirigimos al Dashboard correspondiente
      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Error al iniciar sesión:",
        error.response?.data || error.message,
      );
      alert(error.response?.data?.detail || "Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="loginContainer">
      <div className="loginCard">
        <img src={initLogo} alt="PlumixERP" className="loginLogo" />
        <h2 className="loginSubtitle">Bienvenido a PlumixERP</h2>

        <form onSubmit={handleLogin}>
          {/* Grupo de Correo/Usuario */}
          <div className="inputGroup">
            <label>Usuario</label>
            <input
              type="text"
              placeholder="Escriba su usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Grupo de Contraseña */}
          <div className="inputGroup">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Recordar mi sesión */}
          <div className="rememberContainer">
            <label>
              <input type="checkbox" />
              Recordar mi sesión
            </label>
          </div>

          <button type="submit" className="loginButton">
            Iniciar sesión
          </button>
          <a href="/recuperar" className="forgotPassword">
            ¿Olvidaste tu contraseña?
          </a>
        </form>
      </div>
    </div>
  );
}

export default LoginCard;
