import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fill demo credentials', () => {
    component.fillDemo();
    expect(component.form.value).toEqual({ username: 'abc', password: '123' });
  });

  it('should fill admin demo credentials', () => {
    component.fillAdminDemo();
    expect(component.form.value).toEqual({ username: 'admin', password: 'admin123' });
  });

  it('should mark form invalid if submitted empty', () => {
    component.submit();
    expect(component.error).toBe('Enter username and password');
  });
});
