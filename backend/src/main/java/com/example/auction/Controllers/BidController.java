package com.example.auction.Controllers;

import com.example.auction.DTOs.BidDTO;
import com.example.auction.Services.BidService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bids")
public class BidController {

    private final BidService bidService;

    public BidController(BidService bidService) {
        this.bidService = bidService;
    }

    @PostMapping("/auction/{auctionId}")
    public ResponseEntity<?> placeBid(
            @PathVariable Long auctionId,
            @RequestBody BidDTO bidDTO,
            Authentication authentication) {

        try {
            BidDTO newBid = bidService.placeBid(auctionId, bidDTO.getBidderName(), bidDTO.getAmount());
            return ResponseEntity.ok(newBid);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/auction/{auctionId}")
    public List<BidDTO> getHistory(@PathVariable Long auctionId) {
        return bidService.getBidsForAuction(auctionId);
    }

    @GetMapping("/reports/summary")
    public Map<String, Object> getReports() {
        return Map.of(
                "bidsLast7Days", bidService.countBidsThisWeek(),
                "moneyPledgedThisMonth", bidService.totalBidAmountThisMonth()
        );
    }
}