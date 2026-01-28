import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService, Review } from '../../../services/review.service';
import { RatingStarsComponent } from '../../shared/rating-stars/rating-stars.component';

@Component({
    selector: 'app-review-list',
    standalone: true,
    imports: [CommonModule, RatingStarsComponent],
    template: `
    <div class="reviews-section animate-fade-in" *ngIf="!isLoading">
        <header class="reviews-header">
            <div class="summary-card">
                <div class="average-box">
                    <span class="avg-number">{{ averageRating | number:'1.1-1' }}</span>
                    <app-rating-stars [rating]="averageRating" [readonly]="true"></app-rating-stars>
                    <span class="total-reviews">Based on {{ reviews.length }} reviews</span>
                </div>
            </div>
            <h3 class="section-title">Community Feedback</h3>
        </header>

        <div class="reviews-list">
            <div class="review-item animate-slide-up" *ngFor="let review of reviews; let i = index" [style.animation-delay]="i * 0.1 + 's'">
                <div class="review-user-info">
                    <div class="user-avatar-blob">{{ (review.userFullName || 'U').charAt(0) }}</div>
                    <div class="user-meta">
                        <span class="user-name">{{ review.userFullName || 'Anonymous User' }}</span>
                        <span class="review-date">{{ review.createdAt | date:'longDate' }}</span>
                    </div>
                    <div class="review-rating-tag">
                        <app-rating-stars [rating]="review.rating" [readonly]="true"></app-rating-stars>
                    </div>
                </div>
                <div class="review-content-premium">
                    <p>{{ review.comment || 'No comment provided.' }}</p>
                </div>
            </div>
        </div>

        <div class="empty-reviews" *ngIf="reviews.length === 0">
            <div class="empty-icon-blob">
                <i class="fa-regular fa-comments"></i>
            </div>
            <h4>No Reviews Yet</h4>
            <p>Be the first to share your experience with this vehicle!</p>
        </div>
    </div>
    `,
    styles: [`
    .reviews-section {
        margin-top: 4rem;
        padding: 4rem 2rem;
        background: #f8fafc;
        border-radius: 32px;
    }

    .reviews-header {
        margin-bottom: 3rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .summary-card {
        background: white;
        padding: 2rem 3rem;
        border-radius: 24px;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
        margin-bottom: 2rem;
    }

    .average-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .avg-number {
        font-size: 3.5rem;
        font-weight: 900;
        color: #0f172a;
        line-height: 1;
    }

    .total-reviews {
        font-size: 0.9rem;
        color: #64748b;
        font-weight: 500;
    }

    .section-title {
        font-size: 1.75rem;
        font-weight: 800;
        color: #1e293b;
    }

    .reviews-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        gap: 2rem;
    }

    .review-item {
        background: white;
        padding: 2rem;
        border-radius: 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        border: 1px solid #f1f5f9;
        transition: transform 0.3s ease;
    }

    .review-item:hover {
        transform: translateY(-5px);
    }

    .review-user-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
        position: relative;
    }

    .user-avatar-blob {
        width: 44px;
        height: 44px;
        background: #3b82f6;
        color: white;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 1.1rem;
    }

    .user-meta {
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    .user-name {
        font-weight: 700;
        color: #1e293b;
        font-size: 1rem;
    }

    .review-date {
        font-size: 0.8rem;
        color: #94a3b8;
    }

    .review-rating-tag {
        background: #f8fafc;
        padding: 4px 10px;
        border-radius: 8px;
    }

    .review-content-premium {
        color: #475569;
        line-height: 1.6;
        font-size: 0.95rem;
        font-style: italic;
    }

    .empty-reviews {
        text-align: center;
        padding: 4rem 2rem;
    }

    .empty-icon-blob {
        width: 64px;
        height: 64px;
        background: #f1f5f9;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #94a3b8;
        font-size: 1.75rem;
        margin: 0 auto 1.5rem;
    }

    .empty-reviews h4 {
        font-size: 1.25rem;
        color: #1e293b;
        margin-bottom: 0.5rem;
    }

    .empty-reviews p {
        color: #64748b;
    }

    @media (max-width: 640px) {
        .reviews-list {
            grid-template-columns: 1fr;
        }
    }
    `]
})
export class ReviewListComponent implements OnInit {
    @Input() carId!: number;
    reviews: Review[] = [];
    isLoading = true;
    averageRating = 0;

    constructor(private reviewService: ReviewService) { }

    ngOnInit(): void {
        this.loadReviews();
    }

    loadReviews(): void {
        this.isLoading = true;
        this.reviewService.getCarReviews(this.carId).subscribe({
            next: (data) => {
                this.reviews = data;
                this.calculateAverage();
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    private calculateAverage(): void {
        if (this.reviews.length === 0) return;
        const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
        this.averageRating = sum / this.reviews.length;
    }
}
