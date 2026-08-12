package com.example.auction.Services;

import com.example.auction.DTOs.AuctionDTO;
import com.example.auction.DTOs.ImageDTO;
import com.example.auction.DTOs.PaymentDTO;
import com.example.auction.Entities.*;
import com.example.auction.Mappers.AuctionMapper;
import com.example.auction.Repositories.AuctionRepository;
import com.example.auction.Repositories.CategoryRepository;
import com.example.auction.Repositories.PaymentRepository;
import com.example.auction.Repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuctionServiceTest {

    @Mock
    private AuctionRepository auctionRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private AuctionMapper auctionMapper;

    @InjectMocks
    private AuctionService auctionService;

    private Auction auction;
    private AuctionDTO auctionDTO;
    private UserEntity user;
    private Category category;

    @BeforeEach
    void setUp() {
        user = new UserEntity();
        user.setId(1L);
        user.setUsername("testuser");

        auction = new Auction();
        auction.setId(1L);
        auction.setTitle("Test Auction");
        auction.setOwner(user);
        auction.setStatus(AuctionStatus.ACTIVE);

        auctionDTO = new AuctionDTO();
        auctionDTO.setId(1L);
        auctionDTO.setTitle("Test Auction");
        auctionDTO.setOwnerName("testuser");

        category = new Category();
        category.setName("Electronics");
    }

    @Test
    void shouldGetAllAuctions() {
        when(auctionRepository.findAll()).thenReturn(List.of(auction));
        when(auctionMapper.mapToDTO(auction)).thenReturn(auctionDTO);

        List<AuctionDTO> result = auctionService.getAllAuctions();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(auctionDTO.getTitle(), result.get(0).getTitle());
    }

    @Test
    void shouldGetAuctionById() {
        when(auctionRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(auction));
        when(auctionMapper.mapToDTO(auction)).thenReturn(auctionDTO);

        Optional<AuctionDTO> result = auctionService.getAuctionById(1L);

        assertTrue(result.isPresent());
        assertEquals(auctionDTO.getTitle(), result.get().getTitle());
    }

    @Test
    void shouldGetAuctionsByCategory() {
        when(auctionRepository.findByCategories_NameIgnoreCase("Electronics")).thenReturn(List.of(auction));
        when(auctionMapper.mapToDTO(auction)).thenReturn(auctionDTO);

        List<AuctionDTO> result = auctionService.getAuctionsByCategory("Electronics");

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void shouldCreateAuction_Active() {
        when(auctionMapper.mapToEntity(auctionDTO)).thenReturn(auction);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(auctionRepository.save(auction)).thenReturn(auction);
        when(auctionMapper.mapToDTO(auction)).thenReturn(auctionDTO);

        AuctionDTO result = auctionService.createAuction(auctionDTO);

        assertNotNull(result);
        assertEquals(AuctionStatus.ACTIVE, auction.getStatus());
        verify(auctionRepository).save(auction);
    }

    @Test
    void shouldCreateAuction_Upcoming() {
        auction.setStartTime(LocalDateTime.now().plusDays(1));
        when(auctionMapper.mapToEntity(auctionDTO)).thenReturn(auction);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(auctionRepository.save(auction)).thenReturn(auction);
        when(auctionMapper.mapToDTO(auction)).thenReturn(auctionDTO);

        AuctionDTO result = auctionService.createAuction(auctionDTO);

        assertNotNull(result);
        assertEquals(AuctionStatus.UPCOMING, auction.getStatus());
    }

    @Test
    void shouldUpdateAuction() {
        AuctionDTO updateDTO = new AuctionDTO();
        updateDTO.setTitle("Updated Title");
        updateDTO.setCategoryNames(List.of("Electronics"));
        ImageDTO imgDTO = new ImageDTO();
        imgDTO.setUrl("http://url");
        imgDTO.setPublicId("pid");
        updateDTO.setImages(Collections.singletonList(imgDTO));

        when(auctionRepository.findById(1L)).thenReturn(Optional.of(auction));
        when(categoryRepository.findByName("Electronics")).thenReturn(Optional.of(category));
        when(auctionRepository.save(any(Auction.class))).thenReturn(auction);
        when(auctionMapper.mapToDTO(any(Auction.class))).thenReturn(updateDTO);

        Optional<AuctionDTO> result = auctionService.updateAuction(1L, updateDTO);

        assertTrue(result.isPresent());
        assertEquals("Updated Title", result.get().getTitle());
        verify(auctionRepository).save(auction);
    }
    
    @Test
    void shouldUpdateAuction_CategoryNotFound() {
        AuctionDTO updateDTO = new AuctionDTO();
        updateDTO.setCategoryNames(List.of("Unknown"));
        
        when(auctionRepository.findById(1L)).thenReturn(Optional.of(auction));
        when(categoryRepository.findByName("Unknown")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> auctionService.updateAuction(1L, updateDTO));
    }

    @Test
    void shouldDeleteAuction() {
        when(auctionRepository.existsById(1L)).thenReturn(true);

        boolean result = auctionService.deleteAuction(1L);

        assertTrue(result);
        verify(auctionRepository).deleteById(1L);
    }

    @Test
    void shouldReturnFalseWhenDeleteNonExistentAuction() {
        when(auctionRepository.existsById(1L)).thenReturn(false);

        boolean result = auctionService.deleteAuction(1L);

        assertFalse(result);
        verify(auctionRepository, never()).deleteById(anyLong());
    }

    @Test
    void shouldGetAuctionsCreatedByUser() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(auctionRepository.findAllByOwnerId(1L)).thenReturn(List.of(auction));
        when(auctionMapper.mapToDTO(auction)).thenReturn(auctionDTO);

        List<AuctionDTO> result = auctionService.getAuctionsCreatedByUser("testuser");

        assertEquals(1, result.size());
    }

    @Test
    void shouldThrowException_GetAuctionsCreatedByUser_UserNotFound() {
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> auctionService.getAuctionsCreatedByUser("unknown"));
    }

    @Test
    void shouldGetAuctionsBidOnByUser() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(auctionRepository.findAuctionsByBidderId(1L)).thenReturn(List.of(auction));
        when(auctionMapper.mapToDTO(auction)).thenReturn(auctionDTO);

        List<AuctionDTO> result = auctionService.getAuctionsBidOnByUser("testuser");

        assertEquals(1, result.size());
    }
    
    @Test
    void shouldThrowException_GetAuctionsBidOnByUser_UserNotFound() {
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> auctionService.getAuctionsBidOnByUser("unknown"));
    }

    @Test
    void shouldGetWonAuctionsPendingPayment() {
        Payment payment = new Payment();
        payment.setId(10L);
        payment.setAuction(auction);
        payment.setAmount(BigDecimal.TEN);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setCreatedAt(LocalDateTime.now());
        
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(paymentRepository.findByBuyerId(1L)).thenReturn(List.of(payment));

        List<PaymentDTO> result = auctionService.getWonAuctionsPendingPayment("testuser");

        assertEquals(1, result.size());
        assertEquals(auction.getTitle(), result.get(0).getAuctionTitle());
    }
    
    @Test
    void shouldThrowException_GetWonAuctionsPendingPayment_UserNotFound() {
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> auctionService.getWonAuctionsPendingPayment("unknown"));
    }
}
