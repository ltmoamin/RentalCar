package tn.RentalCar.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.RentalCar.dto.ChangePasswordRequest;
import tn.RentalCar.dto.UpdateProfileRequest;
import tn.RentalCar.dto.UserDTO;
import tn.RentalCar.entity.User;
import tn.RentalCar.repository.UserRepository;
import tn.RentalCar.service.UserService;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        UserDTO userDTO = userService.getProfile(user.getId());
        return ResponseEntity.ok(userDTO);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {
        User user = getUserFromAuthentication(authentication);
        UserDTO updatedUser = userService.updateProfile(user.getId(), request);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        User user = getUserFromAuthentication(authentication);
        userService.changePassword(user.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Password successfully changed"));
    }

    @PostMapping("/avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            Authentication authentication,
            @RequestParam("avatar") org.springframework.web.multipart.MultipartFile file) {
        User user = getUserFromAuthentication(authentication);
        String avatarUrl = userService.saveAvatar(user.getId(), file);
        return ResponseEntity.ok(Map.of("avatarUrl", avatarUrl));
    }

    private User getUserFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
