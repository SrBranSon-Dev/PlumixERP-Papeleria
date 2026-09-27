from datetime import date
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.test import TestCase

from clientes.models import Cliente
from productos.models import Categoria, Producto
from proveedores.models import Proveedor
from ventas.models import DetalleVenta, Venta

from .models import (
	DetalleFacturaElectronica,
	FacturaElectronica,
	ResolucionFacturacion,
)
from .serializers import FacturaElectronicaSerializer


class FacturacionModelTest(TestCase):

	def setUp(self):
		self.cliente = Cliente.objects.create(
			nombre="Cliente de prueba",
			correo_electronico="cliente@example.com",
			direccion="Calle 1",
		)
		proveedor = Proveedor.objects.create(
			nit="900123456",
			nombre_empresa="Proveedor de prueba",
			nombre_contacto="Contacto",
			telefono="3000000000",
			correo="proveedor@example.com",
			direccion="Calle 2",
			ciudad="Bogota",
		)
		producto = Producto.objects.create(
			codigo="P-001",
			nombre="Producto de prueba",
			categoria=Categoria.objects.create(nombre="Pruebas"),
			proveedor=proveedor,
			precio_compra=Decimal("10.00"),
			precio_venta=Decimal("20.00"),
		)
		producto.inventario.cantidad = 10
		producto.inventario.save()
		self.venta = Venta.objects.create(
			cliente=self.cliente,
			medio_pago="EFECTIVO",
		)
		self.detalle_venta = DetalleVenta.objects.create(
			venta=self.venta,
			producto=producto,
			cantidad=2,
		)
		self.resolucion = ResolucionFacturacion.objects.create(
			prefijo="FE",
			numero_inicial=1,
			numero_final=10,
			numero_actual=1,
			fecha_inicio=date(2026, 1, 1),
			fecha_fin=date(2026, 12, 31),
		)

	def crear_factura(self):
		serializer = FacturaElectronicaSerializer(data={
			"venta": self.venta.pk,
			"cliente": self.cliente.pk,
			"resolucion": self.resolucion.pk,
			"cliente_nombre": self.cliente.nombre,
		})
		self.assertTrue(serializer.is_valid(), serializer.errors)
		return serializer.save()

	def test_asigna_consecutivo_y_actualiza_resolucion(self):
		factura = self.crear_factura()

		self.assertEqual(factura.numero, "FE1")
		self.assertEqual(factura.consecutivo, 1)
		self.resolucion.refresh_from_db()
		self.assertEqual(self.resolucion.numero_actual, 2)

	def test_detalle_actualiza_totales(self):
		factura = self.crear_factura()
		DetalleFacturaElectronica.objects.create(
			factura=factura,
			detalle_venta=self.detalle_venta,
			producto=self.detalle_venta.producto,
			descripcion="Producto de prueba",
			codigo_producto="P-001",
			cantidad=2,
			precio_unitario=Decimal("20.00"),
		)

		factura.refresh_from_db()
		self.assertEqual(factura.subtotal, Decimal("40.00"))
		self.assertEqual(factura.impuesto, Decimal("7.60"))
		self.assertEqual(factura.total, Decimal("47.60"))

	def test_rechaza_detalle_de_otra_venta(self):
		factura = self.crear_factura()
		otra_venta = Venta.objects.create(
			cliente=self.cliente,
			medio_pago="EFECTIVO",
		)

		self.detalle_venta.venta = otra_venta
		with self.assertRaises(ValidationError):
			DetalleFacturaElectronica(
				factura=factura,
				detalle_venta=self.detalle_venta,
				producto=self.detalle_venta.producto,
				descripcion="Producto de prueba",
				codigo_producto="P-001",
				cantidad=2,
				precio_unitario=Decimal("20.00"),
			).full_clean()
