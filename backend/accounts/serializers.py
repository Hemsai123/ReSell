from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile


class UserSerializer(serializers.ModelSerializer):
    phone_number = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number']

    def get_phone_number(self, obj):
        profile = getattr(obj, 'profile', None)
        return profile.phone_number if profile else None


class RegisterSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(max_length=15, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'phone_number', 'first_name', 'last_name', 'password', 'password_confirm']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        phone_number = validated_data.pop('phone_number', None)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        if phone_number and str(phone_number).strip():
            profile, _ = Profile.objects.get_or_create(user=user)
            profile.phone_number = str(phone_number).strip()
            profile.save()
        return user
