import { useState, useEffect } from 'react';
import { dbService } from '../database/supabaseClient';
import { checkProfileCompleteness, getAvatarUrl, compressImage } from '../utils/profileCompleteness';
import { calculateUnreadCount } from '../utils/unreadMessages';
import { downloadPaymentReceipt } from '../utils/receiptGenerator';
import { 
  Bell, Heart, MapPin, Search, Users, ArrowRight, MessageSquare, 
  FileText, Calendar, CreditCard, Star, ShieldCheck, UserCheck, 
  HelpCircle, Settings, CheckCircle, Download, X, Plus, AlertCircle, 
  Trash2, Lock, ShieldAlert, Zap, FileDown, Printer, Clock, Eye, Camera 
} from 'lucide-react';

export default function StudentDashboard({ 
  currentUser, 
  activeTab = 'dashboard', 
  onNavigate, 
  onStartChat, 
  onSaveSettings,
  payments = [],
  onAddPayment,
  savedPropertyIds = [],
  userBookedPropertyIds = [],
  listings = [],
  chats = [],
  notifications = []
}) {
  
  // Real valid metrics synchronized with actual stored properties
  const validSavedListings = (listings || []).filter(l => (savedPropertyIds || []).includes(l.id));
  const realSavedCount = validSavedListings.length;

  const validBookedListings = (listings || []).filter(l => (userBookedPropertyIds || []).includes(l.id));

  // 2. Active Bookings
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('rentease_student_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const displayBookings = [...bookings];
  (userBookedPropertyIds || []).forEach(bookedId => {
    const listingMatch = (listings || []).find(l => l.id === bookedId);
    if (listingMatch && !displayBookings.some(b => b.propertyId === bookedId || b.propertyTitle === listingMatch.title)) {
      displayBookings.push({
        id: `b_user_${bookedId}`,
        propertyId: bookedId,
        propertyTitle: listingMatch.title,
        landlordName: listingMatch.landlord?.name || listingMatch.landlord_name || 'Landlord',
        moveInDate: 'Next Month 1st',
        deposit: listingMatch.price ? Math.round(listingMatch.price * 1.5) : 10000,
        status: 'Pending Confirmation'
      });
    }
  });

  const realBookingsCount = displayBookings.length;
  const realUnreadMessagesCount = calculateUnreadCount(chats, currentUser);
  const realNotificationsCount = (notifications || []).length;

  // 3. Roommate Matches
  const [matches] = useState(() => {
    const saved = localStorage.getItem('rentease_student_matches');
    return saved ? JSON.parse(saved) : [];
  });

  // 4. Student Reviews Given
  const [myReviews, setMyReviews] = useState(() => {
    const saved = localStorage.getItem('rentease_student_reviews');
    return saved ? JSON.parse(saved) : [];
  });

  // 5. Payments History
  const [localPayments, setLocalPayments] = useState(() => {
    const saved = localStorage.getItem('rentease_student_payments');
    return saved ? JSON.parse(saved) : [];
  });

  const displayPayments = (payments && payments.length > 0) ? payments : localPayments;

  // Real-time Database Initializer
  useEffect(() => {
    // 1. Fetch Bookings from Database Service
    dbService.getBookings().then(fetchedBookings => {
      if (Array.isArray(fetchedBookings) && fetchedBookings.length > 0) {
        const formatted = fetchedBookings.map(b => ({
          id: b.id,
          propertyId: b.property_id || b.propertyId,
          propertyTitle: b.property_title || b.propertyTitle || 'Student Housing',
          landlordName: b.landlord_name || b.landlordName || 'Landlord Owner',
          moveInDate: b.move_in_date || b.moveInDate || b.date || 'Next Month 1st',
          deposit: b.deposit || (b.price ? Math.round(b.price * 1.5) : 10000),
          status: b.status || 'Pending Confirmation'
        }));
        setBookings(formatted);
      }
    });

    // 2. Fetch Payments from Database Service
    dbService.getPayments().then(fetchedPayments => {
      if (Array.isArray(fetchedPayments) && fetchedPayments.length > 0) {
        const formatted = fetchedPayments.map(p => ({
          id: p.id,
          receiptId: p.receipt_id || p.receiptId || 'REC-' + p.id,
          receiptNo: p.receipt_id || p.receiptId || 'REC-' + p.id,
          tenantName: p.tenant_name || p.tenantName || currentUser?.name || 'Student Tenant',
          propertyTitle: p.property_title || p.propertyTitle || 'Student Housing',
          property: p.property_title || p.propertyTitle || 'Student Housing',
          amount: p.amount || 6000,
          month: p.month || 'August 2026',
          status: p.status === 'Paid' ? 'Paid' : (p.status || 'Pending'),
          date: p.date || new Date().toISOString().split('T')[0],
          gateway: p.gateway || 'bKash',
          accountNum: p.accountNum || p.account_num || '+880 1711-XXXXXX',
          depositStatus: 'Refundable'
        }));
        setLocalPayments(formatted);
      }
    });
    // 3. Fetch Reviews from Database Service
    dbService.getReviews().then(fetchedReviews => {
      if (Array.isArray(fetchedReviews) && fetchedReviews.length > 0) {
        setMyReviews(fetchedReviews);
      }
    });
  }, [currentUser]);

  // 6. Profile Editable Form States
  const [fullName, setFullName] = useState(currentUser?.name || 'Anas Ahmed');
  const [studentId, setStudentId] = useState(currentUser?.studentId || '22235103467');
  const [university, setUniversity] = useState(currentUser?.university || 'Bangladesh University of Business and Technology (BUBT)');
  const [department, setDepartment] = useState(currentUser?.department || 'Computer Science & Engineering (CSE)');
  const [academicYear, setAcademicYear] = useState(currentUser?.academicYear || currentUser?.academic_year || currentUser?.year || 'Junior Year (Intake 51/8)');
  const [email, setEmail] = useState(currentUser?.email || 'anas@cse.bubt.edu.bd');
  const [phone, setPhone] = useState(currentUser?.phone || '+880 1711-223344');
  const [gender, setGender] = useState(currentUser?.gender || 'Male');
  const [dob, setDob] = useState(currentUser?.dob || currentUser?.date_of_birth || '2003-05-14');
  const [emergencyContact, setEmergencyContact] = useState(currentUser?.emergencyContact || currentUser?.emergency_contact || '+880 1819-000000');
  const [enable2FA, setEnable2FA] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Profile Picture Upload State & Handler
  const [profilePicture, setProfilePicture] = useState(currentUser?.avatar || currentUser?.avatar_url || currentUser?.profile_picture || '');
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Frontend File Format Validation (JPG, PNG, WEBP)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      alert('❌ Invalid file format! Only JPG, PNG, and WEBP image files are allowed for your profile picture.');
      return;
    }

    // Frontend File Size Validation (Max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('❌ File size exceeds 2 MB limit! Please upload a smaller profile picture.');
      return;
    }

    setAvatarUploading(true);
    try {
      // Compress and resize image to ~30KB JPEG to prevent localStorage quota crash
      const compressedDataUrl = await compressImage(file, 300, 300, 0.85);
      setProfilePicture(compressedDataUrl);

      const res = await dbService.updateProfilePicture(currentUser?.email || email, compressedDataUrl);
      if (res && res.error) {
        alert(`❌ ${res.message}`);
        setAvatarUploading(false);
        return;
      }

      const updatedAvatar = res.avatarUrl || compressedDataUrl;
      setAvatarUploading(false);
      setProfilePicture(updatedAvatar);

      if (onSaveSettings) {
        onSaveSettings({
          ...currentUser,
          avatar: updatedAvatar,
          avatar_url: updatedAvatar,
          profile_picture: updatedAvatar
        });
      }

      alert('🎉 Profile picture updated successfully!');
    } catch (err) {
      console.warn('Avatar compression error:', err);
      setAvatarUploading(false);
      alert('❌ Failed to process profile picture. Please select a valid image file.');
    }
  };

  // Dynamic Profile Completeness Checker
  const currentStudentProfile = {
    fullName,
    name: fullName,
    studentId,
    university,
    department,
    academicYear,
    academic_year: academicYear,
    year: academicYear,
    email,
    phone,
    gender,
    dob,
    date_of_birth: dob,
    emergencyContact,
    emergency_contact: emergencyContact
  };

  const profileCompleteness = checkProfileCompleteness(currentStudentProfile);

  // Live ID Verification Record State
  const [idVerRecord, setIdVerRecord] = useState(null);
  const [idUploading, setIdUploading] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  useEffect(() => {
    if (currentUser?.email) {
      dbService.getIdVerificationStatus(currentUser.email).then(rec => {
        if (rec) setIdVerRecord(rec);
      });
    }
  }, [currentUser?.email]);

  const handleIdUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!profileCompleteness.isComplete) {
      alert(`⚠️ Please complete your profile before submitting ID verification.\n\nMissing required fields:\n• ${profileCompleteness.missingFields.join('\n• ')}`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10 MB limit. Please select a smaller document (image or PDF).');
      return;
    }

    setIdUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const fileUrl = reader.result;
      const response = await dbService.submitIdVerification(
        currentUser?.email || email,
        fullName || currentUser?.name || 'Student',
        fileUrl,
        currentStudentProfile
      );

      if (response && response.error) {
        alert(`❌ ${response.message}`);
        setIdUploading(false);
        return;
      }

      setIdVerRecord(response);
      setIdUploading(false);
      alert('🎉 Student ID document submitted! Status: Pending Review by Admin.');
    };
    reader.readAsDataURL(file);
  };

  // 7. Pay Rent Online Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState(1200);
  const [payGateway, setPayGateway] = useState('bKash');
  const [payAccountNum, setPayAccountNum] = useState('');

  // 8. Add Review Modal
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [reviewCategory, setReviewCategory] = useState('Property'); // 'Property' | 'Landlord' | 'Roommate'
  const [newReviewTarget, setNewReviewTarget] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  // Target Option Pools for Review Modal
  const bookedPropertyListings = (userBookedPropertyIds || []).map(id => {
    return (listings || []).find(l => l.id === id);
  }).filter(Boolean);

  const availablePropertyOptions = bookedPropertyListings.length > 0
    ? bookedPropertyListings
    : (validSavedListings.length > 0 ? validSavedListings : listings);

  const landlordOptions = ['Mehadi Hasan (Landlord)', 'Abdur Rahman (Landlord)', 'Sumon Hossain (Landlord)', 'Nirob Ahmed (Landlord)'];
  const roommateOptions = (matches || []).length > 0
    ? matches.map(m => `${m.name} (Roommate)`)
    : ['Anas Ahmed (Roommate)', 'Sumon Hossain (Roommate)', 'Mehadi Hasan (Roommate)', 'Ashikur Rahman (Roommate)'];

  // 9. Selected Receipt for Official PDF Viewer Modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Form Submission Handlers
  const handleProfileSave = (e) => {
    e.preventDefault();
    if (onSaveSettings) {
      onSaveSettings({
        name: fullName,
        email,
        phone,
        university,
        department,
        studentId
      });
    }
    dbService.saveUser({
      id: currentUser?.id,
      name: fullName,
      email,
      phone,
      university,
      department,
      studentId
    });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handlePayRentSubmit = (e) => {
    e.preventDefault();
    if (!payAccountNum) return;

    const receiptId = 'REC-' + Math.floor(10000 + Math.random() * 90000);
    const newTxn = {
      id: 'pay_' + Date.now(),
      receiptId: receiptId,
      receiptNo: receiptId,
      tenantName: fullName,
      propertyTitle: 'Mirpur House',
      property: 'Mirpur House',
      amount: parseInt(payAmount),
      month: 'August 2026',
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      gateway: payGateway,
      accountNum: payAccountNum,
      depositStatus: 'Refundable'
    };

    // Save to Database Service & Supabase PostgreSQL
    dbService.addPayment(newTxn);

    if (onAddPayment) {
      onAddPayment(newTxn);
    } else {
      setLocalPayments(prev => [newTxn, ...prev]);
    }
    setShowPayModal(false);
    setPayAccountNum('');
    alert(`Rent payment of ${payAmount} BDT via ${payGateway} submitted to Landlord! Status: Pending Approval.`);
  };

  const handleCreateReview = (e) => {
    e.preventDefault();
    if (!newReviewComment) return;

    const targetName = newReviewTarget || (reviewCategory === 'Property' ? (availablePropertyOptions[0]?.title || 'Mirpur House') : reviewCategory === 'Landlord' ? landlordOptions[0] : roommateOptions[0]);

    const newRev = {
      id: 'rev_' + Date.now(),
      target: `${targetName} [${reviewCategory}]`,
      rating: parseInt(newReviewRating),
      comment: newReviewComment,
      author: fullName || currentUser?.name || 'Student',
      date: new Date().toISOString().split('T')[0]
    };

    dbService.saveReview(newRev);
    setMyReviews(prev => [newRev, ...prev]);
    setShowAddReviewModal(false);
    setNewReviewComment('');
    setNewReviewTarget('');
    alert(`Your review for "${targetName}" has been published and saved to database!`);
  };

  const cancelBooking = (id, title) => {
    if (window.confirm(`Are you sure you want to cancel your booking request for "${title}"?`)) {
      dbService.updateBookingStatus(id, 'Cancelled');
      setBookings(prev => prev.filter(b => b.id !== id));
      alert(`Booking request for "${title}" cancelled.`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Top Banner Header */}
      <div className="glass-panel" style={{ padding: '1.5rem 2rem', background: 'white', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Welcome back, {fullName.split(' ')[0]}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Student Workspace • {university} ({department})
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {(!idVerRecord || idVerRecord.verification_status === 'verified' || currentUser?.is_verified) && (
            <span className="badge-student-verified" style={{ background: '#d1fae5', color: '#065f46', fontWeight: 'bold', padding: '0.4rem 0.85rem', borderRadius: '50px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={16} /> ✓ ID Verified
            </span>
          )}

          {idVerRecord?.verification_status === 'pending' && (
            <span className="badge-student-verified" style={{ background: '#fef3c7', color: '#b45309', fontWeight: 'bold', padding: '0.4rem 0.85rem', borderRadius: '50px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={16} /> 🟡 Pending Review
            </span>
          )}

          {idVerRecord?.verification_status === 'rejected' && (
            <span className="badge-student-verified" style={{ background: '#fee2e2', color: 'var(--danger)', fontWeight: 'bold', padding: '0.4rem 0.85rem', borderRadius: '50px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <AlertCircle size={16} /> 🔴 Verification Rejected
            </span>
          )}
        </div>
      </div>

      {/* SUB-VIEW 1: MAIN DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Profile Incomplete Banner Alert */}
          {!profileCompleteness.isComplete && (
            <div style={{ padding: '1rem 1.25rem', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#9a3412', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertCircle size={18} style={{ color: '#ea580c' }} /> Complete your profile before submitting ID verification
                </strong>
                <p style={{ fontSize: '0.82rem', color: '#c2410c', marginTop: '0.2rem' }}>
                  Missing required profile fields: <strong>{profileCompleteness.missingFields.join(', ')}</strong>
                </p>
              </div>

              <button 
                type="button" 
                className="btn-filter-apply" 
                style={{ background: '#ea580c', fontSize: '0.8rem', padding: '0.45rem 1rem' }} 
                onClick={() => onNavigate('student_profile')}
              >
                Complete Profile Now &rarr;
              </button>
            </div>
          )}

          {/* 6 Key Overview Widgets */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
            
            <div className="admin-stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('saved')}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#ffe4e6', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={20} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Saved Properties</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800' }}>{realSavedCount}</h3>
              </div>
            </div>

            <div className="admin-stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('student_bookings')}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={20} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Active Bookings</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800' }}>{realBookingsCount || bookings.length}</h3>
              </div>
            </div>

            <div className="admin-stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('roommate')}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Roommate Matches</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800' }}>{matches.length}</h3>
              </div>
            </div>

            <div className="admin-stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('messages')}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={20} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Unread Messages</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800' }}>{realUnreadMessagesCount}</h3>
              </div>
            </div>

            <div className="admin-stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('student_reviews')}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#fffbeb', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={20} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Reviews Given</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800' }}>{myReviews.length}</h3>
              </div>
            </div>

            <div className="admin-stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('student_notifications')}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={20} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Notifications</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800' }}>{realNotificationsCount}</h3>
              </div>
            </div>

          </div>

          {/* Quick Action Banner */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            
            {/* Recommended Housing */}
            <div className="admin-pane-container" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Recommended Student Housing</h3>
                <button className="widget-link" style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }} onClick={() => onNavigate('listings')}>
                  View All &rarr;
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(listings || []).slice(0, 3).map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', border: '1px solid var(--border-light)', padding: '0.75rem', borderRadius: '8px', background: '#f8fafc', cursor: 'pointer' }} onClick={() => onNavigate('listings')}>
                    <img src={item.image || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=150&q=80'} alt={item.title} style={{ width: '70px', height: '70px', borderRadius: '6px', objectFit: 'cover' }} />
                    <div>
                      <h4 style={{ fontWeight: '800', fontSize: '0.95rem' }}>{item.title}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.location}</p>
                      <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '0.85rem' }}>{item.price} BDT/mo</span>
                    </div>
                  </div>
                ))}
                {(!listings || listings.length === 0) && (
                  <div style={{ padding: '1.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>No recommended properties available yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Roommate Recommendations */}
            <div className="admin-pane-container" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Compatible Roommates</h3>
                <button className="widget-link" style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }} onClick={() => onNavigate('roommate')}>
                  Find More &rarr;
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {matches.map(m => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-light)', padding: '0.75rem', borderRadius: '8px', background: '#f8fafc' }}>
                    <div>
                      <h4 style={{ fontWeight: '800', fontSize: '0.9rem' }}>{m.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.dept} • {m.year}</p>
                    </div>
                    <span style={{ background: '#d1fae5', color: '#065f46', fontWeight: 'bold', fontSize: '0.8rem', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                      {m.score} Match
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB-VIEW 2: MY PROFILE & ACCOUNT SETTINGS */}
      {activeTab === 'student_profile' && (
        <div className="admin-pane-container">
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Student Profile & Verification</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage your university credentials, personal details, and security preferences.</p>
          </div>

          {profileSuccess && (
            <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '6px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.85rem' }}>
              <CheckCircle size={16} /> Student Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '720px' }}>
            
            {/* Interactive Avatar Upload Block */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src={profilePicture || getAvatarUrl({ name: fullName, avatar: currentUser?.avatar })} 
                  alt="Student Avatar" 
                  style={{ width: '85px', height: '85px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getAvatarUrl({ name: fullName });
                  }}
                />
                <label 
                  style={{ 
                    position: 'absolute', bottom: 0, right: 0, 
                    background: 'var(--primary)', color: 'white', 
                    borderRadius: '50%', width: '28px', height: '28px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    cursor: avatarUploading ? 'wait' : 'pointer', boxShadow: 'var(--shadow-sm)' 
                  }}
                  title="Upload profile picture"
                >
                  <Camera size={15} />
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,image/webp" 
                    onChange={handleAvatarUpload} 
                    style={{ display: 'none' }} 
                    disabled={avatarUploading}
                  />
                </label>
              </div>

              <div>
                <h4 style={{ fontWeight: '800', fontSize: '1.05rem' }}>{fullName}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{university}</p>
                <span className="badge-pill-light" style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '0.25rem', display: 'inline-block' }}>
                  Student ID: {studentId}
                </span>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label 
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.45rem', 
                      background: 'var(--primary)', 
                      color: 'white',
                      padding: '0.45rem 0.9rem', 
                      borderRadius: '8px',
                      fontSize: '0.8rem', 
                      fontWeight: '700',
                      cursor: avatarUploading ? 'wait' : 'pointer',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <Camera size={15} />
                    <span>{avatarUploading ? 'Uploading...' : 'Upload Profile Picture'}</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarUpload} style={{ display: 'none' }} disabled={avatarUploading} />
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max 2MB (JPG, PNG, WEBP)</span>
                </div>
              </div>
            </div>

            {/* Profile Details Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="filter-label">Full Name</label>
                <input type="text" className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <label className="filter-label" style={{ margin: 0 }}>Student ID Number</label>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: '600' }}>
                    <Lock size={12} /> Permanent / Cannot be changed
                  </span>
                </div>
                <input 
                  type="text" 
                  className="form-input" 
                  value={studentId} 
                  disabled 
                  readOnly 
                  style={{ background: '#f1f5f9', cursor: 'not-allowed', color: '#475569', fontWeight: '600' }} 
                  title="Student ID Number is locked and cannot be modified."
                />
              </div>

              <div className="form-group">
                <label className="filter-label">University / Institution</label>
                <input type="text" className="form-input" value={university} onChange={(e) => setUniversity(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="filter-label">Department / Major</label>
                <input type="text" className="form-input" value={department} onChange={(e) => setDepartment(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="filter-label">Academic Year / Intake</label>
                <input type="text" className="form-input" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} required />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <label className="filter-label" style={{ margin: 0 }}>Email Address</label>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: '600' }}>
                    <Lock size={12} /> Permanent / Verified Email
                  </span>
                </div>
                <input 
                  type="email" 
                  className="form-input" 
                  value={email} 
                  disabled 
                  readOnly 
                  style={{ background: '#f1f5f9', cursor: 'not-allowed', color: '#475569', fontWeight: '600' }} 
                  title="Email address is locked and cannot be modified."
                />
              </div>

              <div className="form-group">
                <label className="filter-label">Phone Number</label>
                <input type="tel" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="filter-label">Gender</label>
                <select className="form-input" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="filter-label">Date of Birth</label>
                <input type="date" className="form-input" value={dob} onChange={(e) => setDob(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="filter-label">Emergency Contact Phone</label>
                <input type="tel" className="form-input" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} />
              </div>
            </div>

            {/* Verification & 2FA */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontWeight: '800', fontSize: '0.95rem' }}>Security & ID Verification Settings</h4>

              <div className="switch-container">
                <div className="switch-details">
                  <span className="switch-title">Two-Factor Authentication (2FA)</span>
                  <span className="switch-desc">Receive SMS OTP verification codes during login.</span>
                </div>
                <label className="custom-toggle">
                  <input type="checkbox" checked={enable2FA} onChange={(e) => setEnable2FA(e.target.checked)} />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {/* Dynamic Student ID Verification Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>University Student ID Scan Status</span>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Upload student card or NID (PDF/Image up to 10MB) for admin verification.</p>
                  </div>

                  {(!idVerRecord || idVerRecord.verification_status === 'verified' || currentUser?.is_verified) && (
                    <span className="admin-badge-pill" style={{ background: '#d1fae5', color: '#065f46', fontWeight: '700', padding: '0.4rem 0.85rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle size={15} /> ✓ ID Verified
                    </span>
                  )}

                  {idVerRecord?.verification_status === 'pending' && (
                    <span className="admin-badge-pill" style={{ background: '#fef3c7', color: '#b45309', fontWeight: '700', padding: '0.4rem 0.85rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={15} /> 🟡 Pending Review
                    </span>
                  )}

                  {idVerRecord?.verification_status === 'rejected' && (
                    <span className="admin-badge-pill" style={{ background: '#fee2e2', color: 'var(--danger)', fontWeight: '700', padding: '0.4rem 0.85rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <AlertCircle size={15} /> 🔴 Rejected
                    </span>
                  )}
                </div>

                {/* Status-specific alert message */}
                {idVerRecord?.verification_status === 'pending' && (
                  <div style={{ padding: '0.75rem 1rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '6px', fontSize: '0.82rem', color: '#b45309' }}>
                    ⏳ Your ID document is currently under review by RentEase Admin. You will receive an in-app & email notification once reviewed.
                  </div>
                )}

                {idVerRecord?.verification_status === 'rejected' && (
                  <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.82rem', color: '#991b1b' }}>
                    ❌ <strong>Verification Rejected:</strong> {idVerRecord.rejection_reason || 'Document unclear or invalid.'} Please upload a valid document below.
                  </div>
                )}

                {/* Upload Input Button OR Profile Incomplete Gate */}
                {(!idVerRecord || idVerRecord.verification_status === 'rejected') && (
                  <div style={{ marginTop: '0.5rem' }}>
                    {!profileCompleteness.isComplete ? (
                      <div style={{ padding: '1rem 1.25rem', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', color: '#c2410c' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <AlertCircle size={18} style={{ color: '#ea580c' }} />
                          <strong style={{ fontSize: '0.9rem', color: '#9a3412' }}>Please complete your profile before submitting ID verification.</strong>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#c2410c', margin: '0.25rem 0 0.85rem 0' }}>
                          Missing required profile fields: <strong>{profileCompleteness.missingFields.join(', ')}</strong>
                        </p>
                        <button 
                          type="button" 
                          className="btn-filter-apply" 
                          style={{ background: '#ea580c', fontSize: '0.8rem', padding: '0.45rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }} 
                          onClick={() => {
                            if (activeTab !== 'student_profile') {
                              onNavigate('student_profile');
                            } else {
                              const el = document.getElementById('student-profile-form-box');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                        >
                          Fill Missing Profile Details &rarr;
                        </button>
                      </div>
                    ) : (
                      <>
                        <label className="btn-filter-apply" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: idUploading ? 'wait' : 'pointer', background: 'var(--primary)', fontSize: '0.82rem' }}>
                          <FileText size={16} />
                          <span>{idUploading ? 'Uploading Document...' : (idVerRecord?.verification_status === 'rejected' ? 'Re-upload Student ID Document' : 'Upload Student ID / NID Document')}</span>
                          <input type="file" accept="image/*,application/pdf" onChange={handleIdUpload} style={{ display: 'none' }} disabled={idUploading} />
                        </label>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.75rem' }}>Supports JPG, PNG, WEBP & PDF (Max 10 MB)</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button type="submit" className="btn-filter-apply" style={{ padding: '0.75rem', justifyContent: 'center' }}>
              Update Student Profile
            </button>
          </form>
        </div>
      )}

      {/* SUB-VIEW 3: MY BOOKINGS */}
      {activeTab === 'student_bookings' && (
        <div className="admin-pane-container">
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>My Housing Bookings</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Track your active rental booking requests, status updates, and confirmations.</p>
          </div>

          {displayBookings.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <Calendar size={40} style={{ color: 'var(--text-light)', marginBottom: '0.75rem' }} />
              <h4 style={{ fontWeight: '700', marginBottom: '0.25rem' }}>No Active Bookings</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You have not submitted any property booking or viewing requests yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {displayBookings.map(b => (
                <div key={b.id} style={{ padding: '1.5rem', border: '1px solid var(--border-light)', borderRadius: '8px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <h4 style={{ fontWeight: '800', fontSize: '1.05rem' }}>{b.propertyTitle}</h4>
                      <span className="admin-badge-pill" style={{ 
                        background: b.status === 'Confirmed' ? '#d1fae5' : '#fef3c7',
                        color: b.status === 'Confirmed' ? '#065f46' : '#b45309'
                      }}>
                        {b.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Landlord Owner: <strong>{b.landlordName}</strong></p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Move-in Date: {b.moveInDate} • Deposit: <strong>{b.deposit} BDT</strong></p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-card-secondary" style={{ background: 'white', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }} onClick={() => alert(`Downloading official booking confirmation PDF for ${b.propertyTitle}`)}>
                      <FileDown size={14} /> Confirmation PDF
                    </button>
                    
                    {b.status !== 'Confirmed' && (
                      <button className="btn-card-secondary" style={{ border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: '0.8rem' }} onClick={() => cancelBooking(b.id, b.propertyTitle)}>
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 4: PAYMENTS MANAGEMENT */}
      {activeTab === 'student_payments' && (
        <div className="admin-pane-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Student Payments Ledger</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pay monthly rent online, download official payment receipts, and track security deposits.</p>
            </div>

            <button className="btn-filter-apply" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowPayModal(true)}>
              <CreditCard size={16} /> Pay Rent Online
            </button>
          </div>

          {/* Security Deposit Summary Card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1.25rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#047857', textTransform: 'uppercase' }}>Security Deposit Held in Escrow</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#065f46', marginTop: '0.2rem' }}>1,200 BDT</h3>
              <span style={{ fontSize: '0.75rem', color: '#047857' }}>Refundable upon lease end</span>
            </div>
          </div>

          <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginTop: '1rem' }}>
            <h4 style={{ fontWeight: '800', fontSize: '1.05rem', marginBottom: '1.25rem', color: '#0f172a' }}>Payment History & Receipts</h4>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e2e8f0', borderTopLeftRadius: '8px' }}>Receipt No</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e2e8f0' }}>Month</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e2e8f0' }}>Property</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e2e8f0' }}>Amount Paid</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e2e8f0' }}>Date</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e2e8f0' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e2e8f0', textAlign: 'center', borderTopRightRadius: '8px' }}>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {displayPayments.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No payments recorded yet. Click "Pay Rent Online" above to submit a rent payment request.
                      </td>
                    </tr>
                  ) : (
                    displayPayments.map((p, idx) => (
                    <tr key={p.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', fontWeight: '800', color: '#1e293b', fontSize: '0.85rem' }}>{p.receiptNo || p.receiptId}</td>
                      <td style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', fontWeight: '600' }}>{p.month}</td>
                      <td style={{ padding: '1rem', color: '#334155', fontSize: '0.85rem', fontWeight: '600' }}>{p.propertyTitle || p.property}</td>
                      <td style={{ padding: '1rem', fontWeight: '800', color: 'var(--primary)', fontSize: '0.9rem' }}>{p.amount.toLocaleString()} BDT</td>
                      <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.825rem' }}>{p.date || 'Pending'}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.35rem 0.75rem',
                          borderRadius: '50px',
                          background: p.status === 'Paid' ? '#d1fae5' : '#fef3c7',
                          color: p.status === 'Paid' ? '#065f46' : '#b45309',
                          fontWeight: '800',
                          fontSize: '0.775rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          {p.status === 'Paid' ? '✓ Paid' : '⏳ ' + p.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {p.status === 'Paid' ? (
                          <button 
                            style={{ 
                              padding: '0.4rem 0.85rem', 
                              fontSize: '0.775rem', 
                              fontWeight: '700',
                              background: '#eff6ff', 
                              color: '#1d4ed8', 
                              border: '1px solid #bfdbfe', 
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              cursor: 'pointer'
                            }} 
                            onClick={() => {
                              setSelectedReceipt(p);
                              downloadPaymentReceipt(p);
                            }}
                          >
                            <FileDown size={14} /> Download PDF
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.775rem', color: '#94a3b8', fontStyle: 'italic' }}>
                            Awaiting Landlord Approval
                          </span>
                        )}
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pay Rent Modal */}
          {showPayModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
              <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '480px', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Pay Monthly Rent Online</h3>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowPayModal(false)}>
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handlePayRentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="filter-label">Rent Amount (BDT)</label>
                    <input type="number" className="form-input" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="filter-label">Payment Gateway</label>
                    <select className="form-input" value={payGateway} onChange={(e) => setPayGateway(e.target.value)}>
                      <option value="bKash">bKash Mobile Wallet</option>
                      <option value="Nagad">Nagad Mobile Wallet</option>
                      <option value="Visa/MasterCard">Visa / MasterCard</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="filter-label">Mobile / Card Account Number</label>
                    <input type="text" className="form-input" placeholder="e.g. 01700000000" value={payAccountNum} onChange={(e) => setPayAccountNum(e.target.value)} required />
                  </div>

                  <button type="submit" className="btn-filter-apply" style={{ justifyContent: 'center', padding: '0.75rem' }}>
                    Confirm Payment of {payAmount} BDT
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 5: MY REVIEWS */}
      {activeTab === 'student_reviews' && (
        <div className="admin-pane-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>My Ratings & Reviews Given</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Review landlords, properties, and roommates to help the university community.</p>
            </div>

            <button className="btn-filter-apply" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowAddReviewModal(true)}>
              <Plus size={16} /> Write New Review
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myReviews.map(r => (
              <div key={r.id} style={{ padding: '1.25rem', border: '1px solid var(--border-light)', borderRadius: '8px', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontWeight: '800' }}>{r.target}</h4>
                  <div style={{ display: 'flex', gap: '0.25rem', color: '#f59e0b' }}>
                    {'★'.repeat(r.rating)}
                  </div>
                </div>
                <p style={{ fontSize: '0.9rem', fontStyle: 'italic', margin: '0.5rem 0' }}>"{r.comment}"</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Posted on: {r.date}</span>
              </div>
            ))}
          </div>

          {/* Add Review Modal */}
          {showAddReviewModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
              <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Write Rating & Review</h3>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowAddReviewModal(false)}>
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Step 1: Category Selector */}
                  <div className="form-group">
                    <label className="filter-label">Target Type (Property / Landlord / Roommate)</label>
                    <select 
                      className="form-input" 
                      value={reviewCategory} 
                      onChange={(e) => {
                        const cat = e.target.value;
                        setReviewCategory(cat);
                        if (cat === 'Property') {
                          setNewReviewTarget(availablePropertyOptions[0]?.title || 'Mirpur House');
                        } else if (cat === 'Landlord') {
                          setNewReviewTarget(landlordOptions[0]);
                        } else if (cat === 'Roommate') {
                          setNewReviewTarget(roommateOptions[0]);
                        }
                      }}
                    >
                      <option value="Property">🏠 Property (My Booked / Saved Properties)</option>
                      <option value="Landlord">👤 Landlord / Property Owner</option>
                      <option value="Roommate">🤝 Roommate Match</option>
                    </select>
                  </div>

                  {/* Step 2: Dynamic Target Box */}
                  <div className="form-group">
                    <label className="filter-label">
                      {reviewCategory === 'Property' ? 'Select Booked / Saved Property' : reviewCategory === 'Landlord' ? 'Select Landlord' : 'Select Roommate Candidate'}
                    </label>
                    
                    {reviewCategory === 'Property' && (
                      <select 
                        className="form-input" 
                        value={newReviewTarget || (availablePropertyOptions[0]?.title || '')} 
                        onChange={(e) => setNewReviewTarget(e.target.value)}
                        required
                      >
                        {availablePropertyOptions.map(p => (
                          <option key={p.id} value={p.title}>
                            {p.title} — {p.location || 'Mirpur, Dhaka'} (৳{p.price}/mo)
                          </option>
                        ))}
                      </select>
                    )}

                    {reviewCategory === 'Landlord' && (
                      <select 
                        className="form-input" 
                        value={newReviewTarget || landlordOptions[0]} 
                        onChange={(e) => setNewReviewTarget(e.target.value)}
                        required
                      >
                        {landlordOptions.map((landlord, i) => (
                          <option key={i} value={landlord}>
                            {landlord}
                          </option>
                        ))}
                      </select>
                    )}

                    {reviewCategory === 'Roommate' && (
                      <select 
                        className="form-input" 
                        value={newReviewTarget || roommateOptions[0]} 
                        onChange={(e) => setNewReviewTarget(e.target.value)}
                        required
                      >
                        {roommateOptions.map((rm, i) => (
                          <option key={i} value={rm}>
                            {rm}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Step 3: Rating */}
                  <div className="form-group">
                    <label className="filter-label">Rating (1 to 5 Stars)</label>
                    <select className="form-input" value={newReviewRating} onChange={(e) => setNewReviewRating(e.target.value)}>
                      <option value="5">⭐⭐⭐⭐⭐ 5 Stars (Excellent)</option>
                      <option value="4">⭐⭐⭐⭐ 4 Stars (Good)</option>
                      <option value="3">⭐⭐⭐ 3 Stars (Average)</option>
                      <option value="2">⭐⭐ 2 Stars (Poor)</option>
                      <option value="1">⭐ 1 Star (Very Poor)</option>
                    </select>
                  </div>

                  {/* Step 4: Review Details */}
                  <div className="form-group">
                    <label className="filter-label">Your Review Details</label>
                    <textarea 
                      className="form-input" 
                      rows="3" 
                      placeholder={`Share your experience with this ${reviewCategory.toLowerCase()}...`} 
                      value={newReviewComment} 
                      onChange={(e) => setNewReviewComment(e.target.value)} 
                      required 
                    />
                  </div>

                  <button type="submit" className="btn-filter-apply" style={{ justifyContent: 'center', padding: '0.75rem' }}>
                    Publish Review
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 6: NOTIFICATIONS */}
      {activeTab === 'student_notifications' && (
        <div className="admin-pane-container">
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Student Activity Notifications 🔔</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Track property bookings, payment receipts, roommate requests, landlord messages, and report statuses.</p>
            </div>
            <span className="badge-pill-light" style={{ background: '#dbeafe', color: '#1e40af', fontWeight: 700, fontSize: '0.8rem' }}>
              {(notifications || []).length} Live Alerts
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(notifications || []).length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <Bell size={36} style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }} />
                <h4 style={{ fontWeight: '700' }}>No Recent Notifications</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Your real-time notifications for bookings, payments, and messages will appear here.</p>
              </div>
            ) : (
              (notifications || []).map((n, i) => (
                <div key={n.id || i} style={{ padding: '1rem 1.25rem', border: '1px solid var(--border-light)', borderRadius: '8px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>
                      {(n.title || '').includes('Booking') ? '📅' : (n.title || '').includes('Payment') ? '💳' : (n.title || '').includes('Saved') ? '💖' : '🔔'}
                    </span>
                    <div>
                      <h4 style={{ fontWeight: '800', fontSize: '0.9rem', margin: 0, color: 'var(--text-main)' }}>{n.title}</h4>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>{n.desc || n.message}</p>
                    </div>
                  </div>
                  <span className="badge-pill-light" style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', fontWeight: 700 }}>
                    {n.time || 'Just now'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 7: HELP & SUPPORT */}
      {activeTab === 'help' && (
        <div className="admin-pane-container">
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Student Help & Support Desk</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Access FAQs, report listing issues, or submit direct support tickets to RentEase Admin.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Ticket Submission Form */}
            <div>
              <h4 style={{ fontWeight: '800', marginBottom: '1rem' }}>Submit a Support Ticket</h4>
              <form onSubmit={(e) => { e.preventDefault(); alert('Support Ticket submitted! Admin team will reply shortly.'); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="filter-label">Issue Topic</label>
                  <select className="form-input">
                    <option>Housing / Booking Problem</option>
                    <option>Report Fake Listing</option>
                    <option>Roommate Dispute</option>
                    <option>Payment / Deposit Help</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="filter-label">Message Details</label>
                  <textarea className="form-input" rows="4" placeholder="Describe your inquiry..." required />
                </div>

                <button type="submit" className="btn-filter-apply" style={{ justifyContent: 'center', padding: '0.75rem' }}>
                  Submit Support Ticket
                </button>
              </form>
            </div>

            {/* Quick FAQs */}
            <div>
              <h4 style={{ fontWeight: '800', marginBottom: '1rem' }}>Frequently Asked Questions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ padding: '0.85rem', border: '1px solid var(--border-light)', borderRadius: '6px', background: '#f8fafc' }}>
                  <h5 style={{ fontWeight: '800', fontSize: '0.85rem' }}>How does Student ID Verification work?</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>We verify your university email and student card against BUBT records for platform security.</p>
                </div>

                <div style={{ padding: '0.85rem', border: '1px solid var(--border-light)', borderRadius: '6px', background: '#f8fafc' }}>
                  <h5 style={{ fontWeight: '800', fontSize: '0.85rem' }}>Are security deposits refundable?</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Yes! Deposits are held in RentEase escrow and refunded automatically upon clean lease end.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Rent Payment Receipt Viewer Modal */}
      {selectedReceipt && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '520px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid var(--border-light)', animation: 'popoverSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            
            {/* Printable Receipt Header */}
            <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-0.5px' }}>RentEase</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginTop: '0.1rem' }}>Official Rent Payment Receipt</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ background: '#d1fae5', color: '#065f46', fontWeight: '800', fontSize: '0.75rem', padding: '0.3rem 0.65rem', borderRadius: '50px', display: 'inline-block' }}>
                  ✓ LANDLORD APPROVED
                </span>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem', fontWeight: 'bold' }}>
                  {selectedReceipt.receiptNo || selectedReceipt.receiptId}
                </div>
              </div>
            </div>

            {/* Receipt Content Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Tenant Name:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>{selectedReceipt.tenantName || fullName}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Property Title:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>{selectedReceipt.propertyTitle || selectedReceipt.property}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Billing Month:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>{selectedReceipt.month}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Payment Date:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>{selectedReceipt.date || '2026-07-01'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Payment Method:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>{selectedReceipt.gateway || 'bKash Mobile Wallet'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.4rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: '800' }}>Total Amount Paid:</span>
                <span style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--primary)' }}>{selectedReceipt.amount.toLocaleString()} BDT</span>
              </div>
            </div>

            {/* Official Stamp Footer */}
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', marginBottom: '1.5rem' }}>
              This is a verified digital payment receipt issued by RentEase Platform for BUBT Housing.
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                className="btn-filter-apply" 
                style={{ flex: 1, justifyContent: 'center', padding: '0.65rem' }} 
                onClick={() => {
                  downloadPaymentReceipt(selectedReceipt);
                }}
              >
                <Printer size={16} /> Print / Save PDF
              </button>

              <button 
                className="btn-card-secondary" 
                style={{ flex: 1, justifyContent: 'center', padding: '0.65rem', border: '1px solid var(--border-light)' }} 
                onClick={() => setSelectedReceipt(null)}
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
