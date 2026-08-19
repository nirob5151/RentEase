import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, Info, Image, Home, ChevronRight, MessageSquare, X } from 'lucide-react';
import { dbService } from '../database/supabaseClient';

function Messaging({ chats = [], activeChatId, setActiveChatId, onSendMessage, onMarkAsRead, listings = [], savedPropertyIds = [], userBookedPropertyIds = [], currentUser }) {
  const [typedMessage, setTypedMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPropertySelect, setShowPropertySelect] = useState(false);
  const [dbMessages, setDbMessages] = useState([]);
  const [liveAvatars, setLiveAvatars] = useState({});
  const logRef = useRef(null);

  // 1. Fetch live participant profile pictures from Supabase profiles database
  useEffect(() => {
    async function fetchLiveParticipantAvatars() {
      if (!chats || chats.length === 0) return;
      try {
        const usersList = await dbService.getUsers();
        if (Array.isArray(usersList)) {
          const avatarMap = {};
          usersList.forEach(u => {
            const avatar = u.avatar_url || u.profile_picture || u.avatar;
            if (u.email && avatar) {
              avatarMap[u.email.toLowerCase().trim()] = avatar;
            }
            if (u.name && avatar) {
              avatarMap[u.name.toLowerCase().trim()] = avatar;
            }
          });
          setLiveAvatars(avatarMap);
        }
      } catch (err) {
        console.warn('Error fetching live participant avatars:', err);
      }
    }
    fetchLiveParticipantAvatars();
  }, [chats]);

  // Helper to dynamically resolve live avatar from Supabase profiles database
  const getLiveAvatar = (chat) => {
    if (!chat) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80';
    
    const contactEmail = (
      (chat.landlord_email && chat.landlord_email !== currentUser?.email ? chat.landlord_email : '') ||
      (chat.student_email && chat.student_email !== currentUser?.email ? chat.student_email : '') ||
      (chat.recipient_email && chat.recipient_email !== currentUser?.email ? chat.recipient_email : '') ||
      (chat.sender_email && chat.sender_email !== currentUser?.email ? chat.sender_email : '') ||
      chat.email || ''
    ).toLowerCase().trim();

    const contactName = (chat.name || '').toLowerCase().trim();

    if (contactEmail && liveAvatars[contactEmail]) {
      return liveAvatars[contactEmail];
    }
    if (contactName && liveAvatars[contactName]) {
      return liveAvatars[contactName];
    }

    if (currentUser && ((currentUser.name && currentUser.name.toLowerCase().trim() === contactName) || (currentUser.email && currentUser.email.toLowerCase().trim() === contactEmail))) {
      return currentUser.avatar || currentUser.avatar_url || currentUser.profile_picture;
    }

    return chat.avatar || chat.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80';
  };

  const activeChat = (chats || []).find(c => c.id === activeChatId) || (chats || [])[0];

  useEffect(() => {
    if (activeChat?.id) {
      dbService.getMessages(activeChat.id).then(msgs => {
        if (msgs && msgs.length > 0) setDbMessages(msgs);
      });
    }
  }, [activeChat?.id, chats]);

  const activeMessages = (activeChat?.messages && activeChat.messages.length > 0) ? activeChat.messages : dbMessages;

  // Auto-scroll messages & Mark active chat as read
  useEffect(() => {
    console.log('[Messaging View Loaded]', { chatsCount: chats?.length, activeChatId, activeChatName: activeChat?.name });
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [chats, activeChatId, activeMessages]);

  useEffect(() => {
    if (activeChat?.id && onMarkAsRead && activeChat.unread > 0) {
      onMarkAsRead(activeChat.id);
    }
  }, [activeChat?.id, activeChat?.unread, onMarkAsRead]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;
    const localUrl = URL.createObjectURL(file);
    
    const newMsg = {
      sender: 'sender',
      text: 'Sent an image attachment',
      isAttachment: true,
      title: file.name,
      price: 'Image Upload',
      tag: 'Photo',
      image: localUrl,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (onSendMessage) {
      onSendMessage(activeChat.id, newMsg, '📷 Image Attachment');
    }
  };

  const handleShareProperty = (item) => {
    if (!activeChat) return;
    const newMsg = {
      sender: 'sender',
      text: `Shared listing: ${item.title}`,
      isAttachment: true,
      title: item.title,
      price: `${item.price.toLocaleString()} BDT/mo`,
      tag: item.type,
      image: item.image,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (onSendMessage) {
      onSendMessage(activeChat.id, newMsg, `🏢 Shared: ${item.title}`);
    }
    setShowPropertySelect(false);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeChat) return;

    const newMsg = {
      sender: 'sender',
      text: typedMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (onSendMessage) {
      onSendMessage(activeChat.id, newMsg, typedMessage);
    }
    setTypedMessage('');
  };

  const filteredChats = (chats || []).filter(c => 
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.snippet || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const shareableListings = (listings || []).filter(item => {
    if (currentUser?.role && (currentUser.role.includes('Landlord') || currentUser.role.includes('Admin'))) {
      return true;
    }
    const isSaved = (savedPropertyIds || []).includes(item.id);
    const isBooked = (userBookedPropertyIds || []).includes(item.id);
    return isSaved || isBooked;
  });

  if (!chats || chats.length === 0) {
    return (
      <div className="chat-columns-wrapper" style={{ justifyContent: 'center', alignItems: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '440px', margin: '0 auto', background: 'white', padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
            <MessageSquare size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>No Real Conversations Yet 💬</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Direct message landlords from property listings or connect with university peers from the Roommate Finder to start chatting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-columns-wrapper">
      {/* Inbox List Column */}
      <aside className="chat-inbox-column">
        <div className="chat-inbox-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Messages ({chats.length})</h2>
          <div className="chat-inbox-search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="chat-inbox-list">
          {filteredChats.map(c => (
            <div 
              key={c.id} 
              className={`chat-inbox-item ${activeChat?.id === c.id ? 'active' : ''}`}
              onClick={() => setActiveChatId(c.id)}
            >
              <img src={getLiveAvatar(c)} alt={c.name} className="chat-inbox-avatar" />
              <div className="chat-inbox-details">
                <div className="chat-inbox-title-row">
                  <span className="chat-inbox-name" style={{ fontWeight: '700' }}>
                    {c.name} {c.property_title || c.propertyTitle || c.role ? `— ${c.property_title || c.propertyTitle || c.role}` : ''}
                  </span>
                  <span className="chat-inbox-time">{c.time}</span>
                </div>
                <div className="chat-inbox-preview-row">
                  <span className="chat-inbox-preview">{c.snippet || 'Click to view conversation'}</span>
                  {c.unread > 0 && (
                    <span className="chat-inbox-unread-count">{c.unread}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main chat window column */}
      {activeChat ? (
        <section className="chat-window-column" style={{ position: 'relative' }}>
          {/* Header */}
          <div className="chat-window-header">
            <div className="chat-window-header-user">
              <img src={getLiveAvatar(activeChat)} alt={activeChat.name} className="chat-inbox-avatar" style={{ width: '2.25rem', height: '2.25rem' }} />
              <div className="chat-window-header-details">
                <h3>{activeChat.name}</h3>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>
                    {(activeChat.type === 'roommate_chat' || activeChat.conversation_type === 'roommate_chat' || activeChat.role === 'Student / Roommate')
                      ? 'Student / Roommate Peer'
                      : (currentUser?.role?.includes('Landlord') ? 'Tenant / Student' : 'Landlord / Property Owner')}
                  </span>
                  <span>•</span>
                  <span style={{ color: 'var(--primary)', fontWeight: '700' }}>
                    Regarding: {(activeChat.type === 'roommate_chat' || activeChat.conversation_type === 'roommate_chat' || activeChat.role === 'Student / Roommate')
                      ? 'Roommate Connection'
                      : (activeChat.property_title || activeChat.propertyTitle || activeChat.role || 'Property Listing')}
                  </span>
                </p>
              </div>
            </div>
            <div className="chat-window-header-actions">
              <button className="chat-tool-btn"><Info size={18} /></button>
            </div>
          </div>

          {/* Messages scrollarea */}
          <div className="chat-message-log" ref={logRef}>
            <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-light)', background: 'white', padding: '0.2rem 0.6rem', borderRadius: '50px', border: '1px solid var(--border-light)' }}>
                CONVERSATION HISTORY
              </span>
            </div>

            {(activeMessages || []).map((msg, i) => {
              const currentUserId = (currentUser?.id || '').toString();
              const currentUserEmail = (currentUser?.email || '').toLowerCase().trim();
              const msgSenderId = (msg.senderId || msg.sender_id || '').toString();
              const msgSenderEmail = (msg.senderEmail || msg.sender_email || '').toLowerCase().trim();
              const msgSenderRole = (msg.senderRole || msg.sender_role || '').toLowerCase();
              
              const userRoleLower = (currentUser?.role || '').toLowerCase();
              const isUserLandlord = userRoleLower.includes('landlord');
              const isUserStudent = !userRoleLower.includes('admin') && !isUserLandlord;

              // Determine if this message was sent by the currently logged-in user
              let isMine = false;
              if (currentUserId && msgSenderId) {
                isMine = (currentUserId === msgSenderId);
              } else if (currentUserEmail && msgSenderEmail) {
                isMine = (currentUserEmail === msgSenderEmail);
              } else if (msgSenderRole === 'landlord' && isUserLandlord && !isUserStudent) {
                isMine = true;
              } else if (msg.sender === 'sender' && !msgSenderId && !msgSenderEmail) {
                isMine = true;
              }

              return (
                <div key={msg.id || i} className={`chat-bubble-row ${isMine ? 'sender' : 'receiver'}`}>
                  {!isMine && (
                    <img src={getLiveAvatar(activeChat)} alt="avatar" className="chat-bubble-avatar" />
                  )}
                  <div className="chat-bubble-group">
                    {msg.isAttachment ? (
                      <div className="chat-attachment-card">
                        <img src={msg.image} alt={msg.title} className="chat-attachment-image" />
                        <div className="chat-attachment-info">
                          <span className="chat-attachment-title">{msg.title}</span>
                          <div className="chat-attachment-price-row">
                            <span className="chat-attachment-price">{msg.price}</span>
                            <span className="chat-attachment-tag">{msg.tag}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="chat-text-bubble">
                        <p>{msg.text}</p>
                      </div>
                    )}
                    <span className="chat-bubble-meta">{msg.time}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Property Selector */}
          {showPropertySelect && (
            <div className="glass-panel" style={{ position: 'absolute', bottom: '70px', left: '1.5rem', right: '1.5rem', background: 'white', border: '1px solid var(--border-light)', padding: '1rem', borderRadius: '8px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-dark)' }}>
                  Select Property to Share {currentUser?.role?.includes('Landlord') ? '' : '(Saved & Booked)'}
                </span>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowPropertySelect(false)}>
                  <X size={14} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                {shareableListings.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.25rem 0.5rem', lineHeight: 1.4 }}>
                    <p style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.35rem' }}>No Saved or Booked Properties 🏠</p>
                    <span>Click the heart icon on properties or book viewings from Search Properties to share them here.</span>
                  </div>
                ) : (
                  shareableListings.map(item => {
                    const isSaved = (savedPropertyIds || []).includes(item.id);
                    const isBooked = (userBookedPropertyIds || []).includes(item.id);
                    const tagLabel = isBooked ? 'Booked Property' : (isSaved ? 'Saved Listing' : item.type);

                    return (
                      <div 
                        key={item.id} 
                        style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem', cursor: 'pointer', borderRadius: '6px', background: '#f8fafc', border: '1px solid var(--border-light)', transition: 'background 0.2s' }} 
                        onClick={() => handleShareProperty(item)}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
                      >
                        <img src={item.image} alt={item.title} style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '700', fontSize: '0.8rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.title}</span>
                            <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: isBooked ? '#dbeafe' : '#fef3c7', color: isBooked ? '#1d4ed8' : '#d97706', fontWeight: 700 }}>
                              {tagLabel}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', marginTop: '0.1rem' }}>{item.price?.toLocaleString()} BDT/mo</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Input box */}
          <form className="chat-reply-panel" onSubmit={handleSend}>
            <input 
              type="file" 
              id="chat-image-input" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleImageUpload} 
            />
            <button type="button" className="chat-tool-btn" onClick={() => document.getElementById('chat-image-input').click()}>
              <Image size={20} />
            </button>
            <button type="button" className="chat-tool-btn" onClick={() => setShowPropertySelect(!showPropertySelect)}>
              <Home size={20} />
            </button>
            <div className="chat-reply-input-box">
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
              />
            </div>
            <button type="submit" className="chat-send-btn">
              <Send size={16} />
            </button>
          </form>
        </section>
      ) : (
        <section className="chat-window-column" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Select a conversation from the left menu to view messages.</p>
        </section>
      )}
    </div>
  );
}

export default Messaging;
