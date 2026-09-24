from django.contrib import admin
from .models import Compra, DetalleCompra


class DetalleCompraInline(admin.TabularInline):
    model = DetalleCompra
    extra = 1
    exclude = ("subtotal",)


@admin.register(Compra)
class CompraAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "proveedor",
        "fecha",
        "total",
        "estado",
    )

    list_filter = (
        "estado",
        "fecha",
    )

    search_fields = (
        "proveedor__nombre",
    )

    exclude = ("total",)

    inlines = [DetalleCompraInline]

    def save_formset(self, request, form, formset, change):
        instances = formset.save()

        compra = form.instance

        compra.total = sum(
            detalle.subtotal
            for detalle in compra.detalles.all()
        )

        compra.save()


@admin.register(DetalleCompra)
class DetalleCompraAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "compra",
        "producto",
        "cantidad",
        "precio_unitario",
        "subtotal",
    )

    search_fields = (
        "producto__nombre",
    )