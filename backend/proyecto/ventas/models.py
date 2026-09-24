from decimal import Decimal

from django.db import models

from clientes.models import Cliente
from productos.models import Producto


class Venta(models.Model):

    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.PROTECT,
        related_name="ventas"
    )

    fecha = models.DateTimeField(auto_now_add=True)

    medio_pago = models.CharField(
        max_length=20,
        choices=[
            ("EFECTIVO", "Efectivo"),
            ("TARJETA", "Tarjeta"),
            ("TRANSFERENCIA", "Transferencia"),
        ]
    )

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    iva = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    def actualizar_totales(self):
        """
        Calcula el subtotal, IVA y total de la venta
        a partir de sus detalles.
        """

        subtotal = sum(
            (
                detalle.subtotal
                for detalle in self.detalles.all()
            ),
            Decimal("0.00")
        )

        self.subtotal = subtotal
        self.iva = subtotal * Decimal("0.19")
        self.total = self.subtotal + self.iva

        self.save(
            update_fields=[
                "subtotal",
                "iva",
                "total"
            ]
        )


class DetalleVenta(models.Model):

    venta = models.ForeignKey(
        Venta,
        on_delete=models.CASCADE,
        related_name="detalles"
    )

    producto = models.ForeignKey(
        Producto,
        on_delete=models.PROTECT,
        related_name="detalles_venta"
    )

    cantidad = models.PositiveIntegerField()

    valor_unitario = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    def save(self, *args, **kwargs):
        """
        Calcula automáticamente el subtotal
        antes de guardar el detalle.
        """

        self.subtotal = self.cantidad * self.valor_unitario

        super().save(*args, **kwargs)

        # Actualizar los totales de la venta
        self.venta.actualizar_totales()

    def delete(self, *args, **kwargs):
        """
        Elimina el detalle y actualiza los totales
        de la venta.
        """

        venta = self.venta

        super().delete(*args, **kwargs)

        # Actualizar los totales después de eliminar
        venta.actualizar_totales()