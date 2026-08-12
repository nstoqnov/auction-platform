package com.example.auction.Entities;

import jakarta.persistence.*;
import java.util.Calendar;
import java.util.Date;
import java.util.UUID;

@Entity
public class VerificationToken {

    private static final int EXPIRATION = 60 * 24; // 24 hours in minutes

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String token;

    @OneToOne(targetEntity = UserEntity.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private UserEntity user;

    private Date expiryDate;

    public VerificationToken() {}

    public VerificationToken(UserEntity user) {
        this.user = user;
        this.expiryDate = calculateExpiryDate(EXPIRATION);
        this.token = UUID.randomUUID().toString();
    }

    private Date calculateExpiryDate(int expiryTimeInMinutes) {
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.MINUTE, expiryTimeInMinutes);
        return new Date(cal.getTime().getTime());
    }
    public String getToken() { return token; }
    public UserEntity getUser() { return user; }
    public Date getExpiryDate() { return expiryDate; }
    public void setToken(String token) { this.token = token; }
    public void setUser(UserEntity user) { this.user = user; }
    public void setExpiryDate(Date expiryDate) { this.expiryDate = expiryDate; }
}