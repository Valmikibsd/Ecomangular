import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, switchMap, tap, throwError, timeout } from 'rxjs';
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
  private sessionVersion = 0;

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
    const sessionVersion = this.sessionVersion;
    return this.http.post<AuthResponse>(`${API_URL}api/auth/login`, dto).pipe(
      tap((res) => {
        if (sessionVersion === this.sessionVersion) {
          this.persist(res);
        }
      })
    );
  }

  register(dto: RegisterDto) {
    return this.http.post<unknown>(`${API_URL}api/auth/register`, dto);
  }

  refreshAccessToken() {
    const sessionVersion = this.sessionVersion;
    return this.http
      .post<AuthResponse>(`${API_URL}api/auth/refresh`, {
        refreshToken: this.getRefreshToken()
      })
      .pipe(
        switchMap((res) => {
          if (sessionVersion !== this.sessionVersion) {
            return throwError(() => new Error('Session ended before token refresh completed'));
          }
          this.persist(res);
          return of(res);
        })
      );
  }

  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    this.sessionVersion += 1;
    this.clearSession();
    void this.router.navigate(['/login']);

    if (!refreshToken) {
      return of(void 0);
    }

    return this.http.post<void>(`${API_URL}api/auth/logout`, { refreshToken }).pipe(
      timeout({ first: 5000 }),
      catchError(() => of(void 0))
    );
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

  private clearSession() {
    localStorage.removeItem(this.accessKey);
    localStorage.removeItem(this.refreshKey);
    this.auth$.next(false);
  }
}
