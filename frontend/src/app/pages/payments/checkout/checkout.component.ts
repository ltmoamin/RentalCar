import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StripeService, StripePaymentElementComponent, NgxStripeModule, StripeElementsDirective } from 'ngx-stripe';
import { StripeElementsOptions, PaymentIntent, StripePaymentElementOptions, StripeElements } from '@stripe/stripe-js';
import { PaymentService } from '../../../services/payment.service';
import { BookingService, Booking } from '../../../services/booking.service';
import { ToastService } from '../../../services/toast.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxStripeModule, StripePaymentElementComponent, StripeElementsDirective],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  @ViewChild('paymentElement') paymentElement!: StripePaymentElementComponent;

  checkoutForm: FormGroup;
  booking?: Booking;
  loading = true;
  paying = false;
  stripeReady = false;
  elementsInstance?: StripeElements;

  elementsOptions?: StripeElementsOptions;

  paymentElementOptions: StripePaymentElementOptions = {
    layout: {
      type: 'tabs',
      defaultCollapsed: false,
    }
  };

  constructor(
    private fb: FormBuilder,
    public stripeService: StripeService,
    private paymentService: PaymentService,
    private bookingService: BookingService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {
    this.checkoutForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
    });
  }


  ngOnInit(): void {
    console.log('CheckoutComponent initialized');
    const bookingId = this.route.snapshot.paramMap.get('bookingId');
    if (!bookingId) {
      this.toastService.error('Invalid booking ID');
      this.router.navigate(['/profile/my-bookings']);
      return;
    }

    this.bookingService.getMyBookings().subscribe({
      next: (bookings) => {
        this.booking = bookings.find(b => b.id === Number(bookingId));
        if (!this.booking) {
          this.toastService.error('Booking not found');
          this.router.navigate(['/profile/my-bookings']);
          return;
        }
        this.createPaymentIntent();
      },
      error: () => {
        this.loading = false;
        this.toastService.error('Failed to load booking details');
      }
    });
  }

  createPaymentIntent(): void {
    this.paymentService.createPaymentIntent({
      bookingId: this.booking!.id!,
      currency: 'usd' // You can make this dynamic based on booking
    }).subscribe({
      next: (response) => {
        console.log('Payment intent created:', response);
        this.elementsOptions = {
          clientSecret: response.clientSecret,
          locale: 'en'
        };
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to create payment intent:', err);
        this.loading = false;
        this.toastService.error(err.error?.message || 'Failed to initialize payment');
      }
    });
  }

  onElements(elements: StripeElements): void {
    console.log('Stripe elements instance captured:', elements);
    this.elementsInstance = elements;
  }

  onReady(): void {
    console.log('Stripe payment element ready');
    this.stripeReady = true;
  }

  pay(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    if (!this.elementsInstance) {
      this.toastService.error('Payment metadata not ready');
      return;
    }

    this.paying = true;

    // 1. Submit the elements (Mandatory for Elements flow)
    this.elementsInstance.submit()
      .then((result) => {
        if (result.error) {
          this.paying = false;
          this.toastService.error(result.error.message || 'Validation failed');
          return;
        }

        // 2. Confirm payment
        const confirmPaymentOptions: any = {
          elements: this.elementsInstance,
          confirmParams: {
            payment_method_data: {
              billing_details: {
                name: this.checkoutForm.get('name')?.value,
                email: this.checkoutForm.get('email')?.value,
              }
            },
            return_url: `${window.location.origin}/payment-success`
          },
          redirect: 'if_required'
        };

        this.stripeService.confirmPayment(confirmPaymentOptions).subscribe({
          next: (result) => {
            this.paying = false;
            if (result.error) {
              this.toastService.error(result.error.message || 'Payment failed');
            } else if (result.paymentIntent?.status === 'succeeded') {
              this.paymentService.confirmPaymentSuccess(result.paymentIntent.id).subscribe({
                next: () => {
                  this.toastService.success('Payment successful!');
                  this.router.navigate(['/payment-success'], {
                    queryParams: { payment_intent: result.paymentIntent?.id }
                  });
                },
                error: (err) => {
                  console.error('Error syncing payment status:', err);
                  // Still navigate to success as Stripe confirmed it
                  this.toastService.success('Payment successful, but status sync failed. We will update it soon.');
                  this.router.navigate(['/payment-success'], {
                    queryParams: { payment_intent: result.paymentIntent?.id }
                  });
                }
              });
            }
          },
          error: (err: any) => {
            this.paying = false;
            console.error('Payment error:', err);
            this.toastService.error('An unexpected error occurred during payment');
          }
        });
      })
      .catch((err) => {
        this.paying = false;
        console.error('Submit error:', err);
        this.toastService.error('An error occurred while processing payment details');
      });
  }
}
