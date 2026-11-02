import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Product } from '../../models/product.model';
import { Category, Brand } from '../../models/master.model';
import { Order } from '../../models/order.model';
import { ProductService } from '../../services/product';
import { OrderService } from '../../services/order.service';

type MasterTab = 'items' | 'categories' | 'brands' | 'orders';

@Component({
  selector: 'app-product-form',
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss'
})
export class ProductForm implements OnInit {
  activeTab: MasterTab = 'items';
  loading = false;
  successMessage = '';
  errorMessage = '';

  // Data collections
  products: Product[] = [];
  categories: Category[] = [];
  brands: Brand[] = [];
  orders: Order[] = [];

  // Item Master search/filter
  productSearch = '';

  // Item Master Form State (Add / Edit)
  isItemModalOpen = false;
  isEditingProduct = false;
  editingProductId: number | null = null;
  productForm = {
    name: '',
    description: '',
    price: 0,
    stock: 10,
    category: '',
    brand: '',
    rating: 4.5,
    reviewCount: 0,
    image: '',
    colors: ''
  };

  // Category Master Form State
  newCategory = {
    name: '',
    description: ''
  };

  // Brand Master Form State
  newBrand = {
    name: '',
    description: ''
  };

  // Order statuses
  readonly orderStatuses = ['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadAllMasters();

    // Subscribe to query parameters to handle menu navigation (e.g. ?tab=categories)
    this.route.queryParams.subscribe((params) => {
      if (params['tab']) {
        const tab = params['tab'] as MasterTab;
        if (['items', 'categories', 'brands', 'orders'].includes(tab)) {
          this.setTab(tab);
        }
      }
      if (params['action'] === 'new-item') {
        setTimeout(() => this.openAddProduct(), 150);
      }
    });

    // Check if route has an id param (e.g., /product/edit/:id)
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.activeTab = 'items';
      const prodId = parseInt(idParam, 10);
      if (!isNaN(prodId)) {
        this.openEditProductById(prodId);
      }
    }
  }

  setTab(tab: MasterTab) {
    this.activeTab = tab;
    this.clearAlerts();
    if (tab === 'orders' && this.orders.length === 0) {
      this.loadOrders();
    }
  }

  clearAlerts() {
    this.successMessage = '';
    this.errorMessage = '';
  }

  loadAllMasters() {
    this.loading = true;
    this.clearAlerts();

    // Load Products
    this.productService.getAll().subscribe({
      next: (prods) => {
        this.products = prods;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });

    // Load Categories
    this.productService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
        if (cats.length > 0 && !this.productForm.category) {
          this.productForm.category = cats[0].name;
        }
      }
    });

    // Load Brands
    this.productService.getBrands().subscribe({
      next: (b) => {
        this.brands = b;
        if (b.length > 0 && !this.productForm.brand) {
          this.productForm.brand = b[0].name;
        }
      }
    });
  }

  loadOrders() {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load customer orders.';
        this.loading = false;
      }
    });
  }

  // --------------------------------------------------------------------------
  // ITEM / PRODUCT MASTER
  // --------------------------------------------------------------------------
  get filteredProducts(): Product[] {
    const q = this.productSearch.trim().toLowerCase();
    if (!q) return this.products;
    return this.products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
    );
  }

  openAddProduct() {
    this.isEditingProduct = false;
    this.editingProductId = null;
    this.productForm = {
      name: '',
      description: '',
      price: 0,
      stock: 10,
      category: this.categories[0]?.name || 'Electronics',
      brand: this.brands[0]?.name || 'Nimbus',
      rating: 4.5,
      reviewCount: 0,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      colors: 'Black, Silver'
    };
    this.isItemModalOpen = true;
    this.clearAlerts();
  }

  openEditProduct(product: Product) {
    this.isEditingProduct = true;
    this.editingProductId = product.id;
    this.productForm = {
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category: product.category,
      brand: product.brand,
      rating: product.rating || 4.5,
      reviewCount: product.reviewCount || 0,
      image: product.image || '',
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : ''
    };
    this.isItemModalOpen = true;
    this.clearAlerts();
  }

  openEditProductById(id: number) {
    this.productService.getById(id).subscribe({
      next: (p) => this.openEditProduct(p),
      error: () => (this.errorMessage = `Could not find product #${id}`)
    });
  }

  closeItemModal() {
    this.isItemModalOpen = false;
  }

  saveProduct() {
    if (!this.productForm.name.trim()) {
      this.errorMessage = 'Product name is required.';
      return;
    }
    if (this.productForm.price <= 0) {
      this.errorMessage = 'Price must be greater than zero.';
      return;
    }

    const payload = {
      name: this.productForm.name.trim(),
      description: this.productForm.description.trim(),
      price: Number(this.productForm.price),
      stock: Number(this.productForm.stock),
      category: this.productForm.category,
      brand: this.productForm.brand,
      rating: Number(this.productForm.rating),
      reviewCount: Number(this.productForm.reviewCount),
      image: this.productForm.image.trim() || 'https://picsum.photos/seed/default/400/400',
      colors: this.productForm.colors
        ? this.productForm.colors.split(',').map((c) => c.trim()).filter(Boolean)
        : []
    };

    this.loading = true;
    if (this.isEditingProduct && this.editingProductId) {
      this.productService.update(this.editingProductId, payload).subscribe({
        next: (updated) => {
          this.loading = false;
          this.successMessage = `Product '${updated.name}' updated successfully!`;
          this.closeItemModal();
          this.loadAllMasters();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err?.error?.message || 'Failed to update product.';
        }
      });
    } else {
      this.productService.create(payload).subscribe({
        next: (created) => {
          this.loading = false;
          this.successMessage = `Product '${created.name}' created successfully!`;
          this.closeItemModal();
          this.loadAllMasters();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err?.error?.message || 'Failed to create product.';
        }
      });
    }
  }

  deleteProduct(product: Product) {
    if (!confirm(`Are you sure you want to delete product '${product.name}' (ID: ${product.id})?`)) {
      return;
    }
    this.loading = true;
    this.productService.delete(product.id).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = `Product '${product.name}' deleted.`;
        this.products = this.products.filter((p) => p.id !== product.id);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to delete product.';
      }
    });
  }

  // --------------------------------------------------------------------------
  // CATEGORY MASTER
  // --------------------------------------------------------------------------
  addCategory() {
    if (!this.newCategory.name.trim()) {
      this.errorMessage = 'Category name is required.';
      return;
    }
    this.loading = true;
    this.productService.createCategory(this.newCategory).subscribe({
      next: (created) => {
        this.loading = false;
        this.successMessage = `Category '${created.name}' created successfully!`;
        this.categories.push(created);
        this.newCategory = { name: '', description: '' };
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to add category.';
      }
    });
  }

  deleteCategory(cat: Category) {
    if (!confirm(`Delete category '${cat.name}'?`)) return;
    this.loading = true;
    this.productService.deleteCategory(cat.id).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = `Category '${cat.name}' deleted.`;
        this.categories = this.categories.filter((c) => c.id !== cat.id);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to delete category.';
      }
    });
  }

  // --------------------------------------------------------------------------
  // BRAND MASTER
  // --------------------------------------------------------------------------
  addBrand() {
    if (!this.newBrand.name.trim()) {
      this.errorMessage = 'Brand name is required.';
      return;
    }
    this.loading = true;
    this.productService.createBrand(this.newBrand).subscribe({
      next: (created) => {
        this.loading = false;
        this.successMessage = `Brand '${created.name}' created successfully!`;
        this.brands.push(created);
        this.newBrand = { name: '', description: '' };
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to add brand.';
      }
    });
  }

  deleteBrand(brand: Brand) {
    if (!confirm(`Delete brand '${brand.name}'?`)) return;
    this.loading = true;
    this.productService.deleteBrand(brand.id).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = `Brand '${brand.name}' deleted.`;
        this.brands = this.brands.filter((b) => b.id !== brand.id);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to delete brand.';
      }
    });
  }

  // --------------------------------------------------------------------------
  // ORDERS MASTER (Admin status update)
  // --------------------------------------------------------------------------
  onOrderStatusChange(order: Order, newStatus: string) {
    if (order.status === newStatus) return;
    const oldStatus = order.status;
    order.status = newStatus;

    this.orderService.updateStatus(order.id, newStatus).subscribe({
      next: () => {
        this.successMessage = `Order #${order.id} status updated to '${newStatus}'.`;
      },
      error: (err) => {
        order.status = oldStatus;
        this.errorMessage = err?.error?.message || 'Failed to update order status.';
      }
    });
  }

  deleteOrder(order: Order) {
    if (!confirm(`Are you sure you want to permanently delete order #${order.id}?`)) return;
    this.loading = true;
    this.orderService.deleteOrder(order.id).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = `Order #${order.id} deleted successfully.`;
        this.orders = this.orders.filter((o) => o.id !== order.id);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to delete order.';
      }
    });
  }
}
