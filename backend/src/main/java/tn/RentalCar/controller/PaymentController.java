package tn.RentalCar.controller;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.RentalCar.dto.PaymentRequest;
import tn.RentalCar.dto.PaymentResponse;
import tn.RentalCar.service.PaymentService;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    @PostMapping("/create-payment-intent")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<PaymentResponse> createPaymentIntent(@RequestBody PaymentRequest request)
            throws StripeException {
        return ResponseEntity.ok(paymentService.createPaymentIntent(request));
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (SignatureVerificationException e) {
            log.error("Webhook signature verification failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        // Handle the event
        switch (event.getType()) {
            case "payment_intent.succeeded":
                PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject()
                        .orElse(null);
                if (paymentIntent != null) {
                    log.info("PaymentIntent succeeded: {}", paymentIntent.getId());
                    // Safely handle receipt URL if charges are not available in this SDK version's
                    // PaymentIntent object
                    String receiptUrl = null;
                    // Note: In real production, you might want to retrieve the charge object using
                    // paymentIntent.getLatestCharge()
                    paymentService.processSuccessfulPayment(paymentIntent.getId(), receiptUrl);
                }
                break;
            case "payment_intent.payment_failed":
                PaymentIntent failedIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
                if (failedIntent != null) {
                    log.error("PaymentIntent failed: {}", failedIntent.getId());
                    paymentService.processFailedPayment(failedIntent.getId());
                }
                break;
            default:
                log.info("Unhandled event type: {}", event.getType());
        }

        return ResponseEntity.ok("Success");
    }

    @PostMapping("/confirm-success/{paymentIntentId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<String> confirmPaymentSuccess(@PathVariable String paymentIntentId) {
        log.info("Manually confirming payment success for Intent ID: {}", paymentIntentId);
        paymentService.processSuccessfulPayment(paymentIntentId, null);
        return ResponseEntity.ok("Payment confirmed successfully");
    }
}
