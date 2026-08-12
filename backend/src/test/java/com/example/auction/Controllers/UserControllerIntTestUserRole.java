package com.example.auction.Controllers;

import com.example.auction.BaseIntegrationTest;
import com.example.auction.Entities.*;
import com.example.auction.Repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@Transactional
class UserControllerIntTestUserRole extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    private UserEntity testUser;

    @BeforeEach
    void setUp() {
        paymentRepository.deleteAll();
        bidRepository.deleteAll();
        auctionRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();
        
        Role userRole = new Role();
        userRole.setName("ROLE_USER");
        roleRepository.save(userRole);
        
        testUser = new UserEntity();
        testUser.setUsername("testuser");
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password");
        testUser.setProvider("web");
        testUser.setProviderId("web");
        testUser.setRoles(Collections.singleton(userRole));
        testUser = userRepository.save(testUser);
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldGetMyAuctions() throws Exception {
        // Create an auction owned by testUser
        Auction auction = new Auction();
        auction.setTitle("My Auction");
        auction.setDescription("Description");
        auction.setCurrentBid(BigDecimal.TEN);
        auction.setEndTime(LocalDateTime.now().plusDays(1));
        auction.setOwner(testUser);
        auction.setStatus(AuctionStatus.ACTIVE);
        auctionRepository.save(auction);
        
        mockMvc.perform(get("/api/users/me/auctions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("My Auction"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldGetMyBids() throws Exception {

        UserEntity seller = new UserEntity();
        seller.setUsername("seller");
        seller.setEmail("seller@example.com");
        seller.setPassword("password");
        userRepository.save(seller);

        Auction auction = new Auction();
        auction.setTitle("Auction to Bid On");
        auction.setDescription("Desc");
        auction.setCurrentBid(BigDecimal.TEN);
        auction.setEndTime(LocalDateTime.now().plusDays(1));
        auction.setOwner(seller);
        auction.setStatus(AuctionStatus.ACTIVE);
        auction = auctionRepository.save(auction);

        Bid bid = new Bid(BigDecimal.valueOf(20), testUser, auction);
        bidRepository.save(bid);

        mockMvc.perform(get("/api/users/me/bids"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Auction to Bid On"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldGetMyWins() throws Exception {
        UserEntity seller = new UserEntity();
        seller.setUsername("seller");
        seller.setEmail("seller@example.com");
        seller.setPassword("password");
        userRepository.save(seller);

        Auction auction = new Auction();
        auction.setTitle("Won Auction");
        auction.setDescription("Desc");
        auction.setCurrentBid(BigDecimal.valueOf(100));
        auction.setEndTime(LocalDateTime.now().minusDays(1)); // Ended
        auction.setOwner(seller);
        auction.setStatus(AuctionStatus.PENDING_PAYMENT);
        auction = auctionRepository.save(auction);

        Payment payment = new Payment();
        payment.setAuction(auction);
        payment.setBuyer(testUser);
        payment.setAmount(BigDecimal.valueOf(100));
        payment.setStatus(PaymentStatus.PENDING);
        payment.setCreatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        mockMvc.perform(get("/api/users/me/wins"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].auctionTitle").value("Won Auction"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldGetAllUsers_Forbidden() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isForbidden());
    }
}
