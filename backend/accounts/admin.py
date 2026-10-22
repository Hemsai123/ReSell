from django.contrib import admin
from .models import Profile, PhoneOTP

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'is_phone_verified', 'created_at')
    search_fields = ('user__username', 'phone_number')

@admin.register(PhoneOTP)
class PhoneOTPAdmin(admin.ModelAdmin):
    list_display = ('phone_number', 'otp', 'is_verified', 'created_at')
    search_fields = ('phone_number', 'otp')
