package tn.RentalCar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.RentalCar.entity.SupportTicket;
import tn.RentalCar.entity.User;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findAllByUserOrderByCreatedAtDesc(User user);

    List<SupportTicket> findAllByOrderByCreatedAtDesc();
}
