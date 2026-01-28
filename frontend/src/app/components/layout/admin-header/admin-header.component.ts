import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';
import { NotificationBellComponent } from '../../shared/notification-bell/notification-bell.component';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [RouterModule, CommonModule, NotificationBellComponent],
  template: `
    <header class="admin-header">
      <div class="header-left">
        <button class="icon-btn search-toggle">
          <i class="fas fa-search"></i>
        </button>
        <div class="search-bar">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Search for users, cars, bookings... (Coming soon)">
        </div>
      </div>

      <div class="header-right">
        <app-notification-bell></app-notification-bell>
        
        <div class="user-profile-wrapper" *ngIf="currentUser">
          <button class="profile-btn" (click)="toggleUserMenu()">
            <div class="avatar">{{ getInitials() }}</div>
            <div class="profile-info">
              <span class="name">{{ currentUser.firstName }}</span>
              <span class="role">Administrator</span>
            </div>
            <i class="fas fa-chevron-down"></i>
          </button>

          <div class="profile-dropdown" *ngIf="showUserMenu">
            <div class="dropdown-header">
              <strong>{{ currentUser.firstName }} {{ currentUser.lastName }}</strong>
              <span>{{ currentUser.email }}</span>
            </div>
            <div class="divider"></div>
            <a routerLink="/profile" (click)="closeUserMenu()" class="dropdown-item">
              <i class="fas fa-user-circle"></i>
              Account Settings
            </a>
            <a routerLink="/" (click)="closeUserMenu()" class="dropdown-item">
              <i class="fas fa-external-link-alt"></i>
              View Public Site
            </a>
            <div class="divider"></div>
            <button class="dropdown-item logout-btn" (click)="logout()">
              <i class="fas fa-sign-out-alt"></i>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .admin-header {
      height: 70px;
      background: white;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      position: sticky;
      top: 0;
      z-index: 900;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex: 1;
    }

    .search-bar {
      display: flex;
      align-items: center;
      background: #f1f5f9;
      border-radius: 8px;
      padding: 0.5rem 1rem;
      width: 100%;
      max-width: 400px;
      gap: 0.75rem;
    }

    .search-bar i {
      color: #94a3b8;
    }

    .search-bar input {
      border: none;
      background: transparent;
      outline: none;
      width: 100%;
      font-size: 0.9rem;
      color: #1e293b;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .icon-btn {
      background: transparent;
      border: none;
      color: #64748b;
      font-size: 1.25rem;
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .icon-btn:hover {
      background: #f1f5f9;
      color: #3b82f6;
    }

    .user-profile-wrapper {
      position: relative;
    }

    .profile-btn {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 12px;
      transition: all 0.2s;
    }

    .profile-btn:hover {
      background: #f8fafc;
    }

    .avatar {
      width: 40px;
      height: 40px;
      background: #3b82f6;
      color: white;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1rem;
    }

    .profile-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-right: 0.5rem;
    }

    .name {
      font-weight: 600;
      font-size: 0.95rem;
      color: #1e293b;
    }

    .role {
      font-size: 0.75rem;
      color: #64748b;
    }

    .profile-btn i {
      color: #94a3b8;
      font-size: 0.8rem;
    }

    .profile-dropdown {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: 240px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
      padding: 0.5rem;
      animation: slideIn 0.2s ease;
    }

    .dropdown-header {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .dropdown-header strong {
      color: #1e293b;
      font-size: 0.95rem;
    }

    .dropdown-header span {
      color: #64748b;
      font-size: 0.85rem;
    }

    .divider {
      height: 1px;
      background: #e2e8f0;
      margin: 0.5rem 0;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: #475569;
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.2s;
      width: 100%;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .dropdown-item:hover {
      background: #f1f5f9;
      color: #3b82f6;
    }

    .logout-btn {
      color: #ef4444;
    }

    .logout-btn:hover {
      background: #fef2f2;
      color: #ef4444;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 640px) {
      .search-bar {
        display: none;
      }
      .profile-info {
        display: none;
      }
    }
  `]
})
export class AdminHeaderComponent implements OnInit {
  currentUser: User | null = null;
  showUserMenu = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeUserMenu();
    this.router.navigate(['/']);
  }

  getInitials(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.firstName.charAt(0)}${this.currentUser.lastName.charAt(0)}`.toUpperCase();
  }
}
