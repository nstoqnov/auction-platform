package com.example.auction.Services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @Test
    void shouldSendPaymentLink() {
        String toEmail = "test@example.com";
        String auctionTitle = "Test Auction";
        Long paymentId = 1L;

        emailService.sendPaymentLink(toEmail, auctionTitle, paymentId);

        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(messageCaptor.capture());

        SimpleMailMessage sentMessage = messageCaptor.getValue();
        assertEquals(toEmail, sentMessage.getTo()[0]);
        assertEquals("Congratulations! You won the auction: Test Auction", sentMessage.getSubject());
        assertEquals("You had the highest bid! Please complete your payment here: http://localhost:3000/checkout/1", sentMessage.getText());
    }

    @Test
    void shouldSendPaymentConfirmation() {
        String toEmail = "test@example.com";
        String auctionTitle = "Test Auction";
        BigDecimal amount = BigDecimal.valueOf(100);

        emailService.sendPaymentConfirmation(toEmail, auctionTitle, amount);

        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(messageCaptor.capture());

        SimpleMailMessage sentMessage = messageCaptor.getValue();
        assertEquals(toEmail, sentMessage.getTo()[0]);
        assertEquals("Congratulations!Payment is successful for auction: Test Auction", sentMessage.getSubject());
        assertEquals("Download your invoice", sentMessage.getText());
    }
}
