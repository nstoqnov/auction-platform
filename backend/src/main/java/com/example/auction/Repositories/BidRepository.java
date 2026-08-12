package com.example.auction.Repositories;

import com.example.auction.Entities.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {

    List<Bid> findByAuction_IdOrderByBidTimeDesc(Long auctionId);

    long countByBidTimeBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT SUM(b.amount) FROM Bid b WHERE b.bidTime BETWEEN :start AND :end")
    BigDecimal sumTotalBidsBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT b.user.username, SUM(b.amount) as total FROM Bid b GROUP BY b.user.username ORDER BY total DESC")
    List<Object[]> findTopSpenders();
}