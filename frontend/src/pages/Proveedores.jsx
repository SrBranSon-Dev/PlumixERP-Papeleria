import { useEffect, useState } from "react";
import api from "../services/api";
import "./Proveedores.css";


function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [idEditar, setIdEditar] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const [formulario, setFormulario] = useState({
    nit: "",
    nombre_empresa: "",
    nombre_contacto: "",
    telefono: "",
    correo: "",
    direccion: "",
    ciudad: "",
    estado: true,
  });

  useEffect(() => {
    cargarProveedores();
  }, []);

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const cargarProveedores = async () => {
    try {
      const respuesta = await api.get("proveedores/");
      setProveedores(respuesta.data);
    } catch (error) {
      console.error(error);
    }
  };

  const guardarProveedor = async () => {
    if (
      !formulario.nit.trim() ||
      !formulario.nombre_empresa.trim() ||
      !formulario.nombre_contacto.trim() ||
      !formulario.telefono.trim()
    ) {
      alert("Todos los campos obligatorios deben estar completos.");
      return;
    }
    
    

    try {
      if (idEditar) {
        await api.put(`proveedores/${idEditar}/`, formulario);
        alert("Proveedor actualizado correctamente");
      } else {
        await api.post("proveedores/", formulario);
        alert("Proveedor registrado correctamente");
      }

      cargarProveedores();

      setFormulario({
        nit: "",
        nombre_empresa: "",
        nombre_contacto: "",
        telefono: "",
        correo: "",
        direccion: "",
        ciudad: "",
        estado: true,
      });

      setIdEditar(null);
   } catch (error) {
  console.error("ERROR COMPLETO:", error);

  if (error.response) {
    console.log("Respuesta del servidor:", error.response.data);
    console.log("Estado HTTP:", error.response.status);

    alert(
      "Error " +
        error.response.status +
        "\n\n" +
        JSON.stringify(error.response.data, null, 2)
    );
  } else if (error.request) {
    console.log("No hubo respuesta del servidor:", error.request);
    alert("No hubo respuesta del servidor Django.");
  } else {
    console.log("Error:", error.message);
    alert(error.message);
  }
}
  };

  const editarProveedor = (proveedor) => {
    setFormulario({
      nit: proveedor.nit,
      nombre_empresa: proveedor.nombre_empresa,
      nombre_contacto: proveedor.nombre_contacto,
      telefono: proveedor.telefono,
      correo: proveedor.correo,
      direccion: proveedor.direccion,
      ciudad: proveedor.ciudad,
      estado: proveedor.estado,
    });

    setIdEditar(proveedor.id);
  };

  const eliminarProveedor = async (id) => {
    const confirmar = window.confirm(
      "¿Está seguro de eliminar este proveedor?"
    );

    if (!confirmar) return;

    try {
      await api.delete(`proveedores/${id}/`);

      alert("Proveedor eliminado correctamente");

      cargarProveedores();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar el proveedor");
    }
  };

  const proveedoresFiltrados = proveedores.filter((proveedor) =>
  proveedor.nit.toLowerCase().includes(busqueda.toLowerCase()) ||
  proveedor.nombre_empresa.toLowerCase().includes(busqueda.toLowerCase()) ||
  proveedor.ciudad.toLowerCase().includes(busqueda.toLowerCase())
);

  return (
  <div className="proveedores-container">

    <div className="proveedores-header">
      <h1>Gestión de Proveedores</h1>

      <p>
        Administra la información de los proveedores de la papelería.
      </p>
    </div>

    <form
      className="proveedores-form"
      onSubmit={(e) => e.preventDefault()}
    >

      <div className="form-grid">

        <input
          type="text"
          name="nit"
          placeholder="NIT"
          value={formulario.nit}
          onChange={manejarCambio}
        />

        <input
          type="text"
          name="nombre_empresa"
          placeholder="Empresa"
          value={formulario.nombre_empresa}
          onChange={manejarCambio}
        />

        <input
          type="text"
          name="nombre_contacto"
          placeholder="Contacto"
          value={formulario.nombre_contacto}
          onChange={manejarCambio}
        />

        <input
          type="text"
          name="telefono"
          placeholder="Teléfono"
          value={formulario.telefono}
          onChange={manejarCambio}
        />

        <input
          type="email"
          name="correo"
          placeholder="Correo"
          value={formulario.correo}
          onChange={manejarCambio}
        />

        <input
          type="text"
          name="direccion"
          placeholder="Dirección"
          value={formulario.direccion}
          onChange={manejarCambio}
        />

        <input
          type="text"
          name="ciudad"
          placeholder="Ciudad"
          value={formulario.ciudad}
          onChange={manejarCambio}
        />

      </div>

      <div className="form-actions">

        <button
          className="btn-guardar"
          type="button"
          onClick={guardarProveedor}
        >
          {idEditar ? "Actualizar proveedor" : "Guardar proveedor"}
        </button>

        <button
          className="btn-limpiar"
          type="button"
          onClick={() => {
            setFormulario({
              nit: "",
              nombre_empresa: "",
              nombre_contacto: "",
              telefono: "",
              correo: "",
              direccion: "",
              ciudad: "",
              estado: true,
            });

            setIdEditar(null);
          }}
        >
          Limpiar
        </button>

      </div>

    </form>
    <div className="busqueda">
  <input
    type="text"
    placeholder=" Buscar proveedor por NIT, empresa o ciudad..."
    value={busqueda}
    onChange={(e) => setBusqueda(e.target.value)}
  />
</div>

    <div className="tabla-card">

    <h2>Listado de Proveedores</h2>
    <p className="contador">
    Total de proveedores: <strong>{proveedores.length}</strong>
</p>

    <table className="tabla-proveedores">
      <thead>
        <tr>
          <th>NIT</th>
          <th>Empresa</th>
          <th>Contacto</th>
          <th>Teléfono</th>
          <th>Ciudad</th>
          <th>Estado</th>
          <th>Acciones</th>
          
        </tr>
      </thead>

      <tbody>

  {proveedoresFiltrados.length === 0 ? (

    <tr>
      <td colSpan="7" style={{ textAlign: "center", padding: "30px" }}>
        No hay proveedores registrados.
      </td>
    </tr>

  ) : (

    proveedoresFiltrados.map((proveedor) => (

      <tr key={proveedor.id}>
        <td>{proveedor.nit}</td>
        <td>{proveedor.nombre_empresa}</td>
        <td>{proveedor.nombre_contacto}</td>
        <td>{proveedor.telefono}</td>
        <td>{proveedor.ciudad}</td>

        <td>
          <span
            className={
              proveedor.estado
                ? "estado-activo"
                : "estado-inactivo"
            }
          >
            {proveedor.estado ? "Activo" : "Inactivo"}
          </span>
        </td>

        <td>
          <button
            className="btn-editar"
            type="button"
            onClick={() => editarProveedor(proveedor)}
          >
            Editar
          </button>

          <button
            className="btn-eliminar"
            type="button"
            onClick={() => eliminarProveedor(proveedor.id)}
          >
            Eliminar
          </button>
        </td>

      </tr>

    ))

  )}

</tbody>
    </table>
    </div>

  </div>
);
}

export default Proveedores;