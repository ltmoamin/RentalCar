import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookingService, Booking, BookingStatus } from '../../../services/booking.service';
import { LoadingSpinnerComponent } from '../../../components/shared/loading-spinner/loading-spinner.component';
import { CarImagePipe } from '../../../pipes/car-image.pipe';
import { ReviewFormComponent } from '../../../components/reviews/review-form/review-form.component';

@Component({
    selector: 'app-my-bookings',
    standalone: true,
    imports: [CommonModule, RouterModule, LoadingSpinnerComponent, CarImagePipe, ReviewFormComponent],
    templateUrl: './my-bookings.component.html',
    styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit {
    bookings: Booking[] = [];
    upcomingBookings: Booking[] = [];
    pastBookings: Booking[] = [];
    isLoading = true;
    BookingStatus = BookingStatus;

    // Review Modal State
    showReviewModal = false;
    selectedBookingForReview: Booking | null = null;

    constructor(private bookingService: BookingService) { }

    ngOnInit(): void {
        this.loadBookings();
    }

    loadBookings(): void {
        this.isLoading = true;
        this.bookingService.getMyBookings().subscribe({
            next: (bookings) => {
                this.bookings = bookings;
                this.categorizeBookings();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading bookings', error);
                this.isLoading = false;
            }
        });
    }

    categorizeBookings(): void {
        const now = new Date();
        this.upcomingBookings = this.bookings.filter(b => new Date(b.startDate) >= now);
        this.pastBookings = this.bookings.filter(b => new Date(b.startDate) < now);
    }

    getStatusClass(status?: BookingStatus): string {
        switch (status) {
            case BookingStatus.CONFIRMED: return 'status-confirmed';
            case BookingStatus.PENDING: return 'status-pending';
            case BookingStatus.CANCELLED: return 'status-cancelled';
            case BookingStatus.REJECTED: return 'status-rejected';
            case BookingStatus.COMPLETED: return 'status-completed';
            default: return '';
        }
    }

    openReviewModal(booking: Booking): void {
        this.selectedBookingForReview = booking;
        this.showReviewModal = true;
    }

    handleReviewSubmitted(): void {
        this.loadBookings(); // Refresh to hide the "Rate" button
    }
}
