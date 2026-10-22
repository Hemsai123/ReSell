import os
import shutil
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from django.conf import settings
from product.models import Category, Brand, Product, ProductImages, Review, Conversation, Message
from accounts.models import Profile

class Command(BaseCommand):
    help = 'Seeds initial sample data for ReSell'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database with sample categories, brands, and listings...')

        # Ensure media directory exists
        media_root = settings.MEDIA_ROOT
        main_product_dir = os.path.join(media_root, 'main_product')
        category_dir = os.path.join(media_root, 'category')
        os.makedirs(main_product_dir, exist_ok=True)
        os.makedirs(category_dir, exist_ok=True)

        static_img_dir = os.path.join(settings.BASE_DIR, 'static', 'images')

        # Helper to copy an image from static to media
        def copy_sample_image(src_name, target_folder, dest_name=None):
            dest_name = dest_name or src_name
            src_path = os.path.join(static_img_dir, src_name)
            target_path = os.path.join(media_root, target_folder, dest_name)
            if os.path.exists(src_path):
                shutil.copyfile(src_path, target_path)
                return f"{target_folder}/{dest_name}"
            return None

        # Users
        admin, _ = User.objects.get_or_create(
            username='admin',
            defaults={'email': 'admin@example.com', 'first_name': 'Admin', 'last_name': 'User'}
        )
        if not admin.check_password('admin123'):
            admin.set_password('admin123')
            admin.is_staff = True
            admin.is_superuser = True
            admin.save()

        alex, _ = User.objects.get_or_create(
            username='alex_trader',
            defaults={'email': 'alex@example.com', 'first_name': 'Alex', 'last_name': 'Morgan'}
        )
        if not alex.check_password('alex12345'):
            alex.set_password('alex12345')
            alex.save()

        priya, _ = User.objects.get_or_create(
            username='priya_sharma',
            defaults={'email': 'priya@example.com', 'first_name': 'Priya', 'last_name': 'Sharma'}
        )
        if not priya.check_password('priya12345'):
            priya.set_password('priya12345')
            priya.save()

        # Seed profile phone numbers for both username and phone-based logins
        p_admin, _ = Profile.objects.get_or_create(user=admin)
        p_admin.phone_number = '9876543212'
        p_admin.is_phone_verified = True
        p_admin.save()

        p_alex, _ = Profile.objects.get_or_create(user=alex)
        p_alex.phone_number = '9876543210'
        p_alex.is_phone_verified = True
        p_alex.save()

        p_priya, _ = Profile.objects.get_or_create(user=priya)
        p_priya.phone_number = '9876543211'
        p_priya.is_phone_verified = True
        p_priya.save()

        # Categories
        cat_data = [
            {'name': 'Electronics', 'slug': 'electronics', 'img': 'cat2.png'},
            {'name': 'Mobile Phones', 'slug': 'mobile-phones', 'img': 'm5.jpg'},
            {'name': 'Cars & Vehicles', 'slug': 'cars-vehicles', 'img': 'cat6.png'},
            {'name': 'Furniture & Decor', 'slug': 'furniture-decor', 'img': 'fr6.jpg'},
            {'name': 'Fashion & Beauty', 'slug': 'fashion-beauty', 'img': 'fa1.jpg'},
            {'name': 'Sports & Hobbies', 'slug': 'sports-hobbies', 'img': 'cat10.png'},
            {'name': 'Books & Learning', 'slug': 'books-learning', 'img': 'bk1.jpg'},
            {'name': 'Bicycles', 'slug': 'bicycles', 'img': 'b1.jpg'},
        ]

        categories = {}
        for c in cat_data:
            img_rel = copy_sample_image(c['img'], 'category') if os.path.exists(os.path.join(static_img_dir, c['img'])) else None
            cat, _ = Category.objects.get_or_create(
                slug=c['slug'],
                defaults={'category_name': c['name'], 'image': img_rel}
            )
            categories[c['slug']] = cat

        # Brands
        brand_names = ['Apple', 'Samsung', 'Sony', 'Dell', 'Nike', 'Honda', 'IKEA', 'Canon', 'Nikon', 'Volvo', 'Audi', 'Royal Enfield', 'Scott', 'Hero']
        brands = {}
        for b_name in brand_names:
            b, _ = Brand.objects.get_or_create(brand_name=b_name)
            brands[b_name] = b

        # Products with authentic matching images
        products_data = [
            {
                'name': 'Apple iPhone 14 Pro - 128GB Space Black',
                'owner': alex,
                'description': 'Pristine condition iPhone 14 Pro, 89% battery health. Comes with original box, cable, and silicone case. No scratches or dents.',
                'condition': 'Used',
                'category': categories.get('mobile-phones'),
                'brand': brands.get('Apple'),
                'price': 64999,
                'quantity': 1,
                'location': 'Mumbai, Maharashtra',
                'status': 'Available',
                'img': 'p10.jpg',
            },
            {
                'name': 'Samsung Galaxy S23 Ultra - 256GB Green',
                'owner': priya,
                'description': 'Flagship S23 Ultra with S-Pen, 200MP camera, 100x zoom. 6 months old with bill, box, and remaining warranty.',
                'condition': 'Used',
                'category': categories.get('mobile-phones'),
                'brand': brands.get('Samsung'),
                'price': 58000,
                'quantity': 1,
                'location': 'Delhi, NCR',
                'status': 'Available',
                'img': 'p1.jpg',
            },
            {
                'name': 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
                'owner': priya,
                'description': 'Brand new in sealed box Sony WH-1000XM5. Industry-leading noise cancellation, 30-hour battery, silver edition.',
                'condition': 'New',
                'category': categories.get('electronics'),
                'brand': brands.get('Sony'),
                'price': 22500,
                'quantity': 2,
                'location': 'Bangalore, Karnataka',
                'status': 'Available',
                'img': 'e3.jpg',
            },
            {
                'name': 'Canon PowerShot G7X Mark III Digital Camera',
                'owner': alex,
                'description': 'Compact 4K vlogging and photography digital camera. 20.1MP 1-inch sensor, flip touchscreen, 4.2x optical zoom. Includes battery and charger.',
                'condition': 'Used',
                'category': categories.get('electronics'),
                'brand': brands.get('Canon'),
                'price': 48500,
                'quantity': 1,
                'location': 'Bangalore, Karnataka',
                'status': 'Available',
                'img': 'e2.jpg',
            },
            {
                'name': 'Nikon D850 Professional DSLR Camera with 24-120mm Lens',
                'owner': alex,
                'description': 'Professional 45.7MP FX full-frame DSLR camera. Shutter count under 8,500. Includes Nikkor 24-120mm f/4G ED VR lens, two batteries, and bag.',
                'condition': 'Used',
                'category': categories.get('electronics'),
                'brand': brands.get('Nikon'),
                'price': 135000,
                'quantity': 1,
                'location': 'Hyderabad, Telangana',
                'status': 'Available',
                'img': 'e6.jpg',
            },
            {
                'name': 'Dell Precision High-Performance Desktop PC & Monitor',
                'owner': priya,
                'description': 'High-performance desktop computer workstation with Intel Core i7 processor, 32GB DDR4 RAM, 1TB NVMe SSD + 2TB HDD, dedicated graphics, and Dell display.',
                'condition': 'Used',
                'category': categories.get('electronics'),
                'brand': brands.get('Dell'),
                'price': 54000,
                'quantity': 1,
                'location': 'Pune, Maharashtra',
                'status': 'Available',
                'img': 'e4.jpg',
            },
            {
                'name': 'Volvo XC90 Inscription Luxury AWD SUV - 2021',
                'owner': alex,
                'description': 'Top-tier luxury 7-seater AWD SUV in onyx black. Panoramic sunroof, Bowers & Wilkins audio, 38,000 km, single owner, comprehensive insurance valid.',
                'condition': 'Used',
                'category': categories.get('cars-vehicles'),
                'brand': brands.get('Volvo'),
                'price': 5200000,
                'quantity': 1,
                'location': 'Mumbai, Maharashtra',
                'status': 'Available',
                'img': 'p7.jpg',
            },
            {
                'name': 'Audi Q3 2.0 TFSI Quattro Premium Edition',
                'owner': priya,
                'description': 'Well-maintained silver Audi Q3 Quattro. All-wheel drive, dual clutch automatic, leather upholstery, full service history from authorized Audi center.',
                'condition': 'Used',
                'category': categories.get('cars-vehicles'),
                'brand': brands.get('Audi'),
                'price': 2450000,
                'quantity': 1,
                'location': 'Delhi, NCR',
                'status': 'Available',
                'img': 'p8.jpg',
            },
            {
                'name': 'Royal Enfield Classic 350 - Stealth Black 2022',
                'owner': alex,
                'description': 'Single-owner Classic 350 with dual-channel ABS, 14,000 km driven. Regularly serviced at authorized RE service center.',
                'condition': 'Used',
                'category': categories.get('cars-vehicles'),
                'brand': brands.get('Royal Enfield'),
                'price': 165000,
                'quantity': 1,
                'location': 'Chennai, Tamil Nadu',
                'status': 'Available',
                'img': 'b12.jpg',
            },
            {
                'name': 'IKEA Poäng Armchair with Leather Cushion',
                'owner': alex,
                'description': 'Very comfortable IKEA birch armchair with brown genuine leather cushion. Clean, smoke-free home.',
                'condition': 'Used',
                'category': categories.get('furniture-decor'),
                'brand': brands.get('IKEA'),
                'price': 4500,
                'quantity': 1,
                'location': 'Pune, Maharashtra',
                'status': 'Available',
                'img': 'fr6.jpg',
            },
            {
                'name': 'Nike Air Jordan 1 Retro High OG - Size UK 9',
                'owner': priya,
                'description': '100% Authentic Air Jordan 1 Chicago colorway, never worn on street, deadstock condition with verified tag.',
                'condition': 'New',
                'category': categories.get('fashion-beauty'),
                'brand': brands.get('Nike'),
                'price': 14999,
                'quantity': 1,
                'location': 'Mumbai, Maharashtra',
                'status': 'Available',
                'img': 'fa1.jpg',
            },
            {
                'name': 'Scott Aspect 950 Mountain Bike - Hydraulic Disc',
                'owner': priya,
                'description': '29er Hardtail MTB with Shimano Altus 18-speed gears and Suntour suspension fork with lockout. Great for trails and city commutes.',
                'condition': 'Used',
                'category': categories.get('bicycles'),
                'brand': brands.get('Scott'),
                'price': 28500,
                'quantity': 1,
                'location': 'Hyderabad, Telangana',
                'status': 'Available',
                'img': 'b1.jpg',
            },
            {
                'name': 'Complete Set: Dune Saga Deluxe Hardcover Edition',
                'owner': alex,
                'description': 'Full Frank Herbert Dune 6-book deluxe hardcover collector edition with colored edges and map endpapers. Like new condition.',
                'condition': 'Used',
                'category': categories.get('books-learning'),
                'brand': None,
                'price': 3800,
                'quantity': 1,
                'location': 'Kolkata, West Bengal',
                'status': 'Available',
                'img': 'bk1.jpg',
            },
        ]

        # Clear previous sample products to ensure 100% accurate image-to-item mapping
        Product.objects.filter(owner__in=[admin, alex, priya]).delete()

        created_products = []
        for p in products_data:
            img_rel = None
            if os.path.exists(os.path.join(static_img_dir, p['img'])):
                img_rel = copy_sample_image(p['img'], 'main_product', f"prod_{p['img']}")

            prod, created = Product.objects.update_or_create(
                name=p['name'],
                defaults={
                    'owner': p['owner'],
                    'description': p['description'],
                    'condition': p['condition'],
                    'category': p['category'],
                    'brand': p['brand'],
                    'price': p['price'],
                    'quantity': p['quantity'],
                    'location': p['location'],
                    'status': p['status'],
                    'image': img_rel,
                }
            )
            created_products.append(prod)

        # Reviews
        if len(created_products) >= 2:
            Review.objects.get_or_create(
                product=created_products[0],
                reviewer=priya,
                defaults={'rating': 5, 'comment': 'Smooth deal! Product was in flawless condition as described. Highly recommend this seller!'}
            )
            Review.objects.get_or_create(
                product=created_products[1],
                reviewer=alex,
                defaults={'rating': 5, 'comment': 'Original sealed piece, prompt response, verified genuine item.'}
            )

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded! Categories: {Category.objects.count()}, Products: {Product.objects.count()}, Users: {User.objects.count()}"
        ))

