package com.example.auction.DTOs;

import com.example.auction.Entities.PaymentStatus;

import java.time.LocalDateTime;

public class PaymentDTO {
    private Long id;
    private Long auctionId;
    private String auctionTitle;
    private String auctionMainImage;
    private Double amount;
    private PaymentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private String stripePaymentIntentId;

    public PaymentDTO() {
    }

    public PaymentDTO(Long id, Long auctionId, String auctionTitle, String auctionMainImage, Double amount, PaymentStatus status, LocalDateTime createdAt, LocalDateTime paidAt, String stripePaymentIntentId) {
        this.id = id;
        this.auctionId = auctionId;
        this.auctionTitle = auctionTitle;
        this.auctionMainImage = auctionMainImage;
        this.amount = amount;
        this.status = status;
        this.createdAt = createdAt;
        this.paidAt = paidAt;
        this.stripePaymentIntentId = stripePaymentIntentId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAuctionId() {
        return auctionId;
    }

    public void setAuctionId(Long auctionId) {
        this.auctionId = auctionId;
    }

    public String getAuctionTitle() {
        return auctionTitle;
    }

    public void setAuctionTitle(String auctionTitle) {
        this.auctionTitle = auctionTitle;
    }

    public String getAuctionMainImage() {
        return auctionMainImage;
    }

    public void setAuctionMainImage(String auctionMainImage) {
        this.auctionMainImage = auctionMainImage;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }

    public String getStripePaymentIntentId() {
        return stripePaymentIntentId;
    }

    public void setStripePaymentIntentId(String stripePaymentIntentId) {
        this.stripePaymentIntentId = stripePaymentIntentId;
    }
}