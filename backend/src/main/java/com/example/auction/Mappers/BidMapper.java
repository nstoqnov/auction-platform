package com.example.auction.Mappers;

import com.example.auction.DTOs.BidDTO;
import com.example.auction.Entities.Bid;
import org.springframework.stereotype.Component;

@Component
public class BidMapper {
    public BidDTO mapToDTO(Bid bid) {
        return new BidDTO(
                bid.getUser().getUsername(),
                bid.getAmount(),
                bid.getBidTime()
        );
    }
}
