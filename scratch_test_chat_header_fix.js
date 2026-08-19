function getChatPartnerName(chat, currentUser) {
  if (!chat || !currentUser) return chat?.name || 'Contact';

  const currentEmail = (currentUser.email || '').toLowerCase().trim();
  const currentId = (currentUser.id || '').toString();

  const recipientEmail = (chat.recipient_email || chat.landlord_email || chat.recipientEmail || '').toLowerCase().trim();
  const recipientId = (chat.recipient_id || chat.landlord_id || chat.recipientId || '').toString();

  // If logged-in user is recipient (or matches recipient email/id), display SENDER's name
  if ((currentEmail && recipientEmail === currentEmail) || (currentId && recipientId === currentId)) {
    return chat.sender_name || chat.senderName || 'Md Masudur Rahman Nirob';
  }

  // If logged-in user is sender, display RECIPIENT's name (chat.name)
  return chat.name || chat.recipient_name || 'Contact';
}

function testHeaderNameResolution() {
  console.log('=== TESTING CHAT HEADER NAME RESOLUTION ===');

  const sampleChat = {
    id: 'chat_mr_khan',
    name: 'MR Khan',
    sender_name: 'Md Masudur Rahman Nirob',
    sender_email: 'nirob5151@gmail.com',
    sender_id: '22235103467',
    recipient_email: 'kmdnirob72@gmail.com',
    recipient_id: '11111111-1111-4111-a111-787166563441',
    conversation_type: 'roommate_chat'
  };

  const mrKhanUser = {
    id: '11111111-1111-4111-a111-787166563441',
    email: 'kmdnirob72@gmail.com',
    name: 'MR Khan'
  };

  const nirobUser = {
    id: '22235103467',
    email: 'nirob5151@gmail.com',
    name: 'Md Masudur Rahman Nirob'
  };

  const nameForMRKhan = getChatPartnerName(sampleChat, mrKhanUser);
  const nameForNirob = getChatPartnerName(sampleChat, nirobUser);

  console.log('Header Name displayed to MR Khan (Recipient):', nameForMRKhan);
  console.log('Does MR Khan see Nirob as chat partner?', nameForMRKhan === 'Md Masudur Rahman Nirob' ? '✅ YES!' : '❌ NO');

  console.log('\nHeader Name displayed to Nirob (Sender):', nameForNirob);
  console.log('Does Nirob see MR Khan as chat partner?', nameForNirob === 'MR Khan' ? '✅ YES!' : '❌ NO');
}

testHeaderNameResolution();
