from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models

from clientes.models import Cliente
from productos.models import Producto, Inventario


class Venta(models.Model):

    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.PROTECT,
        related_name="ventas"
    )

    fecha = models.DateTimeField(
        auto_now_add=True
    )

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

    def __str__(self):
        return f"Venta #{self.id}"


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

    def clean(self):

        if not self.producto_id or not self.cantidad:
            return

        inventario, created = Inventario.objects.get_or_create(
            producto=self.producto
        )

        cantidad_disponible = inventario.cantidad

        if self.pk:

            detalle_anterior = DetalleVenta.objects.get(
                pk=self.pk
            )

            if (
                detalle_anterior.producto_id
                == self.producto_id
            ):
                cantidad_disponible += (
                    detalle_anterior.cantidad
                )

        if cantidad_disponible < self.cantidad:

            raise ValidationError(
                {
                    "cantidad": (
                        f"No hay suficiente inventario. "
                        f"Disponible: {cantidad_disponible}."
                    )
                }
            )

    def save(self, *args, **kwargs):

        # El precio de venta siempre viene del producto
        self.valor_unitario = self.producto.precio_venta

        # Calcular subtotal automáticamente
        self.subtotal = (
            self.cantidad *
            self.valor_unitario
        )

        # DETALLE EXISTENTE
        if self.pk:

            detalle_anterior = DetalleVenta.objects.get(
                pk=self.pk
            )

            # Si cambió el producto
            if (
                detalle_anterior.producto_id
                != self.producto_id
            ):

                inventario_anterior, created = (
                    Inventario.objects.get_or_create(
                        producto=detalle_anterior.producto
                    )
                )

                inventario_anterior.cantidad += (
                    detalle_anterior.cantidad
                )

                inventario_anterior.save()

                inventario_nuevo, created = (
                    Inventario.objects.get_or_create(
                        producto=self.producto
                    )
                )

                if inventario_nuevo.cantidad < self.cantidad:

                    raise ValidationError(
                        (
                            "No hay suficiente inventario "
                            "para este producto."
                        )
                    )

                inventario_nuevo.cantidad -= (
                    self.cantidad
                )

                inventario_nuevo.save()

            else:

                diferencia = (
                    self.cantidad
                    - detalle_anterior.cantidad
                )

                inventario, created = (
                    Inventario.objects.get_or_create(
                        producto=self.producto
                    )
                )

                if diferencia > 0:

                    if inventario.cantidad < diferencia:

                        raise ValidationError(
                            (
                                "No hay suficiente inventario "
                                "para aumentar esta venta."
                            )
                        )

                inventario.cantidad -= diferencia
                inventario.save()

        # DETALLE NUEVO
        else:

            inventario, created = (
                Inventario.objects.get_or_create(
                    producto=self.producto
                )
            )

            if inventario.cantidad < self.cantidad:

                raise ValidationError(
                    {
                        "cantidad": (
                            f"No hay suficiente inventario. "
                            f"Disponible: "
                            f"{inventario.cantidad}."
                        )
                    }
                )

            inventario.cantidad -= self.cantidad
            inventario.save()

        super().save(*args, **kwargs)

        self.venta.actualizar_totales()

    def delete(self, *args, **kwargs):

        inventario, created = (
            Inventario.objects.get_or_create(
                producto=self.producto
            )
        )

        inventario.cantidad += self.cantidad
        inventario.save()

        venta = self.venta

        super().delete(*args, **kwargs)

        venta.actualizar_totales()

    def __str__(self):
        return f"Detalle de Venta #{self.id}"