function getChatPartnerName(chat, currentUser, liveNames = {}) {
  if (!chat || !currentUser) return chat?.name || 'Contact';

  const currentEmail = (currentUser.email || '').toLowerCase().trim();
  const currentId = (currentUser.id || '').toString();

  const senderEmail = (chat.sender_email || chat.student_email || chat.senderEmail || '').toLowerCase().trim();
  const senderId = (chat.sender_id || chat.student_id || chat.senderId || '').toString();

  const recipientEmail = (chat.recipient_email || chat.landlord_email || chat.recipientEmail || '').toLowerCase().trim();
  const recipientId = (chat.recipient_id || chat.landlord_id || chat.recipientId || '').toString();

  // If logged-in user is recipient, display SENDER's name
  if ((currentEmail && recipientEmail === currentEmail) || (currentId && recipientId === currentId)) {
    if (chat.sender_name || chat.senderName) return chat.sender_name || chat.senderName;
    if (senderEmail && liveNames[senderEmail]) return liveNames[senderEmail];
    if (senderId && liveNames[senderId]) return liveNames[senderId];
    return 'Contact';
  }

  // If logged-in user is sender, display RECIPIENT's name
  if (chat.recipient_name || chat.recipientName) return chat.recipient_name || chat.recipientName;
  if (recipientEmail && liveNames[recipientEmail]) return liveNames[recipientEmail];
  if (recipientId && liveNames[recipientId]) return liveNames[recipientId];

  return chat.name || 'Contact';
}

function testGenericNameResolution() {
  console.log('=== TESTING MULTI-USER DYNAMIC NAME RESOLUTION ===');

  const liveNames = {
    'alice@univ.edu': 'Alice Johnson',
    'bob@univ.edu': 'Bob Smith'
  };

  const sampleChatBetweenAliceAndBob = {
    id: 'chat_alice_bob',
    name: 'Bob Smith',
    sender_id: 'usr_alice_101',
    sender_email: 'alice@univ.edu',
    recipient_id: 'usr_bob_202',
    recipient_email: 'bob@univ.edu',
    conversation_type: 'roommate_chat'
  };

  const aliceUser = { id: 'usr_alice_101', email: 'alice@univ.edu', name: 'Alice Johnson' };
  const bobUser = { id: 'usr_bob_202', email: 'bob@univ.edu', name: 'Bob Smith' };

  const nameForBob = getChatPartnerName(sampleChatBetweenAliceAndBob, bobUser, liveNames);
  const nameForAlice = getChatPartnerName(sampleChatBetweenAliceAndBob, aliceUser, liveNames);

  console.log('Name displayed to Bob (Recipient):', nameForBob);
  console.log('Is Bob seeing Alice Johnson?', nameForBob === 'Alice Johnson' ? '✅ YES!' : '❌ NO');

  console.log('Name displayed to Alice (Sender):', nameForAlice);
  console.log('Is Alice seeing Bob Smith?', nameForAlice === 'Bob Smith' ? '✅ YES!' : '❌ NO');

  // Test missing sender name fallback
  const chatWithMissingName = {
    id: 'chat_unknown',
    sender_email: 'ghost@univ.edu',
    recipient_email: 'bob@univ.edu'
  };
  const fallbackResult = getChatPartnerName(chatWithMissingName, bobUser, {});
  console.log('\nName for conversation with missing/unknown sender:', fallbackResult);
  console.log('Is fallback generic ("Contact") with NO hardcoded names?', fallbackResult === 'Contact' ? '✅ YES!' : '❌ NO');
}

testGenericNameResolution();
