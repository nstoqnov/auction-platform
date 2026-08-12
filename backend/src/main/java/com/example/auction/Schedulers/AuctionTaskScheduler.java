package com.example.auction.Schedulers;

import com.example.auction.Entities.Auction;
import com.example.auction.Entities.AuctionStatus;
import com.example.auction.Entities.Payment;
import com.example.auction.Entities.PaymentStatus;
import com.example.auction.Repositories.AuctionRepository;
import com.example.auction.Repositories.PaymentRepository;
import com.example.auction.Services.EmailService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AuctionTaskScheduler {

    private final AuctionRepository auctionRepository;
    private final PaymentRepository paymentRepository;
    private final EmailService emailService;

    public AuctionTaskScheduler(AuctionRepository auctionRepository,
                                PaymentRepository paymentRepository,
                                EmailService emailService) {
        this.auctionRepository = auctionRepository;
        this.paymentRepository = paymentRepository;
        this.emailService = emailService;
    }
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void processEndedAuctions() {
        LocalDateTime now = LocalDateTime.now();

        auctionRepository.closeWonAuctions(now);
        auctionRepository.closeUnwonAuctions(now);

        List<Auction> needsPayment = auctionRepository.findPendingPaymentsWithoutPayment();

        for (Auction auction : needsPayment) {
            if (!paymentRepository.existsByAuctionId(auction.getId())) {
                Payment payment = new Payment();
                payment.setAuction(auction);
                payment.setBuyer(auction.getCurrentHighestBidder());
                payment.setAmount(auction.getCurrentBid());
                payment.setCreatedAt(LocalDateTime.now());
                payment.setStatus(PaymentStatus.PENDING);
                paymentRepository.save(payment);

                emailService.sendPaymentLink(
                        auction.getCurrentHighestBidder().getEmail(),
                        auction.getTitle(),
                        payment.getId()
                );
                System.out.println("Mail");
            }
        }
    }
}
