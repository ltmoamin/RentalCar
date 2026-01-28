package tn.RentalCar.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.RentalCar.dto.ReviewRequestDTO;
import tn.RentalCar.dto.ReviewResponseDTO;
import tn.RentalCar.entity.ReviewStatus;
import tn.RentalCar.entity.User;
import tn.RentalCar.repository.UserRepository;
import tn.RentalCar.service.ReviewService;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    // Public: Get approved reviews for a specific car
    @GetMapping("/car/{carId}")
    public ResponseEntity<List<ReviewResponseDTO>> getCarReviews(@PathVariable Long carId) {
        return ResponseEntity.ok(reviewService.getApprovedReviewsByCar(carId));
    }

    // Authenticated: Submit a new review
    @PostMapping
    public ResponseEntity<ReviewResponseDTO> submitReview(
            @RequestBody ReviewRequestDTO request,
            Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        return ResponseEntity.ok(reviewService.createReview(request, user));
    }

    private User getUserFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Admin: Get all reviews for moderation
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReviewResponseDTO>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    // Admin: Moderate review status
    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReviewResponseDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam ReviewStatus status) {
        return ResponseEntity.ok(reviewService.updateStatus(id, status));
    }

    // Admin: Delete review
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}
