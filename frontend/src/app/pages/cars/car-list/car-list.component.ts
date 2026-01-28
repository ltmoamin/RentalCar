import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarService, Car, CarFilters, Transmission, FuelType } from '../../../services/car.service';
import { CarCardComponent } from '../../../components/cars/car-card/car-card.component';
import { LoadingSpinnerComponent } from '../../../components/shared/loading-spinner/loading-spinner.component';

@Component({
    selector: 'app-car-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, CarCardComponent, LoadingSpinnerComponent],
    templateUrl: './car-list.component.html',
    styleUrls: ['./car-list.component.scss']
})
export class CarListComponent implements OnInit {
    cars: Car[] = [];
    isLoading = true;
    filters: CarFilters = {
        brand: '',
        minPrice: undefined,
        maxPrice: undefined,
        available: undefined,
        category: ''
    };

    categories = ['Sedan', 'SUV', 'Luxury', 'Sports', 'Economy', 'Electric'];
    brands = ['Tesla', 'BMW', 'Mercedes', 'Audi', 'Toyota', 'Honda', 'Ford', 'Porsche'];

    constructor(private carService: CarService) { }

    ngOnInit(): void {
        this.loadCars();
    }

    loadCars(): void {
        this.isLoading = true;
        this.carService.getCars(this.filters).subscribe({
            next: (cars) => {
                this.cars = cars;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading cars', error);
                this.isLoading = false;
            }
        });
    }

    applyFilters(): void {
        this.loadCars();
    }

    resetFilters(): void {
        this.filters = {
            brand: '',
            minPrice: undefined,
            maxPrice: undefined,
            available: undefined,
            category: ''
        };
        this.loadCars();
    }
}
