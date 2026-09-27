from rest_framework import viewsets

from .models import (
	DetalleFacturaElectronica,
	EventoDian,
	FacturaElectronica,
	ImpuestoFactura,
	ResolucionFacturacion,
)
from .serializers import (
	DetalleFacturaElectronicaSerializer,
	EventoDianSerializer,
	FacturaElectronicaSerializer,
	ImpuestoFacturaSerializer,
	ResolucionFacturacionSerializer,
)


class ResolucionFacturacionViewSet(viewsets.ModelViewSet):

	queryset = ResolucionFacturacion.objects.all()
	serializer_class = ResolucionFacturacionSerializer


class FacturaElectronicaViewSet(viewsets.ModelViewSet):

	queryset = FacturaElectronica.objects.select_related(
		"venta",
		"cliente",
		"resolucion",
		"usuario_creacion",
	).all()
	serializer_class = FacturaElectronicaSerializer


class DetalleFacturaElectronicaViewSet(viewsets.ModelViewSet):

	queryset = DetalleFacturaElectronica.objects.select_related(
		"factura",
		"detalle_venta",
		"producto",
	).all()
	serializer_class = DetalleFacturaElectronicaSerializer


class ImpuestoFacturaViewSet(viewsets.ModelViewSet):

	queryset = ImpuestoFactura.objects.select_related(
		"factura",
		"detalle",
	).all()
	serializer_class = ImpuestoFacturaSerializer


class EventoDianViewSet(viewsets.ModelViewSet):

	queryset = EventoDian.objects.select_related("factura").all()
	serializer_class = EventoDianSerializer
