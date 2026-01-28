package tn.RentalCar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.RentalCar.entity.Payment;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);

    Optional<Payment> findByBookingId(Long bookingId);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = tn.RentalCar.entity.PaymentStatus.COMPLETED")
    Double sumTotalRevenue();

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = tn.RentalCar.entity.PaymentStatus.COMPLETED AND p.createdAt >= :startDate")
    Double sumRevenueSince(@Param("startDate") java.time.LocalDateTime startDate);

    @Query(value = "SELECT DATE_FORMAT(p.created_at, '%Y-%m') as label, SUM(p.amount) as value " +
            "FROM payments p " +
            "WHERE p.status = 'COMPLETED' " +
            "GROUP BY DATE_FORMAT(p.created_at, '%Y-%m') " +
            "ORDER BY DATE_FORMAT(p.created_at, '%Y-%m') ASC", nativeQuery = true)
    List<Object[]> findRevenueTrendsRaw();
}
