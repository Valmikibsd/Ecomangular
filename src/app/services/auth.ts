import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, LoginDto, RegisterDto } from '../models/auth.models';
import { Router } from '@angular/router';
import { decodeJwt, isTokenExpired } from '../utils/jwt.util';
import { API_URL } from '../config/api';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly accessKey = 'ecom_access_token';
  private readonly refreshKey = 'ecom_refresh_token';
  private auth$ = new BehaviorSubject<boolean>(this.hasValidSession());

  constructor(private http: HttpClient, private router: Router) {}

  isLoggedIn(): Observable<boolean> {
    return this.auth$.asObservable();
  }

  hasValidSession(): boolean {
    const refresh = this.getRefreshToken();
    if (refresh && !isTokenExpired(refresh, 0)) {
      return true;
    }
    const access = this.getToken();
    return !!access && !isTokenExpired(access, 0);
  }

  login(dto: LoginDto) {
    return this.http.post<AuthResponse>(`${API_URL}api/auth/login`, dto).pipe(
      tap((res) => this.persist(res))
    );
  }

  register(dto: RegisterDto) {
    return this.http.post<unknown>(`${API_URL}api/auth/register`, dto);
  }

  refreshAccessToken() {
    return this.http
      .post<AuthResponse>(`${API_URL}api/auth/refresh`, {
        refreshToken: this.getRefreshToken()
      })
      .pipe(tap((res) => this.persist(res)));
  }

  logout() {
    localStorage.removeItem(this.accessKey);
    localStorage.removeItem(this.refreshKey);
    this.auth$.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.accessKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshKey);
  }

  getUserId(): number {
    const payload = this.getTokenPayload() as Record<string, unknown> | null;
    const sub =
      (payload?.['sub'] as string) ??
      (payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] as string) ??
      '1';
    const parsed = parseInt(sub, 10);
    return isNaN(parsed) ? 1 : parsed;
  }

  getUsername(): string {
    const payload = this.getTokenPayload() as Record<string, unknown> | null;
    return (
      (payload?.['username'] as string) ??
      (payload?.['name'] as string) ??
      (payload?.['unique_name'] as string) ??
      (payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] as string) ??
      'Customer'
    );
  }

  getTokenPayload() {
    return decodeJwt(this.getToken()) ?? decodeJwt(this.getRefreshToken());
  }

  isAdmin(): boolean {
    const payload = this.getTokenPayload() as Record<string, unknown> | null;
    const role =
      (payload?.['role'] as string) ??
      (payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as string);
    return role === 'Admin';
  }

  private persist(res: AuthResponse) {
    const access = res.accessToken || res.token;
    if (access) {
      localStorage.setItem(this.accessKey, access);
    }
    if (res.refreshToken) {
      localStorage.setItem(this.refreshKey, res.refreshToken);
    }
    this.auth$.next(true);
  }
}
