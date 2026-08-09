import { useState, useRef } from 'react';
import { 
  Camera, User, Mail, GraduationCap, Briefcase, CheckCircle, 
  Bell, CreditCard, Lock, Settings, Phone, MapPin, 
  Landmark, DollarSign, FileText, Info, Globe 
} from 'lucide-react';

function SettingsPage({ currentUser, onSave }) {
  const isLandlord = currentUser?.role?.includes('Landlord');
  
  // Success toast state
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Settings updated successfully!');

  // --- STUDENT STATES ---
  const [studentName, setStudentName] = useState(currentUser?.name || '');
  const [studentAvatar, setStudentAvatar] = useState(currentUser?.avatar || '');
  
  // --- LANDLORD STATES ---
  const [activeTab, setActiveTab] = useState('profile');
  
  // 1. Profile Tab
  const [llName, setLlName] = useState(currentUser?.name || 'Mehadi Hasan');
  const [llPhone, setLlPhone] = useState(currentUser?.phone || '+880 1712-345678');
  const [llCity, setLlCity] = useState(currentUser?.city || 'Dhaka');
  const [llBio, setLlBio] = useState(currentUser?.bio || 'Professional student housing host in Mirpur, Dhaka. Dedicated to providing safe, comfortable, and study-friendly flats for BUBT students.');
  const [llAvatar, setLlAvatar] = useState(currentUser?.avatar || '');

  // 2. Payout Tab
  const [payoutChannel, setPayoutChannel] = useState(currentUser?.paymentMethod || 'bKash');
  const [payoutAccount, setPayoutAccount] = useState(currentUser?.paymentAccount || '+880 1712-345678');
  const [bankName, setBankName] = useState(currentUser?.bankName || 'City Bank PLC');
  const [bankBranch, setBankBranch] = useState(currentUser?.bankBranch || 'Mirpur Branch');
  const [bankAccountNo, setBankAccountNo] = useState(currentUser?.bankAccountNo || '2201992813123');
  const [bankHolderName, setBankHolderName] = useState(currentUser?.bankHolderName || currentUser?.name || 'Mehadi Hasan');
  const [instantPayout, setInstantPayout] = useState(currentUser?.instantPayout !== false);

  // 3. Notifications Tab
  const [notifBooking, setNotifBooking] = useState(currentUser?.notifBooking !== false);
  const [notifPayment, setNotifPayment] = useState(currentUser?.notifPayment !== false);
  const [notifMessage, setNotifMessage] = useState(currentUser?.notifMessage !== false);
  const [notifEmail, setNotifEmail] = useState(currentUser?.notifEmail !== false);
  const [notifSms, setNotifSms] = useState(currentUser?.notifSms !== false);

  // 4. Hosting Preferences Tab
  const [autoAccept, setAutoAccept] = useState(currentUser?.autoAccept || false);
  const [autoAcceptCompatibility, setAutoAcceptCompatibility] = useState(currentUser?.autoAcceptCompatibility || 90);
  const [defaultLeaseTerms, setDefaultLeaseTerms] = useState(
    currentUser?.defaultLeaseTerms || 
    'The tenant agrees to keep the premises clean and pay utilities by the 10th of every month. No loud music or events are permitted after 11:00 PM.'
  );
  const [defaultDepositMonths, setDefaultDepositMonths] = useState(currentUser?.defaultDepositMonths || 2);

  // 5. Security & Privacy Tab
  const [hidePhone, setHidePhone] = useState(currentUser?.hidePhone || false);
  const [enableTwoFactor, setEnableTwoFactor] = useState(currentUser?.enableTwoFactor || false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Auto Currency Based on User Location States
  const [autoCurrency, setAutoCurrency] = useState(() => {
    const saved = localStorage.getItem('rentease_auto_currency');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [selectedRegion, setSelectedRegion] = useState(() => {
    const saved = localStorage.getItem('rentease_selected_region');
    return saved || 'BD';
  });

  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (isLandlord) {
          setLlAvatar(reader.result);
        } else {
          setStudentAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    
    onSave({
      name: studentName.trim(),
      avatar: studentAvatar
    });
    
    setSuccessMessage('Settings updated successfully!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleLandlordSave = (e) => {
    if (e) e.preventDefault();

    // Check password matching if new password is typed
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return;
      }
      if (currentPassword === '') {
        alert('Please enter your current password to change it.');
        return;
      }
    }

    onSave({
      name: llName.trim(),
      avatar: llAvatar,
      phone: llPhone,
      city: llCity,
      bio: llBio,
      paymentMethod: payoutChannel,
      paymentAccount: payoutAccount,
      bankName,
      bankBranch,
      bankAccountNo,
      bankHolderName,
      instantPayout,
      notifBooking,
      notifPayment,
      notifMessage,
      notifEmail,
      notifSms,
      autoAccept,
      autoAcceptCompatibility,
      defaultLeaseTerms,
      defaultDepositMonths,
      hidePhone,
      enableTwoFactor
    });

    // Reset password fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setSuccessMessage('Host settings updated successfully!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Render Student Layout (Fallback/Legacy style matching original)
  if (!isLandlord) {
    return (
      <div className="glass-panel" style={{ padding: '2.5rem', background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Account Settings</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Update your profile details and picture.</p>
        </div>

        {showSuccess && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--secondary-glow)', border: '1px solid var(--secondary)', color: '#065f46', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
            <CheckCircle size={20} style={{ color: 'var(--secondary)' }} />
            <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Profile Picture Upload */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            <div 
              onClick={handleAvatarClick}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                position: 'relative',
                cursor: 'pointer',
                overflow: 'hidden',
                border: '3px solid white',
                boxShadow: 'var(--shadow-lg)',
                transition: 'var(--transition-smooth)',
                background: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              className="settings-avatar-container"
            >
              {studentAvatar ? (
                <img 
                  src={studentAvatar} 
                  alt="Avatar Preview" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <User size={48} style={{ color: 'var(--text-light)' }} />
              )}
              
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  color: 'white'
                }}
                className="settings-avatar-overlay"
              >
                <Camera size={24} />
              </div>
            </div>
            
            <button 
              type="button" 
              onClick={handleAvatarClick}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              Change Profile Picture
            </button>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={14} style={{ color: 'var(--text-muted)' }} />
                Profile Name
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={studentName} 
                onChange={(e) => setStudentName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={14} style={{ color: 'var(--text-light)' }} />
                University Email
              </label>
              <input 
                type="email" 
                className="form-input" 
                value={currentUser.email} 
                disabled 
                style={{ cursor: 'not-allowed', opacity: 0.7 }}
              />
            </div>

            {currentUser.university && (
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <GraduationCap size={14} style={{ color: 'var(--text-light)' }} />
                  University
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={currentUser.university} 
                  disabled 
                  style={{ cursor: 'not-allowed', opacity: 0.7 }}
                />
              </div>
            )}

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={14} style={{ color: 'var(--text-light)' }} />
                Account Type
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={currentUser.role} 
                disabled 
                style={{ cursor: 'not-allowed', opacity: 0.7 }}
              />
            </div>

            {/* Auto Currency Based on User Location (Recommended) Section */}
            <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', padding: '1.25rem', background: '#ffffff', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Globe size={18} style={{ color: 'var(--primary)' }} />
                    <h4 style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>
                      Auto Currency Based on User Location
                    </h4>
                    <span style={{ background: '#dbeafe', color: '#1d4ed8', fontWeight: '800', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '50px' }}>
                      Recommended
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: '1.4' }}>
                    Automatically detect user country upon login and format all rental listing prices into local currency.
                  </p>
                </div>

                <label className="custom-toggle" style={{ flexShrink: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={autoCurrency} 
                    onChange={(e) => {
                      setAutoCurrency(e.target.checked);
                      localStorage.setItem('rentease_auto_currency', JSON.stringify(e.target.checked));
                    }} 
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {/* Location Selector Dropdown */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="filter-label" style={{ fontSize: '0.8rem', fontWeight: '700' }}>
                  Simulated User Login Location / Currency Region
                </label>
                <select 
                  className="form-input" 
                  style={{ fontSize: '0.85rem', fontWeight: '600' }}
                  value={selectedRegion} 
                  onChange={(e) => {
                    setSelectedRegion(e.target.value);
                    localStorage.setItem('rentease_selected_region', e.target.value);
                  }}
                >
                  <option value="BD">🇧🇩 Bangladesh — Show ৳150,000/month</option>
                  <option value="US">🇺🇸 USA — Show $1,250/month</option>
                  <option value="GB">🇬🇧 UK — Show £930/month</option>
                  <option value="EU">🇪🇺 Europe — Show €1,080/month</option>
                </select>
              </div>

              {/* Grid of Location & Currency Sample Display Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem' }}>
                
                <div 
                  style={{ 
                    padding: '0.75rem', 
                    borderRadius: '10px', 
                    border: selectedRegion === 'BD' ? '2px solid var(--primary)' : '1px solid var(--border-light)', 
                    background: selectedRegion === 'BD' ? '#eff6ff' : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                  onClick={() => {
                    setSelectedRegion('BD');
                    localStorage.setItem('rentease_selected_region', 'BD');
                  }}
                >
                  <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>🇧🇩 Bangladesh</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.25rem' }}>৳150,000/mo</div>
                </div>

                <div 
                  style={{ 
                    padding: '0.75rem', 
                    borderRadius: '10px', 
                    border: selectedRegion === 'US' ? '2px solid var(--primary)' : '1px solid var(--border-light)', 
                    background: selectedRegion === 'US' ? '#eff6ff' : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                  onClick={() => {
                    setSelectedRegion('US');
                    localStorage.setItem('rentease_selected_region', 'US');
                  }}
                >
                  <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>🇺🇸 USA</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.25rem' }}>$1,250/mo</div>
                </div>

                <div 
                  style={{ 
                    padding: '0.75rem', 
                    borderRadius: '10px', 
                    border: selectedRegion === 'GB' ? '2px solid var(--primary)' : '1px solid var(--border-light)', 
                    background: selectedRegion === 'GB' ? '#eff6ff' : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                  onClick={() => {
                    setSelectedRegion('GB');
                    localStorage.setItem('rentease_selected_region', 'GB');
                  }}
                >
                  <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>🇬🇧 UK</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.25rem' }}>£930/mo</div>
                </div>

                <div 
                  style={{ 
                    padding: '0.75rem', 
                    borderRadius: '10px', 
                    border: selectedRegion === 'EU' ? '2px solid var(--primary)' : '1px solid var(--border-light)', 
                    background: selectedRegion === 'EU' ? '#eff6ff' : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                  onClick={() => {
                    setSelectedRegion('EU');
                    localStorage.setItem('rentease_selected_region', 'EU');
                  }}
                >
                  <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>🇪🇺 Europe</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.25rem' }}>€1,080/mo</div>
                </div>

              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-filter-apply" 
            style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', fontWeight: '700', borderRadius: 'var(--radius-md)' }}
          >
            Save Changes
          </button>
        </form>
      </div>
    );
  }

  // --- RENDER LANDLORD SETTINGS LAYOUT ---
  return (
    <div className="landlord-settings-wrapper" style={{ maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
      {/* Dynamic CSS Injection for Premium styling and transitions */}
      <style>{`
        .landlord-settings-card {
          display: grid;
          grid-template-columns: 260px 1fr;
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          min-height: 620px;
        }

        .settings-sidebar-pane {
          background: #f8fafc;
          border-right: 1px solid var(--border-light);
          padding: 2rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .settings-sidebar-header {
          padding: 0 0.75rem;
          margin-bottom: 1rem;
        }

        .settings-sidebar-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 0.25rem;
        }

        .settings-sidebar-subtitle {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .settings-menu-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .settings-menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.8rem 1rem;
          border-radius: var(--radius-sm);
          font-weight: 600;
          font-size: 0.925rem;
          color: var(--text-muted);
          cursor: pointer;
          transition: var(--transition-smooth);
          border-left: 3px solid transparent;
        }

        .settings-menu-item:hover {
          background: var(--bg-secondary);
          color: var(--text-main);
        }

        .settings-menu-item.active {
          background: var(--primary-glow);
          color: var(--primary);
          border-left-color: var(--primary);
        }

        .settings-content-pane {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          position: relative;
          background: #ffffff;
          animation: fadeSlideIn 0.35s ease;
        }

        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .settings-pane-header {
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 1rem;
        }

        .settings-pane-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 0.25rem;
        }

        .settings-pane-subtitle {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        /* Form Controls */
        .settings-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .settings-form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .settings-label {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .settings-input {
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          background: #ffffff;
          color: var(--text-main);
          font-size: 0.95rem;
          transition: var(--transition-smooth);
        }

        .settings-input:focus {
          outline: none;
          border-color: var(--primary-light);
          box-shadow: 0 0 0 3px var(--primary-glow);
        }

        .settings-textarea {
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          background: #ffffff;
          color: var(--text-main);
          font-size: 0.95rem;
          font-family: inherit;
          resize: vertical;
          transition: var(--transition-smooth);
        }

        .settings-textarea:focus {
          outline: none;
          border-color: var(--primary-light);
          box-shadow: 0 0 0 3px var(--primary-glow);
        }

        .settings-select {
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          background: #ffffff;
          color: var(--text-main);
          font-size: 0.95rem;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .settings-select:focus {
          outline: none;
          border-color: var(--primary-light);
          box-shadow: 0 0 0 3px var(--primary-glow);
        }

        /* Toggle Switches */
        .switch-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          background: var(--bg-deep);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          margin-bottom: 1rem;
          transition: var(--transition-smooth);
        }

        .switch-container:hover {
          border-color: #cbd5e1;
        }

        .switch-details {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          max-width: 80%;
        }

        .switch-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .switch-desc {
          font-size: 0.775rem;
          color: var(--text-muted);
        }

        .custom-toggle {
          position: relative;
          display: inline-block;
          width: 46px;
          height: 24px;
        }

        .custom-toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #cbd5e1;
          transition: .3s;
          border-radius: 34px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }

        input:checked + .toggle-slider {
          background-color: var(--secondary);
        }

        input:checked + .toggle-slider:before {
          transform: translateX(22px);
        }

        .save-bar {
          margin-top: auto;
          padding-top: 2rem;
          border-top: 1px solid var(--border-light);
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        .btn-ll-save {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          color: white;
          border: none;
          padding: 0.8rem 2rem;
          border-radius: var(--radius-sm);
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-smooth);
          box-shadow: 0 4px 6px rgba(0, 82, 204, 0.15);
        }

        .btn-ll-save:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 12px rgba(0, 82, 204, 0.25);
        }

        .btn-ll-reset {
          background: white;
          color: var(--text-muted);
          border: 1px solid var(--border-light);
          padding: 0.8rem 1.5rem;
          border-radius: var(--radius-sm);
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .btn-ll-reset:hover {
          background: var(--bg-secondary);
          color: var(--text-main);
        }

        /* Mobile adaptation */
        @media (max-width: 768px) {
          .landlord-settings-card {
            grid-template-columns: 1fr;
            min-height: auto;
          }
          
          .settings-sidebar-pane {
            border-right: none;
            border-bottom: 1px solid var(--border-light);
            padding: 1.5rem;
          }

          .settings-menu-list {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 0.5rem;
          }

          .settings-menu-item {
            white-space: nowrap;
            padding: 0.6rem 0.9rem;
            font-size: 0.85rem;
          }

          .settings-content-pane {
            padding: 1.5rem;
          }

          .settings-form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }
      `}</style>

      {/* Main Settings Card Layout */}
      <div className="landlord-settings-card">
        
        {/* Left Sidebar Menu */}
        <aside className="settings-sidebar-pane">
          <div className="settings-sidebar-header">
            <h3 className="settings-sidebar-title">Host Console</h3>
            <span className="settings-sidebar-subtitle">Manage rental parameters</span>
          </div>

          <ul className="settings-menu-list">
            <li 
              className={`settings-menu-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} /> Profile Settings
            </li>
            <li 
              className={`settings-menu-item ${activeTab === 'payout' ? 'active' : ''}`}
              onClick={() => setActiveTab('payout')}
            >
              <CreditCard size={18} /> Payout & Banking
            </li>
            <li 
              className={`settings-menu-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={18} /> Notifications
            </li>
            <li 
              className={`settings-menu-item ${activeTab === 'hosting' ? 'active' : ''}`}
              onClick={() => setActiveTab('hosting')}
            >
              <Settings size={18} /> Host Preferences
            </li>
            <li 
              className={`settings-menu-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Lock size={18} /> Security & Privacy
            </li>
            <li 
              className={`settings-menu-item ${activeTab === 'currency' ? 'active' : ''}`}
              onClick={() => setActiveTab('currency')}
            >
              <Globe size={18} /> Auto Currency & Location
            </li>
          </ul>
        </aside>

        {/* Right Settings Content View */}
        <main className="settings-content-pane">
          
          {/* Success Alerts */}
          {showSuccess && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              backgroundColor: 'var(--secondary-glow)', 
              border: '1px solid var(--secondary)', 
              color: '#065f46', 
              padding: '1rem', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '1.5rem', 
              animation: 'fadeSlideIn 0.3s ease' 
            }}>
              <CheckCircle size={20} style={{ color: 'var(--secondary)' }} />
              <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleLandlordSave} style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '480px' }}>
            
            {/* 1. PROFILE TAB */}
            {activeTab === 'profile' && (
              <div style={{ animation: 'fadeSlideIn 0.2s ease' }}>
                <div className="settings-pane-header">
                  <h3 className="settings-pane-title">Public Profile</h3>
                  <p className="settings-pane-subtitle">Control details displayed on your active listings and roommate responses.</p>
                </div>

                {/* Profile Picture upload area */}
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  
                  <div 
                    onClick={handleAvatarClick}
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      position: 'relative',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      border: '3px solid white',
                      boxShadow: 'var(--shadow-md)',
                      background: 'var(--bg-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    className="settings-avatar-container"
                  >
                    {llAvatar ? (
                      <img src={llAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={36} style={{ color: 'var(--text-light)' }} />
                    )}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                      background: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s ease', color: 'white'
                    }} className="settings-avatar-overlay">
                      <Camera size={18} />
                    </div>
                  </div>

                  <div>
                    <button 
                      type="button" 
                      onClick={handleAvatarClick}
                      className="btn-card-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: '600', border: '1px solid var(--border-light)', background: 'white' }}
                    >
                      Upload New Photo
                    </button>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.35rem' }}>PNG, JPG or JPEG. Max 2MB.</p>
                  </div>
                </div>

                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label className="settings-label"><User size={14} /> Full Name</label>
                    <input 
                      type="text" 
                      className="settings-input" 
                      value={llName} 
                      onChange={(e) => setLlName(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="settings-form-group">
                    <label className="settings-label"><Phone size={14} /> Phone Number</label>
                    <input 
                      type="tel" 
                      className="settings-input" 
                      value={llPhone} 
                      onChange={(e) => setLlPhone(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label className="settings-label"><Mail size={14} /> Email Address (Read-only)</label>
                    <input 
                      type="email" 
                      className="settings-input" 
                      value={currentUser.email} 
                      disabled 
                      style={{ background: '#f8fafc', cursor: 'not-allowed', opacity: 0.7 }} 
                    />
                  </div>
                  <div className="settings-form-group">
                    <label className="settings-label"><MapPin size={14} /> City/Location</label>
                    <input 
                      type="text" 
                      className="settings-input" 
                      value={llCity} 
                      onChange={(e) => setLlCity(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">Host Bio</label>
                  <textarea 
                    className="settings-textarea" 
                    rows="3" 
                    value={llBio} 
                    onChange={(e) => setLlBio(e.target.value)}
                    placeholder="Introduce yourself to student tenants..."
                  />
                </div>
              </div>
            )}

            {/* 2. PAYOUT & BANKING TAB */}
            {activeTab === 'payout' && (
              <div style={{ animation: 'fadeSlideIn 0.2s ease' }}>
                <div className="settings-pane-header">
                  <h3 className="settings-pane-title">Payout Configurations</h3>
                  <p className="settings-pane-subtitle">Configure mobile money numbers or bank details for collecting rent from student agreements.</p>
                </div>

                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label className="settings-label"><DollarSign size={14} /> Primary Payout Channel</label>
                    <select 
                      className="settings-select" 
                      value={payoutChannel} 
                      onChange={(e) => setPayoutChannel(e.target.value)}
                    >
                      <option value="bKash">bKash Mobile Wallet</option>
                      <option value="Nagad">Nagad Mobile Wallet</option>
                      <option value="Bank">Bank Account Payout</option>
                    </select>
                  </div>
                  
                  {payoutChannel !== 'Bank' ? (
                    <div className="settings-form-group">
                      <label className="settings-label"><Phone size={14} /> Mobile Account Number</label>
                      <input 
                        type="text" 
                        className="settings-input" 
                        value={payoutAccount} 
                        onChange={(e) => setPayoutAccount(e.target.value)} 
                        placeholder="+880 17XX-XXXXXX"
                      />
                    </div>
                  ) : (
                    <div className="settings-form-group">
                      <label className="settings-label"><User size={14} /> Account Holder Name</label>
                      <input 
                        type="text" 
                        className="settings-input" 
                        value={bankHolderName} 
                        onChange={(e) => setBankHolderName(e.target.value)} 
                      />
                    </div>
                  )}
                </div>

                {payoutChannel === 'Bank' && (
                  <div style={{ border: '1px solid var(--border-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', background: '#f8fafc', marginBottom: '1.5rem', animation: 'fadeSlideIn 0.2s ease' }}>
                    <h4 style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Landmark size={16} style={{ color: 'var(--primary)' }} /> Bank Details
                    </h4>
                    
                    <div className="settings-form-row" style={{ marginBottom: 0 }}>
                      <div className="settings-form-group">
                        <label className="settings-label">Bank Name</label>
                        <input 
                          type="text" 
                          className="settings-input" 
                          value={bankName} 
                          onChange={(e) => setBankName(e.target.value)} 
                        />
                      </div>
                      <div className="settings-form-group">
                        <label className="settings-label">Branch Name</label>
                        <input 
                          type="text" 
                          className="settings-input" 
                          value={bankBranch} 
                          onChange={(e) => setBankBranch(e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="settings-form-group" style={{ marginBottom: 0, marginTop: '1rem' }}>
                      <label className="settings-label">Bank Account Number</label>
                      <input 
                        type="text" 
                        className="settings-input" 
                        value={bankAccountNo} 
                        onChange={(e) => setBankAccountNo(e.target.value)} 
                      />
                    </div>
                  </div>
                )}

                <div className="switch-container">
                  <div className="switch-details">
                    <span className="switch-title">Instant Cash Payouts</span>
                    <span className="switch-desc">Automatically disburse rent payments to your active payout wallet immediately after students pay.</span>
                  </div>
                  <label className="custom-toggle">
                    <input 
                      type="checkbox" 
                      checked={instantPayout} 
                      onChange={(e) => setInstantPayout(e.target.checked)} 
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            )}

            {/* 3. NOTIFICATION PREFERENCES TAB */}
            {activeTab === 'notifications' && (
              <div style={{ animation: 'fadeSlideIn 0.2s ease' }}>
                <div className="settings-pane-header">
                  <h3 className="settings-pane-title">Notification Settings</h3>
                  <p className="settings-pane-subtitle">Choose how you wish to receive updates regarding property inquiries, payouts, and chats.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Core System Triggers</h4>
                  
                  <div className="switch-container">
                    <div className="switch-details">
                      <span className="switch-title">New Booking Requests</span>
                      <span className="switch-desc">Receive alerts immediately when a student or roommate group submits an application.</span>
                    </div>
                    <label className="custom-toggle">
                      <input 
                        type="checkbox" 
                        checked={notifBooking} 
                        onChange={(e) => setNotifBooking(e.target.checked)} 
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="switch-container">
                    <div className="switch-details">
                      <span className="switch-title">Rent & Ledger Payments</span>
                      <span className="switch-desc">Receive confirmations when a monthly rental payment invoice is successfully fulfilled.</span>
                    </div>
                    <label className="custom-toggle">
                      <input 
                        type="checkbox" 
                        checked={notifPayment} 
                        onChange={(e) => setNotifPayment(e.target.checked)} 
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="switch-container">
                    <div className="switch-details">
                      <span className="switch-title">Direct Messages & Chat Inquiries</span>
                      <span className="switch-desc">Receive notification sounds and indicators when tenants send message alerts.</span>
                    </div>
                    <label className="custom-toggle">
                      <input 
                        type="checkbox" 
                        checked={notifMessage} 
                        onChange={(e) => setNotifMessage(e.target.checked)} 
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Communication Channels</h4>
                  
                  <div className="switch-container">
                    <div className="switch-details">
                      <span className="switch-title">Email Notifications</span>
                      <span className="switch-desc">Forward summaries of important system alerts to your verified email account.</span>
                    </div>
                    <label className="custom-toggle">
                      <input 
                        type="checkbox" 
                        checked={notifEmail} 
                        onChange={(e) => setNotifEmail(e.target.checked)} 
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="switch-container">
                    <div className="switch-details">
                      <span className="switch-title">SMS / WhatsApp Text Alerts</span>
                      <span className="switch-desc">Send automated SMS pings for booking confirmations and urgent client notices.</span>
                    </div>
                    <label className="custom-toggle">
                      <input 
                        type="checkbox" 
                        checked={notifSms} 
                        onChange={(e) => setNotifSms(e.target.checked)} 
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 4. HOST PREFERENCES TAB */}
            {activeTab === 'hosting' && (
              <div style={{ animation: 'fadeSlideIn 0.2s ease' }}>
                <div className="settings-pane-header">
                  <h3 className="settings-pane-title">Hosting Preferences</h3>
                  <p className="settings-pane-subtitle">Establish booking automation thresholds, standard security policies, and lease rules.</p>
                </div>

                <div className="switch-container" style={{ marginBottom: '1.5rem' }}>
                  <div className="switch-details">
                    <span className="switch-title">Auto-Accept Qualified Booking Requests</span>
                    <span className="switch-desc">Automatically approve incoming bookings from students with verified profiles.</span>
                  </div>
                  <label className="custom-toggle">
                    <input 
                      type="checkbox" 
                      checked={autoAccept} 
                      onChange={(e) => setAutoAccept(e.target.checked)} 
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                {autoAccept && (
                  <div className="settings-form-group" style={{ animation: 'fadeSlideIn 0.2s ease' }}>
                    <label className="settings-label">
                      Auto-Approve Score Threshold (%) 
                      <span style={{ fontWeight: 'normal', color: 'var(--text-muted)', fontSize: '0.8rem' }}>(Requires score greater than this)</span>
                    </label>
                    <input 
                      type="number" 
                      min="70" 
                      max="100" 
                      className="settings-input" 
                      value={autoAcceptCompatibility}
                      onChange={(e) => setAutoAcceptCompatibility(parseInt(e.target.value))}
                    />
                  </div>
                )}

                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label className="settings-label">Security Deposit Period (Months)</label>
                    <select 
                      className="settings-select" 
                      value={defaultDepositMonths}
                      onChange={(e) => setDefaultDepositMonths(parseInt(e.target.value))}
                    >
                      <option value="1">1 Month Rent</option>
                      <option value="2">2 Months Rent (Standard)</option>
                      <option value="3">3 Months Rent (Premium)</option>
                    </select>
                  </div>
                  <div className="settings-form-group" style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: '#1e40af' }}>
                      <Info size={18} style={{ flexShrink: 0 }} />
                      <span>These values will set defaults when you build custom leases.</span>
                    </div>
                  </div>
                </div>

                <div className="settings-form-group">
                  <label className="settings-label"><FileText size={14} /> Default Tenancy Lease Terms</label>
                  <textarea 
                    className="settings-textarea" 
                    rows="4" 
                    value={defaultLeaseTerms}
                    onChange={(e) => setDefaultLeaseTerms(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* 5. SECURITY & PRIVACY TAB */}
            {activeTab === 'security' && (
              <div style={{ animation: 'fadeSlideIn 0.2s ease' }}>
                <div className="settings-pane-header">
                  <h3 className="settings-pane-title">Security & Privacy</h3>
                  <p className="settings-pane-subtitle">Manage authorization passwords, contact display configurations, and verification safety.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
                  <div className="switch-container">
                    <div className="switch-details">
                      <span className="switch-title">Hide Contact Number on Public Listings</span>
                      <span className="switch-desc">Mask your phone number in public searches. Checked tenants must initiate chat to request phone details.</span>
                    </div>
                    <label className="custom-toggle">
                      <input 
                        type="checkbox" 
                        checked={hidePhone} 
                        onChange={(e) => setHidePhone(e.target.checked)} 
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="switch-container">
                    <div className="switch-details">
                      <span className="switch-title">Enable Two-Factor Authentication (2FA)</span>
                      <span className="switch-desc">Add a temporary mobile OTP requirement when accessing billing ledgers or banking preferences.</span>
                    </div>
                    <label className="custom-toggle">
                      <input 
                        type="checkbox" 
                        checked={enableTwoFactor} 
                        onChange={(e) => setEnableTwoFactor(e.target.checked)} 
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div style={{ border: '1px solid var(--border-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', background: '#fff', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lock size={16} style={{ color: 'var(--danger)' }} /> Change Access Password
                  </h4>
                  
                  <div className="settings-form-group">
                    <label className="settings-label">Current Account Password</label>
                    <input 
                      type="password" 
                      className="settings-input" 
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>

                  <div className="settings-form-row" style={{ marginBottom: 0 }}>
                    <div className="settings-form-group">
                      <label className="settings-label">New Password</label>
                      <input 
                        type="password" 
                        className="settings-input" 
                        placeholder="Min 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="settings-form-group">
                      <label className="settings-label">Confirm New Password</label>
                      <input 
                        type="password" 
                        className="settings-input" 
                        placeholder="Re-type new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. AUTO CURRENCY & LOCATION TAB */}
            {activeTab === 'currency' && (
              <div style={{ animation: 'fadeSlideIn 0.2s ease' }}>
                <div className="settings-pane-header">
                  <h3 className="settings-pane-title">Auto Currency Based on User Location</h3>
                  <p className="settings-pane-subtitle">Automatically detect user country upon login and format all rental listing prices into local currency.</p>
                </div>

                <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', padding: '1.5rem', background: '#ffffff', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Globe size={18} style={{ color: 'var(--primary)' }} />
                        <h4 style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>
                          Auto Currency Based on User Location
                        </h4>
                        <span style={{ background: '#dbeafe', color: '#1d4ed8', fontWeight: '800', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '50px' }}>
                          Recommended
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: '1.4' }}>
                        When a user logs in: Bangladesh (৳150,000/mo), USA ($1,250/mo), UK (£930/mo), Europe (€1,080/mo).
                      </p>
                    </div>

                    <label className="custom-toggle" style={{ flexShrink: 0 }}>
                      <input 
                        type="checkbox" 
                        checked={autoCurrency} 
                        onChange={(e) => {
                          setAutoCurrency(e.target.checked);
                          localStorage.setItem('rentease_auto_currency', JSON.stringify(e.target.checked));
                        }} 
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  {/* Location Selector Dropdown */}
                  <div className="settings-form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="settings-label" style={{ fontSize: '0.8rem', fontWeight: '700' }}>
                      Simulated User Login Location / Currency Region
                    </label>
                    <select 
                      className="settings-select" 
                      style={{ fontSize: '0.85rem', fontWeight: '600' }}
                      value={selectedRegion} 
                      onChange={(e) => {
                        setSelectedRegion(e.target.value);
                        localStorage.setItem('rentease_selected_region', e.target.value);
                      }}
                    >
                      <option value="BD">🇧🇩 Bangladesh — Show ৳150,000/month</option>
                      <option value="US">🇺🇸 USA — Show $1,250/month</option>
                      <option value="GB">🇬🇧 UK — Show £930/month</option>
                      <option value="EU">🇪🇺 Europe — Show €1,080/month</option>
                    </select>
                  </div>

                  {/* Grid of Location & Currency Sample Display Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem' }}>
                    
                    <div 
                      style={{ 
                        padding: '1rem', 
                        borderRadius: '10px', 
                        border: selectedRegion === 'BD' ? '2px solid var(--primary)' : '1px solid var(--border-light)', 
                        background: selectedRegion === 'BD' ? '#eff6ff' : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'center'
                      }}
                      onClick={() => {
                        setSelectedRegion('BD');
                        localStorage.setItem('rentease_selected_region', 'BD');
                      }}
                    >
                      <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>🇧🇩 Bangladesh</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.35rem' }}>৳150,000/mo</div>
                    </div>

                    <div 
                      style={{ 
                        padding: '1rem', 
                        borderRadius: '10px', 
                        border: selectedRegion === 'US' ? '2px solid var(--primary)' : '1px solid var(--border-light)', 
                        background: selectedRegion === 'US' ? '#eff6ff' : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'center'
                      }}
                      onClick={() => {
                        setSelectedRegion('US');
                        localStorage.setItem('rentease_selected_region', 'US');
                      }}
                    >
                      <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>🇺🇸 USA</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.35rem' }}>$1,250/mo</div>
                    </div>

                    <div 
                      style={{ 
                        padding: '1rem', 
                        borderRadius: '10px', 
                        border: selectedRegion === 'GB' ? '2px solid var(--primary)' : '1px solid var(--border-light)', 
                        background: selectedRegion === 'GB' ? '#eff6ff' : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'center'
                      }}
                      onClick={() => {
                        setSelectedRegion('GB');
                        localStorage.setItem('rentease_selected_region', 'GB');
                      }}
                    >
                      <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>🇬🇧 UK</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.35rem' }}>£930/mo</div>
                    </div>

                    <div 
                      style={{ 
                        padding: '1rem', 
                        borderRadius: '10px', 
                        border: selectedRegion === 'EU' ? '2px solid var(--primary)' : '1px solid var(--border-light)', 
                        background: selectedRegion === 'EU' ? '#eff6ff' : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'center'
                      }}
                      onClick={() => {
                        setSelectedRegion('EU');
                        localStorage.setItem('rentease_selected_region', 'EU');
                      }}
                    >
                      <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>🇪🇺 Europe</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.35rem' }}>€1,080/mo</div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* Bottom Form Submission Buttons */}
            <footer className="save-bar">
              <button 
                type="button" 
                className="btn-ll-reset"
                onClick={() => {
                  if (window.confirm('Discard all unsaved settings changes?')) {
                    // Quick reload state from currentUser
                    setLlName(currentUser?.name || 'Mehadi Hasan');
                    setLlPhone(currentUser?.phone || '+880 1712-345678');
                    setLlCity(currentUser?.city || 'Dhaka');
                    setLlBio(currentUser?.bio || 'Professional student housing host in Mirpur, Dhaka. Dedicated to providing safe, comfortable, and study-friendly flats for BUBT students.');
                    setLlAvatar(currentUser?.avatar || '');
                    setPayoutChannel(currentUser?.paymentMethod || 'bKash');
                    setPayoutAccount(currentUser?.paymentAccount || '+880 1712-345678');
                    setBankName(currentUser?.bankName || 'City Bank PLC');
                    setBankBranch(currentUser?.bankBranch || 'Mirpur Branch');
                    setBankAccountNo(currentUser?.bankAccountNo || '2201992813123');
                    setBankHolderName(currentUser?.bankHolderName || currentUser?.name || 'Mehadi Hasan');
                    setInstantPayout(currentUser?.instantPayout !== false);
                    setNotifBooking(currentUser?.notifBooking !== false);
                    setNotifPayment(currentUser?.notifPayment !== false);
                    setNotifMessage(currentUser?.notifMessage !== false);
                    setNotifEmail(currentUser?.notifEmail !== false);
                    setNotifSms(currentUser?.notifSms !== false);
                    setAutoAccept(currentUser?.autoAccept || false);
                    setAutoAcceptCompatibility(currentUser?.autoAcceptCompatibility || 90);
                    setDefaultLeaseTerms(currentUser?.defaultLeaseTerms || 'The tenant agrees to keep the premises clean and pay utilities by the 10th of every month. No loud music or events are permitted after 11:00 PM.');
                    setDefaultDepositMonths(currentUser?.defaultDepositMonths || 2);
                    setHidePhone(currentUser?.hidePhone || false);
                    setEnableTwoFactor(currentUser?.enableTwoFactor || false);
                  }
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn-ll-save">
                Save Changes
              </button>
            </footer>
          </form>
        </main>
      </div>
    </div>
  );
}

export default SettingsPage;
