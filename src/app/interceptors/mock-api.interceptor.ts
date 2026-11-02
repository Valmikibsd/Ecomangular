import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { AuthResponse } from '../models/auth.models';
import { DUMMY_PRODUCTS } from '../data/dummy-products';
import { createJwt, decodeJwt, isTokenExpired } from '../utils/jwt.util';

const ACCESS_TTL = 90;
const REFRESH_TTL = 60 * 60 * 24;

@Injectable()
export class MockApiInterceptor implements HttpInterceptor {
  private users = new Map<string, string>([['abc', '123']]);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!req.url.includes('/api/')) {
      return next.handle(req);
    }

    return of(null).pipe(
      delay(220),
      switchMap(() => this.handleApi(req))
    );
  }

  private handleApi(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    if (req.url.includes('/api/auth/login') && req.method === 'POST') {
      return this.login(req);
    }
    if (req.url.includes('/api/auth/refresh') && req.method === 'POST') {
      return this.refresh(req);
    }
    if (req.url.includes('/api/auth/register') && req.method === 'POST') {
      return this.register(req);
    }
    if (req.url.includes('/api/products') && req.method === 'GET') {
      return this.products(req);
    }

    return this.fail(404, 'Not found', req.url);
  }

  private register(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    const body = (req.body ?? {}) as { username?: string; password?: string };
    const user = (body.username || '').trim().toLowerCase();
    const password = String(body.password ?? '');

    if (!user || !password) {
      return this.fail(400, 'Username and password are required', req.url);
    }

    this.users.set(user, password);
    return this.ok({ message: `Registered successfully. Sign in with ${user} or demo credentials.` });
  }

  private login(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    const body = (req.body ?? {}) as { username?: string; email?: string; password?: string };
    const user = (body.username || body.email || '').trim().toLowerCase();
    const password = String(body.password ?? '');

    if (this.users.has(user) && this.users.get(user) === password) {
      return this.ok(this.issueTokens(user));
    }
    return this.fail(401, 'Invalid username or password', req.url);
  }

  private refresh(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    const body = (req.body ?? {}) as { refreshToken?: string };
    const payload = decodeJwt(body.refreshToken ?? null);
    if (!payload || payload.typ !== 'refresh' || isTokenExpired(body.refreshToken ?? null, 0)) {
      return this.fail(401, 'Refresh token expired', req.url);
    }
    return this.ok(this.issueTokens(payload.username, payload.role));
  }

  private products(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    const header = req.headers.get('Authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    const payload = decodeJwt(token);
    if (!token || !payload || payload.typ !== 'access' || isTokenExpired(token, 0)) {
      return this.fail(401, 'Access token expired', req.url);
    }
    return this.ok(DUMMY_PRODUCTS);
  }

  private issueTokens(username = 'abc', role = 'Customer'): AuthResponse {
    const accessToken = createJwt({ sub: '1', username, role, typ: 'access' }, ACCESS_TTL);
    const refreshToken = createJwt({ sub: '1', username, role, typ: 'refresh' }, REFRESH_TTL);
    const expiration = new Date(Date.now() + ACCESS_TTL * 1000).toISOString();
    return { token: accessToken, accessToken, refreshToken, expiration, username, role };
  }

  private ok<T>(body: T): Observable<HttpEvent<T>> {
    return of(new HttpResponse({ status: 200, body }));
  }

  private fail(status: number, message: string, url: string): Observable<HttpEvent<never>> {
    return throwError(
      () =>
        new HttpErrorResponse({
          status,
          statusText: message,
          error: { message },
          url
        })
    );
  }
}
