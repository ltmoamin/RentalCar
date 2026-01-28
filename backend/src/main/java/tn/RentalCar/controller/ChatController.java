package tn.RentalCar.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.RentalCar.dto.ChatConversationDTO;
import tn.RentalCar.dto.ChatMessageDTO;
import tn.RentalCar.dto.SendMessageRequest;
import tn.RentalCar.entity.User;
import tn.RentalCar.repository.UserRepository;
import tn.RentalCar.service.ChatService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    @GetMapping("/conversations")
    public ResponseEntity<List<ChatConversationDTO>> getConversations(
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getUserFromDetails(userDetails);
        return ResponseEntity.ok(chatService.getConversations(currentUser));
    }

    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<Page<ChatMessageDTO>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getUserFromDetails(userDetails);
        return ResponseEntity.ok(chatService.getMessages(conversationId, page, size, currentUser));
    }

    @PostMapping("/send")
    public ResponseEntity<ChatMessageDTO> sendMessage(
            @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getUserFromDetails(userDetails);
        return ResponseEntity.ok(chatService.sendMessage(request, currentUser));
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getUserFromDetails(userDetails);
        String mediaUrl = chatService.uploadMedia(file, currentUser);
        return ResponseEntity.ok(Map.of("url", mediaUrl));
    }

    @PutMapping("/read/{conversationId}")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getUserFromDetails(userDetails);
        chatService.markAsRead(conversationId, currentUser);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/pin/{conversationId}")
    public ResponseEntity<Void> togglePin(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getUserFromDetails(userDetails);
        chatService.togglePin(conversationId, currentUser);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/archive/{conversationId}")
    public ResponseEntity<Void> toggleArchive(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getUserFromDetails(userDetails);
        chatService.toggleArchive(conversationId, currentUser);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{conversationId}")
    public ResponseEntity<Void> deleteConversation(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getUserFromDetails(userDetails);
        chatService.deleteConversation(conversationId, currentUser);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/start")
    public ResponseEntity<ChatConversationDTO> startConversation(
            @RequestBody Map<String, Long> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getUserFromDetails(userDetails);
        Long userId = request.get("userId");
        if (userId == null)
            userId = request.get("adminId"); // Backward compatibility
        return ResponseEntity.ok(chatService.startConversation(userId, currentUser));
    }

    @GetMapping("/admins")
    public ResponseEntity<List<Map<String, Object>>> getAvailableAdmins() {
        List<User> admins = userRepository.findByRole(tn.RentalCar.entity.Role.ADMIN);
        List<Map<String, Object>> adminList = admins.stream()
                .map(admin -> Map.<String, Object>of(
                        "id", admin.getId(),
                        "name", admin.getFirstName() + " " + admin.getLastName(),
                        "avatar", admin.getAvatar() != null ? admin.getAvatar() : ""))
                .toList();
        return ResponseEntity.ok(adminList);
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new RuntimeException("Authentication required");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
