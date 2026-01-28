package tn.RentalCar.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.RentalCar.entity.PaymentStatus;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long bookingId;
    private String clientSecret; // From Stripe PaymentIntent
    private Double amount;
    private String currency;
    private PaymentStatus status;
    private String receiptUrl;
    private LocalDateTime createdAt;
}
