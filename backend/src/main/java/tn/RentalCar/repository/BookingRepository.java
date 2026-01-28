package tn.RentalCar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.RentalCar.entity.Booking;
import tn.RentalCar.entity.BookingStatus;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
        List<Booking> findByUserId(Long userId);

        List<Booking> findByCarId(Long carId);

        List<Booking> findByStatus(BookingStatus status);

        List<Booking> findByCarIdAndStatusIn(Long carId, List<BookingStatus> statuses);

        @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.car.id = :carId " +
                        "AND b.status IN (tn.RentalCar.entity.BookingStatus.CONFIRMED, tn.RentalCar.entity.BookingStatus.PENDING) "
                        +
                        "AND (:startDate < b.endDate AND :endDate > b.startDate)")
        boolean existsOverlappingBookings(@Param("carId") Long carId,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        long countByStatus(BookingStatus status);

        long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

        @Query("SELECT new tn.RentalCar.dto.MostRentedCarDTO(CONCAT(b.car.brand, ' ', b.car.model), COUNT(b), SUM(b.totalPrice)) "
                        +
                        "FROM Booking b " +
                        "WHERE b.status = tn.RentalCar.entity.BookingStatus.COMPLETED OR b.status = tn.RentalCar.entity.BookingStatus.CONFIRMED "
                        +
                        "GROUP BY b.car.brand, b.car.model " +
                        "ORDER BY COUNT(b) DESC")
        List<tn.RentalCar.dto.MostRentedCarDTO> findMostRentedCars(org.springframework.data.domain.Pageable pageable);

        List<Booking> findTop10ByOrderByCreatedAtDesc();
}
