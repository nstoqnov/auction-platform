package com.example.auction.Repositories;


import com.example.auction.Entities.Payment;
import com.example.auction.Entities.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByBuyerId(Long buyerId);

    List<Payment> findByBuyerIdAndStatus(Long buyerId, PaymentStatus status);

    Optional<Payment> findByStripePaymentIntentId(String intentId);
    boolean existsByAuctionId(Long auctionId);

    @Query("SELECT p FROM Payment p JOIN FETCH p.buyer JOIN FETCH p.auction WHERE p.id = :id")
    Optional<Payment> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT p FROM Payment p JOIN FETCH p.auction WHERE p.buyer.id = :userId AND p.status = :status")
    List<Payment> findByBuyerWithAuction(@Param("userId") Long userId, @Param("status") PaymentStatus status);
}
