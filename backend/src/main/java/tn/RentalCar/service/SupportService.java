package tn.RentalCar.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.RentalCar.dto.*;
import tn.RentalCar.entity.*;
import tn.RentalCar.repository.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupportService {

        private final SupportTicketRepository ticketRepository;
        private final SupportMessageRepository messageRepository;
        private final BookingRepository bookingRepository;
        private final PaymentRepository paymentRepository;
        private final NotificationService notificationService;
        private final UserRepository userRepository;

        @Transactional
        public SupportTicketResponse createTicket(SupportTicketRequest request, User user) {
                SupportTicket ticket = SupportTicket.builder()
                                .subject(request.getSubject())
                                .description(request.getDescription())
                                .user(user)
                                .status(SupportTicketStatus.OPEN)
                                .issueType(request.getIssueType())
                                .priority(request.getPriority())
                                .build();

                if (request.getBookingId() != null) {
                        Booking booking = bookingRepository.findById(request.getBookingId())
                                        .orElseThrow(() -> new RuntimeException("Booking not found"));
                        ticket.setBooking(booking);
                }

                if (request.getPaymentId() != null) {
                        Payment payment = paymentRepository.findById(request.getPaymentId())
                                        .orElseThrow(() -> new RuntimeException("Payment not found"));
                        ticket.setPayment(payment);
                }

                SupportTicket savedTicket = ticketRepository.save(ticket);

                // Notify all admins
                List<User> admins = userRepository.findByRole(Role.ADMIN);
                String customerName = user.getFirstName() + " " + user.getLastName();
                for (User admin : admins) {
                        notificationService.createNotification(
                                        admin,
                                        "New Support Ticket",
                                        customerName + " opened a ticket: " + savedTicket.getSubject(),
                                        NotificationType.SUPPORT,
                                        "/admin/support");
                }

                return mapToTicketResponse(savedTicket);
        }

        public List<SupportTicketResponse> getUserTickets(User user) {
                return ticketRepository.findAllByUserOrderByCreatedAtDesc(user)
                                .stream()
                                .map(this::mapToTicketResponse)
                                .collect(Collectors.toList());
        }

        public List<SupportTicketResponse> getAllTickets() {
                return ticketRepository.findAllByOrderByCreatedAtDesc()
                                .stream()
                                .map(this::mapToTicketResponse)
                                .collect(Collectors.toList());
        }

        public SupportTicketResponse getTicketById(Long id) {
                SupportTicket ticket = ticketRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Ticket not found"));
                return mapToTicketResponse(ticket);
        }

        @Transactional
        public SupportMessageResponse addMessage(Long ticketId, SupportMessageRequest request, User sender) {
                SupportTicket ticket = ticketRepository.findById(ticketId)
                                .orElseThrow(() -> new RuntimeException("Ticket not found"));

                SupportMessage message = SupportMessage.builder()
                                .ticket(ticket)
                                .sender(sender)
                                .content(request.getContent())
                                .mediaUrl(request.getMediaUrl())
                                .build();

                SupportMessage savedMessage = messageRepository.save(message);

                ticket.setUpdatedAt(LocalDateTime.now());
                ticketRepository.save(ticket);

                // Notify user if admin replied, or notify admin if user replied?
                // For now, simplify: notify the OTHER person if possible, or just notify the
                // owner of the ticket if sender is not the owner.
                if (!sender.getId().equals(ticket.getUser().getId())) {
                        notificationService.createNotification(
                                        ticket.getUser(),
                                        "New Response on Ticket #" + ticket.getId(),
                                        "An agent has replied to your support ticket: " + ticket.getSubject(),
                                        NotificationType.SUPPORT,
                                        "/profile/support/" + ticket.getId());
                } else {
                        // Notify all admins if user replied
                        List<User> admins = userRepository.findByRole(Role.ADMIN);
                        String customerName = sender.getFirstName() + " " + sender.getLastName();
                        for (User admin : admins) {
                                notificationService.createNotification(
                                                admin,
                                                "New User Response",
                                                customerName + " replied to ticket #" + ticket.getId() + ": "
                                                                + ticket.getSubject(),
                                                NotificationType.SUPPORT,
                                                "/admin/support");
                        }
                }

                return mapToMessageResponse(savedMessage);
        }

        @Transactional
        public SupportTicketResponse updateTicketStatus(Long ticketId, SupportTicketStatus status) {
                SupportTicket ticket = ticketRepository.findById(ticketId)
                                .orElseThrow(() -> new RuntimeException("Ticket not found"));
                ticket.setStatus(status);
                ticket.setUpdatedAt(LocalDateTime.now());
                SupportTicket savedTicket = ticketRepository.save(ticket);

                notificationService.createNotification(
                                ticket.getUser(),
                                "Ticket Status Updated",
                                "Your ticket #" + ticket.getId() + " status has been changed to " + status,
                                NotificationType.SUPPORT,
                                "/profile/support/" + ticket.getId());

                return mapToTicketResponse(savedTicket);
        }

        private SupportTicketResponse mapToTicketResponse(SupportTicket ticket) {
                return SupportTicketResponse.builder()
                                .id(ticket.getId())
                                .subject(ticket.getSubject())
                                .description(ticket.getDescription())
                                .user(mapToUserDTO(ticket.getUser()))
                                .booking(ticket.getBooking() != null ? mapToBookingDTO(ticket.getBooking()) : null)
                                .paymentId(ticket.getPayment() != null ? ticket.getPayment().getId() : null)
                                .status(ticket.getStatus())
                                .issueType(ticket.getIssueType())
                                .priority(ticket.getPriority())
                                .createdAt(ticket.getCreatedAt())
                                .updatedAt(ticket.getUpdatedAt())
                                .messages(ticket.getMessages().stream()
                                                .map(this::mapToMessageResponse)
                                                .collect(Collectors.toList()))
                                .build();
        }

        private SupportMessageResponse mapToMessageResponse(SupportMessage message) {
                return SupportMessageResponse.builder()
                                .id(message.getId())
                                .sender(mapToUserDTO(message.getSender()))
                                .content(message.getContent())
                                .mediaUrl(message.getMediaUrl())
                                .mediaType(message.getMediaType())
                                .createdAt(message.getCreatedAt())
                                .build();
        }

        private UserDTO mapToUserDTO(User user) {
                return UserDTO.builder()
                                .id(user.getId())
                                .firstName(user.getFirstName())
                                .lastName(user.getLastName())
                                .email(user.getEmail())
                                .build();
        }

        private BookingDTO mapToBookingDTO(Booking booking) {
                return BookingDTO.builder()
                                .id(booking.getId())
                                .startDate(booking.getStartDate())
                                .endDate(booking.getEndDate())
                                .totalPrice(booking.getTotalPrice())
                                .status(booking.getStatus())
                                .carName(booking.getCar().getBrand() + " " + booking.getCar().getModel())
                                .build();
        }
}
