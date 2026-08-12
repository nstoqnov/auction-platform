package com.example.auction.Controllers;

import com.example.auction.Entities.ChatMessage;
import com.example.auction.Repositories.ChatMessageRepository;
import com.example.auction.Services.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private ChatService chatService;

    // --- SEND over HTTP (reliable), then push to the recipient over WS ---
    @PostMapping("/api/chat/send")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody ChatMessage chatMessage, Principal principal) {
        // Trust the authenticated user, never the request body, for the sender
        chatMessage.setSenderUsername(principal.getName());
        ChatMessage saved = chatService.save(chatMessage);

        // Live-deliver to the recipient if they're connected; if not, it's
        // already persisted and they'll load it on their next fetch.
        messagingTemplate.convertAndSendToUser(
                saved.getRecipientUsername(),
                "/queue/messages",
                saved
        );

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/api/chat/status/{username}")
    public ResponseEntity<Boolean> getOnlineStatus(@PathVariable String username) {
        return ResponseEntity.ok(chatService.isUserOnline(username));
    }

    @GetMapping("/api/chat/history/{otherUser}")
    public ResponseEntity<List<ChatMessage>> getChatHistory(@PathVariable String otherUser, Principal principal) {
        return ResponseEntity.ok(chatService.getConversation(principal.getName(), otherUser));
    }

    @GetMapping("/api/chat/conversations")
    public ResponseEntity<List<ChatMessage>> getConversations(Principal principal) {
        return ResponseEntity.ok(chatService.getRecentConversations(principal.getName()));
    }

    // --- UNREAD tracking ---

    // Total unread messages → drives the navbar badge
    @GetMapping("/api/chat/unread-count")
    public ResponseEntity<Long> getUnreadCount(Principal principal) {
        return ResponseEntity.ok(chatService.getUnreadCount(principal.getName()));
    }

    // Unread counts per conversation partner → inbox dots
    @GetMapping("/api/chat/unread")
    public ResponseEntity<List<ChatMessageRepository.UnreadCount>> getUnreadByPartner(Principal principal) {
        return ResponseEntity.ok(chatService.getUnreadByPartner(principal.getName()));
    }

    // Mark a conversation read when the user opens that chat; returns new total.
    // Also pushes a "seen" receipt to the sender so their bubbles update live.
    @PostMapping("/api/chat/read/{otherUser}")
    public ResponseEntity<Long> markRead(@PathVariable String otherUser, Principal principal) {
        String me = principal.getName();
        LocalDateTime now = LocalDateTime.now();
        int updated = chatService.markRead(me, otherUser, now);

        if (updated > 0) {
            // Tell `otherUser` (the sender) that `me` has seen their messages
            messagingTemplate.convertAndSendToUser(
                    otherUser,
                    "/queue/read",
                    Map.of("reader", me, "readAt", now.toString())
            );
        }

        return ResponseEntity.ok(chatService.getUnreadCount(me));
    }
}
