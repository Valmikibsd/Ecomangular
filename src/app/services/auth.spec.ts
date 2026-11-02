import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth';
import { API_URL } from '../config/api';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.clear();
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false for hasValidSession when no token is present', () => {
    expect(service.hasValidSession()).toBeFalse();
  });

  it('should send login request and persist tokens on success', () => {
    service.login({ username: 'abc', password: '123' }).subscribe((res) => {
      expect(res.token).toBe('test-token');
    });

    const req = httpMock.expectOne(`${API_URL}api/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'test-token', refreshToken: 'test-refresh' });

    expect(service.getToken()).toBe('test-token');
    expect(service.getRefreshToken()).toBe('test-refresh');
  });

  it('should clear tokens on logout', () => {
    localStorage.setItem('ecom_access_token', 'test');
    localStorage.setItem('ecom_refresh_token', 'test-refresh');
    service.logout();
    expect(service.getToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
  });
});
