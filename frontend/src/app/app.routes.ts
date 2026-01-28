import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';
import { ProfileComponent } from './pages/user/profile/profile.component';
import { ProfileEditComponent } from './pages/user/profile-edit/profile-edit.component';
import { ChangePasswordComponent } from './pages/user/change-password/change-password.component';
import { RoleManagementComponent } from './pages/admin/role-management/role-management.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { UserLayoutComponent } from './components/layout/user-layout/user-layout.component';
import { AdminLayoutComponent } from './components/layout/admin-layout/admin-layout.component';
import { CarListComponent } from './pages/cars/car-list/car-list.component';
import { CarDetailsComponent } from './pages/cars/car-details/car-details.component';
import { AdminCarManagementComponent } from './pages/admin/car-management/car-management.component';
import { MyBookingsComponent } from './pages/user/my-bookings/my-bookings.component';
import { BookingManagementComponent } from './pages/admin/booking-management/booking-management.component';
import { AdminReviewsComponent } from './pages/admin/review-management/review-management.component';

import { CheckoutComponent } from './pages/payments/checkout/checkout.component';
import { PaymentSuccessComponent } from './pages/payments/payment-success/payment-success.component';

export const routes: Routes = [
  // User/Public pages
  {
    path: '',
    component: UserLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password/:token', component: ResetPasswordComponent },
      { path: 'cars', component: CarListComponent },
      { path: 'cars/:id', component: CarDetailsComponent },
      {
        path: 'checkout/:bookingId',
        component: CheckoutComponent,
        canActivate: [authGuard]
      },
      {
        path: 'payment-success',
        component: PaymentSuccessComponent,
        canActivate: [authGuard]
      },
      {
        path: 'chat',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/chat/chat/chat.component').then(m => m.ChatComponent)
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        children: [
          { path: '', component: ProfileComponent },
          { path: 'edit', component: ProfileEditComponent },
          { path: 'change-password', component: ChangePasswordComponent },
          { path: 'my-bookings', component: MyBookingsComponent },
          {
            path: 'notifications',
            loadComponent: () => import('./pages/user/notification-center/notification-center.component').then(m => m.NotificationCenterComponent)
          },
          {
            path: 'support',
            children: [
              {
                path: '',
                loadComponent: () => import('./pages/user/support-dashboard/support-dashboard.component').then(m => m.SupportDashboardComponent)
              },
              {
                path: 'create',
                loadComponent: () => import('./pages/user/create-ticket/create-ticket.component').then(m => m.CreateTicketComponent)
              },
              {
                path: ':id',
                loadComponent: () => import('./pages/user/ticket-thread/ticket-thread.component').then(m => m.TicketThreadComponent)
              }
            ]
          }
        ]
      }
    ]
  },

  // Admin pages
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: 'users', component: RoleManagementComponent },
      { path: 'cars', component: AdminCarManagementComponent },
      { path: 'bookings', component: BookingManagementComponent },
      { path: 'reviews', component: AdminReviewsComponent },
      {
        path: 'support',
        loadComponent: () => import('./pages/admin/support-management/support-management.component').then(m => m.SupportManagementComponent)
      },
      {
        path: 'support/:id',
        loadComponent: () => import('./pages/user/ticket-thread/ticket-thread.component').then(m => m.TicketThreadComponent)
      },
      {
        path: 'chat',
        loadComponent: () => import('./pages/chat/chat/chat.component').then(m => m.ChatComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./pages/user/notification-center/notification-center.component').then(m => m.NotificationCenterComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: '**', redirectTo: 'dashboard' }
    ]
  },

  // Fallback
  { path: '**', redirectTo: '' }
];
