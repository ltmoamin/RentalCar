import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SupportService } from '../../../services/support.service';
import { SupportTicket, SupportMessage, SupportTicketStatus } from '../../../models/support-ticket.model';
import { CloudinaryService } from '../../../services/cloudinary.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-ticket-thread',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ticket-thread.component.html',
  styleUrl: './ticket-thread.component.scss'
})
export class TicketThreadComponent implements OnInit {
  ticketId!: number;
  ticket: SupportTicket | null = null;
  newMessage = '';
  selectedFile: File | null = null;
  filePreview: string | null = null;
  isUploading = false;
  sending = false;
  currentUser: any = null;

  // Expose enum to template
  TicketStatusEnum = SupportTicketStatus;

  constructor(
    private route: ActivatedRoute,
    private supportService: SupportService,
    private cloudinaryService: CloudinaryService,
    private toastService: ToastService
  ) {
    const userJson = localStorage.getItem('user');
    if (userJson) this.currentUser = JSON.parse(userJson);
  }

  ngOnInit(): void {
    this.ticketId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTicket();
  }

  loadTicket(): void {
    this.supportService.getTicketById(this.ticketId).subscribe({
      next: (data) => this.ticket = data,
      error: (err) => console.error('Error loading ticket', err)
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.filePreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.filePreview = null;
  }

  async sendMessage(): Promise<void> {
    if (!this.newMessage.trim() && !this.selectedFile) return;

    this.sending = true;
    let mediaUrl = '';

    try {
      if (this.selectedFile) {
        this.isUploading = true;
        mediaUrl = await this.cloudinaryService.upload(this.selectedFile, 'support').toPromise() || '';
        this.isUploading = false;
      }

      this.supportService.addMessage(this.ticketId, {
        content: this.newMessage,
        mediaUrl: mediaUrl
      }).subscribe({
        next: (msg) => {
          if (this.ticket) {
            this.ticket.messages.push(msg);
          }
          this.newMessage = '';
          this.removeFile();
          this.sending = false;
        },
        error: (err) => {
          this.toastService.error('Failed to send message');
          this.sending = false;
        }
      });
    } catch (error) {
      this.toastService.error('Error uploading file');
      this.isUploading = false;
      this.sending = false;
    }
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

  isImage(url: string | undefined): boolean {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif)$/i.test(url);
  }

  isVideo(url: string | undefined): boolean {
    if (!url) return false;
    return /\.(mp4|webm)$/i.test(url);
  }
}
