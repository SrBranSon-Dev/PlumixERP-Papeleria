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
            "subtotal",
        ]


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