import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService, Booking, BookingStatus } from '../../../services/booking.service';
import { LoadingSpinnerComponent } from '../../../components/shared/loading-spinner/loading-spinner.component';
import { CarImagePipe } from '../../../pipes/car-image.pipe';
import { CarService, Car } from '../../../services/car.service';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-booking-management',
    standalone: true,
    imports: [CommonModule, FormsModule, LoadingSpinnerComponent, CarImagePipe],
    templateUrl: './booking-management.component.html',
    styleUrls: ['./booking-management.component.scss']
})
export class BookingManagementComponent implements OnInit {
    bookings: Booking[] = [];
    filteredBookings: Booking[] = [];
    cars: Car[] = [];
    isLoading = true;

    // Filters
    searchTerm = '';
    statusFilter = '';
    carFilter = '';
    dateFilter = '';

    BookingStatus = BookingStatus;

    constructor(
        private bookingService: BookingService,
        private carService: CarService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        this.loadBookings();
        this.loadCars();
    }

    loadCars(): void {
        this.carService.getCars().subscribe(cars => this.cars = cars);
    }

    loadBookings(): void {
        this.isLoading = true;
        this.bookingService.getAllBookings().subscribe({
            next: (bookings) => {
                this.bookings = bookings;
                this.applyFilters();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading bookings', error);
                this.isLoading = false;
            }
        });
    }

    applyFilters(): void {
        this.filteredBookings = this.bookings.filter(booking => {
            const matchesSearch = !this.searchTerm ||
                booking.userFullName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                booking.carName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                booking.id?.toString().includes(this.searchTerm);

            const matchesStatus = !this.statusFilter || booking.status === this.statusFilter;

            const matchesCar = !this.carFilter || booking.carId === Number(this.carFilter);

            const matchesDate = !this.dateFilter ||
                booking.startDate.includes(this.dateFilter) ||
                booking.endDate.includes(this.dateFilter);

            return matchesSearch && matchesStatus && matchesCar && matchesDate;
        });
    }

    updateStatus(id: number, status: BookingStatus): void {
        if (confirm(`Are you sure you want to change status to ${status}?`)) {
            this.bookingService.updateStatus(id, status).subscribe({
                next: (updatedBooking) => {
                    const index = this.bookings.findIndex(b => b.id === id);
                    if (index !== -1) {
                        this.bookings[index] = updatedBooking;
                        this.applyFilters();
                    }
                    this.toastService.success(`Status updated to ${status} successfully!`);
                },
                error: (error) => {
                    this.toastService.error('Failed to update status.');
                }
            });
        }
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

    getStats() {
        return {
            total: this.bookings.length,
            pending: this.bookings.filter(b => b.status === BookingStatus.PENDING).length,
            confirmed: this.bookings.filter(b => b.status === BookingStatus.CONFIRMED).length,
            completed: this.bookings.filter(b => b.status === BookingStatus.COMPLETED).length
        };
    }
}
