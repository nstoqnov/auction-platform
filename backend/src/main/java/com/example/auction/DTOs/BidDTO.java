package com.example.auction.DTOs;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BidDTO {
    private String bidderName;
    private BigDecimal amount;
    private LocalDateTime bidTime;

    public BidDTO(String bidderName, BigDecimal amount, LocalDateTime bidTime) {
        this.bidderName = bidderName;
        this.amount = amount;
        this.bidTime = bidTime;
    }

    public String getBidderName() {
        return bidderName;
    }

    public void setBidderName(String bidderName) {
        this.bidderName = bidderName;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDateTime getBidTime() {
        return bidTime;
    }

    public void setBidTime(LocalDateTime bidTime) {
        this.bidTime = bidTime;
    }
}