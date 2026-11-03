import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  form: FormGroup;
  error = '';
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.auth.hasValidSession()) {
      if (this.auth.isAdmin()) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/shop']);
      }
    }
  }

  fillCustomerDemo() {
    this.form.setValue({ username: 'abc', password: '123' });
    this.error = '';
  }

  fillDemo() {
    this.fillCustomerDemo();
  }

  fillAdminDemo() {
    this.form.setValue({ username: 'admin', password: 'admin123' });
    this.error = '';
  }

  submit() {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Enter username and password';
      return;
    }

    this.loading = true;
    this.auth.login(this.form.value).subscribe({
      next: () => {
        if (this.auth.isAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/shop']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Login failed. Try admin / admin123 or abc / 123.';
      }
    });
  }
}
