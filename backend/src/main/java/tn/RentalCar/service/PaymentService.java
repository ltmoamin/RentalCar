package tn.RentalCar.service;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.RentalCar.dto.PaymentRequest;
import tn.RentalCar.dto.PaymentResponse;
import tn.RentalCar.entity.Booking;
import tn.RentalCar.entity.BookingStatus;
import tn.RentalCar.entity.NotificationType;
import tn.RentalCar.entity.Payment;
import tn.RentalCar.entity.PaymentStatus;
import tn.RentalCar.repository.BookingRepository;
import tn.RentalCar.repository.PaymentRepository;
import tn.RentalCar.repository.UserRepository;
import tn.RentalCar.entity.User;
import tn.RentalCar.entity.Role;
import java.util.List;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final StripeService stripeService;
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Transactional
    public PaymentResponse createPaymentIntent(PaymentRequest request) throws StripeException {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Cannot pay for a cancelled booking");
        }

        // Check if a payment already exists for this booking
        Optional<Payment> existingPayment = paymentRepository.findByBookingId(booking.getId());
        if (existingPayment.isPresent() && existingPayment.get().getStatus() == PaymentStatus.COMPLETED) {
            throw new RuntimeException("Booking already paid");
        }

        PaymentIntent intent = stripeService.createPaymentIntent(
                booking.getTotalPrice(),
                request.getCurrency() != null ? request.getCurrency() : "usd",
                booking.getId().toString());

        Payment payment;
        if (existingPayment.isPresent()) {
            payment = existingPayment.get();
            payment.setStripePaymentIntentId(intent.getId());
            payment.setAmount(booking.getTotalPrice());
            payment.setStatus(PaymentStatus.PENDING);
        } else {
            payment = Payment.builder()
                    .booking(booking)
                    .stripePaymentIntentId(intent.getId())
                    .amount(booking.getTotalPrice())
                    .currency(intent.getCurrency())
                    .status(PaymentStatus.PENDING)
                    .build();
        }

        paymentRepository.save(payment);

        return mapToResponse(payment, intent.getClientSecret());
    }

    @Transactional
    public void processSuccessfulPayment(String paymentIntentId, String receiptUrl) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Payment not found for Intent ID: " + paymentIntentId));

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setReceiptUrl(receiptUrl);
        paymentRepository.save(payment);

        Booking booking = payment.getBooking();
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        notificationService.createNotification(
                booking.getUser(),
                "Payment Successful",
                "Your payment of " + payment.getAmount() + " " + payment.getCurrency() + " for booking #"
                        + booking.getId() + " was successful.",
                NotificationType.PAYMENT,
                "/profile/my-bookings");

        // Notify all admins
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        String customerName = booking.getUser().getFirstName() + " " + booking.getUser().getLastName();
        for (User admin : admins) {
            notificationService.createNotification(
                    admin,
                    "Payment Received",
                    customerName + " paid for booking #" + booking.getId() + " successfully.",
                    NotificationType.PAYMENT,
                    "/admin/bookings");
        }
    }

    @Transactional
    public void processFailedPayment(String paymentIntentId) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Payment not found for Intent ID: " + paymentIntentId));

        payment.setStatus(PaymentStatus.FAILED);
        paymentRepository.save(payment);

        notificationService.createNotification(
                payment.getBooking().getUser(),
                "Payment Failed",
                "Your payment for booking #" + payment.getBooking().getId() + " has failed. Please try again.",
                NotificationType.PAYMENT,
                "/checkout/" + payment.getBooking().getId());
    }

    private PaymentResponse mapToResponse(Payment payment, String clientSecret) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(payment.getBooking().getId())
                .clientSecret(clientSecret)
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .receiptUrl(payment.getReceiptUrl())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
