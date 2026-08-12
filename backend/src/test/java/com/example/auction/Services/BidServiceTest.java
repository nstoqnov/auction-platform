package com.example.auction.Services;

import com.example.auction.DTOs.BidDTO;
import com.example.auction.DTOs.BidUpdateDTO;
import com.example.auction.Entities.*;
import com.example.auction.Mappers.BidMapper;
import com.example.auction.Repositories.AuctionRepository;
import com.example.auction.Repositories.BidRepository;
import com.example.auction.Repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BidServiceTest {

    @Mock
    private BidRepository bidRepository;
    @Mock
    private AuctionRepository auctionRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private SimpMessagingTemplate messagingTemplate;
    @Mock
    private BidMapper bidMapper;

    @InjectMocks
    private BidService bidService;

    private Auction auction;
    private UserEntity user;
    private Bid bid;
    private BidDTO bidDTO;

    @BeforeEach
    void setUp() {
        user = new UserEntity();
        user.setId(1L);
        user.setUsername("testuser");

        auction = new Auction();
        auction.setId(1L);
        auction.setCurrentBid(BigDecimal.TEN);
        auction.setStartTime(LocalDateTime.now().minusHours(1));
        auction.setEndTime(LocalDateTime.now().plusHours(1));
        auction.setStatus(AuctionStatus.ACTIVE);

        bid = new Bid(BigDecimal.valueOf(20), user, auction);
        bidDTO = new BidDTO("testuser", BigDecimal.valueOf(20), LocalDateTime.now());
    }

    @Test
    void shouldPlaceBid() {
        when(auctionRepository.findById(1L)).thenReturn(Optional.of(auction));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(bidRepository.save(any(Bid.class))).thenReturn(bid);
        when(bidMapper.mapToDTO(bid)).thenReturn(bidDTO);

        BidDTO result = bidService.placeBid(1L, "testuser", BigDecimal.valueOf(20));

        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(20), auction.getCurrentBid());
        assertEquals(user, auction.getCurrentHighestBidder());
        verify(auctionRepository).save(auction);
        verify(messagingTemplate, times(2)).convertAndSend(anyString(), any(BidUpdateDTO.class));
    }

    @Test
    void shouldThrowException_PlaceBid_AuctionNotFound() {
        when(auctionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> bidService.placeBid(1L, "testuser", BigDecimal.valueOf(20)));
    }

    @Test
    void shouldThrowException_PlaceBid_AuctionNotActiveStatus() {
        auction.setStatus(AuctionStatus.CANCELLED);
        when(auctionRepository.findById(1L)).thenReturn(Optional.of(auction));

        assertThrows(RuntimeException.class, () -> bidService.placeBid(1L, "testuser", BigDecimal.valueOf(20)));
    }

    @Test
    void shouldThrowException_PlaceBid_AuctionTimeExpired() {
        auction.setEndTime(LocalDateTime.now().minusHours(1));
        when(auctionRepository.findById(1L)).thenReturn(Optional.of(auction));

        assertThrows(RuntimeException.class, () -> bidService.placeBid(1L, "testuser", BigDecimal.valueOf(20)));
    }

    @Test
    void shouldThrowException_PlaceBid_AmountTooLow() {
        when(auctionRepository.findById(1L)).thenReturn(Optional.of(auction));

        assertThrows(RuntimeException.class, () -> bidService.placeBid(1L, "testuser", BigDecimal.valueOf(5)));
    }

    @Test
    void shouldThrowException_PlaceBid_UserNotFound() {
        when(auctionRepository.findById(1L)).thenReturn(Optional.of(auction));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> bidService.placeBid(1L, "testuser", BigDecimal.valueOf(20)));
    }

    @Test
    void shouldGetBidsForAuction() {
        when(bidRepository.findByAuction_IdOrderByBidTimeDesc(1L)).thenReturn(List.of(bid));
        when(bidMapper.mapToDTO(bid)).thenReturn(bidDTO);

        List<BidDTO> result = bidService.getBidsForAuction(1L);

        assertEquals(1, result.size());
    }

    @Test
    void shouldCountBidsThisWeek() {
        when(bidRepository.countByBidTimeBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(5L);

        long count = bidService.countBidsThisWeek();

        assertEquals(5L, count);
    }

    @Test
    void shouldTotalBidAmountThisMonth() {
        when(bidRepository.sumTotalBidsBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(BigDecimal.valueOf(100));

        BigDecimal total = bidService.totalBidAmountThisMonth();

        assertEquals(BigDecimal.valueOf(100), total);
    }

    @Test
    void shouldReturnZeroTotalBidAmountThisMonth_WhenNull() {
        when(bidRepository.sumTotalBidsBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(null);

        BigDecimal total = bidService.totalBidAmountThisMonth();

        assertEquals(BigDecimal.ZERO, total);
    }
}
