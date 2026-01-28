package tn.RentalCar.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.RentalCar.dto.BookingDTO;
import tn.RentalCar.entity.*;
import tn.RentalCar.repository.BookingRepository;
import tn.RentalCar.repository.CarRepository;
import tn.RentalCar.repository.ReviewRepository;
import tn.RentalCar.repository.UserRepository;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Transactional
    public Booking createBooking(Booking booking) {
        if (isCarAvailable(booking.getCar().getId(), booking.getStartDate(), booking.getEndDate())) {

            long days = ChronoUnit.DAYS.between(booking.getStartDate(), booking.getEndDate());
            if (days <= 0)
                days = 1; // Minimum 1 day

            Car car = carRepository.findById(booking.getCar().getId())
                    .orElseThrow(() -> new RuntimeException("Car not found"));

            booking.setTotalPrice(days * car.getPricePerDay());
            booking.setStatus(BookingStatus.PENDING);
            Booking savedBooking = bookingRepository.save(booking);

            // Notify all admins
            List<User> admins = userRepository.findByRole(Role.ADMIN);
            String customerName = booking.getUser().getFirstName() + " " + booking.getUser().getLastName();
            for (User admin : admins) {
                notificationService.createNotification(
                        admin,
                        "New Booking Request",
                        customerName + " has requested a new booking #" + savedBooking.getId() + " for "
                                + car.getBrand() + " " + car.getModel(),
                        NotificationType.BOOKING,
                        "/admin/bookings");
            }

            return savedBooking;
        } else {
            throw new RuntimeException("Car is not available for the selected dates");
        }
    }

    public boolean isCarAvailable(Long carId, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate) {
        return !bookingRepository.existsOverlappingBookings(carId, startDate, endDate);
    }

    public List<BookingDTO> getBusyDates(Long carId) {
        List<BookingStatus> busyStatuses = List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);
        return bookingRepository.findByCarIdAndStatusIn(carId, busyStatuses).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingDTO updateBookingStatus(Long bookingId, BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(status);
        Booking updatedBooking = bookingRepository.save(booking);

        // Notify user
        notificationService.createNotification(
                booking.getUser(),
                "Booking Status Updated",
                "Your booking #" + booking.getId() + " for " + booking.getCar().getBrand() + " "
                        + booking.getCar().getModel() + " is now " + status,
                NotificationType.BOOKING,
                "/profile/bookings");

        return mapToDTO(updatedBooking);
    }

    public BookingDTO getBookingById(Long id) {
        return bookingRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }

    public BookingDTO mapToDTO(Booking booking) {
        return BookingDTO.builder()
                .id(booking.getId())
                .userId(booking.getUser().getId())
                .userFullName(booking.getUser().getFirstName() + " " + booking.getUser().getLastName())
                .carId(booking.getCar().getId())
                .carName(booking.getCar().getBrand() + " " + booking.getCar().getModel())
                .carImageUrl(booking.getCar().getImageUrl())
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .reviewed(reviewRepository.findByBookingId(booking.getId()).isPresent())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
