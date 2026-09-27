from rest_framework.routers import DefaultRouter

from .views import (
    DetalleFacturaElectronicaViewSet,
    EventoDianViewSet,
    FacturaElectronicaViewSet,
    ImpuestoFacturaViewSet,
    ResolucionFacturacionViewSet,
)


router = DefaultRouter()
router.register("resoluciones", ResolucionFacturacionViewSet, basename="resolucion")
router.register("facturas", FacturaElectronicaViewSet, basename="factura")
router.register(
    "detalles",
    DetalleFacturaElectronicaViewSet,
    basename="detalle-factura",
)
router.register("impuestos", ImpuestoFacturaViewSet, basename="impuesto-factura")
router.register("eventos-dian", EventoDianViewSet, basename="evento-dian")

urlpatterns = router.urls