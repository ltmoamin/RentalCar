import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SupportService } from '../../../services/support.service';
import { SupportTicket, SupportTicketStatus, SupportIssueType, SupportTicketPriority } from '../../../models/support-ticket.model';
import { ToastService } from '../../../services/toast.service';
import { FilterPipe } from '../../../pipes/filter.pipe';

@Component({
  selector: 'app-support-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FilterPipe],
  templateUrl: './support-management.component.html',
  styleUrl: './support-management.component.scss'
})
export class SupportManagementComponent implements OnInit {
  tickets: SupportTicket[] = [];
  filteredTickets: SupportTicket[] = [];
  loading = true;
  activeDropdown: number | null = null;

  // Make enum available to template
  TicketStatusEnum = SupportTicketStatus;

  // Filters
  searchTerm = '';
  statusFilter = 'ALL';
  priorityFilter = 'ALL';
  categoryFilter = 'ALL';

  constructor(private supportService: SupportService, private toastService: ToastService) { }

  toggleDropdown(event: Event, ticketId: number): void {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === ticketId ? null : ticketId;
  }

  closeDropdown(): void {
    this.activeDropdown = null;
  }

  ngOnInit(): void {
    this.loadAllTickets();
  }

  loadAllTickets(): void {
    this.supportService.getAllTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tickets', err);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredTickets = this.tickets.filter(ticket => {
      const matchSearch = !this.searchTerm ||
        ticket.subject.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ticket.user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ticket.id.toString().includes(this.searchTerm);

      const matchStatus = this.statusFilter === 'ALL' || ticket.status === this.statusFilter;
      const matchPriority = this.priorityFilter === 'ALL' || ticket.priority === this.priorityFilter;
      const matchCategory = this.categoryFilter === 'ALL' || ticket.issueType === this.categoryFilter;

      return matchSearch && matchStatus && matchPriority && matchCategory;
    });
  }

  updateStatus(ticketId: number, status: SupportTicketStatus): void {
    this.closeDropdown();
    this.supportService.updateTicketStatus(ticketId, status).subscribe({
      next: (updated) => {
        const index = this.tickets.findIndex(t => t.id === updated.id);
        if (index !== -1) {
          this.tickets[index] = updated;
          this.applyFilters();
        }
        this.toastService.success(`Ticket #${ticketId} status updated to ${status}`);
      },
      error: (err) => this.toastService.error('Failed to update status')
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
