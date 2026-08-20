/**
 * Single Source of Truth Unread Messages Calculator
 * Reused in: App Top Navbar Badge, App Sidebar Badge, Student Dashboard Stat Card, Landlord Dashboard Stat Card
 */
export function calculateUnreadCount(userChats = [], currentUser = null) {
  if (!userChats || !currentUser) return 0;
  
  const currentEmail = (currentUser.email || '').toLowerCase().trim();
  const currentId = (currentUser.id || '').toString();

  return userChats.reduce((total, chat) => {
    if (!chat) return total;
    
    // 1. Check message-level unread flags
    const messages = Array.isArray(chat.messages) ? chat.messages : [];
    if (messages.length > 0) {
      const unreadInMessages = messages.filter(m => {
        if (!m) return false;
        // The message was sent TO the current user (current user is NOT the sender)
        const isFromOther = (m.senderEmail && m.senderEmail.toLowerCase().trim() !== currentEmail) ||
                            (m.senderId && String(m.senderId) !== currentId) ||
                            (m.sender !== 'sender');
        const isUnread = m.isRead === false || m.is_read === false || m.read === false;
        return isFromOther && isUnread;
      }).length;

      if (unreadInMessages > 0) {
        return total + unreadInMessages;
      }
    }

    // 2. Conversation-level unread count check for recipient
    const isRecipient = (chat.recipient_email && chat.recipient_email.toLowerCase().trim() === currentEmail) ||
                        (chat.recipient_id && String(chat.recipient_id) === currentId) ||
                        (chat.student_email && chat.student_email.toLowerCase().trim() === currentEmail) ||
                        (chat.landlord_email && chat.landlord_email.toLowerCase().trim() === currentEmail);
    
    if (isRecipient && Number(chat.unread) > 0) {
      return total + Number(chat.unread);
    }

    return total;
  }, 0);
}
