package com.example.auction.Controllers;

import com.example.auction.BaseIntegrationTest;
import com.example.auction.DTOs.AuctionDTO;
import com.example.auction.Entities.Auction;
import com.example.auction.Entities.UserEntity;
import com.example.auction.Repositories.AuctionRepository;
import com.example.auction.Repositories.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@Transactional
class AuctionControllerIntTest extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        auctionRepository.deleteAll();
        userRepository.deleteAll();

        UserEntity owner = new UserEntity();
        owner.setUsername("user");
        owner.setEmail("user@example.com");
        owner.setPassword("password");
        owner.setProvider("web");
        owner.setProviderId("web");
        userRepository.save(owner);
    }

    @Test
    void shouldGetAllAuctions() throws Exception {
        mockMvc.perform(get("/api/auctions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void shouldReturnNotFoundForUnknownAuction() throws Exception {
        mockMvc.perform(get("/api/auctions/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void shouldReturnNotFoundWhenUpdatingUnknownAuction() throws Exception {
        AuctionDTO auctionDTO = new AuctionDTO();
        auctionDTO.setTitle("Nothing");
        auctionDTO.setCurrentBid(BigDecimal.ONE);
        auctionDTO.setEndTime(LocalDateTime.now().plusDays(1));

        mockMvc.perform(put("/api/auctions/9999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(auctionDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldReturnNotFoundWhenDeletingUnknownAuction() throws Exception {
        mockMvc.perform(delete("/api/auctions/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void shouldCreateAuction() throws Exception {
        AuctionDTO auctionDTO = new AuctionDTO();
        auctionDTO.setTitle("Vintage Camera");
        auctionDTO.setDescription("A rare vintage camera.");
        auctionDTO.setCurrentBid(BigDecimal.valueOf(100.0));
        auctionDTO.setEndTime(LocalDateTime.now().plusDays(1));
        auctionDTO.setOwnerName("user");

        mockMvc.perform(post("/api/auctions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(auctionDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Vintage Camera"));
    }
}
