from rest_framework import serializers

from .models import Compra, DetalleCompra


class DetalleCompraSerializer(serializers.ModelSerializer):

    class Meta:
        model = DetalleCompra
        fields = [
            "id",
            "compra",
            "producto",
            "cantidad",
            "precio_unitario",
            "subtotal",
        ]
        read_only_fields = [
            "id",
            "subtotal",
        ]


class CompraSerializer(serializers.ModelSerializer):

    class Meta:
        model = Compra
        fields = [
            "id",
            "proveedor",
            "fecha",
            "total",
            "estado",
        ]
        read_only_fields = [
            "id",
            "fecha",
            "total",
        ]