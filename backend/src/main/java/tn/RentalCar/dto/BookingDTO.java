package tn.RentalCar.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.RentalCar.entity.BookingStatus;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    private Long id;
    private Long userId;
    private String userFullName;
    private Long carId;
    private String carBrand;
    private String carModel;
    private String carName; // Brand + Model
    private String carImageUrl;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Double totalPrice;
    private BookingStatus status;
    private Boolean reviewed;
    private LocalDateTime createdAt;
}
