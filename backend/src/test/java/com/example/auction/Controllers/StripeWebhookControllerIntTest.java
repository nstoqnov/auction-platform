package com.example.auction.Controllers;

import com.example.auction.BaseIntegrationTest;
import com.example.auction.Services.PaymentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class StripeWebhookControllerIntTest extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PaymentService paymentService;

    @Test
    void shouldHandleWebhookInvalidSignature() throws Exception {
        mockMvc.perform(post("/api/stripe/webhook")
                        .header("Stripe-Signature", "invalid_sig")
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }
}
