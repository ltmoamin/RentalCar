import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <a routerLink="/" class="logo">
          <span class="logo-text">Rental<span class="highlight">Car</span></span>
          <span class="admin-badge">Admin</span>
        </a>
      </div>
      
      <nav class="sidebar-nav">
        <ul>
          <li>
            <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-link">
              <i class="fa-solid fa-chart-simple"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a routerLink="/admin/users" routerLinkActive="active" class="nav-link">
              <i class="fa-solid fa-users"></i>
              <span>Manage Users</span>
            </a>
          </li>
          <li>
            <a routerLink="/admin/cars" routerLinkActive="active" class="nav-link">
              <i class="fa-solid fa-car"></i>
              <span>Manage Cars</span>
            </a>
          </li>
          <li>
            <a routerLink="/admin/bookings" routerLinkActive="active" class="nav-link">
              <i class="fa-solid fa-calendar-check"></i>
              <span>Bookings</span>
            </a>
          </li>
          <li>
            <a routerLink="/admin/reviews" routerLinkActive="active" class="nav-link">
              <i class="fa-solid fa-star"></i>
              <span>Reviews</span>
            </a>
          </li>
          <li>
            <a routerLink="/admin/chat" routerLinkActive="active" class="nav-link">
              <i class="fa-solid fa-comments"></i>
              <span>Customer Chat</span>
            </a>
          </li>
          <li>
            <a routerLink="/admin/support" routerLinkActive="active" class="nav-link">
              <i class="fa-solid fa-headset"></i>
              <span>Support Management</span>
            </a>
          </li>
        </ul>
      </nav>
      
      <div class="sidebar-footer">
        <a routerLink="/profile" class="nav-link">
          <i class="fa-solid fa-user-gear"></i>
          <span>My Account</span>
        </a>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      background: #1e293b;
      color: white;
      position: fixed;
      left: 0;
      top: 0;
      display: flex;
      flex-direction: column;
      z-index: 1000;
      box-shadow: 4px 0 10px rgba(0,0,0,0.1);
    }

    .sidebar-header {
      padding: 2rem 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .logo {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      text-decoration: none;
      color: white;
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.5px;
    }

    .highlight {
      color: #3b82f6;
    }

    .admin-badge {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
      padding: 2px 8px;
      border-radius: 4px;
      width: fit-content;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1.5rem 0;
    }

    .sidebar-nav ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.875rem 1.5rem;
      color: #94a3b8;
      text-decoration: none;
      transition: all 0.2s ease;
      position: relative;
    }

    .nav-link i {
      width: 20px;
      font-size: 1.1rem;
    }

    .nav-link:hover {
      color: white;
      background: rgba(255,255,255,0.05);
    }

    .nav-link.active {
      color: white;
      background: #3b82f6;
    }

    .nav-link.active::after {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: #60a5fa;
    }

    .sidebar-footer {
      padding: 1.5rem;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
  `]
})
export class SidebarComponent { }
