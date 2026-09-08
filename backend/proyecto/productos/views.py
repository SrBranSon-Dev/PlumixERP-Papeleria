from django.shortcuts import render, redirect, get_object_or_404
from django.core.paginator import Paginator
from rest_framework import viewsets

from .models import Categoria, Producto, Inventario
from .forms import ProductoForm

from .serializers import (
    CategoriaSerializer,
    ProductoSerializer,
    InventarioSerializer,
)


# ==========================
# VISTAS WEB
# ==========================

def lista_productos(request):

    qs = Producto.objects.select_related(
        "categoria",
        "proveedor"
    )

    paginator = Paginator(qs, 10)

    productos = paginator.get_page(
        request.GET.get("page")
    )

    return render(
        request,
        "productos/lista.html",
        {
            "productos": productos
        }
    )


def crear_producto(request):

    if request.method == "POST":

        form = ProductoForm(request.POST)

        if form.is_valid():

            form.save()

            return redirect("productos:lista")

    else:

        form = ProductoForm()

    return render(
        request,
        "productos/formulario.html",
        {
            "form": form,
            "titulo": "Nuevo producto"
        }
    )


def editar_producto(request, pk):

    producto = get_object_or_404(
        Producto,
        pk=pk
    )

    if request.method == "POST":

        form = ProductoForm(
            request.POST,
            instance=producto
        )

        if form.is_valid():

            form.save()

            return redirect("productos:lista")

    else:

        form = ProductoForm(
            instance=producto
        )

    return render(
        request,
        "productos/formulario.html",
        {
            "form": form,
            "titulo": f"Editar {producto.nombre}"
        }
    )


def eliminar_producto(request, pk):

    producto = get_object_or_404(
        Producto,
        pk=pk
    )

    if request.method == "POST":

        producto.delete()

    return redirect("productos:lista")


# ==========================
# API REST
# ==========================

class CategoriaViewSet(viewsets.ModelViewSet):

    queryset = Categoria.objects.all()

    serializer_class = CategoriaSerializer


class ProductoViewSet(viewsets.ModelViewSet):

    queryset = Producto.objects.all()

    serializer_class = ProductoSerializer


class InventarioViewSet(viewsets.ModelViewSet):

    queryset = Inventario.objects.all()

    serializer_class = InventarioSerializer
    