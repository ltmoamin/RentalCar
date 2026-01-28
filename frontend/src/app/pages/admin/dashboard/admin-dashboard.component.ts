import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats } from '../../../services/dashboard.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, BaseChartDirective],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
    stats?: DashboardStats;
    loading = true;
    errorMessage: string | null = null;

    // Revenue Chart Configuration
    public lineChartData: ChartData<'line'> = {
        datasets: [],
        labels: []
    };

    public lineChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#f8fafc',
                bodyColor: '#f8fafc',
                padding: 12,
                cornerRadius: 8,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(226, 232, 240, 0.5)' },
                ticks: { color: '#64748b' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#64748b' }
            }
        }
    };

    // Top Cars Chart Configuration
    public barChartData: ChartData<'bar'> = {
        datasets: [],
        labels: []
    };

    public barChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(226, 232, 240, 0.5)' }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    constructor(private dashboardService: DashboardService) { }

    ngOnInit(): void {
        console.log('AdminDashboardComponent initialized');
        this.loadStats();
    }

    loadStats(): void {
        this.loading = true;
        this.errorMessage = null;
        console.log('Loading dashboard stats...');
        this.dashboardService.getStats().subscribe({
            next: (data) => {
                console.log('Dashboard stats received:', data);
                this.stats = data;
                this.prepareCharts();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading dashboard stats:', err);
                this.errorMessage = 'Failed to load analytics data. Please check the console for details.';
                this.loading = false;
            }
        });
    }

    prepareCharts(): void {
        if (!this.stats) return;

        // Line Chart: Revenue Trends
        this.lineChartData = {
            labels: this.stats.revenueTrends.map(t => t.label),
            datasets: [
                {
                    data: this.stats.revenueTrends.map(t => t.value),
                    label: 'Revenue',
                    fill: true,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }
            ]
        };

        // Bar Chart: Most Rented Cars
        this.barChartData = {
            labels: this.stats.mostRentedCars.map(c => c.carName),
            datasets: [
                {
                    data: this.stats.mostRentedCars.map(c => c.rentalCount),
                    label: 'Rentals',
                    backgroundColor: '#10b981',
                    borderRadius: 6
                }
            ]
        };
    }

    getStatusClass(status: string): string {
        switch (status.toLowerCase()) {
            case 'confirmed': return 'status-confirmed';
            case 'completed': return 'status-completed';
            case 'cancelled': return 'status-cancelled';
            case 'pending': return 'status-pending';
            default: return '';
        }
    }
}
