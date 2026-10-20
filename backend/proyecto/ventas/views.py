
from django.db import transaction
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError

from .models import Venta, DetalleVenta
from .serializers import VentaSerializer, DetalleVentaSerializer


class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all()
    serializer_class = VentaSerializer


class DetalleVentaViewSet(viewsets.ModelViewSet):
    queryset = DetalleVenta.objects.all()
    serializer_class = DetalleVentaSerializer

    def perform_create(self, serializer):
        with transaction.atomic():
            try:
                serializer.save()
            except ValidationError as error:
                raise ValidationError(error.messages)
