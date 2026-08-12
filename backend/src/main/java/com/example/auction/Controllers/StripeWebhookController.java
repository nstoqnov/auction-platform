package com.example.auction.Controllers;

import com.example.auction.Entities.Auction;
import com.example.auction.Entities.AuctionStatus;
import com.example.auction.Entities.PaymentStatus;
import com.example.auction.Repositories.AuctionRepository;
import com.example.auction.Repositories.PaymentRepository;
import com.example.auction.Services.EmailService;
import com.example.auction.Services.PaymentService;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/stripe")
public class StripeWebhookController {

    private final PaymentService paymentService;

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    public StripeWebhookController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(@RequestBody String payload,
                                                      @RequestHeader("Stripe-Signature") String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Invalid signature");
        }

        String eventType = event.getType();
        if ("checkout.session.completed".equals(eventType) || "payment_intent.succeeded".equals(eventType)) {

            String dataObjectJson = event.getDataObjectDeserializer().getRawJson();
            JsonObject jsonObject = JsonParser.parseString(dataObjectJson).getAsJsonObject();

            if (jsonObject.has("metadata") && !jsonObject.get("metadata").isJsonNull()) {
                JsonObject metadata = jsonObject.getAsJsonObject("metadata");
                if (metadata.has("paymentId")) {
                    Long paymentId = metadata.get("paymentId").getAsLong();
                    String piId = jsonObject.has("payment_intent")
                            ? jsonObject.get("payment_intent").getAsString()
                            : jsonObject.get("id").getAsString();

                    paymentService.fulfillPayment(paymentId, piId);
                }
            }
        }

        return ResponseEntity.ok("Success");
    }
}