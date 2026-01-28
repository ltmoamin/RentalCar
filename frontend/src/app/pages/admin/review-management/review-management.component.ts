import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService, Review } from '../../../services/review.service';
import { RatingStarsComponent } from '../../../components/shared/rating-stars/rating-stars.component';
import { ToastService } from '../../../services/toast.service';
import { LoadingSpinnerComponent } from '../../../components/shared/loading-spinner/loading-spinner.component';

@Component({
    selector: 'app-admin-reviews',
    standalone: true,
    imports: [CommonModule, FormsModule, RatingStarsComponent, LoadingSpinnerComponent],
    template: `
    <div class="admin-reviews-page">
        <div class="container">
            <header class="page-header animate-slide-up">
                <div class="title-group">
                    <h1>Review Moderation</h1>
                    <p>Manage and moderate user reviews and ratings.</p>
                </div>
            </header>

            <div class="filter-section animate-fade-in">
                <div class="filter-group">
                    <label>Status Filter</label>
                    <div class="status-filters">
                        <button [class.active]="statusFilter === 'ALL'" (click)="statusFilter = 'ALL'">All</button>
                        <button [class.active]="statusFilter === 'PENDING'" (click)="statusFilter = 'PENDING'">Pending</button>
                        <button [class.active]="statusFilter === 'APPROVED'" (click)="statusFilter = 'APPROVED'">Approved</button>
                        <button [class.active]="statusFilter === 'HIDDEN'" (click)="statusFilter = 'HIDDEN'">Hidden</button>
                    </div>
                </div>

                <div class="filter-group">
                    <label>Rating Filter</label>
                    <select [(ngModel)]="ratingFilter" class="form-select">
                        <option value="0">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>
                </div>
            </div>

            <div class="reviews-table-container animate-slide-up" *ngIf="!isLoading">
                <table class="premium-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Vehicle</th>
                            <th>Rating</th>
                            <th>Comment</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let review of filteredReviews">
                            <td>
                                <div class="user-cell">
                                    <div class="avatar">{{ review.userFullName.charAt(0) }}</div>
                                    <span>{{ review.userFullName }}</span>
                                </div>
                            </td>
                            <td>{{ review.carName }}</td>
                            <td>
                                <app-rating-stars [rating]="review.rating"></app-rating-stars>
                            </td>
                            <td class="comment-cell">
                                <div class="comment-text" [title]="review.comment">{{ review.comment }}</div>
                            </td>
                            <td>{{ review.createdAt | date:'shortDate' }}</td>
                            <td>
                                <span class="status-badge" [ngClass]="'status-' + review.status.toLowerCase()">
                                    {{ review.status }}
                                </span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button *ngIf="review.status !== 'APPROVED'" 
                                            class="btn-icon approve" 
                                            (click)="updateStatus(review, 'APPROVED')"
                                            title="Approve">
                                        <i class="fa-solid fa-check"></i>
                                    </button>
                                    <button *ngIf="review.status !== 'HIDDEN'" 
                                            class="btn-icon hide" 
                                            (click)="updateStatus(review, 'HIDDEN')"
                                            title="Hide">
                                        <i class="fa-solid fa-eye-slash"></i>
                                    </button>
                                    <button class="btn-icon delete" 
                                            (click)="deleteReview(review)"
                                            title="Delete">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div class="empty-state" *ngIf="filteredReviews.length === 0">
                    <i class="fa-solid fa-inbox"></i>
                    <p>No reviews found matching your filters.</p>
                </div>
            </div>
        </div>
    </div>
    <app-loading-spinner *ngIf="isLoading" message="Loading reviews..."></app-loading-spinner>
    `,
    styles: [`
    .admin-reviews-page {
        padding: 2rem 0;
        background: #f8fafc;
        min-height: calc(100vh - 80px);
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1.5rem;
    }

    .page-header {
        margin-bottom: 2rem;
    }

    .page-header h1 {
        font-size: 2rem;
        font-weight: 800;
        color: #1e293b;
        margin-bottom: 0.5rem;
    }

    .page-header p {
        color: #64748b;
    }

    .filter-section {
        background: white;
        padding: 1.5rem;
        border-radius: 16px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        margin-bottom: 2rem;
        display: flex;
        gap: 2rem;
        align-items: flex-end;
    }

    .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .filter-group label {
        font-size: 0.85rem;
        font-weight: 700;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .status-filters {
        display: flex;
        background: #f1f5f9;
        padding: 4px;
        border-radius: 10px;
        gap: 4px;
    }

    .status-filters button {
        border: none;
        background: none;
        padding: 0.5rem 1.25rem;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 600;
        color: #64748b;
        cursor: pointer;
        transition: all 0.2s;
    }

    .status-filters button.active {
        background: white;
        color: #1e293b;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .form-select {
        padding: 0.6rem 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        background: #f8fafc;
        color: #1e293b;
        font-weight: 600;
        min-width: 200px;
    }

    .reviews-table-container {
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    .premium-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }

    .premium-table th {
        background: #f8fafc;
        padding: 1.25rem 1.5rem;
        font-size: 0.85rem;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        border-bottom: 1px solid #f1f5f9;
    }

    .premium-table td {
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #f1f5f9;
        color: #334155;
        font-size: 0.95rem;
    }

    .user-cell {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .avatar {
        width: 32px;
        height: 32px;
        background: #e2e8f0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.8rem;
        color: #475569;
    }

    .comment-cell {
        max-width: 250px;
    }

    .comment-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #64748b;
        font-style: italic;
    }

    .status-badge {
        padding: 0.4rem 0.8rem;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
    }

    .status-pending { background: #fef9c3; color: #a16207; }
    .status-approved { background: #dcfce7; color: #15803d; }
    .status-hidden { background: #f1f5f9; color: #475569; }

    .action-buttons {
        display: flex;
        gap: 0.5rem;
    }

    .btn-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.9rem;
    }

    .btn-icon.approve { background: #f0fdf4; color: #22c55e; }
    .btn-icon.approve:hover { background: #22c55e; color: white; }
    
    .btn-icon.hide { background: #f8fafc; color: #64748b; }
    .btn-icon.hide:hover { background: #64748b; color: white; }
    
    .btn-icon.delete { background: #fef2f2; color: #ef4444; }
    .btn-icon.delete:hover { background: #ef4444; color: white; }

    .empty-state {
        padding: 4rem;
        text-align: center;
        color: #94a3b8;
    }

    .empty-state i {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.2;
    }
    `]
})
export class AdminReviewsComponent implements OnInit {
    reviews: Review[] = [];
    isLoading = true;
    statusFilter: string = 'ALL';
    ratingFilter: number = 0;

    constructor(
        private reviewService: ReviewService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        this.loadReviews();
    }

    loadReviews(): void {
        this.isLoading = true;
        this.reviewService.getAllReviews().subscribe({
            next: (data) => {
                this.reviews = data;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this.toastService.error('Failed to load reviews');
            }
        });
    }

    get filteredReviews(): Review[] {
        return this.reviews.filter(r => {
            const statusMatch = this.statusFilter === 'ALL' || r.status === this.statusFilter;
            const ratingMatch = this.ratingFilter == 0 || r.rating == this.ratingFilter;
            return statusMatch && ratingMatch;
        });
    }

    updateStatus(review: Review, status: string): void {
        this.reviewService.updateStatus(review.id, status).subscribe({
            next: (updated) => {
                const index = this.reviews.findIndex(r => r.id === updated.id);
                if (index !== -1) {
                    this.reviews[index] = updated;
                }
                this.toastService.success(`Review ${status.toLowerCase()} successfully`);
            },
            error: () => this.toastService.error('Failed to update status')
        });
    }

    deleteReview(review: Review): void {
        if (confirm('Are you sure you want to delete this review?')) {
            this.reviewService.deleteReview(review.id).subscribe({
                next: () => {
                    this.reviews = this.reviews.filter(r => r.id !== review.id);
                    this.toastService.success('Review deleted successfully');
                },
                error: () => this.toastService.error('Failed to delete review')
            });
        }
    }
}
