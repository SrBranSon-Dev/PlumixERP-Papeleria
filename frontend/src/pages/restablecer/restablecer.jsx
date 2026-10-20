import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "./restablecer.css";

function RestablecerPassword() {
  const navigate = useNavigate();
  const { uid, token } = useParams();

  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (!nuevaPassword || !confirmarPassword) {
      setError("Debes completar todos los campos.");
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError("Las nuevas contraseñas no coinciden.");
      return;
    }

    try {
      setCargando(true);

      const response = await api.post("restablecer-password/", {
        uid: uid,
        token: token,
        password: nuevaPassword,
      });

      setMensaje(
        response.data?.mensaje ||
          "Tu contraseña se ha restablecido correctamente."
      );

      setNuevaPassword("");
      setConfirmarPassword("");

    } catch (error) {
      console.error("Error al restablecer contraseña:", error);

      if (error.response?.data?.mensaje) {
        setError(error.response.data.mensaje);
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError(
          "No fue posible restablecer la contraseña. El enlace puede haber expirado o no ser válido."
        );
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="restablecer-container">
      <div className="restablecer-card">

        <h1>Restablecer contraseña</h1>

        <p className="restablecer-descripcion">
          Ingresa una nueva contraseña para recuperar el acceso
          a tu cuenta de PlumixERP.
        </p>

        <form onSubmit={handleSubmit}>

          <label htmlFor="nuevaPassword">
            Nueva contraseña
          </label>

          <input
            id="nuevaPassword"
            type="password"
            placeholder="Ingresa tu nueva contraseña"
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            disabled={cargando}
          />

          <label htmlFor="confirmarPassword">
            Confirmar nueva contraseña
          </label>

          <input
            id="confirmarPassword"
            type="password"
            placeholder="Confirma tu nueva contraseña"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            disabled={cargando}
          />

          {error && (
            <div className="restablecer-error">
              {error}
            </div>
          )}

          {mensaje && (
            <div className="restablecer-mensaje">
              {mensaje}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
          >
            {cargando
              ? "Restableciendo..."
              : "Restablecer contraseña"}
          </button>

        </form>

        <button
          type="button"
          className="btn-volver-login"
          onClick={() => navigate("/")}
        >
          Volver al inicio de sesión
        </button>

      </div>
    </div>
  );
}

export default RestablecerPassword;