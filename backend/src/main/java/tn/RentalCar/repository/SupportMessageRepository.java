package tn.RentalCar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.RentalCar.entity.SupportMessage;
import tn.RentalCar.entity.SupportTicket;

import java.util.List;

@Repository
public interface SupportMessageRepository extends JpaRepository<SupportMessage, Long> {
    List<SupportMessage> findAllByTicketOrderByCreatedAtAsc(SupportTicket ticket);
}
