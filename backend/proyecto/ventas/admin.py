from django.contrib import admin

from .models import Venta, DetalleVenta
from productos.models import Producto


class DetalleVentaInline(admin.TabularInline):
    model = DetalleVenta
    extra = 1

    exclude = (
        "valor_unitario",
        "subtotal",
    )

    def get_formset(self, request, obj=None, **kwargs):

        formset = super().get_formset(
            request,
            obj,
            **kwargs
        )

        producto_field = formset.form.base_fields.get(
            "producto"
        )

        if producto_field:
            producto_field.queryset = Producto.objects.filter(
                inventario__isnull=False,
                inventario__cantidad__gt=0
            ).distinct()

        return formset


@admin.register(Venta)
class VentaAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "cliente",
        "fecha",
        "medio_pago",
        "subtotal",
        "iva",
        "total",
    )

    list_filter = (
        "medio_pago",
        "fecha",
    )

    search_fields = (
        "cliente__nombre",
    )

    exclude = (
        "subtotal",
        "iva",
        "total",
    )

    inlines = [
        DetalleVentaInline
    ]


@admin.register(DetalleVenta)
class DetalleVentaAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "venta",
        "producto",
        "cantidad",
        "valor_unitario",
        "subtotal",
    )

    search_fields = (
        "producto__nombre",
    )

    exclude = (
        "valor_unitario",
        "subtotal",
    )

    def get_form(self, request, obj=None, **kwargs):

        form = super().get_form(
            request,
            obj,
            **kwargs
        )

        producto_field = form.base_fields.get(
            "producto"
        )

        if producto_field:
            producto_field.queryset = Producto.objects.filter(
                inventario__isnull=False,
                inventario__cantidad__gt=0
            ).distinct()

        return form