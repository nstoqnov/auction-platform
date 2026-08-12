package com.example.auction.Repositories;

import com.example.auction.Entities.Auction;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Long> {

    @EntityGraph(attributePaths = {"categories", "images"})
    List<Auction> findByCategories_Name(String name);

    @Override
    @EntityGraph(attributePaths = {"categories", "images"})
    List<Auction> findAll();

    List<Auction> findByCategories_NameIgnoreCase(String categoryName);

    @Modifying
    @Transactional
    @Query("UPDATE Auction a SET a.status = 'PENDING_PAYMENT' " +
            "WHERE a.status = 'ACTIVE' AND a.endTime < :now AND a.currentHighestBidder IS NOT NULL")
    int closeWonAuctions(@Param("now") LocalDateTime now);

    @Modifying
    @Transactional
    @Query("UPDATE Auction a SET a.status = 'CANCELLED' " +
            "WHERE a.status = 'ACTIVE' AND a.endTime < :now AND a.currentHighestBidder IS NULL")
    int closeUnwonAuctions(@Param("now") LocalDateTime now);


    @Query("SELECT a FROM Auction a LEFT JOIN Payment p ON a.id = p.auction.id " +
            "WHERE a.status = 'PENDING_PAYMENT' AND p.id IS NULL")
    List<Auction> findPendingPaymentsWithoutPayment();


    @Query("SELECT a FROM Auction a LEFT JOIN FETCH a.categories WHERE a.id = :id")
    Optional<Auction> findByIdWithCategories(@Param("id") Long id);

    @Query("SELECT DISTINCT a FROM Auction a " +
            "LEFT JOIN FETCH a.categories " +
            "LEFT JOIN FETCH a.images " +
            "WHERE a.id = :id")
    Optional<Auction> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT DISTINCT a FROM Auction a " +
            "LEFT JOIN FETCH a.categories " +
            "LEFT JOIN FETCH a.images " +
            "WHERE a.owner.id = :userId")
    List<Auction> findAllByOwnerId(@Param("userId") Long userId);

    @Query("SELECT DISTINCT b.auction FROM Bid b " +
            "LEFT JOIN FETCH b.auction.categories " +
            "LEFT JOIN FETCH b.auction.images " +
            "WHERE b.user.id = :userId")
    List<Auction> findAuctionsByBidderId(@Param("userId") Long userId);

    @Query("SELECT DISTINCT a FROM Auction a " +
            "LEFT JOIN FETCH a.categories " +
            "LEFT JOIN FETCH a.images " +
            "WHERE a.currentHighestBidder.id = :userId " +
            "AND a.status = 'PENDING_PAYMENT'")
    List<Auction> findWonAuctionsPendingPayment(@Param("userId") Long userId);
}