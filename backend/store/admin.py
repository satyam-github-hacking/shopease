from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Category, Brand, Product, Cart, CartItem, Order, OrderItem, Review, Wishlist

admin.site.register(User, UserAdmin)
admin.site.register(Category)
admin.site.register(Brand)
admin.site.register(Product)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Review)
admin.site.register(Wishlist)
