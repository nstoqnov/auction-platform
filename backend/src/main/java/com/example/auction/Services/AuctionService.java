package com.example.auction.Services;
import com.example.auction.Exceptions.ResourceNotFoundException;

import com.example.auction.DTOs.AuctionDTO;
import com.example.auction.DTOs.ImageDTO;
import com.example.auction.DTOs.PaymentDTO;
import com.example.auction.Entities.*;
import com.example.auction.Mappers.AuctionMapper;
import com.example.auction.Repositories.AuctionRepository;
import com.example.auction.Repositories.CategoryRepository;
import com.example.auction.Repositories.PaymentRepository;
import com.example.auction.Repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Array;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    private final AuctionMapper auctionMapper;
    public AuctionService(AuctionRepository auctionRepository, CategoryRepository categoryRepository, UserRepository userRepository, PaymentRepository paymentRepository, AuctionMapper auctionMapper) {
        this.auctionRepository = auctionRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.auctionMapper = auctionMapper;
    }

    public List<AuctionDTO> getAllAuctions() {
        return auctionRepository.findAll().stream()
                .map(auctionMapper::mapToDTO)
                .toList();
    }
    public Optional<AuctionDTO> getAuctionById(Long id) {
        return auctionRepository.findByIdWithDetails(id)
                .map(auctionMapper::mapToDTO);
    }

    public List<AuctionDTO> getAuctionsByCategory(String categoryName) {
        return auctionRepository.findByCategories_NameIgnoreCase(categoryName).stream()
                .map(auctionMapper::mapToDTO)
                .toList();
    }

    @Transactional
    public AuctionDTO createAuction(AuctionDTO dto) {
        Auction auctionEntity = auctionMapper.mapToEntity(dto);
        auctionEntity.setId(null);
        String ownerName = dto.getOwnerName();
        if(ownerName.equals("Unknown") || ownerName.isBlank()){
            ownerName = "admin";
        }
        Optional<UserEntity> owner = userRepository.findByUsername(ownerName);
        UserEntity ownerObj = owner.get();
        auctionEntity.setOwner(ownerObj);
        if (auctionEntity.getStartTime() != null && auctionEntity.getStartTime().isAfter(LocalDateTime.now())) {
            auctionEntity.setStatus(AuctionStatus.UPCOMING);
        } else {
            auctionEntity.setStatus(AuctionStatus.ACTIVE);
        }

        Auction savedAuction = auctionRepository.save(auctionEntity);
        return auctionMapper.mapToDTO(savedAuction);
    }

    @Transactional
    public Optional<AuctionDTO> updateAuction(Long id, AuctionDTO dto) {
        return auctionRepository.findById(id).map(existingAuction -> {
            existingAuction.setTitle(dto.getTitle());
            existingAuction.setDescription(dto.getDescription());

            existingAuction.setMainImageUrl(dto.getMainImageUrl());

            existingAuction.setCurrentBid(dto.getCurrentBid());
            existingAuction.setStartTime(dto.getStartTime());
            existingAuction.setEndTime(dto.getEndTime());

            if (dto.getCategoryNames() != null) {
                Set<Category> newCategories = new HashSet<>();
                for (String catName : dto.getCategoryNames()) {
                    Category cat = categoryRepository.findByName(catName)
                            .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + catName));
                    newCategories.add(cat);
                }
                existingAuction.setCategories(newCategories);
            }


            if (dto.getImages() != null) {
                existingAuction.getImages().clear();

                for (ImageDTO imgDto : dto.getImages()) {
                    ImageMetadata img = new ImageMetadata();
                    img.setUrl(imgDto.getUrl());
                    img.setCloudId(imgDto.getPublicId());
                    existingAuction.addImage(img);
                }
            }

            Auction savedAuction = auctionRepository.save(existingAuction);
            return auctionMapper.mapToDTO(savedAuction);
        });
    }

    public boolean deleteAuction(Long id) {
        if (auctionRepository.existsById(id)) {
            auctionRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<AuctionDTO> getAuctionsCreatedByUser(String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return auctionRepository.findAllByOwnerId(user.getId()).stream()
                .map(auctionMapper::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AuctionDTO> getAuctionsBidOnByUser(String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return auctionRepository.findAuctionsByBidderId(user.getId()).stream()
                .map(auctionMapper::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<PaymentDTO> getWonAuctionsPendingPayment(String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Payment> payments = paymentRepository.findByBuyerId(user.getId());
        List<PaymentDTO> paymentDTO = new ArrayList<>();
        for (Payment pm : payments) {
            Auction auction = pm.getAuction();
            PaymentDTO tempPaymentDTO = new PaymentDTO();
            tempPaymentDTO.setStatus(pm.getStatus());
            tempPaymentDTO.setAuctionTitle(auction.getTitle());
            tempPaymentDTO.setAmount(pm.getAmount().doubleValue());
            tempPaymentDTO.setPaidAt(pm.getPaidAt());
            tempPaymentDTO.setCreatedAt(pm.getCreatedAt());
            tempPaymentDTO.setId(pm.getId());
            paymentDTO.add(tempPaymentDTO);
        }

        return paymentDTO;
    }
}
