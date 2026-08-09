import { useState } from 'react';
import { 
  Bell, Heart, MapPin, Search, Users, ArrowRight, MessageSquare, 
  FileText, Calendar, CreditCard, Star, ShieldCheck, UserCheck, 
  HelpCircle, Settings, CheckCircle, Download, X, Plus, AlertCircle, 
  Trash2, Lock, ShieldAlert, Zap, FileDown, Printer 
} from 'lucide-react';

export default function StudentDashboard({ 
  currentUser, 
  activeTab = 'dashboard', 
  onNavigate, 
  onStartChat, 
  onSaveSettings,
  payments = [],
  onAddPayment
}) {
  
  // --- MOCK STATE SEEDS ---

  // 1. Saved Properties
  const [savedCount] = useState(3);

  // 2. Active Bookings
  const [bookings, setBookings] = useState([
    {
      id: 'bk_101',
      propertyTitle: 'Mirpur House (Studio Suite)',
      landlordName: 'Mehadi Hasan',
      price: 1200,
      moveInDate: '2026-08-01',
      status: 'Confirmed',
      deposit: 1200,
      receiptId: 'REC-99120'
    },
    {
      id: 'bk_102',
      propertyTitle: 'Dhaka Premium Sublet',
      landlordName: 'Mrs. Begum',
      price: 850,
      moveInDate: '2026-09-01',
      status: 'Pending Landlord Approval',
      deposit: 850,
      receiptId: 'REC-99121'
    }
  ]);

  // 3. Roommate Matches
  const [matches] = useState([
    { id: 1, name: 'Nirob Ahmed', score: '94%', dept: 'CSE BUBT', year: 'Senior Year', bio: 'Quiet study habits, early riser, non-smoker.', status: 'Request Pending' },
    { id: 2, name: 'Sumon Paul', score: '88%', dept: 'BBA BUBT', year: 'Junior Year', bio: 'Loves gaming, clean room, keeps to himself.', status: 'Compatible' }
  ]);

  // 4. Student Reviews Given
  const [myReviews, setMyReviews] = useState([
    { id: 1, target: 'Dhaka Rent Listing', rating: 5, comment: 'Great apartment close to BUBT campus. Fast fiber internet!', date: '2026-06-15' },
    { id: 2, target: 'Nirob Ahmed (Roommate)', rating: 5, comment: 'Very respectful and clean roommate. Highly recommended!', date: '2026-05-10' }
  ]);

  // 5. Payments History
  const [localPayments, setLocalPayments] = useState([
    { id: 'pay_701', month: 'July 2026', property: 'Mirpur House', amount: 1200, status: 'Paid', date: '2026-07-01', receiptNo: 'TXN-88192' },
    { id: 'pay_700', month: 'June 2026', property: 'Mirpur House', amount: 1200, status: 'Paid', date: '2026-06-01', receiptNo: 'TXN-88100' }
  ]);

  // 6. Profile Editable Form States
  const [fullName, setFullName] = useState(currentUser?.name || 'Anas Ahmed');
  const [studentId, setStudentId] = useState(currentUser?.studentId || '22235103467');
  const [university, setUniversity] = useState(currentUser?.university || 'Bangladesh University of Business and Technology (BUBT)');
  const [department, setDepartment] = useState(currentUser?.department || 'Computer Science & Engineering (CSE)');
  const [academicYear, setAcademicYear] = useState('Junior Year (Intake 51/8)');
  const [email, setEmail] = useState(currentUser?.email || 'anas@cse.bubt.edu.bd');
  const [phone, setPhone] = useState(currentUser?.phone || '+880 1711-223344');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('2003-05-14');
  const [emergencyContact, setEmergencyContact] = useState('+880 1819-000000');
  const [enable2FA, setEnable2FA] = useState(false);
  const [isIdVerified, setIsIdVerified] = useState(true);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // 7. Pay Rent Online Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState(1200);
  const [payGateway, setPayGateway] = useState('bKash');
  const [payAccountNum, setPayAccountNum] = useState('');

  // 8. Add Review Modal
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [newReviewTarget, setNewReviewTarget] = useState('Mirpur House');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

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
      status: 'Pending Approval (Sent to Landlord)',
      date: new Date().toISOString().split('T')[0],
      gateway: payGateway,
      accountNum: payAccountNum,
      depositStatus: 'Refundable'
    };

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

    const newRev = {
      id: Date.now(),
      target: newReviewTarget,
      rating: parseInt(newReviewRating),
      comment: newReviewComment,
      date: new Date().toISOString().split('T')[0]
    };

    setMyReviews(prev => [newRev, ...prev]);
    setShowAddReviewModal(false);
    setNewReviewComment('');
    alert('Your review has been published!');
  };

  const cancelBooking = (id, title) => {
    if (window.confirm(`Are you sure you want to cancel your booking request for "${title}"?`)) {
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

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="badge-student-verified" style={{ background: '#d1fae5', color: '#065f46', fontWeight: 'bold', padding: '0.4rem 0.85rem', borderRadius: '50px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={16} /> Student Verified ID
          </span>
        </div>
      </div>

      {/* SUB-VIEW 1: MAIN DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* 6 Key Overview Widgets */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
            
            <div className="admin-stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('saved')}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#ffe4e6', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={20} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Saved Properties</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800' }}>{savedCount}</h3>
              </div>
            </div>

            <div className="admin-stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('student_bookings')}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={20} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Active Bookings</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800' }}>{bookings.length}</h3>
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
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800' }}>2</h3>
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
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800' }}>4</h3>
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
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', border: '1px solid var(--border-light)', padding: '0.75rem', borderRadius: '8px', background: '#f8fafc' }}>
                  <img src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=150&q=80" alt="housing" style={{ width: '70px', height: '70px', borderRadius: '6px', objectFit: 'cover' }} />
                  <div>
                    <h4 style={{ fontWeight: '800', fontSize: '0.95rem' }}>Mirpur House</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>0.4 miles from BUBT campus</p>
                    <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '0.85rem' }}>1,200 BDT/mo</span>
                  </div>
                </div>
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
            
            {/* Avatar block */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <img src={currentUser?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"} alt="avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-light)' }} />
              <div>
                <h4 style={{ fontWeight: '800' }}>{fullName}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{university}</p>
                <span className="badge-pill-light" style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '0.25rem', display: 'inline-block' }}>
                  Student ID: {studentId}
                </span>
              </div>
            </div>

            {/* Profile Details Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="filter-label">Full Name</label>
                <input type="text" className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="filter-label">Student ID Number</label>
                <input type="text" className="form-input" value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
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
                <label className="filter-label">Email Address</label>
                <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>University Student ID Scan Status</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified against BUBT student registry database.</p>
                </div>

                <button type="button" className="btn-filter-apply" style={{ background: 'var(--secondary)', fontSize: '0.8rem' }} onClick={() => alert('Student ID card scan verified successfully.')}>
                  {isIdVerified ? '✓ ID Verified' : 'Upload ID Card'}
                </button>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {bookings.map(b => (
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
                  {payments.map((p, idx) => (
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
                            onClick={() => setSelectedReceipt(p)}
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
                  ))}
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
              <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '480px', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Write Rating & Review</h3>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowAddReviewModal(false)}>
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="filter-label">Target (Property / Landlord / Roommate)</label>
                    <input type="text" className="form-input" value={newReviewTarget} onChange={(e) => setNewReviewTarget(e.target.value)} required />
                  </div>

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

                  <div className="form-group">
                    <label className="filter-label">Your Review Details</label>
                    <textarea className="form-input" rows="3" placeholder="Share your experience..." value={newReviewComment} onChange={(e) => setNewReviewComment(e.target.value)} required />
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
              7 Recent Alerts
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* 1. Books Property -> Booking Sent */}
            <div style={{ padding: '1rem 1.25rem', border: '1px solid var(--border-light)', borderRadius: '8px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>📅</span>
                <div>
                  <h4 style={{ fontWeight: '800', fontSize: '0.9rem', margin: 0, color: 'var(--text-main)' }}>Booking Sent</h4>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>Your room booking application for "Dhaka Premium Sublet" was submitted to Landlord.</p>
                </div>
              </div>
              <span className="badge-pill-light" style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', fontWeight: 700 }}>10 mins ago</span>
            </div>

            {/* 2. Landlord Accepts -> Booking Accepted */}
            <div style={{ padding: '1rem 1.25rem', border: '1px solid var(--border-light)', borderRadius: '8px', background: '#ecfdf5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>👍</span>
                <div>
                  <h4 style={{ fontWeight: '800', fontSize: '0.9rem', margin: 0, color: '#047857' }}>Booking Accepted</h4>
                  <p style={{ fontSize: '0.825rem', color: '#065f46', margin: '0.15rem 0 0 0' }}>Landlord Mehadi Hasan ACCEPTED your booking application! Move-in date confirmed.</p>
                </div>
              </div>
              <span className="badge-pill-light" style={{ background: '#a7f3d0', color: '#047857', fontSize: '0.75rem', fontWeight: 700 }}>2 hours ago</span>
            </div>

            {/* 3. Pays Rent -> Payment Successful */}
            <div style={{ padding: '1rem 1.25rem', border: '1px solid var(--border-light)', borderRadius: '8px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>💳</span>
                <div>
                  <h4 style={{ fontWeight: '800', fontSize: '0.9rem', margin: 0, color: 'var(--text-main)' }}>Payment Successful</h4>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>July rent payment (৳1,200 BDT) processed via bKash. Receipt #TXN-88192 issued.</p>
                </div>
              </div>
              <span className="badge-pill-light" style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', fontWeight: 700 }}>Yesterday</span>
            </div>

            {/* 4. Roommate Request -> Request Received */}
            <div style={{ padding: '1rem 1.25rem', border: '1px solid var(--border-light)', borderRadius: '8px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🤝</span>
                <div>
                  <h4 style={{ fontWeight: '800', fontSize: '0.9rem', margin: 0, color: 'var(--text-main)' }}>Roommate Request Received</h4>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>Nirob Ahmed sent you a roommate match request (94% Lifestyle Compatibility).</p>
                </div>
              </div>
              <span className="badge-pill-light" style={{ background: '#f3e8ff', color: '#6b21a8', fontSize: '0.75rem', fontWeight: 700 }}>Yesterday</span>
            </div>

            {/* 5. Landlord Messages -> New Message */}
            <div style={{ padding: '1rem 1.25rem', border: '1px solid var(--border-light)', borderRadius: '8px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>💬</span>
                <div>
                  <h4 style={{ fontWeight: '800', fontSize: '0.9rem', margin: 0, color: 'var(--text-main)' }}>New Landlord Message</h4>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>Landlord Mehadi Hasan sent a message: "Key handover scheduled for 10 AM on Friday."</p>
                </div>
              </div>
              <span className="badge-pill-light" style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.75rem', fontWeight: 700 }}>2 days ago</span>
            </div>

            {/* 6. Submit Report/Complaint -> Report Submitted */}
            <div style={{ padding: '1rem 1.25rem', border: '1px solid var(--border-light)', borderRadius: '8px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                <div>
                  <h4 style={{ fontWeight: '800', fontSize: '0.9rem', margin: 0, color: 'var(--text-main)' }}>Report Submitted</h4>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>Your support case #REP-804 regarding wifi maintenance was logged to Admin.</p>
                </div>
              </div>
              <span className="badge-pill-light" style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.75rem', fontWeight: 700 }}>3 days ago</span>
            </div>

            {/* 7. Admin Updates Report -> Report Status Updated */}
            <div style={{ padding: '1rem 1.25rem', border: '1px solid var(--border-light)', borderRadius: '8px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>✅</span>
                <div>
                  <h4 style={{ fontWeight: '800', fontSize: '0.9rem', margin: 0, color: 'var(--text-main)' }}>Report Status Updated</h4>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>RentEase Admin updated Case #REP-804 to "RESOLVED: Landlord notified and fixed router."</p>
                </div>
              </div>
              <span className="badge-pill-light" style={{ background: '#ecfdf5', color: '#047857', fontSize: '0.75rem', fontWeight: 700 }}>4 days ago</span>
            </div>
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
                  window.print();
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
