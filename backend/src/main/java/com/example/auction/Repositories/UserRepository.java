package com.example.auction.Repositories;

import com.example.auction.Entities.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByUsername(String username);
    Optional<UserEntity> findByEmail(String email);
    @Query("SELECT a.owner.username FROM Auction a WHERE a.id = :auctionId")
    String findOwnerUsernameByAuctionId(@Param("auctionId") Long auctionId);
}