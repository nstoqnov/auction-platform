package com.example.auction.Controllers;

import com.example.auction.DTOs.AuctionDTO;
import com.example.auction.DTOs.PaymentDTO;
import com.example.auction.DTOs.RegisterRequest;
import com.example.auction.DTOs.UserDTO;
import com.example.auction.Entities.UserEntity;
import com.example.auction.Services.AuctionService;
import com.example.auction.Services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController

@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AuctionService auctionService;
    public UserController(UserService userService, AuctionService auctionService) {

        this.userService = userService;
        this.auctionService = auctionService;
    }

    @GetMapping
    public List<UserDTO> getAllUsers() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userService.getAllUsers();
    }

    @PostMapping
    public ResponseEntity<?> getAllUsers(@Valid @RequestBody RegisterRequest registerRequest) {
        UserDTO createdUser = userService.createUser(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id,@Valid @RequestBody UserDTO userDTO) {
        return userService.updateUser(id, userDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userService.deleteUser(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    @GetMapping("me/auctions")
    public ResponseEntity<List<AuctionDTO>> getMyAuctions(Authentication authentication) {
        String username = authentication.getName(); // Extracted from JWT
        return ResponseEntity.ok(auctionService.getAuctionsCreatedByUser(username));
    }

    @GetMapping("me/bids")
    public ResponseEntity<List<AuctionDTO>> getMyBids(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(auctionService.getAuctionsBidOnByUser(username));
    }

    @GetMapping("me/wins")
    public ResponseEntity<List<PaymentDTO>> getMyWins(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(auctionService.getWonAuctionsPendingPayment(username));
    }
}
