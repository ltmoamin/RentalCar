package tn.RentalCar.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import tn.RentalCar.entity.User;
import tn.RentalCar.repository.UserRepository;
import tn.RentalCar.service.ChatService;

import java.security.Principal;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload Map<String, Object> payload, Principal principal) {
        if (principal == null)
            return;

        User currentUser = userRepository.findByEmail(principal.getName()).orElse(null);
        if (currentUser == null)
            return;

        Long conversationId = ((Number) payload.get("conversationId")).longValue();
        boolean isTyping = (Boolean) payload.get("isTyping");

        chatService.sendTypingIndicator(conversationId, currentUser, isTyping);
    }

    @MessageMapping("/chat.markRead")
    public void handleMarkRead(@Payload Map<String, Object> payload, Principal principal) {
        if (principal == null)
            return;

        User currentUser = userRepository.findByEmail(principal.getName()).orElse(null);
        if (currentUser == null)
            return;

        Long conversationId = ((Number) payload.get("conversationId")).longValue();
        chatService.markAsRead(conversationId, currentUser);
    }
}
