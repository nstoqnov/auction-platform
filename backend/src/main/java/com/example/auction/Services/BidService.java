package com.example.auction.Services;

import com.example.auction.DTOs.BidDTO;
import com.example.auction.DTOs.BidUpdateDTO;
import com.example.auction.Entities.Auction;
import com.example.auction.Entities.AuctionStatus;
import com.example.auction.Entities.Bid;
import com.example.auction.Entities.UserEntity;
import com.example.auction.Exceptions.BadRequestException;
import com.example.auction.Exceptions.ResourceNotFoundException;
import com.example.auction.Mappers.BidMapper;
import com.example.auction.Repositories.AuctionRepository;
import com.example.auction.Repositories.BidRepository;
import com.example.auction.Repositories.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BidService {

    private final BidRepository bidRepository;
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;

    private final SimpMessagingTemplate messagingTemplate;

    private final BidMapper bidMapper;

    public BidService(BidRepository bidRepository, AuctionRepository auctionRepository, UserRepository userRepository, SimpMessagingTemplate messagingTemplate, BidMapper bidMapper) {
        this.bidRepository = bidRepository;
        this.auctionRepository = auctionRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
        this.bidMapper = bidMapper;
    }

    @Transactional
    public BidDTO placeBid(Long auctionId, String username, BigDecimal amount) {

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found"));

        if(auction.getStatus() != AuctionStatus.ACTIVE){
            throw new BadRequestException("This auction is not currently in active state.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(auction.getStartTime()) || now.isAfter(auction.getEndTime())) {
            throw new BadRequestException("This auction is not currently active.");
        }

        if (amount.compareTo(auction.getCurrentBid()) <= 0) {
            throw new BadRequestException("Bid must be higher than the current price: " + auction.getCurrentBid());
        }

        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Bid bid = new Bid(amount, user, auction);
        Bid savedBid = bidRepository.save(bid);


        auction.setCurrentBid(amount);
        auction.setCurrentHighestBidder(user);
        auctionRepository.save(auction);
        BidUpdateDTO updateMsg = new BidUpdateDTO(
                auctionId,
                amount,
                savedBid.getUser().getUsername()
        );

        messagingTemplate.convertAndSend("/topic/auction/" + auctionId, updateMsg);
        messagingTemplate.convertAndSend("/topic/bids", updateMsg);

        return bidMapper.mapToDTO(savedBid);
    }

    public List<BidDTO> getBidsForAuction(Long auctionId) {
        return bidRepository.findByAuction_IdOrderByBidTimeDesc(auctionId).stream()
                .map(bidMapper::mapToDTO)
                .toList();
    }

    public long countBidsThisWeek() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneWeekAgo = now.minusWeeks(1);
        return bidRepository.countByBidTimeBetween(oneWeekAgo, now);
    }

    public BigDecimal totalBidAmountThisMonth() {
        LocalDateTime now = LocalDateTime.now();

        LocalDateTime firstOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);

        BigDecimal total = bidRepository.sumTotalBidsBetween(firstOfMonth, now);
        return (total != null) ? total : BigDecimal.ZERO;
    }


}
