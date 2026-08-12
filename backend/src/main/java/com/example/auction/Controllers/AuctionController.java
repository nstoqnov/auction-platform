package com.example.auction.Controllers;

import com.example.auction.DTOs.AuctionDTO;
import com.example.auction.Services.AuctionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auctions")
public class AuctionController {

    private final AuctionService auctionService;

    public AuctionController(AuctionService auctionService) {
        this.auctionService = auctionService;
    }

    @GetMapping
    public List<AuctionDTO> getAllAuctions() {
        return auctionService.getAllAuctions();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuctionDTO> getAuctionById(@PathVariable Long id) {
        return auctionService.getAuctionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{categoryName}")
    public ResponseEntity<List<AuctionDTO>> getAuctionsByCategory(@PathVariable String categoryName) {
        return ResponseEntity.ok(auctionService.getAuctionsByCategory(categoryName));
    }

    @PostMapping
    public ResponseEntity<AuctionDTO> createAuction(@RequestBody @Valid AuctionDTO auctionDTO) {
        AuctionDTO createdAuction = auctionService.createAuction(auctionDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAuction);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuctionDTO> updateAuction(@PathVariable Long id, @RequestBody @Valid AuctionDTO auctionDTO) {
        return auctionService.updateAuction(id, auctionDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuction(@PathVariable Long id) {
        if (auctionService.deleteAuction(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}