package tn.RentalCar.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.RentalCar.dto.BookingDTO;
import tn.RentalCar.dto.BookingRequest;
import tn.RentalCar.entity.Booking;
import tn.RentalCar.entity.BookingStatus;
import tn.RentalCar.entity.Car;
import tn.RentalCar.entity.User;
import tn.RentalCar.repository.CarRepository;
import tn.RentalCar.repository.UserRepository;
import tn.RentalCar.service.BookingService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;
    private final CarRepository carRepository;

    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(
            Authentication authentication,
            @RequestBody BookingRequest request) {

        User user = getUserFromAuthentication(authentication);
        Car car = carRepository.findById(request.getCarId())
                .orElseThrow(() -> new RuntimeException("Car not found"));

        Booking booking = Booking.builder()
                .user(user)
                .car(car)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        return ResponseEntity.ok(bookingService.mapToDTO(bookingService.createBooking(booking)));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingDTO>> getMyBookings(Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        return ResponseEntity.ok(bookingService.getBookingsByUser(user.getId()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingDTO>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingDTO> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusMap) {
        BookingStatus status = BookingStatus.valueOf(statusMap.get("status"));
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status));
    }

    @GetMapping("/car/{carId}/busy-dates")
    public ResponseEntity<List<BookingDTO>> getBusyDates(@PathVariable Long carId) {
        return ResponseEntity.ok(bookingService.getBusyDates(carId));
    }

    @GetMapping("/check-availability")
    public ResponseEntity<Map<String, Boolean>> checkAvailability(
            @RequestParam Long carId,
            @RequestParam String startDate,
            @RequestParam String endDate) {

        java.time.LocalDateTime start = java.time.LocalDateTime.parse(startDate);
        java.time.LocalDateTime end = java.time.LocalDateTime.parse(endDate);

        boolean available = bookingService.isCarAvailable(carId, start, end);
        return ResponseEntity.ok(Map.of("available", available));
    }

    private User getUserFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
