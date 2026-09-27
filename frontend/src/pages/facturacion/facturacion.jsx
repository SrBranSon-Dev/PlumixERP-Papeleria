import { useCallback, useEffect, useMemo, useState } from "react";
import { FaFileInvoiceDollar, FaSearch, FaStamp } from "react-icons/fa";

import api from "../../services/api";
import "./facturacion.css";


const listaDesdeRespuesta = (data) => data?.results || data || [];

const estadoInicial = {
	venta: "",
	resolucion: "",
	medio_pago: "EFECTIVO",
	fecha_vencimiento: "",
};


function Facturacion() {
	const [ventas, setVentas] = useState([]);
	const [detallesVenta, setDetallesVenta] = useState([]);
	const [clientes, setClientes] = useState([]);
	const [productos, setProductos] = useState([]);
	const [resoluciones, setResoluciones] = useState([]);
	const [facturas, setFacturas] = useState([]);
	const [formulario, setFormulario] = useState(estadoInicial);
	const [busqueda, setBusqueda] = useState("");
	const [cargando, setCargando] = useState(true);
	const [guardando, setGuardando] = useState(false);
	const [error, setError] = useState("");
	const [mensaje, setMensaje] = useState("");

	const cargarDatos = useCallback(async () => {
		setCargando(true);
		setError("");

		try {
			const respuestas = await Promise.all([
				api.get("ventas/ventas/"),
				api.get("ventas/detalles-venta/"),
				api.get("clientes/"),
				api.get("productos/api/productos/"),
				api.get("facturacion/resoluciones/"),
				api.get("facturacion/facturas/"),
			]);

			setVentas(listaDesdeRespuesta(respuestas[0].data));
			setDetallesVenta(listaDesdeRespuesta(respuestas[1].data));
			setClientes(listaDesdeRespuesta(respuestas[2].data));
			setProductos(listaDesdeRespuesta(respuestas[3].data));
			setResoluciones(
				listaDesdeRespuesta(respuestas[4].data).filter((item) => item.activa),
			);
			setFacturas(listaDesdeRespuesta(respuestas[5].data));
		} catch (requestError) {
			console.error("Error cargando facturación:", requestError);
			setError("No fue posible cargar la información de facturación.");
		} finally {
			setCargando(false);
		}
	}, []);

	useEffect(() => {
		const temporizador = setTimeout(() => cargarDatos(), 0);
		return () => clearTimeout(temporizador);
	}, [cargarDatos]);

	const ventaSeleccionada = useMemo(
		() => ventas.find((venta) => String(venta.id) === String(formulario.venta)),
		[ventas, formulario.venta],
	);

	const detallesSeleccionados = useMemo(
		() => detallesVenta.filter(
			(detalle) => Number(detalle.venta) === Number(formulario.venta),
		),
		[detallesVenta, formulario.venta],
	);

	const cambiarVenta = (event) => {
		const ventaId = event.target.value;
		const venta = ventas.find((item) => String(item.id) === String(ventaId));

		setFormulario((actual) => ({
			...actual,
			venta: ventaId,
			medio_pago: venta?.medio_pago || "EFECTIVO",
		}));
		setError("");
		setMensaje("");
	};

	const guardarFactura = async (event) => {
		event.preventDefault();
		setError("");
		setMensaje("");

		if (!ventaSeleccionada) {
			setError("Selecciona una venta para emitir la factura.");
			return;
		}

		if (!formulario.resolucion) {
			setError("Selecciona una resolución de facturación activa.");
			return;
		}

		if (detallesSeleccionados.length === 0) {
			setError("La venta seleccionada no tiene detalles para facturar.");
			return;
		}

		const cliente = clientes.find(
			(item) => Number(item.id) === Number(ventaSeleccionada.cliente),
		);

		if (!cliente) {
			setError("No se encontró el cliente asociado a la venta.");
			return;
		}

		setGuardando(true);

		try {
			const facturaRespuesta = await api.post("facturacion/facturas/", {
				venta: ventaSeleccionada.id,
				cliente: cliente.id,
				resolucion: Number(formulario.resolucion),
				medio_pago: formulario.medio_pago,
				fecha_vencimiento: formulario.fecha_vencimiento || null,
				cliente_nombre: cliente.nombre,
				cliente_correo: cliente.correo_electronico || "",
				cliente_direccion: cliente.direccion || "",
			});

			await Promise.all(
				detallesSeleccionados.map((detalle) => {
					const producto = productos.find(
						(item) => Number(item.id) === Number(detalle.producto),
					);

					return api.post("facturacion/detalles/", {
						factura: facturaRespuesta.data.id,
						detalle_venta: detalle.id,
						producto: detalle.producto,
						descripcion: producto?.nombre || `Producto #${detalle.producto}`,
						codigo_producto: producto?.codigo || String(detalle.producto),
						cantidad: detalle.cantidad,
						precio_unitario: detalle.valor_unitario,
					});
				}),
			);

			setMensaje(`Factura ${facturaRespuesta.data.numero} generada correctamente.`);
			setFormulario(estadoInicial);
			await cargarDatos();
		} catch (requestError) {
			console.error("Error generando factura:", requestError);
			setError(
				requestError.response?.data
					? JSON.stringify(requestError.response.data)
					: "No fue posible generar la factura.",
			);
		} finally {
			setGuardando(false);
		}
	};

	const facturaDeVenta = (ventaId) =>
		facturas.find((factura) => Number(factura.venta) === Number(ventaId));

	const nombreCliente = (clienteId) => {
		const cliente = clientes.find(
			(item) => Number(item.id) === Number(clienteId),
		);
		return cliente?.nombre || `Cliente #${clienteId}`;
	};

	const facturasFiltradas = facturas.filter((factura) => {
		const texto = `${factura.numero} ${factura.cliente_nombre} ${factura.estado}`;
		return texto.toLowerCase().includes(busqueda.toLowerCase());
	});

	const formatoMoneda = (valor) =>
		Number(valor || 0).toLocaleString("es-CO", {
			style: "currency",
			currency: "COP",
			maximumFractionDigits: 0,
		});

	const formatoFecha = (fecha) =>
		fecha ? new Date(fecha).toLocaleDateString("es-CO") : "-";

	const etiquetaEstado = (estado) =>
		({
			BORRADOR: "Borrador",
			GENERADA: "Generada",
			ENVIADA: "Enviada",
			ACEPTADA: "Aceptada",
			RECHAZADA: "Rechazada",
			ANULADA: "Anulada",
		}[estado] || estado || "Sin estado");

	return (
		<main className="facturacion-page">
			<header className="facturacion-header">
				<div>
					<span className="facturacion-kicker">Documentos tributarios</span>
					<h1>Facturación electrónica</h1>
					<p>Convierte una venta registrada en una factura trazable y lista para su gestión.</p>
				</div>
				<div className="facturacion-header-mark" aria-hidden="true">
					<FaFileInvoiceDollar />
				</div>
			</header>

			{error && <div className="facturacion-alert error">{error}</div>}
			{mensaje && <div className="facturacion-alert success">{mensaje}</div>}

			<section className="facturacion-layout">
				<form className="factura-form-card" onSubmit={guardarFactura}>
					<div className="facturacion-section-heading">
						<div>
							<span className="facturacion-eyebrow">Emisión</span>
							<h2>Generar factura</h2>
						</div>
						<FaStamp aria-hidden="true" />
					</div>

					<label htmlFor="factura-venta">Venta a facturar</label>
					<select id="factura-venta" value={formulario.venta} onChange={cambiarVenta}>
						<option value="">Selecciona una venta</option>
						{ventas.map((venta) => {
							const factura = facturaDeVenta(venta.id);
							return (
								<option key={venta.id} value={venta.id} disabled={Boolean(factura)}>
									Venta #{venta.id} · {nombreCliente(venta.cliente)}{factura ? " · Ya facturada" : ""}
								</option>
							);
						})}
					</select>

					<div className="factura-grid">
						<div>
							<label htmlFor="factura-resolucion">Resolución activa</label>
							<select
								id="factura-resolucion"
								value={formulario.resolucion}
								onChange={(event) => setFormulario((actual) => ({ ...actual, resolucion: event.target.value }))}
							>
								<option value="">Selecciona una resolución</option>
								{resoluciones.map((resolucion) => (
									<option key={resolucion.id} value={resolucion.id}>
										{resolucion.prefijo} · Disponible desde {resolucion.numero_actual}
									</option>
								))}
							</select>
						</div>
						<div>
							<label htmlFor="factura-medio-pago">Medio de pago</label>
							<select
								id="factura-medio-pago"
								value={formulario.medio_pago}
								onChange={(event) => setFormulario((actual) => ({ ...actual, medio_pago: event.target.value }))}
							>
								<option value="EFECTIVO">Efectivo</option>
								<option value="TARJETA">Tarjeta</option>
								<option value="TRANSFERENCIA">Transferencia</option>
							</select>
						</div>
					</div>

					<label htmlFor="factura-vencimiento">Fecha de vencimiento <span>(opcional)</span></label>
					<input
						id="factura-vencimiento"
						type="date"
						value={formulario.fecha_vencimiento}
						onChange={(event) => setFormulario((actual) => ({ ...actual, fecha_vencimiento: event.target.value }))}
					/>

					<div className="venta-preview">
						<div className="preview-heading">
							<div>
								<span className="facturacion-eyebrow">Origen seleccionado</span>
								<h3>{ventaSeleccionada ? `Venta #${ventaSeleccionada.id}` : "Sin venta seleccionada"}</h3>
							</div>
							{ventaSeleccionada && <strong>{formatoMoneda(ventaSeleccionada.total)}</strong>}
						</div>
						{ventaSeleccionada ? (
							<p>{nombreCliente(ventaSeleccionada.cliente)} · {detallesSeleccionados.length} líneas de venta</p>
						) : (
							<p>Selecciona una venta para revisar su información antes de emitirla.</p>
						)}
					</div>

					<div className="factura-actions">
						<button className="factura-secondary" type="button" onClick={() => setFormulario(estadoInicial)}>
							Limpiar
						</button>
						<button className="factura-primary" type="submit" disabled={guardando || cargando}>
							{guardando ? "Generando..." : "Generar factura"}
						</button>
					</div>
				</form>

				<aside className="facturacion-summary">
					<span>Facturas registradas</span>
					<strong>{facturas.length}</strong>
					<p>Documentos vinculados a ventas del sistema.</p>
					<div className="facturacion-rule" />
					<span>Total facturado</span>
					<strong>{formatoMoneda(facturas.reduce((total, factura) => total + Number(factura.total || 0), 0))}</strong>
				</aside>
			</section>

			<section className="facturas-history">
				<div className="history-heading">
					<div>
						<span className="facturacion-eyebrow">Trazabilidad</span>
						<h2>Facturas emitidas</h2>
					</div>
					<div className="factura-search">
						<FaSearch aria-hidden="true" />
						<input
							type="search"
							placeholder="Buscar factura, cliente o estado"
							value={busqueda}
							onChange={(event) => setBusqueda(event.target.value)}
							aria-label="Buscar facturas"
						/>
					</div>
				</div>

				{cargando ? (
					<div className="factura-table-message">Cargando facturas...</div>
				) : facturasFiltradas.length === 0 ? (
					<div className="factura-table-message">No hay facturas que mostrar.</div>
				) : (
					<div className="factura-table-scroll">
						<table className="facturas-table">
							<thead>
								<tr>
									<th>Número</th>
									<th>Cliente</th>
									<th>Emisión</th>
									<th>Estado</th>
									<th className="factura-align-right">Total</th>
								</tr>
							</thead>
							<tbody>
								{facturasFiltradas.map((factura) => (
									<tr key={factura.id}>
										<td className="factura-number">{factura.numero || `Factura #${factura.id}`}</td>
										<td>{factura.cliente_nombre || `Cliente #${factura.cliente}`}</td>
										<td>{formatoFecha(factura.fecha_emision)}</td>
										<td><span className={`factura-status status-${String(factura.estado || "").toLowerCase()}`}>{etiquetaEstado(factura.estado)}</span></td>
										<td className="factura-align-right factura-total">{formatoMoneda(factura.total)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>
		</main>
	);
}

export default Facturacion;
