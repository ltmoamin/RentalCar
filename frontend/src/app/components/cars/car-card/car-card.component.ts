import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Car } from '../../../services/car.service';
import { CarImagePipe } from '../../../pipes/car-image.pipe';

@Component({
    selector: 'app-car-card',
    standalone: true,
    imports: [CommonModule, RouterModule, CarImagePipe],
    template: `
    <div class="car-card" [routerLink]="['/cars', car.id]">
      <div class="car-image">
        <img [src]="car.imageUrl | carImage" [alt]="car.brand + ' ' + car.model">
        <div class="car-badge" [class.available]="car.available">
          {{ car.available ? 'Available' : 'Rented' }}
        </div>
      </div>
      
      <div class="car-content">
        <div class="car-header">
          <div class="car-title">
            <h3>{{ car.brand }} {{ car.model }}</h3>
            <span class="car-category">{{ car.category }}</span>
          </div>
          <div class="car-price">
            <span class="amount">\${{ car.pricePerDay }}</span>
            <span class="period">/ day</span>
          </div>
        </div>
        
        <div class="car-specs">
          <div class="spec-item">
            <i class="fas fa-cog"></i>
            <span>{{ car.transmission }}</span>
          </div>
          <div class="spec-item">
            <i class="fas fa-gas-pump"></i>
            <span>{{ car.fuelType }}</span>
          </div>
          <div class="spec-item">
            <i class="fas fa-users"></i>
            <span>{{ car.seats }} Seats</span>
          </div>
        </div>
        
        <div class="car-footer">
          <button class="btn btn-primary w-full" [disabled]="!car.available">
            {{ car.available ? 'Book Now' : 'Check Availability' }}
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .car-card {
      background: white;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
      cursor: pointer;
      height: 100%;
      display: flex;
      flex-direction: column;
      border: 1px solid #f1f5f9;
      position: relative;
    }

    .car-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px rgba(0,0,0,0.08);
      border-color: rgba(59, 130, 246, 0.2);
    }

    .car-image {
      position: relative;
      height: 220px;
      overflow: hidden;
      background: #f8fafc;
    }

    .car-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
    }

    .car-card:hover .car-image img {
      transform: scale(1.15);
    }

    .car-badge {
      position: absolute;
      top: 1.25rem;
      right: 1.25rem;
      padding: 0.5rem 1rem;
      border-radius: 100px;
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      color: #64748b;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      z-index: 2;
    }

    .car-badge.available {
      color: #10b981;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .car-content {
      padding: 1.75rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .car-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .car-title h3 {
      font-size: 1.35rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 0.4rem 0;
      letter-spacing: -0.5px;
    }

    .car-category {
      font-size: 0.8rem;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }

    .car-price {
      text-align: right;
    }

    .car-price .amount {
      display: block;
      font-size: 1.5rem;
      font-weight: 900;
      color: #3b82f6;
      line-height: 1;
      margin-bottom: 0.2rem;
    }

    .car-price .period {
      font-size: 0.75rem;
      font-weight: 600;
      color: #94a3b8;
    }

    .car-specs {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1.75rem;
      padding: 1.25rem 0;
      border-top: 1px solid #f1f5f9;
      border-bottom: 1px solid #f1f5f9;
    }

    .spec-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
    }

    .spec-item i {
      color: #3b82f6;
      font-size: 1rem;
      opacity: 0.8;
    }

    .car-footer {
      margin-top: auto;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 16px;
      font-weight: 700;
      font-size: 0.95rem;
      transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.15);
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.25);
    }

    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-primary:disabled {
      background: #f1f5f9;
      color: #cbd5e1;
      cursor: not-allowed;
      box-shadow: none;
    }

    .w-full {
      width: 100%;
    }
  `]
})
export class CarCardComponent {
    @Input() car!: Car;
}
