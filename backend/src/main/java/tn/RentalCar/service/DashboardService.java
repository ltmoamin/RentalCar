package tn.RentalCar.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.RentalCar.dto.BookingDTO;
import tn.RentalCar.dto.DashboardStatsDTO;
import tn.RentalCar.dto.RevenueTrendDTO;
import tn.RentalCar.entity.BookingStatus;
import tn.RentalCar.repository.BookingRepository;
import tn.RentalCar.repository.PaymentRepository;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardService {

        private final BookingRepository bookingRepository;
        private final PaymentRepository paymentRepository;

        public DashboardStatsDTO getDashboardStats() {
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime todayStart = now.with(LocalTime.MIN);
                LocalDateTime todayEnd = now.with(LocalTime.MAX);
                LocalDateTime monthStart = now.withDayOfMonth(1).with(LocalTime.MIN);
                LocalDateTime yearStart = now.withDayOfYear(1).with(LocalTime.MIN);

                Double totalRevenue = paymentRepository.sumTotalRevenue();
                Double monthlyRevenue = paymentRepository.sumRevenueSince(monthStart);
                Double yearlyRevenue = paymentRepository.sumRevenueSince(yearStart);

                return DashboardStatsDTO.builder()
                                .totalRevenue(totalRevenue != null ? totalRevenue : 0.0)
                                .monthlyRevenue(monthlyRevenue != null ? monthlyRevenue : 0.0)
                                .yearlyRevenue(yearlyRevenue != null ? yearlyRevenue : 0.0)
                                .totalBookings(bookingRepository.count())
                                .bookingsToday(bookingRepository.countByCreatedAtBetween(todayStart, todayEnd))
                                .bookingsThisMonth(bookingRepository.countByCreatedAtBetween(monthStart, todayEnd))
                                .activeBookings(bookingRepository.countByStatus(BookingStatus.CONFIRMED))
                                .completedBookings(bookingRepository.countByStatus(BookingStatus.COMPLETED))
                                .canceledBookings(bookingRepository.countByStatus(BookingStatus.CANCELLED))
                                .revenueTrends(convertRevenueTrends(paymentRepository.findRevenueTrendsRaw()))
                                .mostRentedCars(bookingRepository.findMostRentedCars(PageRequest.of(0, 5)))
                                .recentBookings(bookingRepository.findTop10ByOrderByCreatedAtDesc().stream()
                                                .map(booking -> BookingDTO.builder()
                                                                .id(booking.getId())
                                                                .carId(booking.getCar().getId())
                                                                .carBrand(booking.getCar().getBrand())
                                                                .carModel(booking.getCar().getModel())
                                                                .carName(booking.getCar().getBrand() + " "
                                                                                + booking.getCar().getModel())
                                                                .userId(booking.getUser().getId())
                                                                .userFullName(booking.getUser().getFirstName() + " "
                                                                                + booking.getUser().getLastName())
                                                                .startDate(booking.getStartDate())
                                                                .endDate(booking.getEndDate())
                                                                .totalPrice(booking.getTotalPrice())
                                                                .status(booking.getStatus())
                                                                .createdAt(booking.getCreatedAt())
                                                                .build())
                                                .collect(Collectors.toList()))
                                .build();
        }

        private List<RevenueTrendDTO> convertRevenueTrends(List<Object[]> rawResults) {
                if (rawResults == null || rawResults.isEmpty()) {
                        return new ArrayList<>();
                }
                return rawResults.stream()
                                .map(row -> new RevenueTrendDTO(
                                                (String) row[0],
                                                row[1] != null ? ((Number) row[1]).doubleValue() : 0.0))
                                .collect(Collectors.toList());
        }
}
