from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction
from django.db.models import Sum, Count
from .models import User, Category, Brand, Product, Cart, CartItem, Order, OrderItem, Review, Wishlist
from .serializers import (
    RegisterSerializer, UserSerializer, CategorySerializer, BrandSerializer,
    ProductSerializer, CartSerializer, CartItemSerializer,
    OrderSerializer, ReviewSerializer, WishlistSerializer
)

# ── Auth ────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    from django.contrib.auth import authenticate
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response(UserSerializer(request.user).data)

# ── Catalog ──────────────────────────────────────────────────────────────────

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class BrandListView(generics.ListAPIView):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [AllowAny]

class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Product.objects.select_related('category', 'brand').prefetch_related('reviews')
        search = self.request.query_params.get('search')
        category = self.request.query_params.get('category')
        if search:
            qs = qs.filter(title__icontains=search)
        if category:
            qs = qs.filter(category__id=category)
        return qs

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.select_related('category', 'brand').prefetch_related('reviews')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

# ── Cart ─────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cart_view(request):
    cart, _ = Cart.objects.get_or_create(user=request.user)
    return Response(CartSerializer(cart).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    cart, _ = Cart.objects.get_or_create(user=request.user)
    product_id = request.data.get('product_id')
    quantity = int(request.data.get('quantity', 1))
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)
    item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    if not created:
        item.quantity += quantity
    else:
        item.quantity = quantity
    item.save()
    return Response(CartSerializer(cart).data)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def cart_item_view(request, item_id):
    try:
        item = CartItem.objects.get(id=item_id, cart__user=request.user)
    except CartItem.DoesNotExist:
        return Response({'error': 'Item not found'}, status=404)
    if request.method == 'DELETE':
        item.delete()
        cart = Cart.objects.get(user=request.user)
        return Response(CartSerializer(cart).data)
    item.quantity = int(request.data.get('quantity', 1))
    item.save()
    cart = Cart.objects.get(user=request.user)
    return Response(CartSerializer(cart).data)

# ── Orders ───────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_order(request):
    cart, _ = Cart.objects.get_or_create(user=request.user)
    items = cart.items.select_related('product').all()
    if not items:
        return Response({'error': 'Cart is empty'}, status=400)
    shipping_address = request.data.get('shipping_address', '')
    with transaction.atomic():
        order = Order.objects.create(
            user=request.user,
            total=cart.total,
            shipping_address=shipping_address,
        )
        for item in items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price,
            )
        items.delete()
    return Response(OrderSerializer(order).data, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def orders_view(request):
    orders = Order.objects.filter(user=request.user).prefetch_related('items__product').order_by('-created_at')
    return Response(OrderSerializer(orders, many=True).data)

# ── Reviews ──────────────────────────────────────────────────────────────────

class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer

    def get_permissions(self):
        return [AllowAny()] if self.request.method == 'GET' else [IsAuthenticated()]

    def get_queryset(self):
        return Review.objects.filter(product_id=self.kwargs['product_id'])

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, product_id=self.kwargs['product_id'])

# ── Wishlist ─────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def wishlist_view(request):
    if request.method == 'GET':
        items = Wishlist.objects.filter(user=request.user).select_related('product')
        return Response(WishlistSerializer(items, many=True).data)
    product_id = request.data.get('product_id')
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)
    item, created = Wishlist.objects.get_or_create(user=request.user, product=product)
    if not created:
        item.delete()
        return Response({'status': 'removed'})
    return Response({'status': 'added'})

# ── Seller Dashboard ─────────────────────────────────────────────────────────

def is_seller(user):
    return user.is_authenticated and user.role in ('seller', 'admin')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seller_stats(request):
    if not is_seller(request.user):
        return Response({'error': 'Seller access required'}, status=403)
    products = Product.objects.count()
    orders = Order.objects.count()
    revenue = Order.objects.aggregate(total=Sum('total'))['total'] or 0
    customers = User.objects.filter(role='user').count()
    recent_orders = Order.objects.select_related('user').prefetch_related('items__product').order_by('-created_at')[:5]
    return Response({
        'products': products,
        'orders': orders,
        'revenue': float(revenue),
        'customers': customers,
        'recent_orders': OrderSerializer(recent_orders, many=True).data,
    })

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def seller_products(request):
    if not is_seller(request.user):
        return Response({'error': 'Seller access required'}, status=403)
    if request.method == 'GET':
        products = Product.objects.select_related('category', 'brand').prefetch_related('reviews').order_by('-created_at')
        return Response(ProductSerializer(products, many=True).data)
    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def seller_product_detail(request, pk):
    if not is_seller(request.user):
        return Response({'error': 'Seller access required'}, status=403)
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    if request.method == 'GET':
        return Response(ProductSerializer(product).data)
    if request.method == 'PUT':
        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    product.delete()
    return Response(status=204)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seller_orders(request):
    if not is_seller(request.user):
        return Response({'error': 'Seller access required'}, status=403)
    orders = Order.objects.select_related('user').prefetch_related('items__product').order_by('-created_at')
    return Response(OrderSerializer(orders, many=True).data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def seller_order_update(request, pk):
    if not is_seller(request.user):
        return Response({'error': 'Seller access required'}, status=403)
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    order.status = request.data.get('status', order.status)
    order.save()
    return Response(OrderSerializer(order).data)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def seller_categories(request):
    if not is_seller(request.user):
        return Response({'error': 'Seller access required'}, status=403)
    if request.method == 'GET':
        return Response(CategorySerializer(Category.objects.all(), many=True).data)
    s = CategorySerializer(data=request.data)
    if s.is_valid():
        s.save()
        return Response(s.data, status=201)
    return Response(s.errors, status=400)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def seller_brands(request):
    if not is_seller(request.user):
        return Response({'error': 'Seller access required'}, status=403)
    if request.method == 'GET':
        return Response(BrandSerializer(Brand.objects.all(), many=True).data)
    s = BrandSerializer(data=request.data)
    if s.is_valid():
        s.save()
        return Response(s.data, status=201)
    return Response(s.errors, status=400)
