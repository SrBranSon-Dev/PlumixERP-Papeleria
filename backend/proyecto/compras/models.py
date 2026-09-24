from django.db import models
from proveedores.models import Proveedor
from productos.models import Producto, Inventario


# ENTIDAD: COMPRA
class Compra(models.Model):
    proveedor = models.ForeignKey(
        Proveedor,
        on_delete=models.PROTECT,
        related_name="compras"
    )

    fecha = models.DateTimeField(
        auto_now_add=True
    )

    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    estado = models.BooleanField(
        default=True
    )

    def __str__(self):
        return f"Compra #{self.id}"


# ENTIDAD: DETALLE DE COMPRA
class DetalleCompra(models.Model):
    compra = models.ForeignKey(
        Compra,
        on_delete=models.CASCADE,
        related_name="detalles"
    )

    producto = models.ForeignKey(
        Producto,
        on_delete=models.PROTECT,
        related_name="detalles_compra"
    )

    cantidad = models.PositiveIntegerField()

    precio_unitario = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    def save(self, *args, **kwargs):

        if self.pk:

            detalle_anterior = DetalleCompra.objects.get(
                pk=self.pk
            )

            # Si cambió el producto
            if detalle_anterior.producto_id != self.producto_id:

                inventario_anterior, created = (
                    Inventario.objects.get_or_create(
                        producto=detalle_anterior.producto
                    )
                )

                inventario_anterior.cantidad -= (
                    detalle_anterior.cantidad
                )

                inventario_anterior.save()

                inventario_nuevo, created = (
                    Inventario.objects.get_or_create(
                        producto=self.producto
                    )
                )

                inventario_nuevo.cantidad += self.cantidad
                inventario_nuevo.save()

            else:

                diferencia = (
                    self.cantidad -
                    detalle_anterior.cantidad
                )

                inventario, created = (
                    Inventario.objects.get_or_create(
                        producto=self.producto
                    )
                )

                inventario.cantidad += diferencia
                inventario.save()

            self.subtotal = (
                self.cantidad *
                self.precio_unitario
            )

            super().save(*args, **kwargs)

        else:

            self.subtotal = (
                self.cantidad *
                self.precio_unitario
            )

            super().save(*args, **kwargs)

            inventario, created = (
                Inventario.objects.get_or_create(
                    producto=self.producto
                )
            )

            inventario.cantidad += self.cantidad
            inventario.save()

    def __str__(self):
        return f"Detalle de Compra #{self.id}"