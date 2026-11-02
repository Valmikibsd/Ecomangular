import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOrderDto, Order } from '../models/order.model';
import { API_URL } from '../config/api';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private base = `${API_URL}api/orders`;

  constructor(private http: HttpClient) {}

  createOrder(dto: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(this.base, dto);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${id}`);
  }

  getOrdersByUserId(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/user/${userId}`);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.base);
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.base}/${id}/status`, { status });
  }

  deleteOrder(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
