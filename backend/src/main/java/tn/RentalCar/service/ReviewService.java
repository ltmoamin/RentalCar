package tn.RentalCar.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.RentalCar.dto.ReviewRequestDTO;
import tn.RentalCar.dto.ReviewResponseDTO;
import tn.RentalCar.entity.*;
import tn.RentalCar.repository.BookingRepository;
import tn.RentalCar.repository.CarRepository;
import tn.RentalCar.repository.ReviewRepository;
import tn.RentalCar.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Transactional
    public ReviewResponseDTO createReview(ReviewRequestDTO request, User user) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Validation: Must be the user's booking
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: You can only review your own bookings");
        }

        // Validation: Booking must be COMPLETED
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new RuntimeException("You can only review completed bookings");
        }

        // Validation: Must not already have a review
        if (reviewRepository.findByBookingId(booking.getId()).isPresent()) {
            throw new RuntimeException("You have already reviewed this booking");
        }

        Review review = Review.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .user(user)
                .car(booking.getCar())
                .booking(booking)
                .status(ReviewStatus.PENDING) // Moderation required
                .build();

        Review saved = reviewRepository.save(review);

        // Notify all admins
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        String customerName = user.getFirstName() + " " + user.getLastName();
        String carName = booking.getCar().getBrand() + " " + booking.getCar().getModel();
        for (User admin : admins) {
            notificationService.createNotification(
                    admin,
                    "New Review Pending",
                    customerName + " added a review for " + carName,
                    NotificationType.REVIEW,
                    "/admin/reviews");
        }

        return mapToResponse(saved);
    }

    public List<ReviewResponseDTO> getApprovedReviewsByCar(Long carId) {
        return reviewRepository.findByCarIdAndStatus(carId, ReviewStatus.APPROVED)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewResponseDTO> getAllReviews() {
        return reviewRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewResponseDTO updateStatus(Long reviewId, ReviewStatus status) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setStatus(status);
        Review saved = reviewRepository.save(review);
        updateCarRating(saved.getCar().getId());

        // Notify user
        notificationService.createNotification(
                review.getUser(),
                "Review Status Updated",
                "Your review for " + review.getCar().getBrand() + " " + review.getCar().getModel() + " has been "
                        + status,
                NotificationType.REVIEW,
                "/profile/reviews");

        return mapToResponse(saved);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        Long carId = review.getCar().getId();
        reviewRepository.deleteById(reviewId);
        updateCarRating(carId);
    }

    private void updateCarRating(Long carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found"));

        List<Review> approvedReviews = reviewRepository.findByCarIdAndStatus(carId, ReviewStatus.APPROVED);

        if (approvedReviews.isEmpty()) {
            car.setAverageRating(0.0);
            car.setReviewCount(0);
        } else {
            double average = approvedReviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
            car.setAverageRating(average);
            car.setReviewCount(approvedReviews.size());
        }
        carRepository.save(car);
    }

    private ReviewResponseDTO mapToResponse(Review review) {
        return ReviewResponseDTO.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .userFullName(review.getUser().getFirstName() + " " + review.getUser().getLastName())
                .carName(review.getCar().getBrand() + " " + review.getCar().getModel())
                .carId(review.getCar().getId())
                .status(review.getStatus())
                .build();
    }
}
