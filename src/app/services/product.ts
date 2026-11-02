import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { Category, Brand } from '../models/master.model';
import { API_URL } from '../config/api';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private base = `${API_URL}api/products`;
  private categoriesUrl = `${API_URL}api/categories`;
  private brandsUrl = `${API_URL}api/brands`;

  constructor(private http: HttpClient) {}

  // Products CRUD
  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.base);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  create(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.base, product);
  }

  update(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.base}/${id}`, product);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }

  // Categories Master CRUD
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl);
  }

  createCategory(category: { name: string; description?: string }): Observable<Category> {
    return this.http.post<Category>(this.categoriesUrl, category);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.categoriesUrl}/${id}`);
  }

  // Brands Master CRUD
  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(this.brandsUrl);
  }

  createBrand(brand: { name: string; description?: string }): Observable<Brand> {
    return this.http.post<Brand>(this.brandsUrl, brand);
  }

  deleteBrand(id: number): Observable<any> {
    return this.http.delete(`${this.brandsUrl}/${id}`);
  }
}
