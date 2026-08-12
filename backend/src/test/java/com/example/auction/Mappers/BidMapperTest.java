package com.example.auction.Mappers;

import com.example.auction.DTOs.BidDTO;
import com.example.auction.Entities.Auction;
import com.example.auction.Entities.Bid;
import com.example.auction.Entities.UserEntity;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

class BidMapperTest {

    private final BidMapper mapper = new BidMapper();

    @Test
    void mapToDTO_shouldCopyBidderNameAmountAndTime() {
        UserEntity user = new UserEntity();
        user.setUsername("alice");
        Auction auction = new Auction();

        LocalDateTime now = LocalDateTime.now();
        Bid bid = new Bid(BigDecimal.valueOf(100), user, auction);
        bid.setBidTime(now);

        BidDTO dto = mapper.mapToDTO(bid);

        assertEquals("alice", dto.getBidderName());
        assertEquals(BigDecimal.valueOf(100), dto.getAmount());
        assertEquals(now, dto.getBidTime());
    }
}
