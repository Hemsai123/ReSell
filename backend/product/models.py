from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.utils.text import slugify

class Category(models.Model):
    category_name = models.CharField(max_length=50)
    image = models.ImageField(upload_to='category/', blank=True, null=True)
    slug = models.SlugField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.slug and self.category_name:
            self.slug = slugify(self.category_name)
        super(Category, self).save(*args, **kwargs)

    class Meta:
        verbose_name = 'category'
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.category_name


class Brand(models.Model):
    brand_name = models.CharField(max_length=50)

    class Meta:
        verbose_name = 'brand'
        verbose_name_plural = 'brands'

    def __str__(self):
        return self.brand_name


class Product(models.Model):
    CONDITION_TYPE = (
        ("New", "New"),
        ("Used", "Used")
    )
    STATUS_TYPE = (
        ("Available", "Available"),
        ("Sold", "Sold"),
    )

    name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField(max_length=500)
    condition = models.CharField(max_length=100, choices=CONDITION_TYPE)
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True)
    brand = models.ForeignKey('Brand', on_delete=models.SET_NULL, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=0)
    quantity = models.PositiveIntegerField(default=1)
    image = models.ImageField(upload_to='main_product/', blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_TYPE, default='Available')
    created = models.DateTimeField(default=timezone.now)
    slug = models.SlugField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.slug and self.name:
            self.slug = slugify(self.name)
        super(Product, self).save(*args, **kwargs)

    def __str__(self):
        return self.name


class ProductImages(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/', blank=True, null=True)

    def __str__(self):
        return self.product.name

    class Meta:
        verbose_name = 'Product Image'
        verbose_name_plural = 'Product Images'


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(default=0)
    comment = models.TextField(max_length=500, blank=True)
    created = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('product', 'reviewer')

    def __str__(self):
        return f"{self.reviewer.username} - {self.product.name}"


class Conversation(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='conversations')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='buyer_conversations')
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='seller_conversations')
    created = models.DateTimeField(default=timezone.now)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('product', 'buyer', 'seller')
        ordering = ['-updated']

    def __str__(self):
        return f"{self.buyer.username} - {self.product.name} - {self.seller.username}"


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages', null=True, blank=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    message = models.TextField(max_length=1000, blank=True, null=True)
    image = models.ImageField(upload_to='messages/', blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['created']

    def __str__(self):
        return f"{self.sender.username}: {self.message[:50] if self.message else '[Image]'}"


class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    created = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created']

    def __str__(self):
        return f"{self.user.username} - {self.message}"
