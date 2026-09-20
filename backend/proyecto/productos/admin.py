from django.contrib import admin

from .models import Categoria, Producto, Inventario


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre", "descripcion")
    search_fields = ("nombre",)


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = (
        "codigo",
        "nombre",
        "categoria",
        "proveedor",
        "precio_compra",
        "precio_venta",
        "activo",
    )

    search_fields = (
        "codigo",
        "nombre",
    )

    list_filter = (
        "categoria",
        "proveedor",
        "activo",
    )


@admin.register(Inventario)
class InventarioAdmin(admin.ModelAdmin):
    list_display = (
        "producto",
        "cantidad",
        "ubicacion",
        "fecha_actualizacion",
    )
    