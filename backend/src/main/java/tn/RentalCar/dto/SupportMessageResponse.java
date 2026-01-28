package tn.RentalCar.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.RentalCar.entity.MessageType;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportMessageResponse {
    private Long id;
    private UserDTO sender;
    private String content;
    private String mediaUrl;
    private MessageType mediaType;
    private LocalDateTime createdAt;
}
