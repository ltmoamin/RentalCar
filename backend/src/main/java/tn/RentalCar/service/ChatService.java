package tn.RentalCar.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import tn.RentalCar.dto.ChatConversationDTO;
import tn.RentalCar.dto.ChatMessageDTO;
import tn.RentalCar.dto.SendMessageRequest;
import tn.RentalCar.entity.*;
import tn.RentalCar.repository.ChatConversationRepository;
import tn.RentalCar.repository.ChatMessageRepository;
import tn.RentalCar.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ChatService {

    private final ChatMessageRepository messageRepository;
    private final ChatConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    public List<ChatConversationDTO> getConversations(User currentUser) {
        List<ChatConversation> conversations = conversationRepository
                .findByUserOrAdminOrderByLastMessageAtDesc(currentUser);

        return conversations.stream()
                .filter(conv -> {
                    if (currentUser.getRole() == Role.ADMIN) {
                        return !conv.isArchivedAdmin();
                    } else {
                        return !conv.isArchivedUser();
                    }
                })
                .sorted((c1, c2) -> {
                    boolean p1 = currentUser.getRole() == Role.ADMIN ? c1.isPinnedAdmin() : c1.isPinnedUser();
                    boolean p2 = currentUser.getRole() == Role.ADMIN ? c2.isPinnedAdmin() : c2.isPinnedUser();
                    if (p1 != p2)
                        return p1 ? -1 : 1;

                    if (c1.getLastMessageAt() == null && c2.getLastMessageAt() == null)
                        return 0;
                    if (c1.getLastMessageAt() == null)
                        return 1;
                    if (c2.getLastMessageAt() == null)
                        return -1;
                    return c2.getLastMessageAt().compareTo(c1.getLastMessageAt());
                })
                .map(conv -> toConversationDTO(conv, currentUser))
                .collect(Collectors.toList());
    }

    public Page<ChatMessageDTO> getMessages(Long conversationId, int page, int size, User currentUser) {
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        // Verify user has access to this conversation
        if (!conversation.getUser().getId().equals(currentUser.getId()) &&
                !conversation.getAdmin().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied to this conversation");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<ChatMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId,
                pageable);
        return messages.map(this::toMessageDTO);
    }

    public ChatMessageDTO sendMessage(SendMessageRequest request, User sender) {
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        // Find or create conversation
        ChatConversation conversation = getOrCreateConversation(sender, receiver);

        // Create message
        ChatMessage message = ChatMessage.builder()
                .sender(sender)
                .receiver(receiver)
                .conversation(conversation)
                .content(request.getContent())
                .mediaUrl(request.getMediaUrl())
                .messageType(request.getMessageType() != null ? request.getMessageType() : MessageType.TEXT)
                .build();

        message = messageRepository.save(message);

        // Update conversation
        String lastMessagePreview = getMessagePreview(message);
        conversation.setLastMessage(lastMessagePreview);
        conversation.setLastMessageAt(message.getCreatedAt());

        // Update unread count
        if (receiver.getRole() == Role.ADMIN) {
            conversation.setUnreadCountAdmin(conversation.getUnreadCountAdmin() + 1);
        } else {
            conversation.setUnreadCountUser(conversation.getUnreadCountUser() + 1);
        }

        conversationRepository.save(conversation);

        ChatMessageDTO messageDTO = toMessageDTO(message);

        // Send real-time message via WebSocket (Direct Chat)
        log.info("Sending real-time message via WebSocket to user: {} on destination: /queue/messages",
                receiver.getEmail());
        try {
            messagingTemplate.convertAndSendToUser(
                    receiver.getEmail(),
                    "/queue/messages",
                    messageDTO);
            log.info("Real-time message sent successfully to user: {}", receiver.getEmail());
        } catch (Exception e) {
            log.error("Failed to send real-time message to user: {}", receiver.getEmail(), e);
        }

        // Create system notification for the receiver (Saved in DB)
        notificationService.createNotification(
                receiver,
                "New Message from " + sender.getFirstName(),
                request.getContent() != null ? request.getContent() : "Received a " + message.getMessageType(),
                NotificationType.CHAT,
                "/chat");

        return messageDTO;
    }

    public String uploadMedia(MultipartFile file, User user) {
        try {
            return cloudinaryService.upload(file, "chat");
        } catch (Exception e) {
            log.error("Failed to upload media for chat", e);
            throw new RuntimeException("Failed to upload media: " + e.getMessage());
        }
    }

    public void markAsRead(Long conversationId, User currentUser) {
        int updated = messageRepository.markConversationAsRead(conversationId, currentUser, LocalDateTime.now());

        if (updated > 0) {
            ChatConversation conversation = conversationRepository.findById(conversationId).orElse(null);
            if (conversation != null) {
                if (currentUser.getRole() == Role.ADMIN) {
                    conversation.setUnreadCountAdmin(0);
                } else {
                    conversation.setUnreadCountUser(0);
                }
                conversationRepository.save(conversation);

                // Notify sender that messages were read
                User otherUser = conversation.getUser().getId().equals(currentUser.getId())
                        ? conversation.getAdmin()
                        : conversation.getUser();

                messagingTemplate.convertAndSendToUser(
                        otherUser.getEmail(),
                        "/queue/read-receipts",
                        conversationId);
                        
                // Also mark system notifications for this sender as read
                String senderName = otherUser.getFirstName(); // The person who sent the messages
                notificationService.markChatNotificationsAsRead(currentUser, senderName);
            }
        }
    }

    public ChatConversationDTO startConversation(Long targetUserId, User currentUser) {
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChatConversation conversation = getOrCreateConversation(currentUser, targetUser);
        return toConversationDTO(conversation, currentUser);
    }

    public void sendTypingIndicator(Long conversationId, User currentUser, boolean isTyping) {
        ChatConversation conversation = conversationRepository.findById(conversationId).orElse(null);
        if (conversation == null)
            return;

        User otherUser = conversation.getUser().getId().equals(currentUser.getId())
                ? conversation.getAdmin()
                : conversation.getUser();

        messagingTemplate.convertAndSendToUser(
                otherUser.getEmail(),
                "/queue/typing",
                new TypingIndicator(conversationId, currentUser.getId(), currentUser.getFirstName(), isTyping));
    }

    private ChatConversation getOrCreateConversation(User user1, User user2) {
        // Determine which user is the regular user and which is admin
        User regularUser = user1.getRole() == Role.ADMIN ? user2 : user1;
        User adminUser = user1.getRole() == Role.ADMIN ? user1 : user2;

        return conversationRepository.findConversationBetweenUsers(user1, user2)
                .orElseGet(() -> {
                    ChatConversation newConversation = ChatConversation.builder()
                            .user(regularUser)
                            .admin(adminUser)
                            .build();
                    return conversationRepository.save(newConversation);
                });
    }

    private String getMessagePreview(ChatMessage message) {
        return switch (message.getMessageType()) {
            case VOICE -> "🎤 Voice message";
            case IMAGE -> "📷 Image";
            case VIDEO -> "🎬 Video";
            default -> message.getContent() != null && message.getContent().length() > 50
                    ? message.getContent().substring(0, 50) + "..."
                    : message.getContent();
        };
    }

    private ChatMessageDTO toMessageDTO(ChatMessage message) {
        return ChatMessageDTO.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFirstName() + " " + message.getSender().getLastName())
                .senderAvatar(message.getSender().getAvatar())
                .receiverId(message.getReceiver().getId())
                .receiverName(message.getReceiver().getFirstName() + " " + message.getReceiver().getLastName())
                .conversationId(message.getConversation().getId())
                .content(message.getContent())
                .mediaUrl(message.getMediaUrl())
                .messageType(message.getMessageType())
                .read(message.isRead())
                .readAt(message.getReadAt())
                .createdAt(message.getCreatedAt())
                .build();
    }

    private ChatConversationDTO toConversationDTO(ChatConversation conversation, User currentUser) {
        Integer unreadCount = currentUser.getRole() == Role.ADMIN
                ? conversation.getUnreadCountAdmin()
                : conversation.getUnreadCountUser();

        boolean isPinned = currentUser.getRole() == Role.ADMIN
                ? conversation.isPinnedAdmin()
                : conversation.isPinnedUser();

        boolean isArchived = currentUser.getRole() == Role.ADMIN
                ? conversation.isArchivedAdmin()
                : conversation.isArchivedUser();

        return ChatConversationDTO.builder()
                .id(conversation.getId())
                .userId(conversation.getUser().getId())
                .userName(conversation.getUser().getFirstName() + " " + conversation.getUser().getLastName())
                .userAvatar(conversation.getUser().getAvatar())
                .adminId(conversation.getAdmin().getId())
                .adminName(conversation.getAdmin().getFirstName() + " " + conversation.getAdmin().getLastName())
                .adminAvatar(conversation.getAdmin().getAvatar())
                .lastMessage(conversation.getLastMessage())
                .lastMessageAt(conversation.getLastMessageAt())
                .unreadCount(unreadCount)
                .createdAt(conversation.getCreatedAt())
                .pinned(isPinned)
                .archived(isArchived)
                .build();
    }

    public void togglePin(Long conversationId, User currentUser) {
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (currentUser.getRole() == Role.ADMIN) {
            conversation.setPinnedAdmin(!conversation.isPinnedAdmin());
        } else {
            conversation.setPinnedUser(!conversation.isPinnedUser());
        }
        conversationRepository.save(conversation);
    }

    public void toggleArchive(Long conversationId, User currentUser) {
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (currentUser.getRole() == Role.ADMIN) {
            conversation.setArchivedAdmin(!conversation.isArchivedAdmin());
        } else {
            conversation.setArchivedUser(!conversation.isArchivedUser());
        }
        conversationRepository.save(conversation);
    }

    public void deleteConversation(Long conversationId, User currentUser) {
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        // For simplicity, we can delete the whole conversation if requested, or just
        // hide for one user.
        // Let's implement actual deletion for now.
        conversationRepository.delete(conversation);
    }

    // Inner class for typing indicator
    public record TypingIndicator(Long conversationId, Long userId, String userName, boolean isTyping) {
    }
}
