package tn.RentalCar.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tn.RentalCar.dto.CarDTO;
import tn.RentalCar.entity.Car;
import tn.RentalCar.repository.CarRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarService {

    private final CarRepository carRepository;
    private final CloudinaryService cloudinaryService;
    private final NotificationService notificationService;
    private final tn.RentalCar.repository.UserRepository userRepository;

    public List<CarDTO> getAllCars() {
        return carRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<CarDTO> getFilteredCars(String brand, Double minPrice, Double maxPrice, Boolean available,
            String category) {
        return carRepository.findFilteredCars(brand, minPrice, maxPrice, available, category).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CarDTO getCarById(Long id) {
        return carRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Car not found"));
    }

    public CarDTO createCar(CarDTO carDTO) {
        Car car = mapToEntity(carDTO);
        Car savedCar = carRepository.save(car);
        return mapToDTO(savedCar);
    }

    public CarDTO updateCar(Long id, CarDTO carDTO) {
        Car existingCar = carRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Car not found"));

        existingCar.setBrand(carDTO.getBrand());
        existingCar.setModel(carDTO.getModel());
        existingCar.setYear(carDTO.getYear());
        existingCar.setPricePerDay(carDTO.getPricePerDay());
        existingCar.setTransmission(carDTO.getTransmission());
        existingCar.setFuelType(carDTO.getFuelType());
        existingCar.setAvailable(carDTO.getAvailable());
        existingCar.setDescription(carDTO.getDescription());
        existingCar.setSeats(carDTO.getSeats());
        existingCar.setCategory(carDTO.getCategory());
        if (carDTO.getImageUrl() != null) {
            existingCar.setImageUrl(carDTO.getImageUrl());
        }

        Car updatedCar = carRepository.save(existingCar);

        // Notify admins
        notifyAdmins("Car Edited", "Car #" + updatedCar.getId() + " (" + updatedCar.getBrand() + " "
                + updatedCar.getModel() + ") was updated", "/cars/" + updatedCar.getId());

        return mapToDTO(updatedCar);
    }

    private void notifyAdmins(String title, String message, String link) {
        try {
            List<tn.RentalCar.entity.User> admins = userRepository.findByRole(tn.RentalCar.entity.Role.ADMIN);
            for (tn.RentalCar.entity.User admin : admins) {
                notificationService.createNotification(admin, title, message,
                        tn.RentalCar.entity.NotificationType.CAR_UPDATE, link);
            }
        } catch (Exception e) {
            System.err.println("Failed to notify admins: " + e.getMessage());
        }
    }

    public void deleteCar(Long id) {
        carRepository.deleteById(id);
    }

    public String uploadCarImage(Long id, MultipartFile file) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Car not found"));

        try {
            String imageUrl = cloudinaryService.upload(file, "cars");
            car.setImageUrl(imageUrl);
            carRepository.save(car);

            // Notify admins
            notifyAdmins("Car Image Updated",
                    "Image for car #" + car.getId() + " (" + car.getBrand() + " " + car.getModel() + ") was updated",
                    "/cars/" + car.getId());

            return imageUrl;
        } catch (IOException e) {
            throw new RuntimeException("Cloudinary upload failed: " + e.getMessage());
        }
    }

    private CarDTO mapToDTO(Car car) {
        return CarDTO.builder()
                .id(car.getId())
                .brand(car.getBrand())
                .model(car.getModel())
                .year(car.getYear())
                .pricePerDay(car.getPricePerDay())
                .transmission(car.getTransmission())
                .fuelType(car.getFuelType())
                .available(car.getAvailable())
                .imageUrl(car.getImageUrl())
                .description(car.getDescription())
                .seats(car.getSeats())
                .category(car.getCategory())
                .averageRating(car.getAverageRating())
                .reviewCount(car.getReviewCount())
                .createdAt(car.getCreatedAt())
                .build();
    }

    private Car carMapToEntity(CarDTO dto) {
        return Car.builder()
                .brand(dto.getBrand())
                .model(dto.getModel())
                .year(dto.getYear())
                .pricePerDay(dto.getPricePerDay())
                .transmission(dto.getTransmission())
                .fuelType(dto.getFuelType())
                .available(dto.getAvailable())
                .imageUrl(dto.getImageUrl())
                .description(dto.getDescription())
                .seats(dto.getSeats())
                .category(dto.getCategory())
                .build();
    }

    // Alias for consistency with service methods
    private Car mapToEntity(CarDTO dto) {
        return carMapToEntity(dto);
    }
}
