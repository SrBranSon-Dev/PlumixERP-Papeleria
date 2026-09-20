from rest_framework import serializers

from .models import Categoria, Producto, Inventario


class CategoriaSerializer(serializers.ModelSerializer):

    class Meta:
        model = Categoria
        fields = "__all__"


class ProductoSerializer(serializers.ModelSerializer):

    def validate(self, data):
        precio_compra = data.get(
            "precio_compra",
            getattr(self.instance, "precio_compra", None)
        )

        precio_venta = data.get(
            "precio_venta",
            getattr(self.instance, "precio_venta", None)
        )

        if precio_venta <= precio_compra:
            raise serializers.ValidationError({
                "precio_venta": "El precio de venta debe ser mayor que el precio de compra."
            })

        return data

    class Meta:
        model = Producto
        fields = "__all__"


class InventarioSerializer(serializers.ModelSerializer):

    class Meta:
        model = Inventario
        fields = "__all__"