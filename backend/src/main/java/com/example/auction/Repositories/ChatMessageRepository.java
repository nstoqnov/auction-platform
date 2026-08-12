package com.example.auction.Repositories;


import com.example.auction.Entities.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySenderUsernameAndRecipientUsernameOrSenderUsernameAndRecipientUsernameOrderByTimestampAsc(
            String sender1, String recipient1, String sender2, String recipient2
    );

    // Total unread messages addressed to this user
    long countByRecipientUsernameAndIsReadFalse(String recipient);

    // Mark every message the other user sent me as read, stamping the read time
    @Modifying
    @Transactional
    @Query("UPDATE ChatMessage m SET m.isRead = true, m.readAt = :now " +
           "WHERE m.recipientUsername = :me AND m.senderUsername = :other AND m.isRead = false")
    int markConversationRead(@Param("me") String me, @Param("other") String other, @Param("now") LocalDateTime now);

    // Unread counts grouped by the sender (for per-conversation dots)
    @Query("SELECT m.senderUsername AS partner, COUNT(m) AS count " +
           "FROM ChatMessage m WHERE m.recipientUsername = :me AND m.isRead = false " +
           "GROUP BY m.senderUsername")
    List<UnreadCount> countUnreadByPartner(@Param("me") String me);

    // Interface projection for the grouped query above
    interface UnreadCount {
        String getPartner();
        long getCount();
    }

    @Query("SELECT m FROM ChatMessage m WHERE (m.senderUsername = :user OR m.recipientUsername = :user) AND m.id IN (SELECT MAX(c.id) FROM ChatMessage c WHERE c.senderUsername = :user OR c.recipientUsername = :user GROUP BY CASE WHEN c.senderUsername = :user THEN c.recipientUsername ELSE c.senderUsername END) ORDER BY m.timestamp DESC")
    List<ChatMessage> findRecentConversations(@Param("user") String user);
}
