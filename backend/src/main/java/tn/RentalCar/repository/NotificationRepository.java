package tn.RentalCar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.RentalCar.entity.Notification;
import tn.RentalCar.entity.User;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    long countByUserAndIsReadFalse(User user);

    List<Notification> findByUserAndTypeAndTitleContainingAndIsReadFalse(User user, tn.RentalCar.entity.NotificationType type, String titleFragment);
}
