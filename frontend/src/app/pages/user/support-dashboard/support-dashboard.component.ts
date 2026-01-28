import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupportService } from '../../../services/support.service';
import { SupportTicket, SupportTicketStatus } from '../../../models/support-ticket.model';

@Component({
  selector: 'app-support-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './support-dashboard.component.html',
  styleUrl: './support-dashboard.component.scss'
})
export class SupportDashboardComponent implements OnInit {
  tickets: SupportTicket[] = [];
  loading = true;

  constructor(private supportService: SupportService) { }

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.supportService.getMyTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching tickets', err);
        this.loading = false;
      }
    });
  }

  getStatusClass(status: SupportTicketStatus): string {
    switch (status) {
      case SupportTicketStatus.OPEN: return 'status-open';
      case SupportTicketStatus.IN_PROGRESS: return 'status-progress';
      case SupportTicketStatus.RESOLVED: return 'status-resolved';
      case SupportTicketStatus.CLOSED: return 'status-closed';
      default: return '';
    }
  }
}
