package tn.RentalCar.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.RentalCar.entity.SupportIssueType;
import tn.RentalCar.entity.SupportTicketPriority;
import tn.RentalCar.entity.SupportTicketStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketResponse {
    private Long id;
    private String subject;
    private String description;
    private UserDTO user;
    private BookingDTO booking;
    private Long paymentId;
    private SupportTicketStatus status;
    private SupportIssueType issueType;
    private SupportTicketPriority priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<SupportMessageResponse> messages;
}
