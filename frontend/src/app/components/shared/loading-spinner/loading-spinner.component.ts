import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-loading-spinner',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="spinner-container" [class.overlay]="overlay" [class]="'size-' + size">
      <div class="spinner" [style.border-top-color]="color"></div>
      <p *ngIf="message" class="spinner-message">{{ message }}</p>
    </div>
  `,
    styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;

      &.overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 9999;
      }
    }

    .spinner {
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: var(--primary-color);
      animation: spin 0.8s linear infinite;
    }

    .size-sm .spinner {
      width: 20px;
      height: 20px;
      border-width: 2px;
    }

    .size-md .spinner {
      width: 40px;
      height: 40px;
      border-width: 3px;
    }

    .size-lg .spinner {
      width: 60px;
      height: 60px;
      border-width: 4px;
    }

    .spinner-message {
      color: white;
      font-size: 0.875rem;
      font-weight: 500;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class LoadingSpinnerComponent {
    @Input() size: 'sm' | 'md' | 'lg' = 'md';
    @Input() color: string = '#3b82f6';
    @Input() overlay: boolean = false;
    @Input() message?: string;
}
