import { useState } from "react";
import "./Chatbot.css";

function Chatbot() {
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [mensajes, setMensajes] = useState([
    {
      tipo: "bot",
      texto:
        "¡Hola! Soy el asistente virtual de PlumixERP. Puedes preguntarme sobre productos, inventario y el funcionamiento del sistema.",
    },
  ]);

  const responder = (pregunta) => {
    const texto = pregunta.toLowerCase();

    if (
      texto.includes("qué es plumixerp") ||
      texto.includes("que es plumixerp")
    ) {
      return "PlumixERP es un sistema de gestión para una papelería que permite administrar productos, inventario y proveedores.";
    }

    if (
      texto.includes("registrar producto") ||
      texto.includes("registrar un producto") ||
      texto.includes("agregar producto") ||
      texto.includes("agregar un producto")
    ) {
      return "Para registrar un producto debes ingresar al módulo Productos y seleccionar Agregar Producto. Luego completas código, nombre, categoría, proveedor, precios y stock.";
    }

    if (
      texto.includes("ver productos") ||
      texto.includes("consultar productos")
    ) {
      return "Puedes consultar los productos desde el módulo Productos en la opción Ver Productos, donde se muestran todos los productos registrados.";
    }

    if (
      texto.includes("stock mínimo") ||
      texto.includes("stock minimo")
    ) {
      return "El stock mínimo es la cantidad mínima permitida de un producto antes de que sea necesario realizar una reposición del inventario.";
    }

    if (
      texto.includes("tecnologías") ||
      texto.includes("tecnologias")
    ) {
      return "PlumixERP integra tecnologías de desarrollo de software y este chatbot representa la incorporación de una tecnología emergente basada en asistentes virtuales.";
    }

    if (
      texto.includes("chatbot") ||
      texto.includes("asistente virtual")
    ) {
      return "El chatbot es un asistente virtual que responde preguntas frecuentes y orienta al usuario sobre el funcionamiento de PlumixERP.";
    }

    return "Lo siento, todavía no tengo una respuesta para esa pregunta. Intenta consultar sobre PlumixERP, registrar productos, ver productos, stock mínimo, tecnologías o chatbot.";
  };

  const enviarMensaje = () => {
    if (mensaje.trim() === "") return;

    const nuevo = {
      tipo: "usuario",
      texto: mensaje,
    };

    setMensajes((prev) => [...prev, nuevo]);

    const respuesta = responder(mensaje);

    setTimeout(() => {
      setMensajes((prev) => [
        ...prev,
        {
          tipo: "bot",
          texto: respuesta,
        },
      ]);
    }, 500);

    setMensaje("");
  };

  return (
    <>
      <button
        className="chatbot-burbuja"
        onClick={() => setAbierto(!abierto)}
      >
        💬
      </button>

      {abierto && (
        <div className="chatbot-contenedor">
          <div className="chatbot-header">
            <div>
              <strong>Asistente PlumixERP</strong>
              <p>Preguntas frecuentes</p>
            </div>

            <button onClick={() => setAbierto(false)}>✕</button>
          </div>

          <div className="chatbot-mensajes">
            {mensajes.map((item, index) => (
              <div
                key={index}
                className={
                  item.tipo === "usuario"
                    ? "mensaje usuario"
                    : "mensaje bot"
                }
              >
                {item.texto}
              </div>
            ))}
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Escribe tu pregunta..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") enviarMensaje();
              }}
            />

            <button onClick={enviarMensaje}>Enviar</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;