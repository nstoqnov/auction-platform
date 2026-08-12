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
    public ResponseEntity<BidDTO> placeBid(
            @PathVariable Long auctionId,
            @RequestBody BidDTO bidDTO,
            Authentication authentication) {
        // The bidder is the authenticated user — never trusted from the request body.
        // Exceptions propagate to GlobalExceptionHandler for correct status codes (404/400/409).
        BidDTO newBid = bidService.placeBid(auctionId, authentication.getName(), bidDTO.getAmount());
        return ResponseEntity.ok(newBid);
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