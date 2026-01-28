import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarService, Car, Transmission, FuelType } from '../../../services/car.service';
import { LoadingSpinnerComponent } from '../../../components/shared/loading-spinner/loading-spinner.component';
import { ToastService } from '../../../services/toast.service';
import { CarImagePipe } from '../../../pipes/car-image.pipe';

@Component({
    selector: 'app-admin-car-management',
    standalone: true,
    imports: [CommonModule, FormsModule, LoadingSpinnerComponent, CarImagePipe],
    templateUrl: './car-management.component.html',
    styleUrls: ['./car-management.component.scss']
})
export class AdminCarManagementComponent implements OnInit {
    cars: Car[] = [];
    filteredCars: Car[] = [];
    isLoading = true;
    searchTerm = '';

    showModal = false;
    isEditing = false;
    currentCar: Partial<Car> = this.getEmptyCar();
    selectedFile: File | null = null;
    imagePreview: string | null = null;

    transmissions = Object.values(Transmission);
    fuelTypes = Object.values(FuelType);
    categories = ['Sedan', 'SUV', 'Luxury', 'Sports', 'Economy', 'Electric'];

    constructor(
        private carService: CarService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        this.loadCars();
    }

    getEmptyCar(): Partial<Car> {
        return {
            brand: '',
            model: '',
            year: new Date().getFullYear(),
            pricePerDay: 0,
            transmission: Transmission.MANUAL,
            fuelType: FuelType.GASOLINE,
            available: true,
            seats: 5,
            category: 'Sedan',
            description: ''
        };
    }

    loadCars(): void {
        this.isLoading = true;
        this.carService.getCars().subscribe({
            next: (cars) => {
                this.cars = cars;
                this.applyFilters();
                this.isLoading = false;
            },
            error: (error) => {
                this.isLoading = false;
                this.toastService.error('Failed to load cars');
            }
        });
    }

    applyFilters(): void {
        this.filteredCars = this.cars.filter(car =>
            car.brand.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            car.model.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }

    openAddModal(): void {
        this.isEditing = false;
        this.currentCar = this.getEmptyCar();
        this.imagePreview = null;
        this.selectedFile = null;
        this.showModal = true;
    }

    openEditModal(car: Car): void {
        this.isEditing = true;
        this.currentCar = { ...car };
        this.imagePreview = car.imageUrl ? car.imageUrl : null;
        this.selectedFile = null;
        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            const reader = new FileReader();
            reader.onload = () => {
                this.imagePreview = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    saveCar(): void {
        if (this.isEditing && this.currentCar.id) {
            this.carService.updateCar(this.currentCar.id, this.currentCar as Car).subscribe({
                next: (updated) => {
                    if (this.selectedFile) {
                        this.uploadImage(updated.id!);
                    } else {
                        this.handleSaveSuccess('Car updated successfully');
                    }
                },
                error: () => this.toastService.error('Failed to update car')
            });
        } else {
            this.carService.createCar(this.currentCar as Car).subscribe({
                next: (created) => {
                    if (this.selectedFile) {
                        this.uploadImage(created.id!);
                    } else {
                        this.handleSaveSuccess('Car created successfully');
                    }
                },
                error: () => this.toastService.error('Failed to create car')
            });
        }
    }

    uploadImage(carId: number): void {
        if (this.selectedFile) {
            this.carService.uploadCarImage(carId, this.selectedFile).subscribe({
                next: () => this.handleSaveSuccess(this.isEditing ? 'Car updated with image' : 'Car created with image'),
                error: () => this.toastService.error('Car saved but image upload failed')
            });
        }
    }

    handleSaveSuccess(message: string): void {
        this.toastService.success(message);
        this.closeModal();
        this.loadCars();
    }

    toggleAvailability(car: Car): void {
        const updated = { ...car, available: !car.available };
        this.carService.updateCar(car.id!, updated).subscribe({
            next: () => {
                car.available = updated.available;
                this.toastService.success(`Car ${car.available ? 'enabled' : 'disabled'}`);
            },
            error: () => this.toastService.error('Failed to update status')
        });
    }

    deleteCar(id: number): void {
        if (confirm('Are you sure you want to delete this car?')) {
            this.carService.deleteCar(id).subscribe({
                next: () => {
                    this.toastService.success('Car deleted successfully');
                    this.loadCars();
                },
                error: () => this.toastService.error('Failed to delete car')
            });
        }
    }
}
