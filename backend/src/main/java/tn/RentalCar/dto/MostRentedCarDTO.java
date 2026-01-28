package tn.RentalCar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MostRentedCarDTO {
    private String carName;
    private Long rentalCount;
    private Double totalRevenue;
}
