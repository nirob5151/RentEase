function calculateUnreadCount(userChats = [], currentUser = null) {
  if (!userChats || !currentUser) return 0;
  
  const currentEmail = (currentUser.email || '').toLowerCase().trim();
  const currentId = (currentUser.id || '').toString();

  return userChats.reduce((total, chat) => {
    if (!chat) return total;
    
    const messages = Array.isArray(chat.messages) ? chat.messages : [];
    if (messages.length > 0) {
      const unreadInMessages = messages.filter(m => {
        if (!m) return false;
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

    const isRecipient = (chat.recipient_email && chat.recipient_email.toLowerCase().trim() === currentEmail) ||
                        (chat.recipient_id && String(chat.recipient_id) === currentId) ||
                        (chat.student_email && chat.student_email.toLowerCase().trim() === currentEmail);
    
    if (isRecipient && Number(chat.unread) > 0) {
      return total + Number(chat.unread);
    }

    return total;
  }, 0);
}

function testUnreadMessages() {
  console.log('=== TESTING UNREAD MESSAGES COUNT CALCULATION ===');

  const mrKhanUser = {
    id: '11111111-1111-4111-a111-787166563441',
    email: 'kmdnirob72@gmail.com',
    name: 'MR Khan'
  };

  const sampleChats = [
    {
      id: 'chat_mr_khan',
      name: 'Md Masudur Rahman Nirob',
      recipient_email: 'kmdnirob72@gmail.com',
      recipient_id: '11111111-1111-4111-a111-787166563441',
      sender_email: 'nirob5151@gmail.com',
      unread: 2,
      messages: [
        { id: 'm1', senderEmail: 'nirob5151@gmail.com', text: 'Hi MR Khan!', isRead: false },
        { id: 'm2', senderEmail: 'nirob5151@gmail.com', text: 'Are you available?', isRead: false }
      ]
    }
  ];

  const unreadForMRKhan = calculateUnreadCount(sampleChats, mrKhanUser);
  console.log('Unread Messages Count for MR Khan:', unreadForMRKhan);
  console.log('Is unread count correctly equal to 2?', unreadForMRKhan === 2 ? '✅ YES!' : '❌ NO');

  // Mark messages as read
  sampleChats[0].messages.forEach(m => m.isRead = true);
  sampleChats[0].unread = 0;

  const countAfterRead = calculateUnreadCount(sampleChats, mrKhanUser);
  console.log('\nUnread Messages Count after opening conversation:', countAfterRead);
  console.log('Is count correctly equal to 0 after opening?', countAfterRead === 0 ? '✅ YES!' : '❌ NO');
}

testUnreadMessages();
