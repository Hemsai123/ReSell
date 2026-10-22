import re
import random
from django.shortcuts import render
from django.core.paginator import Paginator
from django.db.models import Q, Count, Max
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from .models import Product, ProductImages, Category, Brand, Review, Message, Wishlist, Notification, Conversation
from .serializers import (
    ProductListSerializer, ProductDetailSerializer, ProductCreateSerializer,
    CategorySerializer, BrandSerializer, ReviewSerializer, MessageSerializer,
    WishlistSerializer, NotificationSerializer, ConversationSerializer,
)
from accounts.models import Profile, PhoneOTP
from accounts.serializers import RegisterSerializer, UserSerializer
from accounts.sms_service import send_sms_otp


def productlist(request, category_slug=None):
    category = None
    productlist = Product.objects.all()
    categorylist = Category.objects.annotate(total_products=Count('product'))

    if category_slug:
        category = get_object_or_404(Category, slug=category_slug)
        productlist = productlist.filter(category=category)

    search_query = request.GET.get('q')
    if search_query:
        productlist = productlist.filter(
            Q(name__icontains=search_query) |
            Q(description__icontains=search_query) |
            Q(condition__icontains=search_query) |
            Q(brand__brand_name__icontains=search_query) |
            Q(category__category_name__icontains=search_query)
        )

    paginator = Paginator(productlist, 1)
    page = request.GET.get('page')
    productlist = paginator.get_page(page)
    template = 'Product/product_list.html'
    context = {'product_list': productlist, 'category_list': categorylist, 'category': category}
    return render(request, template, context)


def productdetail(request, product_slug):
    productdetail = get_object_or_404(Product, slug=product_slug)
    productimages = ProductImages.objects.filter(product=productdetail)
    template = 'Product/product_detail.html'
    context = {'product_detail': productdetail, 'product_images': productimages}
    return render(request, template, context)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.annotate(total_products=Count('product')).order_by('category_name')
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all().order_by('brand_name')
    serializer_class = BrandSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


from rest_framework.exceptions import PermissionDenied

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category', 'brand', 'owner').all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'condition', 'brand__brand_name', 'category__category_name', 'location']
    ordering_fields = ['created', 'price', 'name']
    ordering = ['-created']

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductCreateSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        category_slug = self.request.query_params.get('category')
        location = self.request.query_params.get('location')
        condition = self.request.query_params.get('condition')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        brand_id = self.request.query_params.get('brand')
        status_val = self.request.query_params.get('status')

        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        if location:
            queryset = queryset.filter(location__icontains=location)
        if condition and condition.lower() != 'all':
            queryset = queryset.filter(condition__iexact=condition)
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass
        if brand_id:
            queryset = queryset.filter(brand_id=brand_id)
        if status_val:
            queryset = queryset.filter(status__iexact=status_val)

        return queryset

    def perform_update(self, serializer):
        if serializer.instance.owner != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("You can only edit your own listings.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.owner != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("You can only delete your own listings.")
        instance.delete()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_listings(self, request):
        queryset = self.get_queryset().filter(owner=request.user)
        serializer = ProductListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_review(self, request, slug=None):
        product = self.get_object()
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(reviewer=request.user, product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def toggle_wishlist(self, request, slug=None):
        product = self.get_object()
        wishlist_item = Wishlist.objects.filter(user=request.user, product=product)
        if wishlist_item.exists():
            wishlist_item.delete()
            return Response({'status': 'removed from wishlist', 'is_wishlisted': False})
        else:
            Wishlist.objects.create(user=request.user, product=product)
            return Response({'status': 'added to wishlist', 'is_wishlisted': True})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def mark_sold(self, request, slug=None):
        product = self.get_object()
        if product.owner != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        product.status = 'Sold'
        product.save()
        return Response({'status': 'marked as sold'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def contact_seller(self, request, slug=None):
        product = self.get_object()
        buyer = request.user
        seller = product.owner

        if buyer == seller:
            return Response({'error': 'You cannot message yourself'}, status=status.HTTP_400_BAD_REQUEST)

        conversation, created = Conversation.objects.get_or_create(
            product=product,
            buyer=buyer,
            seller=seller,
        )
        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response(serializer.data)


class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(
            Q(buyer=self.request.user) | Q(seller=self.request.user)
        ).select_related('product', 'buyer', 'seller').prefetch_related('messages')

    def create(self, request, *args, **kwargs):
        product_id = request.data.get('product_id')
        product = get_object_or_404(Product, id=product_id)
        buyer = request.user
        seller = product.owner

        if buyer == seller:
            return Response({'error': 'You cannot message yourself'}, status=status.HTTP_400_BAD_REQUEST)

        conversation, created = Conversation.objects.get_or_create(
            product=product,
            buyer=buyer,
            seller=seller,
        )
        serializer = self.get_serializer(conversation)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        conversation = self.get_object()
        if conversation.buyer != request.user and conversation.seller != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        messages = conversation.messages.all()
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        conversation = self.get_object()
        if conversation.buyer != request.user and conversation.seller != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        message_text = request.data.get('message', '').strip()
        image = request.FILES.get('image') or request.data.get('image')

        if not message_text and not image:
            return Response({'error': 'Message cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            message=message_text if message_text else '',
            image=image,
        )
        serializer = MessageSerializer(message, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        conversation = self.get_object()
        if conversation.buyer != request.user and conversation.seller != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        conversation.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
        return Response({'status': 'marked as read'})

    @action(detail=True, methods=['delete'], url_path='messages/(?P<message_id>[^/.]+)')
    def delete_message(self, request, pk=None, message_id=None):
        conversation = self.get_object()
        if conversation.buyer != request.user and conversation.seller != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        message = get_object_or_404(Message, id=message_id, conversation=conversation)
        if message.sender != request.user:
            return Response({'error': 'You can only delete your own messages'}, status=status.HTTP_403_FORBIDDEN)
        if message.image:
            message.image.delete(save=False)
        message.delete()
        return Response({'status': 'message deleted'}, status=status.HTTP_204_NO_CONTENT)


class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all marked as read'})


@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    raw_phone = request.data.get('phone_number', '').strip()
    cleaned_phone = re.sub(r'[\s\-\(\)\+]', '', raw_phone)
    if not cleaned_phone or len(cleaned_phone) < 10:
        return Response({'error': 'Please enter a valid 10-digit mobile number.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if already registered
    if Profile.objects.filter(phone_number=cleaned_phone).exists():
        return Response({'error': 'This mobile number is already registered. Please log in.'}, status=status.HTTP_400_BAD_REQUEST)

    # Generate 6-digit OTP
    otp_code = str(random.randint(100000, 999999))
    PhoneOTP.objects.create(
        phone_number=cleaned_phone,
        otp=otp_code,
        is_verified=False
    )

    # Dispatch SMS to the recipient's mobile handset via SMS carrier gateway
    send_sms_otp(cleaned_phone, otp_code)

    formatted_number = f"+91 {cleaned_phone[-10:]}" if len(cleaned_phone) >= 10 else cleaned_phone
    return Response({
        'message': f'Verification OTP code has been sent via SMS to {formatted_number}. Please check your phone.',
        'phone_number': cleaned_phone,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    raw_phone = request.data.get('phone_number', '').strip()
    otp_code = str(request.data.get('otp', '')).strip()
    cleaned_phone = re.sub(r'[\s\-\(\)\+]', '', raw_phone)

    if not cleaned_phone or not otp_code:
        return Response({'error': 'Both mobile number and OTP code are required.'}, status=status.HTTP_400_BAD_REQUEST)

    otp_record = PhoneOTP.objects.filter(phone_number=cleaned_phone, otp=otp_code).order_by('-created_at').first()

    if not otp_record:
        return Response({'error': 'Invalid OTP code. Please check and try again.'}, status=status.HTTP_400_BAD_REQUEST)

    if otp_record.is_expired():
        return Response({'error': 'This OTP code has expired. Please request a new OTP.'}, status=status.HTTP_400_BAD_REQUEST)

    otp_record.is_verified = True
    otp_record.save()

    return Response({
        'verified': True,
        'message': 'Mobile number verified successfully!'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username_or_phone = request.data.get('username', '').strip()
    password = request.data.get('password', '')

    if not username_or_phone or not password:
        return Response({'error': 'Please enter your username/mobile and password.'}, status=status.HTTP_400_BAD_REQUEST)

    target_username = username_or_phone
    cleaned_phone = re.sub(r'[\s\-\(\)\+]', '', username_or_phone)

    # Check if a user profile exists with this mobile number
    profile = Profile.objects.filter(phone_number=cleaned_phone).first()
    if profile:
        target_username = profile.user.username

    user = authenticate(username=target_username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
        })
    return Response({'error': 'Invalid username/mobile or password.'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    request.user.auth_token.delete()
    return Response({'message': 'Logged out successfully'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
