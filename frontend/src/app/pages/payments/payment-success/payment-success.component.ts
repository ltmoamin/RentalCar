import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.scss']
})
export class PaymentSuccessComponent implements OnInit {
  paymentIntentId?: string;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.paymentIntentId = this.route.snapshot.queryParamMap.get('payment_intent') || undefined;
  }
}
