package tn.RentalCar.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private Double totalRevenue;
    private Double monthlyRevenue;
    private Double yearlyRevenue;

    private Long totalBookings;
    private Long bookingsToday;
    private Long bookingsThisMonth;

    private Long activeBookings;
    private Long completedBookings;
    private Long canceledBookings;

    private List<RevenueTrendDTO> revenueTrends;
    private List<MostRentedCarDTO> mostRentedCars;
    private List<BookingDTO> recentBookings;
}
