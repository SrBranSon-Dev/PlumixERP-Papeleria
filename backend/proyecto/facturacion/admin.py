from django.contrib import admin

from .models import (
	DetalleFacturaElectronica,
	EventoDian,
	FacturaElectronica,
	ImpuestoFactura,
	ResolucionFacturacion,
)


admin.site.register(ResolucionFacturacion)
admin.site.register(FacturaElectronica)
admin.site.register(DetalleFacturaElectronica)
admin.site.register(ImpuestoFactura)
admin.site.register(EventoDian)
