package tn.RentalCar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.RentalCar.entity.Car;
import java.util.List;

@Repository
public interface CarRepository extends JpaRepository<Car, Long> {

    @Query("SELECT c FROM Car c WHERE " +
            "(:brand IS NULL OR LOWER(c.brand) LIKE LOWER(CONCAT('%', :brand, '%'))) AND " +
            "(:minPrice IS NULL OR c.pricePerDay >= :minPrice) AND " +
            "(:maxPrice IS NULL OR c.pricePerDay <= :maxPrice) AND " +
            "(:available IS NULL OR c.available = :available) AND " +
            "(:category IS NULL OR c.category = :category)")
    List<Car> findFilteredCars(
            @Param("brand") String brand,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("available") Boolean available,
            @Param("category") String category);

    List<Car> findByBrandContainingIgnoreCase(String brand);

    List<Car> findByAvailableTrue();
}
