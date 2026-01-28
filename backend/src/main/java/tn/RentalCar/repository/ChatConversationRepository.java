package tn.RentalCar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.RentalCar.entity.ChatConversation;
import tn.RentalCar.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {

    @Query("SELECT c FROM ChatConversation c WHERE c.user = :user OR c.admin = :user ORDER BY c.lastMessageAt DESC NULLS LAST")
    List<ChatConversation> findByUserOrAdminOrderByLastMessageAtDesc(@Param("user") User user);

    @Query("SELECT c FROM ChatConversation c WHERE (c.user = :user1 AND c.admin = :user2) OR (c.user = :user2 AND c.admin = :user1)")
    Optional<ChatConversation> findConversationBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);

    @Query("SELECT c FROM ChatConversation c WHERE c.user = :user")
    List<ChatConversation> findByUser(@Param("user") User user);

    @Query("SELECT c FROM ChatConversation c WHERE c.admin = :admin ORDER BY c.lastMessageAt DESC NULLS LAST")
    List<ChatConversation> findByAdminOrderByLastMessageAtDesc(@Param("admin") User admin);
}
