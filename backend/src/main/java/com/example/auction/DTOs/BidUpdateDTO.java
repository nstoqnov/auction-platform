package com.example.auction.DTOs;

import java.math.BigDecimal;

public class BidUpdateDTO {
    private Long auctionId;
    private BigDecimal newAmount;
    private String bidderName;

    public BidUpdateDTO(Long auctionId, BigDecimal newAmount, String bidderName) {
        this.auctionId = auctionId;
        this.newAmount = newAmount;
        this.bidderName = bidderName;
    }
    public Long getAuctionId() { return auctionId; }
    public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }

    public BigDecimal getNewAmount() { return newAmount; }
    public void setNewAmount(BigDecimal newAmount) { this.newAmount = newAmount; }

    public String getBidderName() { return bidderName; }
    public void setBidderName(String bidderName) { this.bidderName = bidderName; }
}