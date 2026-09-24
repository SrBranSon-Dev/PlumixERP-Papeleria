from rest_framework.routers import DefaultRouter
from .views import VentaViewSet, DetalleVentaViewSet

router = DefaultRouter()

router.register("ventas", VentaViewSet, basename="venta")
router.register("detalles-venta", DetalleVentaViewSet, basename="detalle-venta")

urlpatterns = router.urls