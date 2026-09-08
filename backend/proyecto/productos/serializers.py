from rest_framework import serializers

from .models import Categoria, Producto, Inventario


class CategoriaSerializer(serializers.ModelSerializer):

    class Meta:
        model = Categoria
        fields = "__all__"


class ProductoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Producto
        fields = "__all__"


class InventarioSerializer(serializers.ModelSerializer):

    class Meta:
        model = Inventario
        fields = "__all__"