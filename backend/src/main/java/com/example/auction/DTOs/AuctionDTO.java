package com.example.auction.DTOs;

import java.awt.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class AuctionDTO {
    private Long id;
    private String title;
    private String description;

    private String ownerName;
    private BigDecimal currentBid;
    private LocalDateTime endTime;
    private LocalDateTime startTime;
    private String mainImageUrl;
    private String status;

    private List<String> categoryNames;
    private List<ImageDTO> images;

    public AuctionDTO() {
    }

    public AuctionDTO(Long id, String title,String ownerName, String description, BigDecimal currentBid, LocalDateTime endTime, LocalDateTime startTime, String mainImageUrl, String status, List<String> categoryNames, List<ImageDTO> images) {
        this.id = id;
        this.title = title;
        this.ownerName = ownerName;
        this.description = description;
        this.currentBid = currentBid;
        this.endTime = endTime;
        this.startTime = startTime;
        this.mainImageUrl = mainImageUrl;
        this.status = status;
        this.categoryNames = categoryNames;
        this.images = images;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getCurrentBid() {
        return currentBid;
    }

    public void setCurrentBid(BigDecimal currentBid) {
        this.currentBid = currentBid;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getMainImageUrl() {
        return mainImageUrl;
    }

    public void setMainImageUrl(String mainImageUrl) {
        this.mainImageUrl = mainImageUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<String> getCategoryNames() {
        return categoryNames;
    }

    public void setCategoryNames(List<String> categoryNames) {
        this.categoryNames = categoryNames;
    }

    public List<ImageDTO> getImages() {
        return images;
    }

    public void setImages(List<ImageDTO> images) {
        this.images = images;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }
}