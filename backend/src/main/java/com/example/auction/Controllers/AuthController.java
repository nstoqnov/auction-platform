package com.example.auction.Controllers;

import com.example.auction.DTOs.LoginRequest;
import com.example.auction.DTOs.RegisterRequest;
import com.example.auction.Entities.Role;
import com.example.auction.Entities.UserEntity;
import com.example.auction.Repositories.RoleRepository;
import com.example.auction.Repositories.UserRepository;
import com.example.auction.Security.JwtUtil;
import com.example.auction.Services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;

    private final UserService userService;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          UserService userService,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.userService = userService;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {

        if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        UserEntity user = userService.createUserWithConfirmation(registerRequest);

        return ResponseEntity.ok("Please verify your email to finish the registration!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        Optional<UserEntity> user = userRepository.findByUsername(loginRequest.getUsername());
        if(user.isPresent()) {
            if(!user.get().isEnabled()){
                return ResponseEntity.badRequest().body("Please confirm your email!");
            }
        }
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        String role = isAdmin ? "ROLE_ADMIN" : "ROLE_USER";
        String token = jwtUtil.generateToken(loginRequest.getUsername(), role);

        return ResponseEntity.ok(token);
    }
    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam("token") String token) {
        String result = userService.validateVerificationToken(token);

        if ("VALID".equals(result)) {
            return ResponseEntity.ok("Email verified successfully! You can now login.");
        } else if ("EXPIRED".equals(result)) {
            return ResponseEntity.badRequest().body("Token expired. Please register again.");
        } else {
            return ResponseEntity.badRequest().body("Invalid token.");
        }
    }
}