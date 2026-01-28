import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CarService, Car } from '../../../services/car.service';
import { BookingService } from '../../../services/booking.service';
import { ToastService } from '../../../services/toast.service';
import { LoadingSpinnerComponent } from '../../../components/shared/loading-spinner/loading-spinner.component';
import { CarImagePipe } from '../../../pipes/car-image.pipe';

import { ReviewListComponent } from '../../../components/reviews/review-list/review-list.component';
import { RatingStarsComponent } from '../../../components/shared/rating-stars/rating-stars.component';

@Component({
    selector: 'app-car-details',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, LoadingSpinnerComponent, CarImagePipe, ReviewListComponent, RatingStarsComponent],
    templateUrl: './car-details.component.html',
    styleUrls: ['./car-details.component.scss']
})
export class CarDetailsComponent implements OnInit {
    car: Car | null = null;
    isLoading = true;
    bookingForm: FormGroup;
    minDate: string;
    isBooking = false;
    busyDates: any[] = [];

    // Pricing Breakdown
    subtotal = 0;
    tax = 0;
    serviceFee = 25;
    totalPrice = 0;
    days = 0;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private carService: CarService,
        private bookingService: BookingService,
        private toastService: ToastService
    ) {
        this.minDate = new Date().toISOString().split('T')[0];
        this.bookingForm = this.fb.group({
            startDate: ['', Validators.required],
            endDate: ['', Validators.required]
        }, { validators: this.dateOrderValidator });
    }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadCar(Number(id));
            this.loadBusyDates(Number(id));
        }
    }

    dateOrderValidator(group: FormGroup) {
        const start = group.get('startDate')?.value;
        const end = group.get('endDate')?.value;
        if (start && end && new Date(start) >= new Date(end)) {
            return { dateOrder: true };
        }
        return null;
    }

    loadCar(id: number): void {
        this.isLoading = true;
        this.carService.getCar(id).subscribe({
            next: (car) => {
                this.car = car;
                this.isLoading = false;
                this.setupForm();
            },
            error: (error) => {
                console.error('Error loading car', error);
                this.isLoading = false;
            }
        });
    }

    loadBusyDates(id: number): void {
        this.bookingService.getBusyDates(id).subscribe(dates => {
            this.busyDates = dates;
        });
    }

    setupForm(): void {
        this.bookingForm.valueChanges.subscribe(() => {
            this.calculateTotal();
        });
    }

    calculateTotal(): void {
        const { startDate, endDate } = this.bookingForm.value;
        if (startDate && endDate && this.car) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            this.days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            this.subtotal = this.days * this.car.pricePerDay;
            this.tax = this.subtotal * 0.15; // 15% VAT
            this.totalPrice = this.subtotal + this.tax + this.serviceFee;
        } else if (this.car) {
            this.days = 0;
            this.subtotal = 0;
            this.tax = 0;
            this.totalPrice = this.car.pricePerDay;
        }
    }

    isDateBusy(date: string): boolean {
        const d = new Date(date).getTime();
        return this.busyDates.some(b => {
            const start = new Date(b.startDate).getTime();
            const end = new Date(b.endDate).getTime();
            return d >= start && d <= end;
        });
    }

    onSubmit(): void {
        if (this.bookingForm.invalid || !this.car) return;

        // Check for local overlaps before submmitting
        const overlap = this.busyDates.some(b => {
            const bStart = new Date(b.startDate).getTime();
            const bEnd = new Date(b.endDate).getTime();
            const sStart = new Date(this.bookingForm.value.startDate).getTime();
            const sEnd = new Date(this.bookingForm.value.endDate).getTime();
            return (sStart < bEnd && sEnd > bStart);
        });

        if (overlap) {
            this.toastService.warning('Selected dates overlap with an existing booking. Please choose other dates.');
            return;
        }

        this.isBooking = true;
        const bookingRequest = {
            carId: this.car.id!,
            startDate: new Date(this.bookingForm.value.startDate).toISOString(),
            endDate: new Date(this.bookingForm.value.endDate).toISOString()
        };

        this.bookingService.createBooking(bookingRequest).subscribe({
            next: (newBooking) => {
                this.isBooking = false;
                this.toastService.success('Booking created! Redirecting to secure checkout...');
                this.router.navigate(['/checkout', newBooking.id]);
            },
            error: (error) => {
                this.isBooking = false;
                this.toastService.error(error.error?.message || 'Failed to confirm booking. Please try again.');
            }
        });
    }
}
