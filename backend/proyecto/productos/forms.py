from django import forms

from .models import Producto


class ProductoForm(forms.ModelForm):

    class Meta:

        model = Producto

        fields = [
            "codigo",
            "nombre",
            "descripcion",
            "categoria",
            "proveedor",
            "precio_compra",
            "precio_venta",
            "activo",
        ]

        widgets = {

            "codigo": forms.TextInput(
                attrs={"class": "form-control"}
            ),

            "nombre": forms.TextInput(
                attrs={"class": "form-control"}
            ),

            "descripcion": forms.Textarea(
                attrs={
                    "class": "form-control",
                    "rows": 3,
                }
            ),

            "categoria": forms.Select(
                attrs={"class": "form-select"}
            ),

            "proveedor": forms.Select(
                attrs={"class": "form-select"}
            ),

            "precio_compra": forms.NumberInput(
                attrs={"class": "form-control"}
            ),

            "precio_venta": forms.NumberInput(
                attrs={"class": "form-control"}
            ),

            "activo": forms.CheckboxInput(
                attrs={"class": "form-check-input"}
            ),

        }

        labels = {

            "precio_compra": "Precio de compra",

            "precio_venta": "Precio de venta",

            "stock_minimo": "Stock mínimo",

        }


    def clean(self):

        cleaned = super().clean()

        stock = cleaned.get("stock")

        stock_minimo = cleaned.get("stock_minimo")


        if stock is not None and stock_minimo is not None:

            if stock == stock_minimo:

                self.add_error(
                    "stock",
                    "⚠ Advertencia: el producto ha alcanzado el stock mínimo. "
                    "Se recomienda realizar un nuevo pedido al proveedor."
                )

            elif stock < stock_minimo:

                self.add_error(
                    "stock",
                    "🚨 Stock crítico: el inventario está por debajo del "
                    "stock mínimo. Debe reabastecer este producto."
                )

        return cleaned
    
    