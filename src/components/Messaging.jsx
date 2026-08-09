import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, Info, Image, Home, ChevronRight, MessageSquare, X } from 'lucide-react';

function Messaging({ chats, activeChatId, setActiveChatId, onSendMessage, listings = [] }) {
  const [typedMessage, setTypedMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const logRef = useRef(null);

  // Auto-scroll messages
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [chats, activeChatId]);

  // Seed chats matching Screenshot 3 exactly
  const mockInbox = [
    {
      id: 'chat_anas',
      name: 'Anas',
      role: 'Online • Property Manager',
      time: '10:42 AM',
      unread: 1,
      snippet: 'Can we schedule a viewing for ...',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
      messages: [
        { sender: 'receiver', text: "Hello Anas! I saw your inquiry regarding the 2BR suite on Maple Avenue. It's still available for the spring semester.", time: '10:30 AM' },
        { sender: 'sender', text: "That's great! My roommate and I are really interested. Is the high-speed wifi included in the listed rent?", time: '10:35 AM' },
        { sender: 'receiver', text: "Yes, all utilities including fiber internet are bundled. Here is the official listing with the full breakdown of amenities:", time: '10:40 AM' },
        {
          sender: 'receiver',
          isAttachment: true,
          title: 'Maple Avenue Executive Suite',
          price: '$1,200/mo',
          tag: 'Fiber Incl.',
          image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
          time: '10:40 AM'
        },
        { sender: 'receiver', text: "Can we schedule a viewing for Tuesday?", time: '10:42 AM' }
      ]
    },
    {
      id: 'chat_nirob',
      name: 'Nirob',
      role: 'Student',
      time: 'Yesterday',
      unread: 0,
      snippet: 'That roommate agreement looks per...',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
      messages: [
        { sender: 'receiver', text: "Hey! I reviewed the contract.", time: 'Yesterday' },
        { sender: 'sender', text: "Great, let me know if we need changes.", time: 'Yesterday' },
        { sender: 'receiver', text: "That roommate agreement looks perfect as is. Let's sign it!", time: 'Yesterday' }
      ]
    },
    {
      id: 'chat_sumon',
      name: 'Sumon',
      role: 'Marketing Student',
      time: '2 days ago',
      unread: 0,
      snippet: 'Welcome to the neighborhood!',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&h=120&q=80',
      messages: [
        { sender: 'receiver', text: "Hey! I'm moving into Mirpur 10.", time: '2 days ago' },
        { sender: 'sender', text: "Nice! BUBT is very near.", time: '2 days ago' },
        { sender: 'receiver', text: "Welcome to the neighborhood!", time: '2 days ago' }
      ]
    },
    {
      id: 'chat_mehadi',
      name: 'Mehadi',
      role: 'Landlord',
      time: 'Last week',
      unread: 0,
      snippet: 'I sent the deposit receipt. Check it ou...',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&h=120&q=80',
      messages: [
        { sender: 'receiver', text: "Received the security deposit.", time: 'Last week' },
        { sender: 'receiver', text: "I sent the deposit receipt. Check it out and let me know.", time: 'Last week' }
      ]
    }
  ];

  // Merge runtime state chats with mockup inbox
  const [inboxChats, setInboxChats] = useState(mockInbox);
  const activeChat = inboxChats.find(c => c.id === activeChatId) || inboxChats[0];

  const [showPropertySelect, setShowPropertySelect] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
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

    setInboxChats(prev => prev.map(c => {
      if (c.id === activeChat.id) {
        return {
          ...c,
          snippet: '📷 Image Attachment',
          time: newMsg.time,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));
  };

  const handleShareProperty = (item) => {
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

    setInboxChats(prev => prev.map(c => {
      if (c.id === activeChat.id) {
        return {
          ...c,
          snippet: `🏢 Shared: ${item.title}`,
          time: newMsg.time,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));
    setShowPropertySelect(false);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const newMsg = {
      sender: 'sender',
      text: typedMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setInboxChats(prev => prev.map(c => {
      if (c.id === activeChat.id) {
        return {
          ...c,
          lastMessage: typedMessage,
          snippet: typedMessage,
          time: newMsg.time,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));

    setTypedMessage('');

    // Trigger bot reply
    setTimeout(() => {
      let replyText = 'Thanks for your inquiry. I will get back to you shortly!';
      if (activeChat.name === 'Anas') {
        replyText = 'Tuesday works perfectly! Does 3 PM work for you?';
      } else if (activeChat.name === 'Nirob') {
        replyText = 'Great, I will print the document now.';
      }
      
      const botMsg = {
        sender: 'receiver',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setInboxChats(prev => prev.map(c => {
        if (c.id === activeChat.id) {
          return {
            ...c,
            lastMessage: replyText,
            snippet: replyText,
            time: botMsg.time,
            messages: [...c.messages, botMsg]
          };
        }
        return c;
      }));
    }, 1500);
  };

  return (
    <div className="chat-columns-wrapper">
      {/* Inbox List Column */}
      <aside className="chat-inbox-column">
        <div className="chat-inbox-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Messages</h2>
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
          {inboxChats
            .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.snippet.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(c => (
              <div 
                key={c.id} 
                className={`chat-inbox-item ${activeChat.id === c.id ? 'active' : ''}`}
                onClick={() => setActiveChatId(c.id)}
              >
                <img src={c.avatar} alt={c.name} className="chat-inbox-avatar" />
                <div className="chat-inbox-details">
                  <div className="chat-inbox-title-row">
                    <span className="chat-inbox-name">{c.name}</span>
                    <span className="chat-inbox-time">{c.time}</span>
                  </div>
                  <div className="chat-inbox-preview-row">
                    <span className="chat-inbox-preview">{c.snippet}</span>
                    {c.unread > 0 && (
                      <span className="chat-inbox-unread-count">{c.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </aside>

      {/* Main chat window column */}
      <section className="chat-window-column" style={{ position: 'relative' }}>
        {/* Header */}
        <div className="chat-window-header">
          <div className="chat-window-header-user">
            <img src={activeChat.avatar} alt={activeChat.name} className="chat-inbox-avatar" style={{ width: '2.25rem', height: '2.25rem' }} />
            <div className="chat-window-header-details">
              <h3>{activeChat.name}</h3>
              <p>{activeChat.role}</p>
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
              MONDAY, OCT 21
            </span>
          </div>

          {activeChat.messages.map((msg, i) => (
            <div key={i} className={`chat-bubble-row ${msg.sender === 'sender' ? 'sender' : 'receiver'}`}>
              {msg.sender === 'receiver' && (
                <img src={activeChat.avatar} alt="avatar" className="chat-bubble-avatar" />
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
          ))}
        </div>

        {/* Floating Property Selector */}
        {showPropertySelect && (
          <div className="glass-panel" style={{ position: 'absolute', bottom: '70px', left: '1.5rem', right: '1.5rem', background: 'white', border: '1px solid var(--border-light)', padding: '1rem', borderRadius: '8px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>Select Property to Share</span>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowPropertySelect(false)}>
                <X size={14} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
              {listings.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No properties listed.</div>
              ) : (
                listings.map(item => (
                  <div 
                    key={item.id} 
                    style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem', cursor: 'pointer', borderRadius: '6px', background: '#f8fafc', border: '1px solid var(--border-light)', transition: 'background 0.2s' }} 
                    onClick={() => handleShareProperty(item)}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
                  >
                    <img src={item.image} alt={item.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '700', fontSize: '0.8rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700' }}>{item.price.toLocaleString()} BDT/mo</div>
                    </div>
                  </div>
                ))
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
    </div>
  );
}

export default Messaging;
