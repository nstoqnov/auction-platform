package com.example.auction.Controllers;

import com.example.auction.Entities.Payment;
import com.example.auction.Entities.PaymentStatus;
import com.example.auction.Repositories.PaymentRepository;
import com.example.auction.Services.PaymentService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stripe")
public class StripeController {



    private final PaymentRepository paymentRepository;

    private final PaymentService paymentService;

    public StripeController(PaymentRepository paymentRepository, PaymentService paymentService) {
        this.paymentRepository = paymentRepository;
        this.paymentService = paymentService;
    }
    @GetMapping("/{paymentId}")
    public ResponseEntity<?> getPaymentDetails(@PathVariable Long paymentId) {
        Map<String, Object> details = paymentService.createPaymentDetails(paymentId);
        return ResponseEntity.ok(details);
    }
    @PostMapping("/create-checkout-session/{paymentId}")
    public Map<String, String> createCheckoutSession(@PathVariable Long paymentId) throws Exception {
        return paymentService.createPaymentCheckout(paymentId);
    }
}