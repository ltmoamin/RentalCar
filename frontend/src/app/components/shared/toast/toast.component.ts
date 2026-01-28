import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Toast, ToastService } from '../../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts" 
           class="toast" 
           [class]="'toast-' + toast.type"
           @slideIn>
        <i class="fas" [class]="getIcon(toast.type)"></i>
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" (click)="remove(toast.id)">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `,
    styles: [`
    .toast-container {
      position: fixed;
      top: 2rem;
      right: 2rem;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      background: white;
      color: var(--text-primary);
      min-width: 300px;
      animation: slideIn 0.3s ease;
    }

    .toast i:first-child {
      font-size: 1.25rem;
    }

    .toast-message {
      flex: 1;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .toast-close {
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      opacity: 0.6;
      transition: opacity 0.2s;
      padding: 0.25rem;

      &:hover {
        opacity: 1;
      }
    }

    .toast-success {
      border-left: 4px solid #10b981;
      i:first-child { color: #10b981; }
    }

    .toast-error {
      border-left: 4px solid #ef4444;
      i:first-child { color: #ef4444; }
    }

    .toast-warning {
      border-left: 4px solid #f59e0b;
      i:first-child { color: #f59e0b; }
    }

    .toast-info {
      border-left: 4px solid #3b82f6;
      i:first-child { color: #3b82f6; }
    }

    @media (max-width: 640px) {
      .toast-container {
        right: 1rem;
        left: 1rem;
        top: 1rem;
        max-width: 100%;
      }

      .toast {
        min-width: auto;
      }
    }
  `],
    animations: [
        trigger('slideIn', [
            transition(':enter', [
                style({ transform: 'translateX(100%)', opacity: 0 }),
                animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
            ])
        ])
    ]
})
export class ToastComponent implements OnInit, OnDestroy {
    toasts: Toast[] = [];
    private subscription: Subscription = new Subscription();

    constructor(private toastService: ToastService) { }

    ngOnInit(): void {
        this.subscription = this.toastService.toast$.subscribe(toast => {
            this.toasts.push(toast);
            if (toast.duration && toast.duration > 0) {
                setTimeout(() => this.remove(toast.id), toast.duration);
            }
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    remove(id: number): void {
        this.toasts = this.toasts.filter(t => t.id !== id);
    }

    getIcon(type: Toast['type']): string {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type];
    }
}
