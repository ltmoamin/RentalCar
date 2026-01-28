import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SupportService } from '../../../services/support.service';
import { BookingService } from '../../../services/booking.service';
import { CloudinaryService } from '../../../services/cloudinary.service';
import { SupportIssueType, SupportTicketPriority } from '../../../models/support-ticket.model';
import { ToastService } from '../../../services/toast.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-ticket.component.html',
  styleUrl: './create-ticket.component.scss'
})
export class CreateTicketComponent implements OnInit {
  ticketForm: FormGroup;
  bookings: any[] = [];
  issueTypes = Object.values(SupportIssueType);
  priorities = Object.values(SupportTicketPriority);

  selectedFile: File | null = null;
  filePreview: string | null = null;
  isUploading = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private supportService: SupportService,
    private bookingService: BookingService,
    private cloudinaryService: CloudinaryService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.ticketForm = this.fb.group({
      subject: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      issueType: [SupportIssueType.OTHER, Validators.required],
      priority: [SupportTicketPriority.MEDIUM, Validators.required],
      bookingId: [null],
      mediaUrl: ['']
    });
  }

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.bookingService.getMyBookings().subscribe({
      next: (data: any[]) => this.bookings = data,
      error: (err: any) => console.error('Error loading bookings', err)
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
    this.ticketForm.patchValue({ mediaUrl: '' });
  }

  async onSubmit(): Promise<void> {
    if (this.ticketForm.invalid) return;

    this.submitting = true;

    try {
      if (this.selectedFile) {
        this.isUploading = true;
        const uploadResult = await lastValueFrom(this.cloudinaryService.upload(this.selectedFile, 'support'));
        this.ticketForm.patchValue({ mediaUrl: uploadResult || '' });
        this.isUploading = false;
      }

      const formValue = this.ticketForm.value;
      this.supportService.createTicket(formValue).subscribe({
        next: (ticket) => {
          this.toastService.success('Ticket created successfully');
          this.router.navigate(['/profile/support', ticket.id]);
        },
        error: (err) => {
          this.toastService.error('Failed to create ticket');
          this.submitting = false;
        }
      });
    } catch (error) {
      this.toastService.error('Error uploading file');
      this.isUploading = false;
      this.submitting = false;
    }
  }
}
