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
import { Home as HomeIcon, Search, Users, MessageSquare, FileText, Bell, LogOut, HelpCircle, Heart, Star, Settings, Plus, Calendar, CreditCard, BarChart3, ShieldCheck, AlertCircle, Lock, Database as DatabaseIcon, CheckCircle2 } from 'lucide-react';


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

  // Initial load from Database Service
  useEffect(() => {
    dbService.getListings().then(data => {
      if (data && data.length > 0) setListings(data);
    });
    dbService.getPayments().then(data => {
      if (data && data.length > 0) setSharedPayments(data);
    });
    dbService.getChats().then(data => {
      if (data && data.length > 0) setChats(data);
    });

    if (isConfigured) {
      setDbStatusMsg('⚡ Supabase Cloud Database Connected');
    } else {
      setDbStatusMsg('⚡ Database Ready (Persistent Local + Cloud Engine)');
    }
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
    localStorage.setItem('rentease_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('rentease_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('rentease_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('rentease_user');
    }
  }, [currentUser]);

  // Auth Redirect Guard
  useEffect(() => {
    if (!currentUser && [
      'dashboard', 'messages', 'contract', 'saved', 'settings', 'roommate',
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

  const addReview = (listingId, review) => {
    setListings(prev => prev.map(item => {
      if (item.id === listingId) {
        const updatedReviews = [review, ...item.reviews];
        const newRating = parseFloat(
          ((item.landlord.rating * item.reviews.length + review.rating) / (item.reviews.length + 1)).toFixed(1)
        );
        return {
          ...item,
          reviews: updatedReviews,
          landlord: {
            ...item.landlord,
            rating: newRating
          }
        };
      }
      return item;
    }));
  };

  const startChat = (contactName, initialMsgText = '') => {
    setCurrentPage('messages');
    setActiveChatId('chat_anas');
  };

  const sendChatMessage = (chatId, text) => {
    // handled inside Messaging state
  };

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

  const handleSaveSettings = (updatedDetails) => {
    setCurrentUser(prev => ({
      ...prev,
      ...updatedDetails
    }));
  };

  // Helper to check if page is a sidebar portal page
  const isPortalPage = [
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
  ].includes(currentPage) && currentUser !== null;

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="navbar">
        <a href="#" className="nav-brand" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }}>
          <div className="nav-logo-text">RentEase</div>
        </a>
        {(!currentUser || (!currentUser.role.includes('Admin') && !currentUser.role.includes('Staff'))) && (
          <nav>
            <ul className="nav-links">
              <li>
                <span className={`nav-link ${currentPage === 'listings' ? 'active' : ''}`} onClick={() => { setSelectedListing(null); setCurrentPage('listings'); }}>
                  Search
                </span>
              </li>
              {(!currentUser || !currentUser.role.includes('Landlord')) && (
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
          {currentUser && (currentUser.role?.includes('Admin') || currentUser.role?.includes('Staff')) && (
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
                          if (currentUser?.role?.includes('Student')) setCurrentPage('student_notifications');
                          else if (currentUser?.role?.includes('Landlord')) setCurrentPage('landlord_notifications');
                          else if (currentUser?.role?.includes('Admin')) setCurrentPage('admin_notifications');
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
                <span className="chat-inbox-unread-count" style={{ position: 'absolute', top: '-6px', right: '-6px', fontSize: '0.6rem', width: '14px', height: '14px' }}>3</span>
              </button>
              <img 
                src={currentUser.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80"} 
                alt="User Avatar" 
                className="nav-avatar-icon" 
                onClick={() => setCurrentPage('dashboard')}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80";
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
                  src={currentUser.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80"} 
                  alt="User Avatar" 
                  className="sidebar-avatar" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80";
                  }}
                />
                <div className="sidebar-user-info">
                  <div className="sidebar-user-name" style={{ fontSize: (currentUser.role.includes('Admin') || currentUser.role.includes('Staff')) ? '0.85rem' : '1rem' }}>
                    {(currentUser.role.includes('Admin') || currentUser.role.includes('Staff')) ? currentUser.name : currentUser.name.split(' ').pop()}
                  </div>
                  <div className="sidebar-user-role">{currentUser.role}</div>
                </div>
              </div>

              {currentUser.role.includes('Student') && (
                <button className="sidebar-cta-btn" onClick={() => setCurrentPage('roommate')}>
                  <Users size={16} /> <span className="sidebar-btn-text">+ Find a Roommate</span>
                </button>
              )}

              <ul className="sidebar-menu" style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', paddingRight: '4px' }}>
                {currentUser.role.includes('Admin') || currentUser.role.includes('Staff') ? (
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
                ) : currentUser.role.includes('Landlord') ? (
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
            {/* Admin Portal Content */}
            {(currentUser.role.includes('Admin') || currentUser.role.includes('Staff')) && 
             ['dashboard', 'admin_users', 'admin_properties', 'admin_verification', 'admin_bookings', 'admin_contracts', 'admin_payments', 'admin_reviews', 'admin_reports', 'admin_analytics', 'admin_notifications', 'admin_content', 'admin_settings', 'admin_security', 'admin_audit', 'admin_backup', 'admin_profile'].includes(currentPage) ? (
              <AdminPanel 
                currentUser={currentUser} 
                activeTab={currentPage}
                onTabChange={(tab) => setCurrentPage(tab)}
                listings={listings}
                onEditListing={editListing}
                onDeleteListing={deleteListing}
                onSaveSettings={handleSaveSettings}
              />
            ) : ['dashboard', 'landlord_properties', 'landlord_add_property', 'landlord_bookings', 'landlord_tenants', 'landlord_contracts', 'landlord_payments', 'landlord_reviews', 'landlord_analytics', 'landlord_notifications', 'landlord_profile'].includes(currentPage) && currentUser.role.includes('Landlord') ? (
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
              />
            ) : ['dashboard', 'student_bookings', 'student_payments', 'student_reviews', 'student_notifications', 'student_profile', 'help'].includes(currentPage) ? (
              <StudentDashboard 
                currentUser={currentUser} 
                activeTab={currentPage}
                onNavigate={(tab) => setCurrentPage(tab)}
                onStartChat={startChat}
                onSaveSettings={handleSaveSettings}
                payments={sharedPayments}
                onAddPayment={addSharedPayment}
              />
            ) : null}
            {currentPage === 'messages' && (
              <Messaging 
                chats={chats}
                activeChatId={activeChatId}
                setActiveChatId={setActiveChatId}
                onSendMessage={sendChatMessage}
                listings={listings}
              />
            )}
            {currentPage === 'contract' && (
              <ContractBuilder currentUser={currentUser} />
            )}
            {currentPage === 'saved' && (
              <div className="glass-panel" style={{ padding: '3rem', background: 'white', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                <Heart size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
                <h3>No Saved Listings Yet</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Browse properties and hit the heart icon to save them here.</p>
              </div>
            )}
            {currentPage === 'settings' && (
              <SettingsPage currentUser={currentUser} onSave={handleSaveSettings} />
            )}
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
              onStartChat={startChat}
              onSubmitReview={addReview}
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
                <a href="#" className="social-icon-btn">@</a>
                <a href="#" className="social-icon-btn">#</a>
                <a href="#" className="social-icon-btn">$</a>
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
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Subscribe to campus listings and housing availability alerts.</p>
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
