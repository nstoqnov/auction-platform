package com.example.auction.Mappers;
import com.example.auction.Exceptions.ResourceNotFoundException;

import com.example.auction.DTOs.AuctionDTO;
import com.example.auction.DTOs.ImageDTO;
import com.example.auction.Entities.Auction;
import com.example.auction.Entities.Category;
import com.example.auction.Entities.ImageMetadata;
import com.example.auction.Repositories.CategoryRepository;
import com.example.auction.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class AuctionMapper {
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;
    public Auction mapToEntity(AuctionDTO dto) {
        Auction auction = new Auction();
        auction.setTitle(dto.getTitle());
        auction.setDescription(dto.getDescription());

        auction.setMainImageUrl(dto.getMainImageUrl());

        auction.setCurrentBid(dto.getCurrentBid());
        auction.setStartTime(dto.getStartTime());
        auction.setEndTime(dto.getEndTime());

        Set<Category> categoryEntities = new HashSet<>();
        if (dto.getCategoryNames() != null) {
            for (String catName : dto.getCategoryNames()) {
                Category cat = categoryRepository.findByName(catName)
                        .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + catName));
                categoryEntities.add(cat);
            }
        }
        auction.setCategories(categoryEntities);

        if (dto.getImages() != null) {
            for (ImageDTO imgDto : dto.getImages()) {
                ImageMetadata img = new ImageMetadata();
                img.setUrl(imgDto.getUrl());
                img.setCloudId(imgDto.getPublicId());
                auction.addImage(img);
            }
        }

        return auction;
    }

    public AuctionDTO mapToDTO(Auction auction) {
        AuctionDTO dto = new AuctionDTO();
        dto.setId(auction.getId());
        dto.setTitle(auction.getTitle());
        dto.setDescription(auction.getDescription());
        dto.setCurrentBid(auction.getCurrentBid());
        dto.setStartTime(auction.getStartTime());
        dto.setEndTime(auction.getEndTime());
        dto.setMainImageUrl(auction.getMainImageUrl());
        dto.setStatus(auction.getStatus().toString());

        String name = userRepository.findOwnerUsernameByAuctionId(auction.getId());
        dto.setOwnerName(name);
        if (auction.getCategories() != null) {
            dto.setCategoryNames(auction.getCategories().stream()
                    .map(category -> category.getName())
                    .collect(Collectors.toList()));
        }

        if (auction.getImages() != null) {
            List<ImageDTO> imgDtoList = auction.getImages().stream()
                    .map(img -> {
                        ImageDTO imgDTO = new ImageDTO();
                        imgDTO.setUrl(img.getUrl());
                        imgDTO.setPublicId(img.getCloudId());
                        return imgDTO;
                    })
                    .collect(Collectors.toList());

            dto.setImages(imgDtoList);
        }

        return dto;
    }
}
