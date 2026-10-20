
from rest_framework import serializers

from .models import Venta, DetalleVenta


class DetalleVentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleVenta
        fields = [
            "id",
            "venta",
            "producto",
            "cantidad",
            "valor_unitario",
            "subtotal",
        ]
        read_only_fields = [
            "id",
            "valor_unitario",
            "subtotal",
        ]

    def validate_cantidad(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "La cantidad debe ser mayor que cero."
            )
        return value

    def validate(self, attrs):
        producto = attrs.get(
            "producto",
            getattr(self.instance, "producto", None),
        )
        cantidad = attrs.get(
            "cantidad",
            getattr(self.instance, "cantidad", None),
        )

        if producto is None or cantidad is None:
            return attrs

        from productos.models import Inventario

        inventario = Inventario.objects.filter(
            producto=producto
        ).first()

        disponible = inventario.cantidad if inventario else 0

        # Si se modifica un detalle existente, contar sus
        # unidades como disponibles para la propia modificación.
        if self.instance and self.instance.producto_id == producto.id:
            disponible += self.instance.cantidad

        if cantidad > disponible:
            raise serializers.ValidationError({
                "cantidad": (
                    f"Stock insuficiente para {producto.nombre}. "
                    f"Disponible: {disponible} unidades."
                )
            })

        return attrs


class VentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venta
        fields = [
            "id",
            "cliente",
            "fecha",
            "medio_pago",
            "subtotal",
            "iva",
            "total",
        ]
        read_only_fields = [
            "id",
            "fecha",
            "subtotal",
            "iva",
            "total",
        ]
