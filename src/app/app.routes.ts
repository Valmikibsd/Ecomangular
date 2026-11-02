import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Products } from './components/products/products';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { ProductForm } from './components/product-form/product-form';
import { AuthGuard } from './guards/auth-guard';
import { AdminGuard } from './guards/admin-guard';
import { CustomerGuard } from './guards/customer-guard';
import { RoleRedirectGuard } from './guards/role-redirect-guard';

export const routes: Routes = [
  // Root URL redirects intelligently by role: Admin -> /admin, Customer -> /shop
  { path: '', canActivate: [RoleRedirectGuard], children: [] },

  { path: 'login', component: Login },
  { path: 'register', component: Register },

  // Customer Shopping Page (Admins are strictly blocked by CustomerGuard and redirected to /admin)
  { path: 'shop', component: Products, canActivate: [CustomerGuard] },

  // Admin Master Management Pages (Customers are blocked by AdminGuard and redirected to /shop)
  { path: 'admin', component: ProductForm, canActivate: [AdminGuard] },
  { path: 'admin/master', component: ProductForm, canActivate: [AdminGuard] },
  { path: 'product/new', component: ProductForm, canActivate: [AdminGuard] },
  { path: 'product/edit/:id', component: ProductForm, canActivate: [AdminGuard] },

  // Fallback
  { path: '**', canActivate: [RoleRedirectGuard], children: [] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
