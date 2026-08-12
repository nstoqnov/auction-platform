package com.example.auction.Services;

import com.example.auction.Entities.ChatMessage;
import com.example.auction.Repositories.ChatMessageRepository;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ChatService {

    private final ChatMessageRepository repository;
    private final SimpUserRegistry userRegistry;

    public ChatService(ChatMessageRepository repository, SimpUserRegistry userRegistry) {
        this.repository = repository;
        this.userRegistry = userRegistry;
    }

    public ChatMessage save(ChatMessage message) {
        ChatMessage chat = new ChatMessage(message.getSenderUsername(), message.getRecipientUsername(), message.getContent());
        return repository.save(chat);
    }

    public List<ChatMessage> getConversation(String user1, String user2) {
        return repository.findBySenderUsernameAndRecipientUsernameOrSenderUsernameAndRecipientUsernameOrderByTimestampAsc(
                user1, user2, user2, user1
        );
    }


    public List<ChatMessage> getRecentConversations(String username) {
        return repository.findRecentConversations(username);
    }
    public boolean isUserOnline(String username) {
        return userRegistry.getUser(username) != null;
    }

    // Mark all messages from `other` to `me` as read at `now`; returns how many were updated
    public int markRead(String me, String other, java.time.LocalDateTime now) {
        return repository.markConversationRead(me, other, now);
    }

    // Total unread messages for the badge
    public long getUnreadCount(String me) {
        return repository.countByRecipientUsernameAndIsReadFalse(me);
    }

    // Unread counts per conversation partner (for inbox dots)
    public List<ChatMessageRepository.UnreadCount> getUnreadByPartner(String me) {
        return repository.countUnreadByPartner(me);
    }
}