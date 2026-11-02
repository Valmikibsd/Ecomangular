import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, ProductFilters } from '../../models/product.model';
import { ProductService } from '../../services/product';
import { CartItem } from '../../models/order.model';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, CurrencyPipe, DecimalPipe],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class Products implements OnInit {
  products: Product[] = [];
  loading = true;
  error = '';
  
  // Cart & Checkout
  cart: CartItem[] = [];
  isCartOpen = false;
  shippingAddress = '123 Main Street, Suite 100';
  placingOrder = false;
  orderSuccessMessage = '';
  orderErrorMessage = '';

  // Dummy Payment State
  paymentMethod = 'Credit Card';
  cardNumber = '4242 •••• •••• 4242';
  cardHolderName = 'Demo Customer';
  expiryDate = '12/28';
  cvv = '123';
  simulatingPayment = false;

  readonly categories = ['Electronics', 'Fashion', 'Home', 'Sports', 'Beauty'];
  readonly brands = ['Nimbus', 'Pulse', 'Stride', 'Harbor', 'Hearth', 'Forge', 'Lumina'];
  readonly ratings = [4, 3, 2, 1];

  filters: ProductFilters = {
    search: '',
    categories: [],
    brands: [],
    minPrice: null,
    maxPrice: null,
    minRating: 0,
    inStockOnly: false,
    sort: 'featured'
  };

  constructor(
    private productsApi: ProductService,
    private orderApi: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.productsApi.getAll().subscribe({
      next: (items) => {
        this.products = items;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load the catalog. Try signing in again.';
        this.loading = false;
      }
    });
  }

  get cartCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  get cartTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  addToCart(product: Product) {
    if (product.stock <= 0) return;
    const existing = this.cart.find((i) => i.productId === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image
      });
    }
  }

  updateQuantity(item: CartItem, delta: number) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeFromCart(item);
    }
  }

  removeFromCart(item: CartItem) {
    this.cart = this.cart.filter((i) => i.productId !== item.productId);
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
    this.orderSuccessMessage = '';
    this.orderErrorMessage = '';
  }

  checkout() {
    if (this.cart.length === 0) return;
    if (!this.shippingAddress.trim()) {
      this.orderErrorMessage = 'Please provide a shipping address.';
      return;
    }

    this.placingOrder = true;
    this.simulatingPayment = true;
    this.orderSuccessMessage = '';
    this.orderErrorMessage = '';

    // Simulate dummy payment gateway authorization delay (1 second)
    setTimeout(() => {
      this.simulatingPayment = false;
      const userId = this.authService.getUserId();
      const orderDto = {
        userId: userId,
        shippingAddress: this.shippingAddress.trim(),
        paymentMethod: this.paymentMethod,
        cardNumber: this.cardNumber,
        cardHolderName: this.cardHolderName,
        expiryDate: this.expiryDate,
        cvv: this.cvv,
        items: this.cart.map((item) => ({
          productId: item.productId,
          productName: item.name,
          unitPrice: item.price,
          quantity: item.quantity
        }))
      };

      this.orderApi.createOrder(orderDto).subscribe({
        next: (createdOrder) => {
          this.placingOrder = false;
          const txn = createdOrder.transactionId || 'TXN-SUCCESS';
          this.orderSuccessMessage = `Payment Authorized (${createdOrder.paymentMethod})! Order #${createdOrder.id} placed successfully! Total Paid: $${createdOrder.totalAmount.toFixed(2)} [Ref: ${txn}]`;
          this.cart = [];
          this.isCartOpen = false;
        },
        error: (err) => {
          this.placingOrder = false;
          this.orderErrorMessage = err?.error?.message || 'Payment or order processing failed. Please try again.';
        }
      });
    }, 1000);
  }

  get filtered(): Product[] {
    const search = this.filters.search.trim().toLowerCase();
    const min =
      this.filters.minPrice !== null && this.filters.minPrice !== undefined && String(this.filters.minPrice).trim() !== ''
        ? Number(this.filters.minPrice)
        : 0;
    const max =
      this.filters.maxPrice !== null && this.filters.maxPrice !== undefined && String(this.filters.maxPrice).trim() !== ''
        ? Number(this.filters.maxPrice)
        : Number.POSITIVE_INFINITY;

    let list = this.products.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search) ||
        (p.description ?? '').toLowerCase().includes(search) ||
        p.brand.toLowerCase().includes(search);
      const matchesCategory =
        this.filters.categories.length === 0 || this.filters.categories.includes(p.category);
      const matchesBrand = this.filters.brands.length === 0 || this.filters.brands.includes(p.brand);
      const matchesPrice = p.price >= min && p.price <= max;
      const matchesRating = p.rating >= this.filters.minRating;
      const matchesStock = !this.filters.inStockOnly || p.stock > 0;
      return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesRating && matchesStock;
    });

    switch (this.filters.sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        list = [...list].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
        break;
      default:
        list = [...list].sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return list;
  }

  toggle(list: string[], value: string) {
    const index = list.indexOf(value);
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push(value);
    }
  }

  clearFilters() {
    this.filters = {
      search: '',
      categories: [],
      brands: [],
      minPrice: null,
      maxPrice: null,
      minRating: 0,
      inStockOnly: false,
      sort: 'featured'
    };
  }
}
