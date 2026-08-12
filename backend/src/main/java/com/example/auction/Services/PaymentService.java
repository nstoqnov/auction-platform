package com.example.auction.Services;
import com.example.auction.Exceptions.ResourceNotFoundException;
import com.example.auction.Exceptions.ForbiddenException;
import com.example.auction.Exceptions.ConflictException;

import com.example.auction.Entities.Auction;
import com.example.auction.Entities.AuctionStatus;
import com.example.auction.Entities.Payment;
import com.example.auction.Entities.PaymentStatus;
import com.example.auction.Repositories.AuctionRepository;
import com.example.auction.Repositories.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {
    @Value("${stripe.api.key}")
    private String stripeSecretKey;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private final PaymentRepository paymentRepository;
    private final AuctionRepository auctionRepository;
    private final EmailService emailService;

    public PaymentService(PaymentRepository paymentRepository,
                          AuctionRepository auctionRepository,
                          EmailService emailService) {
        this.paymentRepository = paymentRepository;
        this.auctionRepository = auctionRepository;
        this.emailService = emailService;
    }

    @Transactional
    public void fulfillPayment(Long paymentId, String paymentIntentId) {
        paymentRepository.findByIdWithDetails(paymentId).ifPresent(payment -> {

            if (payment.getStatus() == PaymentStatus.COMPLETED) {
                return;
            }

            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setPaidAt(LocalDateTime.now());
            payment.setStripePaymentIntentId(paymentIntentId);
            paymentRepository.save(payment);

            Auction auction = payment.getAuction();
            auction.setStatus(AuctionStatus.PAID);
            auctionRepository.save(auction);

            sendPaymentConfirmation(payment);
        });
    }

    private void sendPaymentConfirmation(Payment payment) {
        String toEmail = payment.getBuyer().getEmail();
        String subject = "Payment Confirmed: " + payment.getAuction().getTitle();
        BigDecimal amount = payment.getAmount();
        String body = String.format(
                "Hello %s,\n\nYour payment of $%s for '%s' has been confirmed.\n\nTransaction ID: %s\n\nThank you!",
                payment.getBuyer().getUsername(),
                payment.getAmount(),
                payment.getAuction().getTitle(),
                payment.getStripePaymentIntentId()
        );
        emailService.sendPaymentConfirmation(toEmail, subject,amount);
    }

    public Map<String, String> createPaymentCheckout(Long paymentId) throws StripeException {
        Stripe.apiKey = stripeSecretKey;

        Payment payment = paymentRepository.findByIdWithDetails(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found"));

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!payment.getBuyer().getUsername().equals(currentUsername)) {
            throw new ForbiddenException("You are not the buyer of this item.");
        }

        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            throw new ConflictException("This item has already been paid for.");
        }

        SessionCreateParams params = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(frontendUrl + "/payment-success?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(frontendUrl + "/payment-cancelled")

                .putMetadata("paymentId", paymentId.toString())

                .setPaymentIntentData(
                        SessionCreateParams.PaymentIntentData.builder()
                                .putMetadata("paymentId", paymentId.toString())
                                .build()
                )
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("usd")
                                .setUnitAmount(payment.getAmount().multiply(new BigDecimal(100)).longValue())
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName(payment.getAuction().getTitle())
                                        .build())
                                .build())
                        .build())
                .build();

        Session session = Session.create(params);

        Map<String, String> response = new HashMap<>();
        response.put("url", session.getUrl());
        return response;
    }

    public Map<String, Object> createPaymentDetails(Long paymentId) {
        Map<String, Object> details = new HashMap<>();
        Payment payment = paymentRepository.findByIdWithDetails(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found"));

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!payment.getBuyer().getUsername().equals(currentUsername)) {
            details.put("error", "User is not the auction winner.");
            return details;
        }

        details.put("id", payment.getId());
        details.put("amount", payment.getAmount());
        details.put("auctionTitle", payment.getAuction().getTitle());
        details.put("status", payment.getStatus());

        return details;
    }
}
