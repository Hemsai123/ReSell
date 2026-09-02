from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'product'

router = DefaultRouter()
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'brands', views.BrandViewSet, basename='brand')
router.register(r'conversations', views.ConversationViewSet, basename='conversation')
router.register(r'wishlist', views.WishlistViewSet, basename='wishlist')
router.register(r'notifications', views.NotificationViewSet, basename='notification')

urlpatterns = [
    path('', views.productlist, name='product_list'),
    path('<slug:category_slug>', views.productlist, name='product_list_category'),
    path('detail/<slug:product_slug>', views.productdetail, name='product_detail'),
]
