import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  form: FormGroup;
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: [''],
      email: [''],
      password: ['']
    });
  }

  submit() {
    this.error = '';
    this.auth.register(this.form.value).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => (this.error = err?.error?.message || 'Register failed')
    });
  }
}
