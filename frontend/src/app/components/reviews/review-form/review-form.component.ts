import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService, ReviewRequest } from '../../../services/review.service';
import { RatingStarsComponent } from '../../shared/rating-stars/rating-stars.component';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-review-form',
    standalone: true,
    imports: [CommonModule, FormsModule, RatingStarsComponent],
    template: `
    <div class="modal-backdrop" *ngIf="show" (click)="close()">
        <div class="modal-card animate-premium-in" (click)="$event.stopPropagation()">
            <div class="modal-header-premium">
                <div class="header-content">
                    <div class="icon-blob">
                        <i class="fa-solid fa-pen-nib"></i>
                    </div>
                    <div>
                        <h2>Share Your Experience</h2>
                        <p>Your feedback helps the community</p>
                    </div>
                </div>
                <button class="close-btn" (click)="close()">&times;</button>
            </div>
            
            <div class="modal-body-premium">
                <div class="car-info-card">
                    <div class="car-icon"><i class="fa-solid fa-car"></i></div>
                    <div class="car-details">
                        <span class="label">Reviewing Vehicle</span>
                        <span class="value">{{ carName }}</span>
                    </div>
                </div>
                
                <div class="rating-section-premium">
                    <label class="section-label">Performance & Satisfaction</label>
                    <div class="stars-wrapper">
                        <app-rating-stars 
                            [rating]="rating" 
                            [readonly]="false" 
                            [showValue]="true"
                            (ratingChange)="onRatingChange($event)">
                        </app-rating-stars>
                    </div>
                    <div class="rating-hints">
                        <span>Tap a star to rate</span>
                    </div>
                    <span class="error-text fade-in" *ngIf="submitted && rating === 0">
                        <i class="fa-solid fa-circle-exclamation"></i> Please select a rating
                    </span>
                </div>

                <div class="comment-section-premium">
                    <label class="section-label">Detailed Feedback</label>
                    <div class="textarea-wrapper">
                        <textarea 
                            [(ngModel)]="comment" 
                            placeholder="How was the vehicle condition? Any specific features you loved?"
                            rows="5">
                        </textarea>
                        <div class="textarea-focus-border"></div>
                    </div>
                </div>
            </div>

            <div class="modal-footer-premium">
                <button class="btn-cancel" (click)="close()">Later</button>
                <button class="btn-submit-premium" [disabled]="isSubmitting" (click)="submit()">
                    <div class="btn-content" *ngIf="!isSubmitting">
                        <span>Post Review</span>
                        <i class="fa-solid fa-paper-plane"></i>
                    </div>
                    <div class="spinner" *ngIf="isSubmitting">
                        <i class="fa-solid fa-circle-notch fa-spin"></i>
                    </div>
                </button>
            </div>
        </div>
    </div>
    `,
    styles: [`
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(8px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        padding: 20px;
    }

    .modal-card {
        background: white;
        width: 100%;
        max-width: 520px;
        border-radius: 24px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .modal-header-premium {
        padding: 32px 32px 24px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        position: relative;
    }

    .header-content {
        display: flex;
        gap: 16px;
        align-items: center;
    }

    .icon-blob {
        width: 48px;
        height: 48px;
        background: #f1f5f9;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #334155;
        font-size: 1.25rem;
    }

    .modal-header-premium h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: -0.025em;
    }

    .modal-header-premium p {
        margin: 4px 0 0;
        color: #64748b;
        font-size: 0.9rem;
    }

    .close-btn {
        background: #f1f5f9;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        color: #64748b;
        cursor: pointer;
        transition: all 0.2s;
    }

    .close-btn:hover {
        background: #e2e8f0;
        color: #0f172a;
    }

    .modal-body-premium {
        padding: 0 32px 32px;
    }

    .car-info-card {
        background: #f8fafc;
        border: 1px solid #f1f5f9;
        border-radius: 16px;
        padding: 16px;
        display: flex;
        gap: 16px;
        align-items: center;
        margin-bottom: 28px;
    }

    .car-icon {
        width: 40px;
        height: 40px;
        background: white;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #3b82f6;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .car-details {
        display: flex;
        flex-direction: column;
    }

    .car-details .label {
        font-size: 0.75rem;
        color: #94a3b8;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .car-details .value {
        font-weight: 700;
        color: #1e293b;
        font-size: 1.05rem;
    }

    .section-label {
        display: block;
        font-size: 0.875rem;
        font-weight: 700;
        color: #334155;
        margin-bottom: 12px;
    }

    .rating-section-premium {
        margin-bottom: 28px;
    }

    .stars-wrapper {
        background: #fff;
        display: inline-block;
        padding: 8px 16px;
        border-radius: 12px;
        border: 1px solid #f1f5f9;
    }

    .rating-hints {
        margin-top: 8px;
        font-size: 0.8rem;
        color: #94a3b8;
        font-style: italic;
    }

    .comment-section-premium {
        position: relative;
    }

    .textarea-wrapper {
        position: relative;
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid #e2e8f0;
        transition: all 0.3s;
    }

    .textarea-wrapper textarea {
        width: 100%;
        padding: 16px;
        border: none;
        background: #fff;
        resize: none;
        font-family: inherit;
        font-size: 0.95rem;
        color: #1e293b;
        display: block;
    }

    .textarea-wrapper textarea:focus {
        outline: none;
    }

    .textarea-focus-border {
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 2px;
        background: #3b82f6;
        transition: all 0.3s ease;
        transform: translateX(-50%);
    }

    .textarea-wrapper:focus-within {
        border-color: #3b82f6;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    .textarea-wrapper:focus-within .textarea-focus-border {
        width: 100%;
    }

    .modal-footer-premium {
        padding: 0 32px 32px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 16px;
    }

    .btn-cancel {
        background: transparent;
        border: none;
        font-weight: 600;
        color: #64748b;
        cursor: pointer;
        padding: 12px 24px;
        border-radius: 12px;
        transition: all 0.2s;
    }

    .btn-cancel:hover {
        background: #f1f5f9;
        color: #0f172a;
    }

    .btn-submit-premium {
        background: #0f172a;
        color: white;
        border: none;
        padding: 12px 28px;
        border-radius: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.3);
    }

    .btn-submit-premium:hover:not(:disabled) {
        transform: translateY(-2px);
        background: #1e293b;
        box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.4);
    }

    .btn-submit-premium:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .btn-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .error-text {
        color: #ef4444;
        font-size: 0.85rem;
        font-weight: 600;
        margin-top: 10px;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .animate-premium-in {
        animation: premiumIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes premiumIn {
        from { transform: translateY(30px) scale(0.95); opacity: 0; }
        to { transform: translateY(0) scale(1); opacity: 1; }
    }

    .fade-in {
        animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
    }
    `]
})
export class ReviewFormComponent {
    @Input() show = false;
    @Input() bookingId!: number;
    @Input() carName!: string;
    @Output() closed = new EventEmitter<void>();
    @Output() submittedReview = new EventEmitter<void>();

    rating = 0;
    comment = '';
    isSubmitting = false;
    submitted = false;

    constructor(
        private reviewService: ReviewService,
        private toastService: ToastService
    ) { }

    onRatingChange(rating: number): void {
        this.rating = rating;
    }

    close(): void {
        this.show = false;
        this.closed.emit();
        // Reset state
        this.rating = 0;
        this.comment = '';
        this.submitted = false;
    }

    submit(): void {
        this.submitted = true;
        if (this.rating === 0) return;

        this.isSubmitting = true;
        const request: ReviewRequest = {
            bookingId: this.bookingId,
            rating: this.rating,
            comment: this.comment
        };

        this.reviewService.submitReview(request).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.toastService.success('Review submitted successfully! It will be visible after moderation.');
                this.submittedReview.emit();
                this.close();
            },
            error: (err) => {
                this.isSubmitting = false;
                this.toastService.error(err.error?.message || 'Failed to submit review');
            }
        });
    }
}
