package com.example.auction.Controllers;

import com.example.auction.BaseIntegrationTest;
import com.example.auction.Services.PaymentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@Transactional
class StripeControllerIntTest extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PaymentService paymentService;

    @Test
    @WithMockUser(username = "buyer")
    void shouldGetPaymentDetails() throws Exception {
        when(paymentService.createPaymentDetails(1L))
                .thenReturn(Map.of("paymentId", 1L, "amount", "10.00", "status", "PENDING"));

        mockMvc.perform(get("/api/stripe/1"))
                .andExpect(status().isOk());
    }
}
