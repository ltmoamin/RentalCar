import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, AdminHeaderComponent],
  template: `
    <div class="admin-layout">
      <app-sidebar></app-sidebar>
      <div class="admin-main">
        <app-admin-header></app-admin-header>
        <main class="admin-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background-color: #f8fafc;
    }
    .admin-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-left: 260px;
      transition: margin-left 0.3s ease;
    }
    .admin-content {
      padding: 2rem;
      flex: 1;
    }
    @media (max-width: 768px) {
      .admin-main {
        margin-left: 0;
      }
    }
  `]
})
export class AdminLayoutComponent { }
