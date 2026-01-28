import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-rating-stars',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="stars-container" [class.interactive]="!readonly">
        <span *ngFor="let star of stars; let i = index" 
              class="star" 
              [class.filled]="i < (hoverRating || rating)"
              (mouseenter)="onMouseEnter(i + 1)"
              (mouseleave)="onMouseLeave()"
              (click)="onStarClick(i + 1)">
            <i [class]="i < (hoverRating || rating) ? 'fa-solid fa-star' : 'fa-regular fa-star'"></i>
        </span>
        <span class="rating-value" *ngIf="showValue && (hoverRating || rating) > 0">
            {{ getRatingLabel(hoverRating || rating) }}
        </span>
    </div>
    `,
    styles: [`
    .stars-container {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        user-select: none;
    }

    .star {
        font-size: 1.25rem;
        color: #e2e8f0;
        transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .interactive .star {
        cursor: pointer;
    }

    .interactive .star:hover {
        transform: scale(1.3);
    }

    .star.filled {
        color: #ffb300;
        filter: drop-shadow(0 0 8px rgba(255, 179, 0, 0.3));
    }

    .rating-value {
        margin-left: 10px;
        font-weight: 700;
        color: #1e293b;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        background: #f1f5f9;
        padding: 4px 10px;
        border-radius: 6px;
    }
    `]
})
export class RatingStarsComponent {
    @Input() rating: number = 0;
    @Input() readonly: boolean = true;
    @Input() showValue: boolean = false;
    @Output() ratingChange = new EventEmitter<number>();

    stars = [1, 2, 3, 4, 5];
    hoverRating: number = 0;

    onMouseEnter(index: number): void {
        if (!this.readonly) {
            this.hoverRating = index;
        }
    }

    onMouseLeave(): void {
        if (!this.readonly) {
            this.hoverRating = 0;
        }
    }

    onStarClick(index: number): void {
        if (!this.readonly) {
            this.rating = index;
            this.ratingChange.emit(this.rating);
        }
    }

    getRatingLabel(value: number): string {
        if (!this.showValue) return '';
        const labels: { [key: number]: string } = {
            1: 'Poor',
            2: 'Fair',
            3: 'Good',
            4: 'Very Good',
            5: 'Excellent'
        };
        return labels[value] || '';
    }
}
