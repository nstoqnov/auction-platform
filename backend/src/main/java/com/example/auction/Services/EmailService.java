package com.example.auction.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    public void sendPaymentLink(String toEmail, String auctionTitle, Long paymentId) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Congratulations! You won the auction: " + auctionTitle);

        String paymentLink = "http://localhost:3000/checkout/" + paymentId;

        message.setText("You had the highest bid! Please complete your payment here: " + paymentLink);
        mailSender.send(message);
    }

    public void sendPaymentConfirmation(String email, String title, BigDecimal amount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Congratulations!Payment is successful for auction: " + title);

        message.setText("Download your invoice");
        mailSender.send(message);
    }

    public void sendVerificationEmail(String toEmail, String token) {
        String subject = "AuctionApp - Please Verify Your Email";

        String confirmationUrl = "http://localhost:3000/verify-email?token=" + token;

        String message = "Thank you for registering. Please click the link below to activate your account:\n" + confirmationUrl;

        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(toEmail);
        email.setSubject(subject);
        email.setText(message);
        //email.setFrom("noreply@auctionapp.com");

        mailSender.send(email);
        System.out.println("Email sent to " + toEmail);
    }
}