package tn.RentalCar.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import tn.RentalCar.dto.SupportMessageRequest;
import tn.RentalCar.dto.SupportMessageResponse;
import tn.RentalCar.dto.SupportTicketRequest;
import tn.RentalCar.dto.SupportTicketResponse;
import tn.RentalCar.entity.SupportTicketStatus;
import tn.RentalCar.entity.User;
import tn.RentalCar.repository.UserRepository;
import tn.RentalCar.service.SupportService;

import java.util.List;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<SupportTicketResponse> createTicket(
            @RequestBody SupportTicketRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(supportService.createTicket(request, user));
    }

    @GetMapping("/my-tickets")
    public ResponseEntity<List<SupportTicketResponse>> getMyTickets(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(supportService.getUserTickets(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupportTicketResponse> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(supportService.getTicketById(id));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<SupportMessageResponse> addMessage(
            @PathVariable Long id,
            @RequestBody SupportMessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(supportService.addMessage(id, request, user));
    }

    // Admin endpoints (could be separated or secured by roles)
    @GetMapping("/admin/all")
    public ResponseEntity<List<SupportTicketResponse>> getAllTickets() {
        return ResponseEntity.ok(supportService.getAllTickets());
    }

    @PatchMapping("/admin/{id}/status")
    public ResponseEntity<SupportTicketResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam SupportTicketStatus status) {
        return ResponseEntity.ok(supportService.updateTicketStatus(id, status));
    }

    private User getUserFromDetails(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
