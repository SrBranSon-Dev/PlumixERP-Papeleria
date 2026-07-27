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
      // 1. Enviar credenciales al backend
      const response = await api.post("login/", {
        username,
        password,
      });

      const { access, refresh } = response.data;

      console.log("ACCESS:", access);
      console.log("REFRESH:", refresh);

      // 2. Consultar el perfil usando el token recibido
      const perfilResponse = await api.get("perfil/", {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      const rolUsuario = perfilResponse.data.rol;

      console.log("ROL:", rolUsuario);

      // 3. Guardar sesión
      login(access, refresh, rolUsuario);

      // 4. Ir al Dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("ERROR COMPLETO:", error);

      if (error.response) {
        console.log("STATUS:", error.response.status);
        console.log("DATA:", error.response.data);

        alert(
          `Error ${error.response.status}\n\n${JSON.stringify(
            error.response.data,
            null,
            2,
          )}`,
        );
      } else {
        alert(error.message);
      }
    }
  };

  return (
    <div className="loginContainer">
      <div className="loginCard">
        <img src={initLogo} alt="PlumixERP" className="loginLogo" />

        <h2 className="loginSubtitle">Bienvenido a PlumixERP</h2>

        <form onSubmit={handleLogin}>
          <div className="inputGroup">
            <label>Usuario</label>
            <input
              type="text"
              placeholder="Escriba su usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="inputGroup">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

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
