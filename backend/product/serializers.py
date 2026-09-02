from rest_framework import serializers
from django.contrib.auth.models import User
from product.models import Product, ProductImages, Category, Brand, Review, Message, Wishlist, Notification, Conversation


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password_confirm']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'brand_name']


class CategorySerializer(serializers.ModelSerializer):
    total_products = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'category_name', 'image', 'slug', 'total_products']


class ProductImagesSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImages
        fields = ['id', 'image', 'image_url']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'reviewer', 'reviewer_name', 'rating', 'comment', 'created']
        read_only_fields = ['reviewer']


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    owner = UserSerializer(read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    location = serializers.CharField(read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'condition', 'status',
            'category', 'brand', 'price', 'quantity', 'image', 'image_url', 'location',
            'created', 'owner', 'average_rating', 'review_count',
        ]

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews:
            return round(sum(r.rating for r in reviews) / len(reviews), 1)
        return 0

    def get_review_count(self, obj):
        return obj.reviews.count()

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    owner = UserSerializer(read_only=True)
    images = ProductImagesSerializer(source='productimages_set', many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    location = serializers.CharField(read_only=True)
    is_wishlisted = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'condition', 'status',
            'category', 'brand', 'price', 'quantity', 'image', 'image_url', 'location',
            'created', 'owner', 'images', 'reviews', 'average_rating', 'review_count', 'is_wishlisted',
        ]

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews:
            return round(sum(r.rating for r in reviews) / len(reviews), 1)
        return 0

    def get_review_count(self, obj):
        return obj.reviews.count()

    def get_is_wishlisted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Wishlist.objects.filter(user=request.user, product=obj).exists()
        return False

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'name', 'description', 'condition', 'category',
            'brand', 'price', 'quantity', 'image', 'location',
        ]

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    sender_id = serializers.IntegerField(source='sender.id', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender_id', 'sender_name', 'message', 'image', 'image_url', 'is_read', 'created']
        read_only_fields = ['sender_id', 'sender_name']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ConversationSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'product', 'product_id', 'buyer', 'seller', 'other_user', 'last_message', 'unread_count', 'created', 'updated']
        read_only_fields = ['buyer', 'seller']

    def get_other_user(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        if obj.buyer == request.user:
            return UserSerializer(obj.seller).data
        return UserSerializer(obj.buyer).data

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created').first()
        if last_msg:
            return {
                'message': last_msg.message,
                'sender': last_msg.sender.username,
                'created': last_msg.created,
                'is_read': last_msg.is_read
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request:
            return 0
        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()


class WishlistSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'product_id', 'created']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created']
