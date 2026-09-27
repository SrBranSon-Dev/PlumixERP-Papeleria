from rest_framework.routers import DefaultRouter

from .views import CompraViewSet, DetalleCompraViewSet


router = DefaultRouter()
router.register("compras", CompraViewSet, basename="compra")
router.register(
    "detalles-compra",
    DetalleCompraViewSet,
    basename="detalle-compra",
)

urlpatterns = router.urls