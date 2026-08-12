package com.example.auction.Controllers;

import com.example.auction.BaseIntegrationTest;
import com.example.auction.DTOs.LoginRequest;
import com.example.auction.DTOs.RegisterRequest;
import com.example.auction.Entities.Role;
import com.example.auction.Entities.UserEntity;
import com.example.auction.Repositories.RoleRepository;
import com.example.auction.Repositories.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@Transactional
class AuthControllerIntTest extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        // Roles are seeded by data.sql at container startup
    }

    @Test
    void shouldRegisterUserSuccessfully() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("John Doe");
        request.setUsername("johndoe");
        request.setEmail("john@example.com");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void shouldLoginUserSuccessfully() throws Exception {
        // Create user first
        Role userRole = roleRepository.findByName("ROLE_USER").orElseThrow();
        UserEntity user = new UserEntity();
        user.setName("Login User");
        user.setUsername("loginuser");
        user.setEmail("login@example.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRoles(Collections.singleton(userRole));
        user.setProvider("web");
        user.setProviderId("web");
        user.setEnabled(false);
        userRepository.save(user);

        LoginRequest request = new LoginRequest();
        request.setUsername("loginuser");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().is(400));
    }

    @Test
    void shouldRejectDuplicateUsername() throws Exception {
        Role userRole = roleRepository.findByName("ROLE_USER").orElseThrow();
        UserEntity existing = new UserEntity();
        existing.setName("Existing");
        existing.setUsername("takenname");
        existing.setEmail("existing@example.com");
        existing.setPassword(passwordEncoder.encode("password123"));
        existing.setProvider("web");
        existing.setProviderId("web");
        existing.setRoles(Collections.singleton(userRole));
        userRepository.save(existing);

        RegisterRequest request = new RegisterRequest();
        request.setName("Duplicate");
        request.setUsername("takenname");
        request.setEmail("dup@example.com");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldRejectInvalidRegistrationPayload() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("");
        request.setUsername("");
        request.setEmail("not-an-email");
        request.setPassword("x");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
