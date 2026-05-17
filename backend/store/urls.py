from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.register_view),
    path('auth/login/', views.login_view),
    path('auth/me/', views.me_view),

    # Catalog
    path('categories/', views.CategoryListView.as_view()),
    path('brands/', views.BrandListView.as_view()),
    path('products/', views.ProductListView.as_view()),
    path('products/<int:pk>/', views.ProductDetailView.as_view()),
    path('products/<int:product_id>/reviews/', views.ReviewListCreateView.as_view()),

    # Cart
    path('cart/', views.cart_view),
    path('cart/add/', views.add_to_cart),
    path('cart/items/<int:item_id>/', views.cart_item_view),

    # Orders
    path('orders/', views.orders_view),
    path('orders/place/', views.place_order),

    # Wishlist
    path('wishlist/', views.wishlist_view),

    # Seller dashboard
    path('seller/stats/', views.seller_stats),
    path('seller/products/', views.seller_products),
    path('seller/products/<int:pk>/', views.seller_product_detail),
    path('seller/orders/', views.seller_orders),
    path('seller/orders/<int:pk>/', views.seller_order_update),
    path('seller/categories/', views.seller_categories),
    path('seller/brands/', views.seller_brands),
]
