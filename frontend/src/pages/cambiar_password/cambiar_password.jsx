import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./cambiar_password.css";

function CambiarPassword() {
  const navigate = useNavigate();

  const [passwordActual, setPasswordActual] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (
      !passwordActual ||
      !nuevaPassword ||
      !confirmarPassword
    ) {
      setError("Debes completar todos los campos.");
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError("Las nuevas contraseñas no coinciden.");
      return;
    }

    setCargando(true);

    try {
      const response = await api.post("cambiar-password/", {
        password_actual: passwordActual,
        nueva_password: nuevaPassword,
        confirmar_password: confirmarPassword,
      });

      setMensaje(response.data.mensaje);

      setPasswordActual("");
      setNuevaPassword("");
      setConfirmarPassword("");

    } catch (error) {
      const mensajeError =
        error.response?.data?.mensaje ||
        "No fue posible cambiar la contraseña.";

      setError(
        Array.isArray(mensajeError)
          ? mensajeError.join(" ")
          : mensajeError
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="cambiar-password-page">

      <div className="cambiar-password-card">

        <h1>Cambiar contraseña</h1>

        <p className="cambiar-password-description">
          Actualiza tu contraseña de acceso a PlumixERP.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="password-field">
            <label htmlFor="passwordActual">
              Contraseña actual
            </label>

            <input
              id="passwordActual"
              type="password"
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              placeholder="Ingresa tu contraseña actual"
            />
          </div>

          <div className="password-field">
            <label htmlFor="nuevaPassword">
              Nueva contraseña
            </label>

            <input
              id="nuevaPassword"
              type="password"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              placeholder="Ingresa tu nueva contraseña"
            />
          </div>

          <div className="password-field">
            <label htmlFor="confirmarPassword">
              Confirmar nueva contraseña
            </label>

            <input
              id="confirmarPassword"
              type="password"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              placeholder="Confirma tu nueva contraseña"
            />
          </div>

          {error && (
            <div className="password-message password-error">
              {error}
            </div>
          )}

          {mensaje && (
            <div className="password-message password-success">
              {mensaje}
            </div>
          )}

          <button
            type="submit"
            className="btn-cambiar-password"
            disabled={cargando}
          >
            {cargando
              ? "Cambiando..."
              : "Cambiar contraseña"}
          </button>

          <button
            type="button"
            className="btn-cancelar-password"
            onClick={() => navigate("/dashboard")}
          >
            Cancelar
          </button>

        </form>

      </div>

    </div>
  );
}

export default CambiarPassword;