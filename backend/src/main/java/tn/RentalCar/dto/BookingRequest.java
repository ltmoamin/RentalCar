package tn.RentalCar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {
    private Long carId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
