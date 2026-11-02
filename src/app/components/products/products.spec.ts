import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Products } from './products';
import { ProductService } from '../../services/product';
import { of } from 'rxjs';
import { DUMMY_PRODUCTS } from '../../data/dummy-products';

describe('Products', () => {
  let component: Products;
  let fixture: ComponentFixture<Products>;
  let productService: jasmine.SpyObj<ProductService>;

  beforeEach(async () => {
    const productSpy = jasmine.createSpyObj('ProductService', ['getAll']);
    productSpy.getAll.and.returnValue(of(DUMMY_PRODUCTS));

    await TestBed.configureTestingModule({
      imports: [Products],
      providers: [
        provideHttpClient(),
        { provide: ProductService, useValue: productSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Products);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    fixture.detectChanges();
  });

  it('should create and load products', () => {
    expect(component).toBeTruthy();
    expect(component.products.length).toBeGreaterThan(0);
    expect(component.loading).toBeFalse();
  });

  it('should filter by search query', () => {
    component.filters.search = 'Headphones';
    const filtered = component.filtered;
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toContain('Headphones');
  });

  it('should add to cart if in stock', () => {
    const inStockItem = component.products.find((p) => p.stock > 0)!;
    const initialCount = component.cartCount;
    component.addToCart(inStockItem);
    expect(component.cartCount).toBe(initialCount + 1);
  });

  it('should not add to cart if out of stock', () => {
    const outOfStockItem = component.products.find((p) => p.stock <= 0) ?? {
      id: 999,
      name: 'Sold Out',
      price: 10,
      stock: 0,
      category: 'Electronics',
      brand: 'Test',
      rating: 5,
      reviewCount: 1,
      image: '',
      colors: []
    };
    const initialCount = component.cartCount;
    component.addToCart(outOfStockItem);
    expect(component.cartCount).toBe(initialCount);
  });
});
