package com.example.auction.Controllers;

import com.example.auction.BaseIntegrationTest;
import com.example.auction.DTOs.BidDTO;
import com.example.auction.Entities.Auction;
import com.example.auction.Entities.AuctionStatus;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@Transactional
class BidControllerIntTest extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Long auctionId;

    @BeforeEach
    void setUp() {
        auctionRepository.deleteAll();
        userRepository.deleteAll();

        UserEntity seller = new UserEntity();
        seller.setUsername("seller");
        seller.setEmail("seller@example.com");
        seller.setPassword("password");
        userRepository.save(seller);

        UserEntity bidder = new UserEntity();
        bidder.setUsername("bidder");
        bidder.setEmail("bidder@example.com");
        bidder.setPassword("password");
        userRepository.save(bidder);

        Auction auction = new Auction();
        auction.setTitle("Test Auction");
        auction.setDescription("Desc");
        auction.setCurrentBid(BigDecimal.TEN);
        auction.setStartTime(LocalDateTime.now().minusDays(1));
        auction.setEndTime(LocalDateTime.now().plusDays(1));
        auction.setOwner(seller);
        auction.setStatus(AuctionStatus.ACTIVE);
        auction = auctionRepository.save(auction);
        auctionId = auction.getId();
    }

    @Test
    @WithMockUser
    void shouldPlaceBid() throws Exception {
        BidDTO bidDTO = new BidDTO("bidder", BigDecimal.valueOf(20), LocalDateTime.now());

        mockMvc.perform(post("/api/bids/auction/" + auctionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bidDTO)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void shouldGetBidHistory() throws Exception {
        mockMvc.perform(get("/api/bids/auction/" + auctionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
