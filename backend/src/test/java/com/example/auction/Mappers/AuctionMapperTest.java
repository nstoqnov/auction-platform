package com.example.auction.Mappers;

import com.example.auction.DTOs.AuctionDTO;
import com.example.auction.DTOs.ImageDTO;
import com.example.auction.Entities.Auction;
import com.example.auction.Entities.AuctionStatus;
import com.example.auction.Entities.Category;
import com.example.auction.Entities.ImageMetadata;
import com.example.auction.Repositories.CategoryRepository;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuctionMapperTest {

    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuctionMapper mapper;

    private AuctionDTO dto;
    private Auction auction;

    @BeforeEach
    void setUp() {
        dto = new AuctionDTO();
        dto.setTitle("Vintage Camera");
        dto.setDescription("A rare vintage camera.");
        dto.setMainImageUrl("http://img");
        dto.setCurrentBid(BigDecimal.TEN);
        dto.setStartTime(LocalDateTime.now());
        dto.setEndTime(LocalDateTime.now().plusDays(1));

        auction = new Auction();
        auction.setId(42L);
        auction.setTitle("Vintage Camera");
        auction.setDescription("Desc");
        auction.setCurrentBid(BigDecimal.TEN);
        auction.setStartTime(LocalDateTime.now());
        auction.setEndTime(LocalDateTime.now().plusDays(1));
        auction.setMainImageUrl("http://img");
        auction.setStatus(AuctionStatus.ACTIVE);
    }

    @Test
    void mapToEntity_shouldCopyScalarFields() {
        Auction result = mapper.mapToEntity(dto);

        assertEquals("Vintage Camera", result.getTitle());
        assertEquals(BigDecimal.TEN, result.getCurrentBid());
        assertEquals("http://img", result.getMainImageUrl());
        assertNotNull(result.getStartTime());
        assertNotNull(result.getEndTime());
    }

    @Test
    void mapToEntity_shouldResolveCategories() {
        Category electronics = new Category();
        electronics.setName("Electronics");
        dto.setCategoryNames(List.of("Electronics"));

        when(categoryRepository.findByName("Electronics")).thenReturn(Optional.of(electronics));

        Auction result = mapper.mapToEntity(dto);

        assertEquals(1, result.getCategories().size());
        assertTrue(result.getCategories().contains(electronics));
    }

    @Test
    void mapToEntity_shouldThrowWhenCategoryMissing() {
        dto.setCategoryNames(List.of("Unknown"));
        when(categoryRepository.findByName("Unknown")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> mapper.mapToEntity(dto));
    }

    @Test
    void mapToEntity_shouldMapImages() {
        ImageDTO imgDto = new ImageDTO();
        imgDto.setUrl("http://x");
        imgDto.setPublicId("pid1");
        dto.setImages(List.of(imgDto));

        Auction result = mapper.mapToEntity(dto);

        assertEquals(1, result.getImages().size());
        assertEquals("http://x", result.getImages().get(0).getUrl());
        assertEquals("pid1", result.getImages().get(0).getCloudId());
    }

    @Test
    void mapToDTO_shouldCopyScalarFields() {
        when(userRepository.findOwnerUsernameByAuctionId(42L)).thenReturn("alice");

        AuctionDTO result = mapper.mapToDTO(auction);

        assertEquals(42L, result.getId());
        assertEquals("Vintage Camera", result.getTitle());
        assertEquals("ACTIVE", result.getStatus());
        assertEquals("alice", result.getOwnerName());
    }

    @Test
    void mapToDTO_shouldMapCategoryNames() {
        Category electronics = new Category();
        electronics.setName("Electronics");
        auction.setCategories(Set.of(electronics));
        when(userRepository.findOwnerUsernameByAuctionId(42L)).thenReturn("alice");

        AuctionDTO result = mapper.mapToDTO(auction);

        assertEquals(List.of("Electronics"), result.getCategoryNames());
    }

    @Test
    void mapToDTO_shouldMapImages() {
        ImageMetadata img = new ImageMetadata();
        img.setUrl("http://y");
        img.setCloudId("pid2");
        auction.addImage(img);
        when(userRepository.findOwnerUsernameByAuctionId(42L)).thenReturn("alice");

        AuctionDTO result = mapper.mapToDTO(auction);

        assertEquals(1, result.getImages().size());
        assertEquals("http://y", result.getImages().get(0).getUrl());
        assertEquals("pid2", result.getImages().get(0).getPublicId());
    }
}
