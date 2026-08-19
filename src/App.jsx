import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import Listings from './components/Listings';
import RoommateMatching from './components/RoommateMatching';
import Messaging from './components/Messaging';
import StudentDashboard from './components/StudentDashboard';
import ContractBuilder from './components/ContractBuilder';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import SettingsPage from './components/SettingsPage';
import AdminPanel from './components/AdminPanel';
import CustomerCareWidget from './components/CustomerCareWidget';
import { DEFAULT_LISTINGS, DEFAULT_CHATS } from './database/mockDb';
import { dbService, isConfigured } from './database/supabaseClient';
import DatabaseViewer from './components/DatabaseViewer';
import ErrorBoundary from './components/ErrorBoundary';
import { getAvatarUrl } from './utils/profileCompleteness';
import { Home as HomeIcon, Search, Users, MessageSquare, FileText, Bell, LogOut, HelpCircle, Heart, Star, Settings, Plus, Calendar, CreditCard, BarChart3, ShieldCheck, AlertCircle, Lock, Database as DatabaseIcon, CheckCircle2, Mail, Phone } from 'lucide-react';


function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [listings, setListings] = useState(() => {
    const saved = localStorage.getItem('rentease_listings');
    return saved ? JSON.parse(saved) : DEFAULT_LISTINGS;
  });
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('rentease_chats');
    return saved ? JSON.parse(saved) : DEFAULT_CHATS;
  });
  const [activeChatId, setActiveChatId] = useState('chat_anas');
  const [selectedListing, setSelectedListing] = useState(null);
  const [authMode, setAuthMode] = useState('signup');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDbViewer, setShowDbViewer] = useState(false);
  const [dbStatusMsg, setDbStatusMsg] = useState('');

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('rentease_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Shared payments state for Student & Landlord portal synchronization
  const [sharedPayments, setSharedPayments] = useState(() => {
    const saved = localStorage.getItem('rentease_shared_payments');
    return saved ? JSON.parse(saved) : [];
  });

  // Saved properties state for students
  const [savedPropertyIds, setSavedPropertyIds] = useState(() => {
    const saved = localStorage.getItem('rentease_saved_properties');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(id => id !== 'prop_1' && id !== 'prop_2' && id !== 'prop_3') : [];
    } catch {
      return [];
    }
  });

  // Booked properties state for students
  const [userBookedPropertyIds, setUserBookedPropertyIds] = useState(() => {
    const saved = localStorage.getItem('rentease_booked_properties');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(id => id !== 'prop_1' && id !== 'prop_2' && id !== 'prop_3') : [];
    } catch {
      return [];
    }
  });

  const toggleSaveProperty = (propertyId) => {
    setSavedPropertyIds(prev => {
      const isSaved = prev.includes(propertyId);
      const updated = isSaved ? prev.filter(id => id !== propertyId) : [...prev, propertyId];
      localStorage.setItem('rentease_saved_properties', JSON.stringify(updated));
      return updated;
    });
  };

  const recordPropertyBooking = (propertyId) => {
    if (!propertyId) return;
    setUserBookedPropertyIds(prev => {
      if (prev.includes(propertyId)) return prev;
      const updated = [...prev, propertyId];
      localStorage.setItem('rentease_booked_properties', JSON.stringify(updated));
      return updated;
    });
  };

  // Dynamic reviews state
  const [reviews, setReviews] = useState([]);

  // Initial load from Database Service
  useEffect(() => {
    dbService.getListings().then(data => {
      if (data && data.length > 0) setListings(data);
    });
    dbService.getListings().then(fetchedListings => {
      if (Array.isArray(fetchedListings) && fetchedListings.length > 0) {
        setListings(fetchedListings);
        localStorage.setItem('rentease_listings', JSON.stringify(fetchedListings));
      }
    });
    dbService.getReviews().then(data => {
      if (Array.isArray(data)) setReviews(data);
    });
    dbService.getPayments().then(data => {
      if (data && data.length > 0) setSharedPayments(data);
    });
    dbService.getChats().then(data => {
      if (data && data.length > 0) setChats(data);
    });
    dbService.getNotifications().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setNotifications(data.map(n => ({
          id: n.id || 'notif_' + Math.random(),
          title: n.title || 'Notification',
          desc: n.message || n.desc || '',
          category: n.category || 'General',
          time: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
          read: Boolean(n.is_read)
        })));
      }
    });

    const unsubscribeNotifs = dbService.subscribeToNotifications((newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
    });

    if (isConfigured) {
      setDbStatusMsg('⚡ Supabase Cloud Database Connected');
    } else {
      setDbStatusMsg('⚡ Database Ready (Persistent Local + Cloud Engine)');
    }

    return () => {
      if (unsubscribeNotifs) unsubscribeNotifs();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('rentease_shared_payments', JSON.stringify(sharedPayments));
  }, [sharedPayments]);

  const addSharedPayment = async (newPayment) => {
    const updated = await dbService.addPayment(newPayment);
    setSharedPayments(updated);
  };

  const approveSharedPayment = async (payId) => {
    const updated = await dbService.approvePayment(payId);
    setSharedPayments(updated);
  };
  
  // Dynamic user session state
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('rentease_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    try {
      localStorage.setItem('rentease_listings', JSON.stringify(listings));
    } catch (e) {
      console.warn('localStorage setItem listings error:', e);
    }
  }, [listings]);

  useEffect(() => {
    try {
      localStorage.setItem('rentease_chats', JSON.stringify(chats));
    } catch (e) {
      console.warn('localStorage setItem chats error:', e);
    }
  }, [chats]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('rentease_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('rentease_user');
      }
    } catch (e) {
      console.warn('localStorage setItem user error:', e);
    }
  }, [currentUser]);

  // Auth Redirect Guard
  useEffect(() => {
    if (!currentUser && [
      'dashboard', 'messages', 'contract', 'saved', 'settings',
      'student_bookings', 'student_payments', 'student_reviews', 'student_notifications', 'student_profile', 'help',
      'landlord_properties', 'landlord_add_property', 'landlord_bookings',
      'landlord_tenants', 'landlord_contracts', 'landlord_payments',
      'landlord_reviews', 'landlord_analytics', 'landlord_notifications',
      'landlord_profile',
      'admin_users', 'admin_properties', 'admin_verification', 'admin_bookings', 
      'admin_contracts', 'admin_payments', 'admin_reviews', 'admin_reports', 
      'admin_analytics', 'admin_notifications', 'admin_content', 'admin_settings', 
      'admin_security', 'admin_audit', 'admin_backup', 'admin_profile'
    ].includes(currentPage)) {
      setAuthMode('signin');
      setCurrentPage('auth');
    }
  }, [currentPage, currentUser]);
  // Reset scroll position of portal content pane on page change
  useEffect(() => {
    const pane = document.querySelector('.portal-content-pane');
    if (pane) {
      pane.scrollTop = 0;
    }
  }, [currentPage]);


  const addListing = async (newListing) => {
    const formatted = {
      ...newListing,
      id: listings.length + 1,
      verified: true,
      image: newListing.image || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
      landlord: {
        name: currentUser?.name || 'Mehadi Hasan',
        rating: 5.0,
        phone: currentUser?.phone || '+880 1712-345678'
      },
      reviews: []
    };
    const updated = await dbService.saveListing(formatted);
    setListings(updated);
  };

  const editListing = (updatedListing) => {
    setListings(prev => prev.map(item => item.id === updatedListing.id ? updatedListing : item));
  };

  const deleteListing = (id) => {
    setListings(prev => prev.filter(item => item.id !== id));
  };

  const addReview = async (listingId, review) => {
    const fullReview = {
      id: 'rev_' + Date.now(),
      listingId: listingId,
      listing_id: listingId,
      propertyId: listingId,
      property_id: listingId,
      target: review.target || 'Property',
      rating: Number(review.rating) || 5,
      comment: review.comment || '',
      author: review.author || 'Student',
      date: review.date || new Date().toISOString().split('T')[0]
    };

    const updatedGlobalReviews = await dbService.saveReview(fullReview);
    setReviews(updatedGlobalReviews);

    setListings(prev => prev.map(item => {
      if (item.id === listingId) {
        const itemReviews = Array.isArray(item.reviews) ? item.reviews : [];
        return {
          ...item,
          reviews: [fullReview, ...itemReviews]
        };
      }
      return item;
    }));
  };

  const startChat = (contactName, initialMsgText = '', contactRole = 'Student / Roommate', avatarUrl = null, targetEmail = '', targetId = '', propertyObj = null) => {
    const cleanName = contactName || 'Contact';
    
    // Support property-scoped conversation threads
    const propId = propertyObj?.id || propertyObj?.propertyId || propertyObj?.property_id || '';
    const propTitle = propertyObj?.title || propertyObj?.propertyTitle || propertyObj?.property_title || (contactRole !== 'Student / Roommate' ? contactRole : '');
    const propSlug = propId ? (`_prop_${propId}`) : (propTitle ? ('_prop_' + String(propTitle).toLowerCase().replace(/[^a-z0-9]/g, '_')) : '');

    const chatId = 'chat_' + String(cleanName).toLowerCase().replace(/[^a-z0-9]/g, '_') + propSlug;
    const existingIndex = chats.findIndex(c => c.id === chatId || (c.name && c.name.toLowerCase() === cleanName.toLowerCase() && String(c.property_id || c.propertyId || '') === String(propId)));

    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const initialMsgObj = initialMsgText ? {
      id: 'msg_' + Date.now(),
      conversationId: chatId,
      senderId: currentUser?.id || 'usr_1',
      senderEmail: currentUser?.email || '',
      senderName: currentUser?.name || 'User',
      senderRole: isStudentUser ? 'student' : (isLandlordUser ? 'landlord' : 'admin'),
      sender: 'sender',
      text: initialMsgText,
      time: formattedTime
    } : null;

    const currentEmailVal = (currentUser?.email || '').toLowerCase().trim();
    const currentUserIdVal = (currentUser?.id || '').toString();

    // Look up target recipient user profile dynamically from local storage or cloud
    const storedUsers = JSON.parse(localStorage.getItem('rentease_users') || '[]');
    const targetUserMatch = storedUsers.find(u => 
      (u.name && u.name.toLowerCase().trim() === cleanName.toLowerCase().trim()) ||
      (u.email && targetEmail && u.email.toLowerCase().trim() === targetEmail.toLowerCase().trim())
    );

    const resolvedTargetEmail = (targetEmail && targetEmail !== currentEmailVal) 
      ? targetEmail 
      : (targetUserMatch?.email || targetEmail || '');

    const resolvedTargetId = (targetId && targetId !== currentUserIdVal) 
      ? targetId 
      : (targetUserMatch?.id || targetId || '');

    const resolvedTargetAvatar = targetUserMatch?.avatar || targetUserMatch?.profile_picture || avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80';

    const convType = contactRole === 'Student / Roommate' ? 'roommate_chat' : 'landlord_inquiry';
    let updatedChats = [...chats];

    if (existingIndex >= 0) {
      const target = updatedChats[existingIndex];
      const newMessages = initialMsgObj ? [...(target.messages || []), initialMsgObj] : (target.messages || []);
      updatedChats[existingIndex] = {
        ...target,
        type: convType,
        conversation_type: convType,
        sender_email: currentEmailVal,
        sender_id: currentUserIdVal,
        sender_name: currentUser?.name || target.sender_name || 'User',
        recipient_name: cleanName || target.recipient_name || 'Contact',
        recipient_email: resolvedTargetEmail || target.recipient_email || target.landlord_email || '',
        recipient_id: resolvedTargetId || target.recipient_id || target.landlord_id || '',
        landlord_email: isStudentUser ? (resolvedTargetEmail || target.landlord_email || currentEmailVal) : (isLandlordUser ? currentEmailVal : (resolvedTargetEmail || currentEmailVal)),
        landlord_id: isStudentUser ? (resolvedTargetId || target.landlord_id || currentUserIdVal) : (isLandlordUser ? currentUserIdVal : (resolvedTargetId || currentUserIdVal)),
        student_email: isStudentUser ? currentEmailVal : (resolvedTargetEmail || currentEmailVal),
        student_id: isStudentUser ? currentUserIdVal : (resolvedTargetId || currentUserIdVal),
        property_id: propId || target.property_id || target.propertyId || '',
        property_title: propTitle || target.property_title || target.propertyTitle || (convType === 'roommate_chat' ? 'Roommate Connection' : 'Rental Inquiry'),
        role: contactRole || target.role || (convType === 'roommate_chat' ? 'Student / Roommate' : 'Rental Inquiry'),
        avatar: resolvedTargetAvatar || target.avatar,
        snippet: initialMsgText || target.snippet || 'Conversation started',
        time: formattedTime,
        messages: newMessages
      };
      dbService.saveChat(updatedChats[existingIndex]);
    } else {
      const newChat = {
        id: chatId,
        name: cleanName,
        type: convType,
        conversation_type: convType,
        sender_email: currentEmailVal,
        sender_id: currentUserIdVal,
        sender_name: currentUser?.name || 'User',
        recipient_name: cleanName,
        recipient_email: resolvedTargetEmail,
        recipient_id: resolvedTargetId,
        landlord_email: isStudentUser ? (resolvedTargetEmail || currentEmailVal) : (isLandlordUser ? currentEmailVal : (resolvedTargetEmail || currentEmailVal)),
        landlord_id: isStudentUser ? (resolvedTargetId || currentUserIdVal) : (isLandlordUser ? currentUserIdVal : (resolvedTargetId || currentUserIdVal)),
        student_email: isStudentUser ? currentEmailVal : (resolvedTargetEmail || currentEmailVal),
        student_id: isStudentUser ? currentUserIdVal : (resolvedTargetId || currentUserIdVal),
        property_id: propId,
        property_title: propTitle || (convType === 'roommate_chat' ? 'Roommate Connection' : 'Rental Inquiry'),
        role: contactRole || (convType === 'roommate_chat' ? 'Student / Roommate' : 'Rental Inquiry'),
        time: formattedTime,
        unread: 0,
        snippet: initialMsgText || 'Conversation started',
        avatar: resolvedTargetAvatar,
        messages: initialMsgObj ? [initialMsgObj] : []
      };
      updatedChats = [newChat, ...chats];
      dbService.saveChat(newChat);
    }

    if (initialMsgObj) {
      dbService.saveMessage(initialMsgObj);
    }

    setChats(updatedChats);
    setActiveChatId(chatId);
    setCurrentPage('messages');
  };

  const sendChatMessage = async (chatId, newMsg, updatedSnippet) => {
    const isStudentSender = isStudentUser;
    const msgText = updatedSnippet || newMsg.text || 'Message attachment';

    const fullMsg = {
      id: 'msg_' + Date.now(),
      conversationId: chatId,
      senderId: currentUser?.id || 'usr_1',
      senderEmail: currentUser?.email || '',
      senderName: currentUser?.name || 'User',
      senderRole: isStudentSender ? 'student' : (isLandlordUser ? 'landlord' : 'admin'),
      text: msgText,
      isRead: false,
      time: newMsg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    await dbService.saveMessage(fullMsg);

    const updatedChats = chats.map(c => {
      if (c.id === chatId) {
        const isCurrentlyOpen = currentPage === 'messages' && activeChatId === chatId;
        const newUnread = (!isCurrentlyOpen && isStudentSender) ? (Number(c.unread || 0) + 1) : c.unread;
        
        const updated = {
          ...c,
          snippet: msgText,
          time: fullMsg.time,
          unread: newUnread,
          messages: [...(c.messages || []), fullMsg]
        };
        dbService.saveChat(updated);

        // Trigger in-app notification for recipient if not actively viewing
        if (isStudentSender && !isCurrentlyOpen) {
          const newNotif = {
            id: 'notif_msg_' + Date.now(),
            type: 'message',
            title: `New Message from ${currentUser?.name || 'Student'} 💬`,
            message: msgText,
            user_email: c.landlord_email || '',
            time: 'Just now',
            unread: true,
            read: false
          };
          dbService.addNotification(newNotif);
          setNotifications(prev => [newNotif, ...prev]);
        }

        return updated;
      }
      return c;
    });
    setChats(updatedChats);
  };

  const markChatAsRead = (chatId) => {
    if (!chatId) return;
    setChats(prev => prev.map(c => {
      if (c.id === chatId && (c.unread || 0) > 0) {
        const updated = { ...c, unread: 0 };
        dbService.saveChat(updated);
        return updated;
      }
      return c;
    }));
  };

  const unreadChatsCount = (chats || []).reduce((acc, c) => acc + (Number(c.unread) || 0), 0);

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('home');
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    if (user?.role?.includes('Admin') || user?.role?.includes('Staff')) {
      setCurrentPage('admin_properties');
    } else {
      setCurrentPage('dashboard');
    }
  };

  const handleSaveSettings = async (updatedDetails) => {
    const mergedUser = {
      ...currentUser,
      ...updatedDetails
    };
    setCurrentUser(mergedUser);

    if (mergedUser?.email) {
      await dbService.saveUser(mergedUser);
    }
  };

  const userRoleLower = (currentUser?.role || '').toLowerCase();
  const isAdminUser = Boolean(currentUser && (userRoleLower.includes('admin') || userRoleLower.includes('staff') || userRoleLower.includes('root')));
  const isLandlordUser = Boolean(currentUser && userRoleLower.includes('landlord'));
  const isStudentUser = Boolean(currentUser && !isAdminUser && !isLandlordUser);

  const currentEmail = (currentUser?.email || '').toLowerCase().trim();
  const currentUserId = (currentUser?.id || '').toString();

  // Strict User-Scoped Conversation Filtering to prevent data leaks between landlords and students
  const userChats = (chats || []).filter(c => {
    if (!c || !currentUser) return false;
    if (isAdminUser) return true;

    const lEmail = (c.landlord_email || c.landlordEmail || '').toLowerCase().trim();
    const lId = (c.landlord_id || c.landlordId || '').toString();
    const sEmail = (c.student_email || c.studentEmail || '').toLowerCase().trim();
    const sId = (c.student_id || c.studentId || '').toString();

    const rEmail = (c.recipient_email || c.recipientEmail || '').toLowerCase().trim();
    const rId = (c.recipient_id || c.recipientId || '').toString();

    if (isLandlordUser) {
      if (c.conversation_type === 'roommate_chat' || c.type === 'roommate_chat') return false;
      if (currentEmail && (lEmail === currentEmail || rEmail === currentEmail)) return true;
      if (currentUserId && (lId === currentUserId || rId === currentUserId)) return true;
      return false;
    }

    if (isStudentUser) {
      if (currentEmail && (sEmail === currentEmail || lEmail === currentEmail || rEmail === currentEmail)) return true;
      if (currentUserId && (sId === currentUserId || lId === currentUserId || rId === currentUserId)) return true;
      return false;
    }

    return false;
  });

  const isPortalPage = Boolean(currentUser) && [
    'dashboard', 'saved', 'student_bookings', 'student_payments',
    'student_reviews', 'student_notifications', 'student_profile', 'help',
    'landlord_properties', 'landlord_add_property', 'landlord_bookings',
    'landlord_tenants', 'landlord_contracts', 'landlord_payments',
    'landlord_reviews', 'landlord_analytics', 'landlord_notifications',
    'landlord_profile', 'landlord_nid', 'profile', 'settings',
    'admin_users', 'admin_properties', 'admin_verification', 'admin_bookings', 
    'admin_contracts', 'admin_payments', 'admin_reviews', 'admin_reports', 
    'admin_analytics', 'admin_notifications', 'admin_content', 'admin_settings', 
    'admin_security', 'admin_audit', 'admin_backup', 'admin_profile',
    'messages', 'contract'
  ].includes(currentPage);

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="navbar">
        <a href="#" className="nav-brand" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }}>
          <div className="nav-logo-text">RentEase</div>
        </a>
        {(!currentUser || !isAdminUser) && (
          <nav>
            <ul className="nav-links">
              <li>
                <span className={`nav-link ${currentPage === 'listings' ? 'active' : ''}`} onClick={() => { setSelectedListing(null); setCurrentPage('listings'); }}>
                  Search
                </span>
              </li>
              {(!currentUser || !isLandlordUser) && (
                <li>
                  <span className={`nav-link ${currentPage === 'roommate' ? 'active' : ''}`} onClick={() => setCurrentPage('roommate')}>
                    Roommates
                  </span>
                </li>
              )}
            </ul>
          </nav>
        )}
        
        <div className="nav-right-actions">
          {currentUser && isAdminUser && (
            <button 
              className="nav-icon-btn" 
              onClick={() => setShowDbViewer(true)}
              title="Inspect Database Tables & SQL Schema"
              style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid var(--border-light)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
            >
              <DatabaseIcon size={16} />
              <span>Database</span>
            </button>
          )}

          {currentUser ? (
            <>
              <div style={{ position: 'relative' }}>
                <button 
                  className="nav-icon-btn" 
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{ position: 'relative' }}
                  title="Notifications"
                >
                  <Bell size={20} />
                  {notifications.some(n => n.unread) && (
                    <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '10px', height: '10px', background: 'var(--danger)', borderRadius: '50%', border: '2px solid white' }}></span>
                  )}
                </button>

                {showNotifications && (
                  <div style={{ position: 'absolute', top: '42px', right: 0, width: '320px', background: 'white', border: '1px solid var(--border-light)', borderRadius: '12px', boxShadow: 'var(--shadow-md)', zIndex: 10000, overflow: 'hidden', animation: 'fadeSlideIn 0.2s ease' }}>
                    <div style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>Activity Notifications</span>
                      <span 
                        style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}
                        onClick={() => {
                          setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                        }}
                      >
                        Mark all as read
                      </span>
                    </div>

                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {notifications.map(n => (
                        <div key={n.id} style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-light)', background: n.unread ? '#eff6ff' : 'white', cursor: 'pointer' }} onClick={() => {
                          setShowNotifications(false);
                          if (currentUser?.role?.includes('Student')) setCurrentPage('student_notifications');
                          else if (currentUser?.role?.includes('Landlord')) setCurrentPage('landlord_notifications');
                          else if (currentUser?.role?.includes('Admin')) setCurrentPage('admin_notifications');
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{n.title}</strong>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.time}</span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: '1.3' }}>{n.message}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: '0.6rem', textAlign: 'center', background: '#f8fafc', borderTop: '1px solid var(--border-light)' }}>
                      <button 
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
                        onClick={() => {
                          setShowNotifications(false);
                          if (isStudentUser) setCurrentPage('student_notifications');
                          else if (isLandlordUser) setCurrentPage('landlord_notifications');
                          else if (isAdminUser) setCurrentPage('admin_notifications');
                        }}
                      >
                        View All Activity Notifications &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button className="nav-icon-btn" onClick={() => setCurrentPage('messages')} style={{ position: 'relative' }}>
                <MessageSquare size={20} />
                {unreadChatsCount > 0 && (
                  <span className="chat-inbox-unread-count" style={{ position: 'absolute', top: '-6px', right: '-6px', fontSize: '0.65rem', minWidth: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                    {unreadChatsCount}
                  </span>
                )}
              </button>
              <img 
                src={getAvatarUrl(currentUser)} 
                alt="User Avatar" 
                className="nav-avatar-icon" 
                onClick={() => {
                  setCurrentPage('dashboard');
                }}
                title="Go to My Dashboard"
                style={{ cursor: 'pointer' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getAvatarUrl(currentUser);
                }}
              />
            </>
          ) : (
            <>
              <span className="nav-signin" onClick={() => { setAuthMode('signin'); setCurrentPage('auth'); }}>Sign In</span>
              <button className="nav-post-btn" onClick={() => { setAuthMode('signup'); setCurrentPage('auth'); }}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>


      {/* Main Content Area */}
      {isPortalPage ? (
        /* Sidebar Portal Layout */
        <div className="student-portal-layout">
          <aside className="portal-sidebar">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
              <div className="sidebar-profile">
                <img 
                  src={getAvatarUrl(currentUser)} 
                  alt="User Avatar" 
                  className="sidebar-avatar" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getAvatarUrl(currentUser);
                  }}
                />
                <div className="sidebar-user-info">
                  <div className="sidebar-user-name" style={{ fontSize: isAdminUser ? '0.85rem' : '1rem' }}>
                    {isAdminUser ? currentUser.name : (currentUser.name || 'User').split(' ').pop()}
                  </div>
                  <div className="sidebar-user-role">{currentUser.role}</div>
                </div>
              </div>

              {isStudentUser && (
                <button className="sidebar-cta-btn" onClick={() => setCurrentPage('roommate')}>
                  <Users size={16} /> <span className="sidebar-btn-text">+ Find a Roommate</span>
                </button>
              )}

              <ul className="sidebar-menu" style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', paddingRight: '4px' }}>
                {isAdminUser ? (
                  <>
                    <li className={`sidebar-item ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentPage('dashboard')}>
                      <HomeIcon size={18} /> <span className="sidebar-menu-label">Dashboard</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'admin_users' ? 'active' : ''}`} onClick={() => setCurrentPage('admin_users')}>
                      <Users size={18} /> <span className="sidebar-menu-label">User Management</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'admin_properties' ? 'active' : ''}`} onClick={() => setCurrentPage('admin_properties')}>
                      <HomeIcon size={18} /> <span className="sidebar-menu-label">Property Listings</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'admin_verification' ? 'active' : ''}`} onClick={() => setCurrentPage('admin_verification')}>
                      <ShieldCheck size={18} /> <span className="sidebar-menu-label">Property Verification</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'admin_bookings' ? 'active' : ''}`} onClick={() => setCurrentPage('admin_bookings')}>
                      <Calendar size={18} /> <span className="sidebar-menu-label">Bookings</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'admin_contracts' ? 'active' : ''}`} onClick={() => setCurrentPage('admin_contracts')}>
                      <FileText size={18} /> <span className="sidebar-menu-label">Rental Contracts</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'admin_payments' ? 'active' : ''}`} onClick={() => setCurrentPage('admin_payments')}>
                      <CreditCard size={18} /> <span className="sidebar-menu-label">Payments</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'admin_reviews' ? 'active' : ''}`} onClick={() => setCurrentPage('admin_reviews')}>
                      <Star size={18} /> <span className="sidebar-menu-label">Reviews</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'admin_reports' ? 'active' : ''}`} onClick={() => setCurrentPage('admin_reports')}>
                      <AlertCircle size={18} /> <span className="sidebar-menu-label">Reports & Complaints</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'admin_analytics' ? 'active' : ''}`} onClick={() => setCurrentPage('admin_analytics')}>
                      <BarChart3 size={18} /> <span className="sidebar-menu-label">Analytics</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'admin_notifications' ? 'active' : ''}`} onClick={() => setCurrentPage('admin_notifications')}>
                      <Bell size={18} /> <span className="sidebar-menu-label">Notifications</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'admin_content' ? 'active' : ''}`} onClick={() => setCurrentPage('admin_content')}>
                      <FileText size={18} /> <span className="sidebar-menu-label">Content Management</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'admin_settings' ? 'active' : ''}`} onClick={() => setCurrentPage('admin_settings')}>
                      <Settings size={18} /> <span className="sidebar-menu-label">System Settings</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'admin_security' ? 'active' : ''}`} onClick={() => setCurrentPage('admin_security')}>
                      <Lock size={18} /> <span className="sidebar-menu-label">Security</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'admin_audit' ? 'active' : ''}`} onClick={() => setCurrentPage('admin_audit')}>
                      <FileText size={18} /> <span className="sidebar-menu-label">Audit Logs</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'admin_backup' ? 'active' : ''}`} onClick={() => setCurrentPage('admin_backup')}>
                      <DatabaseIcon size={18} /> <span className="sidebar-menu-label">Backup & Recovery</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'admin_profile' ? 'active' : ''}`} onClick={() => setCurrentPage('admin_profile')}>
                      <Users size={18} /> <span className="sidebar-menu-label">My Profile</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'help' ? 'active' : ''}`} onClick={() => setCurrentPage('help')}>
                      <HelpCircle size={18} /> <span className="sidebar-menu-label">Help Center</span>
                    </li>
                  </>
                ) : isLandlordUser ? (
                  <>
                    <li className={`sidebar-item ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentPage('dashboard')}>
                      <HomeIcon size={18} /> <span className="sidebar-menu-label">Dashboard</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'landlord_properties' ? 'active' : ''}`} onClick={() => setCurrentPage('landlord_properties')}>
                      <HomeIcon size={18} /> <span className="sidebar-menu-label">My Properties</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'landlord_add_property' ? 'active' : ''}`} onClick={() => setCurrentPage('landlord_add_property')}>
                      <Plus size={18} /> <span className="sidebar-menu-label">Add Property</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'landlord_bookings' ? 'active' : ''}`} onClick={() => setCurrentPage('landlord_bookings')}>
                      <Calendar size={18} /> <span className="sidebar-menu-label">Booking Requests</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'landlord_tenants' ? 'active' : ''}`} onClick={() => setCurrentPage('landlord_tenants')}>
                      <Users size={18} /> <span className="sidebar-menu-label">Tenants</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'messages' ? 'active' : ''}`} onClick={() => setCurrentPage('messages')}>
                      <MessageSquare size={18} /> <span className="sidebar-menu-label">Messages</span>
                      {unreadChatsCount > 0 && (
                        <span className="chat-inbox-unread-count" style={{ marginLeft: 'auto', fontSize: '0.65rem', padding: '0.1rem 0.45rem', borderRadius: '10px' }}>
                          {unreadChatsCount}
                        </span>
                      )}
                    </li>
                    <li className={`sidebar-item ${currentPage === 'landlord_contracts' ? 'active' : ''}`} onClick={() => setCurrentPage('landlord_contracts')}>
                      <FileText size={18} /> <span className="sidebar-menu-label">Rental Contracts</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'landlord_payments' ? 'active' : ''}`} onClick={() => setCurrentPage('landlord_payments')}>
                      <CreditCard size={18} /> <span className="sidebar-menu-label">Payments</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'landlord_reviews' ? 'active' : ''}`} onClick={() => setCurrentPage('landlord_reviews')}>
                      <Star size={18} /> <span className="sidebar-menu-label">Reviews</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'landlord_analytics' ? 'active' : ''}`} onClick={() => setCurrentPage('landlord_analytics')}>
                      <BarChart3 size={18} /> <span className="sidebar-menu-label">Analytics</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'landlord_notifications' ? 'active' : ''}`} onClick={() => setCurrentPage('landlord_notifications')}>
                      <Bell size={18} /> <span className="sidebar-menu-label">Notifications</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'landlord_profile' ? 'active' : ''}`} onClick={() => setCurrentPage('landlord_profile')}>
                      <Users size={18} /> <span className="sidebar-menu-label">Profile</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'landlord_nid' ? 'active' : ''}`} onClick={() => setCurrentPage('landlord_nid')}>
                      <ShieldCheck size={18} /> <span className="sidebar-menu-label">NID Verification</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className={`sidebar-item ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentPage('dashboard')}>
                      <HomeIcon size={18} /> <span className="sidebar-menu-label">Dashboard</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'listings' ? 'active' : ''}`} onClick={() => { setSelectedListing(null); setCurrentPage('listings'); }}>
                      <Search size={18} /> <span className="sidebar-menu-label">Search Properties</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'saved' ? 'active' : ''}`} onClick={() => setCurrentPage('saved')}>
                      <Heart size={18} /> <span className="sidebar-menu-label">Saved Properties</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'roommate' ? 'active' : ''}`} onClick={() => setCurrentPage('roommate')}>
                      <Users size={18} /> <span className="sidebar-menu-label">Roommate Finder</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'student_bookings' ? 'active' : ''}`} onClick={() => setCurrentPage('student_bookings')}>
                      <Calendar size={18} /> <span className="sidebar-menu-label">My Bookings</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'messages' ? 'active' : ''}`} onClick={() => setCurrentPage('messages')}>
                      <MessageSquare size={18} /> <span className="sidebar-menu-label">Messages</span>
                      {unreadChatsCount > 0 && (
                        <span className="chat-inbox-unread-count" style={{ marginLeft: 'auto', fontSize: '0.65rem', padding: '0.1rem 0.45rem', borderRadius: '10px' }}>
                          {unreadChatsCount}
                        </span>
                      )}
                    </li>
                    <li className={`sidebar-item ${currentPage === 'contract' ? 'active' : ''}`} onClick={() => setCurrentPage('contract')}>
                      <FileText size={18} /> <span className="sidebar-menu-label">Rental Contracts</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'student_payments' ? 'active' : ''}`} onClick={() => setCurrentPage('student_payments')}>
                      <CreditCard size={18} /> <span className="sidebar-menu-label">Payments</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'student_reviews' ? 'active' : ''}`} onClick={() => setCurrentPage('student_reviews')}>
                      <Star size={18} /> <span className="sidebar-menu-label">My Reviews</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'student_notifications' ? 'active' : ''}`} onClick={() => setCurrentPage('student_notifications')}>
                      <Bell size={18} /> <span className="sidebar-menu-label">Notifications</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'help' ? 'active' : ''}`} onClick={() => setCurrentPage('help')}>
                      <HelpCircle size={18} /> <span className="sidebar-menu-label">Help & Support</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'student_profile' ? 'active' : ''}`} onClick={() => setCurrentPage('student_profile')}>
                      <Users size={18} /> <span className="sidebar-menu-label">My Profile</span>
                    </li>
                    <li className={`sidebar-item ${currentPage === 'settings' ? 'active' : ''}`} onClick={() => setCurrentPage('settings')}>
                      <Settings size={18} /> <span className="sidebar-menu-label">Settings</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div className="sidebar-footer">
              <span className="sidebar-item" onClick={() => alert('Support tickets matching CSE BUBT.')}>
                <HelpCircle size={18} /> <span className="sidebar-menu-label">Help Center</span>
              </span>
              <span className="sidebar-item" onClick={handleLogout}>
                <LogOut size={18} /> <span className="sidebar-menu-label">Logout</span>
              </span>
            </div>
          </aside>

          <main className={`portal-content-pane ${currentPage === 'messages' ? 'no-scroll' : ''}`}>
            {/* Robust Portal Content Router (Clean page separation & ErrorBoundary Protection) */}
            <ErrorBoundary>
              {currentPage === 'messages' ? (
                <Messaging 
                  chats={userChats}
                  activeChatId={activeChatId}
                  setActiveChatId={setActiveChatId}
                  onSendMessage={sendChatMessage}
                  onMarkAsRead={markChatAsRead}
                  listings={listings}
                  savedPropertyIds={savedPropertyIds}
                  userBookedPropertyIds={userBookedPropertyIds}
                  currentUser={currentUser}
                />
              ) : isAdminUser ? (
                <AdminPanel 
                  currentUser={currentUser} 
                  activeTab={currentPage}
                  onTabChange={(tab) => setCurrentPage(tab)}
                  listings={listings}
                  onEditListing={editListing}
                  onDeleteListing={deleteListing}
                  onSaveSettings={handleSaveSettings}
                />
              ) : isLandlordUser ? (
                <Dashboard 
                  listings={listings} 
                  onAddListing={addListing} 
                  onEditListing={editListing}
                  onDeleteListing={deleteListing}
                  currentUser={currentUser} 
                  activeTab={currentPage}
                  onTabChange={(tab) => setCurrentPage(tab)}
                  onSaveSettings={handleSaveSettings}
                  payments={sharedPayments}
                  onApprovePayment={approveSharedPayment}
                  chats={userChats}
                  notifications={notifications}
                  onStartChat={startChat}
                />
              ) : (currentPage === 'contract' || currentPage === 'contracts' || currentPage === 'rental_contracts') ? (
                <ContractBuilder currentUser={currentUser} />
              ) : currentPage === 'settings' ? (
                <SettingsPage currentUser={currentUser} onSave={handleSaveSettings} />
              ) : currentPage === 'saved' ? (
                <div>
                  <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Saved Properties ❤️</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Properties you bookmarked to review, compare, or share with potential roommates.</p>
                  </div>

                  {listings.filter(l => (savedPropertyIds || []).includes(l.id)).length === 0 ? (
                    <div className="glass-panel" style={{ padding: '3rem', background: 'white', border: '1px solid var(--border-light)', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                      <Heart size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>No Saved Listings Yet</h3>
                      <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: '1.25rem' }}>Browse properties and hit the heart icon on any listing card to save it here.</p>
                      <button className="btn-filter-apply" onClick={() => setCurrentPage('listings')}>
                        Explore Housing Listings
                      </button>
                    </div>
                  ) : (
                    <div className="listings-grid">
                      {listings.filter(l => (savedPropertyIds || []).includes(l.id)).map(listing => (
                        <div key={listing.id} className="listing-card">
                          <div className="listing-image-wrapper">
                            <img src={listing.image} alt={listing.title} className="listing-card-image" />
                            <button 
                              type="button" 
                              style={{ position: 'absolute', top: '8px', right: '8px', background: '#ef4444', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3 }}
                              onClick={() => toggleSaveProperty(listing.id)}
                              title="Remove from saved"
                            >
                              <Heart size={16} fill="white" color="white" />
                            </button>
                            <span className="badge badge-price">৳{listing.price.toLocaleString()} BDT/mo</span>
                          </div>
                          <div className="listing-info">
                            <h3 className="listing-title">{listing.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{listing.location}</p>
                            <button className="btn-card-action" onClick={() => { setSelectedListing(listing); setCurrentPage('listings'); }}>
                              View Property Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <StudentDashboard 
                  currentUser={currentUser} 
                  activeTab={currentPage}
                  onNavigate={(tab) => setCurrentPage(tab)}
                  onStartChat={startChat}
                  onSaveSettings={handleSaveSettings}
                  payments={sharedPayments}
                  onAddPayment={addSharedPayment}
                  savedPropertyIds={savedPropertyIds}
                  userBookedPropertyIds={userBookedPropertyIds}
                  listings={listings}
                  chats={chats}
                  notifications={notifications}
                />
              )}
            </ErrorBoundary>
          </main>
        </div>
      ) : (
        /* Full-Width Core Pages (Home, Listings, Roommate Matching, Auth) */
        <main className="screen-content" style={{ padding: (currentPage === 'home' || currentPage === 'auth') ? '0' : '2rem' }}>
          {currentPage === 'home' && (
            <Hero 
              onSearch={() => setCurrentPage('listings')} 
              onExploreRoommates={() => setCurrentPage('roommate')}
            />
          )}

          {currentPage === 'auth' && (
            <Auth 
              onAuthSuccess={handleAuthSuccess} 
              initialMode={authMode} 
              onBackToHome={() => setCurrentPage('home')}
            />
          )}
          
          {currentPage === 'listings' && (
            <Listings 
              listings={listings} 
              selectedListing={selectedListing}
              setSelectedListing={setSelectedListing}
              savedPropertyIds={savedPropertyIds}
              onToggleSave={toggleSaveProperty}
              onRecordBooking={recordPropertyBooking}
              onStartChat={startChat}
              onSubmitReview={addReview}
              reviews={reviews}
            />
          )}

          {currentPage === 'roommate' && (
            <RoommateMatching 
              currentUser={currentUser} 
              onStartChat={startChat}
            />
          )}
        </main>
      )}

      {/* Main footer visible on core landing flow */}
      {!isPortalPage && (
        <footer className="main-footer">
          <div className="main-footer-container">
            <div className="main-footer-brand">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>RentEase</h3>
              <p>Simplifying student living through smart roommate matching and seamless verified housing listings.</p>
              <div className="social-icons-row">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="Facebook">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="LinkedIn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="YouTube">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="main-footer-links-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Student Stories</a></li>
                <li><a href="#">Careers</a></li>
              </ul>
            </div>

            <div className="main-footer-links-col">
              <h4>Resources</h4>
              <ul>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Landlord FAQ</a></li>
                <li><a href="#">Support</a></li>
              </ul>
            </div>

            <div className="main-footer-links-col">
              <h4>Stay Connected</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Subscribe to campus listings and housing availability alerts.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <a href="mailto:renteasy.web@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', textDecoration: 'none', fontWeight: '600' }}>
                  <Mail size={15} style={{ color: 'var(--primary)' }} /> renteasy.web@gmail.com
                </a>
                <a href="tel:01828384972" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', textDecoration: 'none', fontWeight: '600' }}>
                  <Phone size={15} style={{ color: 'var(--primary)' }} /> +880 1828-384972
                </a>
              </div>
            </div>
          </div>
          <div className="main-footer-credits">
            &copy; 2026 RentEase Inc. Built for university students. BUBT CSE Intake 51/8.
          </div>
        </footer>
      )}

      {/* Floating Customer Care Phone Widget for Students & Landlords */}
      {(!currentUser || (!currentUser.role.includes('Admin') && !currentUser.role.includes('Staff'))) && (
        <CustomerCareWidget currentUser={currentUser} />
      )}

      {/* Live Database Inspector Modal */}
      <DatabaseViewer isOpen={showDbViewer} onClose={() => setShowDbViewer(false)} />
    </div>
  );
}

export default App;
