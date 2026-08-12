package com.example.auction.Entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "auctions")
public class Auction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Optimistic locking: concurrent bids on the same auction can't silently overwrite each other.
    // A losing concurrent update fails with an OptimisticLockException instead of a lost update.
    @Version
    private Long version;

    private String title;

    @Column(length = 1000)
    private String description;

    @Column(name = "main_image_url")
    private String mainImageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "highest_bidder_id")
    private UserEntity currentHighestBidder;

    private BigDecimal currentBid;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuctionStatus status;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @ManyToMany(cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(
            name = "auction_categories",
            joinColumns = @JoinColumn(name = "auction_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new HashSet<>();

    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ImageMetadata> images = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private UserEntity owner;

    public UserEntity getOwner() {
        return owner;
    }

    public void setOwner(UserEntity owner) {
        this.owner = owner;
    }

    public void addImage(ImageMetadata image) {
        images.add(image);
        image.setAuction(this);
    }

    public void removeImage(ImageMetadata image) {
        images.remove(image);
        image.setAuction(null);
    }

    public void addCategory(Category category) {
        this.categories.add(category);
        category.getAuctions().add(this);
    }

    public void removeCategory(Category category) {
        this.categories.remove(category);
        category.getAuctions().remove(this);
    }

    public Auction() {
    }

    public Auction(Long id, String title, String description, String mainImageUrl, UserEntity currentHighestBidder, BigDecimal currentBid, AuctionStatus status, LocalDateTime startTime, LocalDateTime endTime, Set<Category> categories, List<ImageMetadata> images, UserEntity owner) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.mainImageUrl = mainImageUrl;
        this.currentHighestBidder = currentHighestBidder;
        this.currentBid = currentBid;
        this.status = status;
        this.startTime = startTime;
        this.endTime = endTime;
        this.categories = categories;
        this.images = images;
        this.owner = owner;
    }

    public UserEntity getCurrentHighestBidder() {
        return currentHighestBidder;
    }

    public void setCurrentHighestBidder(UserEntity currentHighestBidder) {
        this.currentHighestBidder = currentHighestBidder;
    }

    public AuctionStatus getStatus() {
        return status;
    }

    public void setStatus(AuctionStatus status) {
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getMainImageUrl() {
        return mainImageUrl;
    }

    public void setMainImageUrl(String mainImageUrl) {
        this.mainImageUrl = mainImageUrl;
    }

    public BigDecimal getCurrentBid() {
        return currentBid;
    }

    public void setCurrentBid(BigDecimal currentBid) {
        this.currentBid = currentBid;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public Set<Category> getCategories() {
        return categories;
    }

    public void setCategories(Set<Category> categories) {
        this.categories = categories;
    }

    public List<ImageMetadata> getImages() {
        return images;
    }

    public void setImages(List<ImageMetadata> images) {
        this.images = images;
    }
}