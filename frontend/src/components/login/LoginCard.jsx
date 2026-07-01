import { useState } from "react";
import "./logincard.css";
import initLogo from "../../images/InitLogo.png";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

function LoginCard() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("login/", {
        username,
        password,
      });

      console.log("Respuesta:", response.data);

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
    }
  };

  return (
    <div className="loginContainer">
      <div className="loginCard">
        <img src={initLogo} alt="PlumixERP" className="loginLogo" />
        <h2 className="loginSubtitle">Bienvenido a PlumixERP</h2>

        <form onSubmit={handleLogin}>
          <div className="inputGroup">
            <label>Correo electrónico</label>
          </div>
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <div className="inputGroup">
            <label>Contraseña</label>
          </div>
          <input
            type="password"
            placeholder="••••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
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
