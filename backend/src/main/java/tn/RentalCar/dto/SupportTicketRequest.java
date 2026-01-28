package tn.RentalCar.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.RentalCar.entity.SupportIssueType;
import tn.RentalCar.entity.SupportTicketPriority;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketRequest {
    private String subject;
    private String description;
    private Long bookingId;
    private Long paymentId;
    private SupportIssueType issueType;
    private SupportTicketPriority priority;
}
