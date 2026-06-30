import "./logincard.css";
import initLogo from "../../images/InitLogo.png";

function LoginCard() {
  return (
    <div className="loginContainer">
      <div className="loginCard">
        <img src={initLogo} alt="PlumixERP" className="loginLogo" />

        <form>
          <div className="inputGroup">
            <label>Correo electrónico</label>
            <input type="email" placeholder="Email" />
          </div>

          <div className="inputGroup">
            <label>Contraseña</label>
            <input type="password" placeholder="••••••••••••••" />
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
