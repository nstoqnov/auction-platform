package com.example.auction.Services;

import com.example.auction.Entities.*;
import com.example.auction.Repositories.AuctionRepository;
import com.example.auction.Repositories.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private AuctionRepository auctionRepository;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private PaymentService paymentService;

    private Payment payment;
    private Auction auction;
    private UserEntity buyer;

    @BeforeEach
    void setUp() {
        buyer = new UserEntity();
        buyer.setUsername("buyer");
        buyer.setEmail("buyer@example.com");

        auction = new Auction();
        auction.setTitle("Test Auction");
        auction.setStatus(AuctionStatus.PENDING_PAYMENT);

        payment = new Payment();
        payment.setId(1L);
        payment.setAuction(auction);
        payment.setBuyer(buyer);
        payment.setAmount(BigDecimal.valueOf(100));
        payment.setStatus(PaymentStatus.PENDING);
    }

    @Test
    void shouldFulfillPayment() {
        when(paymentRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(payment));

        paymentService.fulfillPayment(1L, "pi_123");

        assertEquals(PaymentStatus.COMPLETED, payment.getStatus());
        assertEquals("pi_123", payment.getStripePaymentIntentId());
        assertEquals(AuctionStatus.PAID, auction.getStatus());

        verify(paymentRepository).save(payment);
        verify(auctionRepository).save(auction);
        verify(emailService).sendPaymentConfirmation(eq("buyer@example.com"), anyString(), eq(BigDecimal.valueOf(100)));
    }

    @Test
    void shouldNotFulfillPayment_AlreadyCompleted() {
        payment.setStatus(PaymentStatus.COMPLETED);
        when(paymentRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(payment));

        paymentService.fulfillPayment(1L, "pi_123");

        verify(paymentRepository, never()).save(payment);
        verify(auctionRepository, never()).save(auction);
        verify(emailService, never()).sendPaymentConfirmation(anyString(), anyString(), any());
    }

    @Test
    void shouldNotFulfillPayment_PaymentNotFound() {
        when(paymentRepository.findByIdWithDetails(1L)).thenReturn(Optional.empty());

        paymentService.fulfillPayment(1L, "pi_123");

        verify(paymentRepository, never()).save(payment);
    }
}
