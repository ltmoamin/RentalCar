package tn.RentalCar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.RentalCar.entity.Review;
import tn.RentalCar.entity.ReviewStatus;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByCarIdAndStatus(Long carId, ReviewStatus status);

    List<Review> findByStatus(ReviewStatus status);

    Optional<Review> findByBookingId(Long bookingId);

    List<Review> findByUserId(Long userId);
}
