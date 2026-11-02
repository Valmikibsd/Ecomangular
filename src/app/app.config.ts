import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';

import { provideRouter } from '@angular/router';

import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS
} from '@angular/common/http';

import { routes } from './app.routes';
import { API_URL } from './config/api';
import { JwtInterceptor } from './interceptors/jwt-interceptor';
// MockApiInterceptor is kept for reference but disabled — real backend is used.
// import { MockApiInterceptor } from './interceptors/mock-api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideZoneChangeDetection({
      eventCoalescing: true
    }),

    provideRouter(routes),

    provideHttpClient(
      withInterceptorsFromDi()
    ),

    // JWT interceptor — attaches Bearer token to every request
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },

    // To re-enable mock API (offline dev), uncomment the block below and
    // import MockApiInterceptor above.
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: MockApiInterceptor,
    //   multi: true
    // }
  ]
};

export const AppConfig = {
  apiUrl: API_URL
};