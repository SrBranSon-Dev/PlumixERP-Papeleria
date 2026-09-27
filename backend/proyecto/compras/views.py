from rest_framework import viewsets

from .models import Compra, DetalleCompra
from .serializers import CompraSerializer, DetalleCompraSerializer


class CompraViewSet(viewsets.ModelViewSet):

	queryset = Compra.objects.all()
	serializer_class = CompraSerializer


class DetalleCompraViewSet(viewsets.ModelViewSet):

	queryset = DetalleCompra.objects.all()
	serializer_class = DetalleCompraSerializer
