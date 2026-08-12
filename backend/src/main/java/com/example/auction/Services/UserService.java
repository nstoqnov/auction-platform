package com.example.auction.Services;

import com.example.auction.DTOs.RegisterRequest;
import com.example.auction.DTOs.UserDTO;
import com.example.auction.Entities.Role;
import com.example.auction.Entities.UserEntity;
import com.example.auction.Entities.VerificationToken;
import com.example.auction.Mappers.UserMapper;
import com.example.auction.Repositories.RoleRepository;
import com.example.auction.Repositories.UserRepository;
import com.example.auction.Repositories.VerificationTokenRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper mapper;
    private final VerificationTokenRepository tokenRepository;

    private final EmailService emailService;
    public UserService(UserRepository userRepository, RoleRepository roleRepository, UserMapper userMapper, PasswordEncoder passwordEncoder, VerificationTokenRepository tokenRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.mapper = userMapper;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(mapper::mapToDTO)
                .toList();
    }

    public UserEntity createUserWithConfirmation(RegisterRequest registerRequest){
        UserEntity user = new UserEntity();
        user.setProvider("web");
        user.setProviderId("web");
        user.setName(registerRequest.getName());
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setEnabled(false);
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));


        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new IllegalStateException("ROLE_USER is missing from the database"));
        user.setRoles(Collections.singleton(userRole));
        UserEntity savedUser = userRepository.save(user);

        VerificationToken token = new VerificationToken(savedUser);
        tokenRepository.save(token);

        // Best-effort: a failure to send the verification email must not fail registration.
        // The account is created; the user can request the email to be resent.
        try {
            emailService.sendVerificationEmail(user.getEmail(), token.getToken());
        } catch (Exception ex) {
            log.warn("Could not send verification email to {}: {}", user.getEmail(), ex.getMessage());
        }

        return user;
    }

    public UserDTO createUser(RegisterRequest registerRequest){
        UserEntity user = new UserEntity();
        user.setProvider("web");
        user.setProviderId("web");
        user.setName(registerRequest.getName());
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setEnabled(true);
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));


        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new IllegalStateException("ROLE_USER is missing from the database"));
        user.setRoles(Collections.singleton(userRole));
        userRepository.save(user);
        UserDTO userDTO = mapper.mapToDTO(user);
        return userDTO;
    }

    public String validateVerificationToken(String token) {
        VerificationToken verificationToken = tokenRepository.findByToken(token);

        if (verificationToken == null) {
            return "INVALID";
        }

        UserEntity user = verificationToken.getUser();
        Calendar cal = Calendar.getInstance();

        if ((verificationToken.getExpiryDate().getTime() - cal.getTime().getTime()) <= 0) {
            tokenRepository.delete(verificationToken);
            return "EXPIRED";
        }

        user.setEnabled(true);
        userRepository.save(user);
        tokenRepository.delete(verificationToken);
        return "VALID";
    }

    public Optional<UserDTO> getUserById(Long id) {
        return userRepository.findById(id)
                .map(mapper::mapToDTO);
    }

    public Optional<UserDTO> updateUser(Long id, UserDTO userDTO) {
        return userRepository.findById(id).map(existingUser -> {

            if (userDTO.getName() != null) {
                existingUser.setName(userDTO.getName());
            }
            if (userDTO.getEmail() != null) {
                existingUser.setEmail(userDTO.getEmail());
            }
            if (userDTO.getUsername() != null) {
                existingUser.setUsername(userDTO.getUsername());
            }

            if (userDTO.getRoles() != null && !userDTO.getRoles().isEmpty()) {
                Set<Role> newRoles = new HashSet<>();

                for (String roleName : userDTO.getRoles()) {
                    Optional<Role> roleOptional = roleRepository.findByName(roleName);
                    if(roleOptional.isPresent()){
                        newRoles.add(roleOptional.get());
                    }
                }

                existingUser.setRoles(newRoles);
            }
            UserEntity savedUser = userRepository.save(existingUser);
            return mapper.mapToDTO(savedUser);
        });
    }
    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }


}
