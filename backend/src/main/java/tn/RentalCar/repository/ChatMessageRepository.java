package tn.RentalCar.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.RentalCar.entity.ChatMessage;
import tn.RentalCar.entity.User;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    Page<ChatMessage> findByConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);

    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.receiver = :user AND m.readAt IS NULL")
    long countUnreadMessages(@Param("user") User user);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.conversation.id = :conversationId AND m.receiver = :user AND m.readAt IS NULL")
    long countUnreadMessagesInConversation(@Param("conversationId") Long conversationId, @Param("user") User user);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.readAt = :readAt WHERE m.conversation.id = :conversationId AND m.receiver = :user AND m.readAt IS NULL")
    int markConversationAsRead(@Param("conversationId") Long conversationId, @Param("user") User user,
            @Param("readAt") LocalDateTime readAt);
}
