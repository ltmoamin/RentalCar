package tn.RentalCar.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.RentalCar.entity.FuelType;
import tn.RentalCar.entity.Transmission;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarDTO {
    private Long id;
    private String brand;
    private String model;
    private Integer year;
    private Double pricePerDay;
    private Transmission transmission;
    private FuelType fuelType;
    private Boolean available;
    private String imageUrl;
    private String description;
    private Integer seats;
    private String category;
    private Double averageRating;
    private Integer reviewCount;
    private LocalDateTime createdAt;
}
