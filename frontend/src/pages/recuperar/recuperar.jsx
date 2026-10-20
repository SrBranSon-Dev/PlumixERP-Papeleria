import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./recuperar.css";

function RecuperarPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (!email.trim()) {
      setError("Por favor, ingresa tu correo electrónico.");
      return;
    }

    try {
      setCargando(true);

      const response = await api.post("recuperar-password/", {
        email: email.trim(),
      });

      setMensaje(
        response.data?.mensaje ||
          "Si el correo está registrado, recibirás las instrucciones para recuperar tu contraseña."
      );

      setEmail("");
    } catch (error) {
      console.error("Error al solicitar recuperación:", error);

      if (error.response?.data?.mensaje) {
        setError(error.response.data.mensaje);
      } else {
        setError(
          "No fue posible procesar la solicitud. Inténtalo nuevamente."
        );
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="recuperar-container">
      <div className="recuperar-card">

        <h1>Recuperar contraseña</h1>

        <p className="recuperar-descripcion">
          Ingresa tu correo electrónico registrado y te enviaremos
          las instrucciones para recuperar el acceso a tu cuenta.
        </p>

        <form onSubmit={handleSubmit}>

          <label htmlFor="email">
            Correo electrónico
          </label>

          <input
            id="email"
            type="email"
            placeholder="Ingresa tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={cargando}
          />

          {error && (
            <div className="recuperar-error">
              {error}
            </div>
          )}

          {mensaje && (
            <div className="recuperar-mensaje">
              {mensaje}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
          >
            {cargando
              ? "Enviando..."
              : "Enviar instrucciones"}
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

export default RecuperarPassword;