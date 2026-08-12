package com.example.auction.Repositories;

import com.example.auction.Entities.ImageMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ImageRepository extends JpaRepository<ImageMetadata, Long> {
    Optional<ImageMetadata> findByCloudId(String cloudId);
}
