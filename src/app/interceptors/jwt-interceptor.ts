import { Injectable, Injector } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth';
import { isTokenExpired } from '../utils/jwt.util';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private refreshing = false;
  private refresh$ = new BehaviorSubject<string | null>(null);

  constructor(private injector: Injector) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.isPublic(req)) {
      return next.handle(req);
    }

    const auth = this.auth();
    const token = auth.getToken();
    const withToken = token ? this.withAuth(req, token) : req;

    if (token && isTokenExpired(token) && auth.getRefreshToken() && !isTokenExpired(auth.getRefreshToken(), 0)) {
      return this.refreshAndRetry(req, next);
    }

    return next.handle(withToken).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && auth.getRefreshToken()) {
          return this.refreshAndRetry(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  private refreshAndRetry(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.refreshing) {
      this.refreshing = true;
      this.refresh$.next(null);
      return this.auth()
        .refreshAccessToken()
        .pipe(
          switchMap((res) => {
            const access = res?.accessToken || res?.token;
            this.refreshing = false;
            if (!access) {
              this.auth().logout();
              return throwError(() => new Error('No access token returned on refresh'));
            }
            this.refresh$.next(access);
            return next.handle(this.withAuth(req, access));
          }),
          catchError((err) => {
            this.refreshing = false;
            this.refresh$.error(err);
            this.refresh$ = new BehaviorSubject<string | null>(null);
            this.auth().logout();
            return throwError(() => err);
          })
        );
    }

    return this.refresh$.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) => next.handle(this.withAuth(req, token)))
    );
  }

  private withAuth(req: HttpRequest<unknown>, token: string) {
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  private isPublic(req: HttpRequest<unknown>) {
    return (
      req.url.includes('/api/auth/login') ||
      req.url.includes('/api/auth/register') ||
      req.url.includes('/api/auth/refresh')
    );
  }

  private auth() {
    return this.injector.get(AuthService);
  }
}
