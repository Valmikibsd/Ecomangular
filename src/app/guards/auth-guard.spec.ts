import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AuthGuard } from './auth-guard';
import { AuthService } from '../services/auth';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['hasValidSession']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        provideHttpClient(),
        provideRouter([]),
        { provide: AuthService, useValue: authSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation when session is valid', () => {
    authService.hasValidSession.and.returnValue(true);
    expect(guard.canActivate()).toBeTrue();
  });

  it('should redirect to /login when session is invalid', () => {
    authService.hasValidSession.and.returnValue(false);
    const result = guard.canActivate();
    expect(result).toEqual(router.parseUrl('/login'));
  });
});
