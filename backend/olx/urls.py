from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from product.views import register, login, logout, current_user, send_otp, verify_otp
from product.urls import router

urlpatterns = [
    path('api/auth/send-otp/', send_otp, name='api-send-otp'),
    path('api/auth/verify-otp/', verify_otp, name='api-verify-otp'),
    path('api/auth/register/', register, name='api-register'),
    path('api/auth/login/', login, name='api-login'),
    path('api/auth/logout/', logout, name='api-logout'),
    path('api/auth/user/', current_user, name='api-current-user'),
    path('api/', include(router.urls)),
    path('admin/', admin.site.urls),
    path('', include('home.urls', namespace='home')),
    path('products/', include('product.urls', namespace='products')),
    path('accounts/', include('accounts.urls', namespace='accounts')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
