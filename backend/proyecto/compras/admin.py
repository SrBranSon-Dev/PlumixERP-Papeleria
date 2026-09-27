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
        "proveedor__nombre_empresa",
    )

    exclude = (
        "total",
    )

    inlines = [DetalleCompraInline]

    def save_formset(self, request, form, formset, change):

        formset.save(commit=False)

        for deleted_form in formset.deleted_forms:
            detalle = deleted_form.instance
            detalle.delete()

        instances = formset.save(commit=False)

        for instance in instances:
            instance.save()

        formset.save_m2m()

        form.instance.actualizar_total()


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