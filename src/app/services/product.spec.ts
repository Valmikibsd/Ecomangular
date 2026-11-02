import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductService } from './product';
import { API_URL } from '../config/api';
import { Product } from '../models/product.model';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all products from API', () => {
    const mockProducts: Product[] = [
      {
        id: 1,
        name: 'Test Product',
        price: 99,
        stock: 5,
        category: 'Electronics',
        brand: 'Nimbus',
        rating: 4.5,
        reviewCount: 10,
        image: '',
        colors: []
      }
    ];

    service.getAll().subscribe((products) => {
      expect(products.length).toBe(1);
      expect(products[0].name).toBe('Test Product');
    });

    const req = httpMock.expectOne(`${API_URL}api/products`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });
});
