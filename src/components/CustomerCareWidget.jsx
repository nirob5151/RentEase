import { useState } from 'react';
import { Phone, X, MessageSquare, Mail, HelpCircle, Send, CheckCircle, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function CustomerCareWidget({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('hotlines'); // 'hotlines', 'report', 'callback'
  const [topic, setTopic] = useState('Booking Inquiry');
  const [phoneNum, setPhoneNum] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Complaint Form States
  const [reporterName, setReporterName] = useState(currentUser?.name || '');
  const [offenderName, setOffenderName] = useState('');
  const [complaintCategory, setComplaintCategory] = useState(currentUser?.role?.includes('Landlord') ? 'Property Damage' : 'Fake Listing / Scam');
  const [complaintDetails, setComplaintDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const handleSubmitCallback = (e) => {
    e.preventDefault();
    if (!phoneNum) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setPhoneNum('');
      setMessage('');
      setIsOpen(false);
    }, 3000);
  };

  const handleFileComplaint = (e) => {
    e.preventDefault();
    if (!reporterName || !offenderName || !complaintDetails) return;
    
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setOffenderName('');
      setComplaintDetails('');
      setIsOpen(false);
    }, 3500);
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div 
        className="customer-care-fab"
        onClick={() => setIsOpen(!isOpen)}
        title="Contact Customer Care & Report Complaints"
      >
        <div className="fab-pulse-wave"></div>
        <Phone size={24} style={{ color: 'white', transform: isOpen ? 'rotate(135deg)' : 'none', transition: 'transform 0.3s ease' }} />
      </div>

      {/* CSS Styles for Floating Button & Popover Modal */}
      <style>{`
        .customer-care-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #0f172a;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 9999;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .customer-care-fab:hover {
          transform: scale(1.1);
          background: #1e293b;
        }

        .fab-pulse-wave {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.35);
          animation: fabPulse 2s infinite ease-out;
          z-index: -1;
        }

        @keyframes fabPulse {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }

        .customer-care-modal {
          position: fixed;
          bottom: 92px;
          right: 24px;
          width: 380px;
          max-width: calc(100vw - 32px);
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--border-light);
          z-index: 9999;
          overflow: hidden;
          animation: popoverSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes popoverSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .care-modal-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .care-tab-row {
          display: flex;
          border-bottom: 1px solid var(--border-light);
          background: #f8fafc;
        }

        .care-tab-btn {
          flex: 1;
          padding: 0.65rem 0.35rem;
          border: none;
          background: none;
          font-size: 0.775rem;
          font-weight: 700;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .care-tab-btn.active {
          color: var(--primary);
          border-bottom: 2px solid var(--primary);
          background: white;
        }

        .hotline-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px solid var(--border-light);
          text-decoration: none;
          color: inherit;
          transition: all 0.2s ease;
        }

        .hotline-card:hover {
          background: #eff6ff;
          border-color: #bfdbfe;
        }
      `}</style>

      {/* Popover Card */}
      {isOpen && (
        <div className="customer-care-modal">
          {/* Header */}
          <div className="care-modal-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={18} style={{ color: '#38bdf8' }} />
                <h4 style={{ fontWeight: '800', fontSize: '1.05rem' }}>RentEase Customer Support</h4>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Hotlines & Admin Complaint Desk
              </p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="care-tab-row">
            <button 
              className={`care-tab-btn ${activeTab === 'hotlines' ? 'active' : ''}`}
              onClick={() => setActiveTab('hotlines')}
            >
              Hotlines
            </button>
            <button 
              className={`care-tab-btn ${activeTab === 'report' ? 'active' : ''}`}
              onClick={() => setActiveTab('report')}
              style={{ color: activeTab === 'report' ? 'var(--danger)' : '' }}
            >
              🚩 File Complaint
            </button>
            <button 
              className={`care-tab-btn ${activeTab === 'callback' ? 'active' : ''}`}
              onClick={() => setActiveTab('callback')}
            >
              Request Call
            </button>
          </div>

          {/* Tab 1: Hotlines & Live Support */}
          {activeTab === 'hotlines' && (
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Direct Phone Lines
              </span>

              <a href="tel:+8801700555111" className="hotline-card">
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>🎓 Student Housing Helpline</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>+880 1700-555111</div>
                  <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: '600' }}>● Available 24/7</span>
                </div>
              </a>

              <a href="tel:+8801800888222" className="hotline-card">
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>🏢 Landlord & Property Desk</div>
                  <div style={{ fontSize: '0.8rem', color: '#7e22ce', fontWeight: 'bold' }}>+880 1800-888222</div>
                  <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: '600' }}>● Available 9 AM - 10 PM</span>
                </div>
              </a>

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a href="mailto:support@rentease.com" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                  <Mail size={14} style={{ color: 'var(--primary)' }} />
                  <span>Email: <strong>support@rentease.com</strong></span>
                </a>
              </div>
            </div>
          )}

          {/* Tab 2: File Complaint / Report to Admin */}
          {activeTab === 'report' && (
            <div style={{ padding: '1.25rem' }}>
              {reportSubmitted ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={40} style={{ color: 'var(--secondary)' }} />
                  <h5 style={{ fontWeight: '800', fontSize: '1rem' }}>Complaint Logged with Admin!</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    RentEase Admin team will investigate and take immediate action within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFileComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', color: '#991b1b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <AlertTriangle size={14} /> File a Report / Complaint to Admin
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="filter-label" style={{ fontSize: '0.75rem' }}>Your Full Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ fontSize: '0.825rem', padding: '0.4rem 0.75rem' }}
                      value={reporterName} 
                      onChange={(e) => setReporterName(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="filter-label" style={{ fontSize: '0.75rem' }}>
                      {currentUser?.role?.includes('Landlord') ? 'Reported Student / Tenant Name' : 'Reported Landlord / Offender Name'}
                    </label>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ fontSize: '0.825rem', padding: '0.4rem 0.75rem' }}
                      placeholder={currentUser?.role?.includes('Landlord') ? "e.g. Sumon Paul" : "e.g. Mrs. Begum"}
                      value={offenderName} 
                      onChange={(e) => setOffenderName(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="filter-label" style={{ fontSize: '0.75rem' }}>Violation Category</label>
                    <select 
                      className="form-input" 
                      style={{ fontSize: '0.825rem', padding: '0.4rem 0.75rem' }}
                      value={complaintCategory} 
                      onChange={(e) => setComplaintCategory(e.target.value)}
                    >
                      {currentUser?.role?.includes('Landlord') ? (
                        <>
                          <option value="Property Damage">Property Damage</option>
                          <option value="Unpaid Utility / Rent Default">Unpaid Utility / Rent Default</option>
                          <option value="Tenant Harassment / Noise">Tenant Harassment / Noise</option>
                          <option value="Fake Student ID">Fake Student ID</option>
                        </>
                      ) : (
                        <>
                          <option value="Fake Listing / Scam">Fake Listing / Scam</option>
                          <option value="Poor Conditions / Broken Amenities">Poor Conditions / Broken Amenities</option>
                          <option value="Security Deposit Retention">Security Deposit Retention</option>
                          <option value="Landlord Harassment">Landlord Harassment</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="filter-label" style={{ fontSize: '0.75rem' }}>Describe Complaint & Evidence</label>
                    <textarea 
                      className="form-input" 
                      rows="2" 
                      style={{ fontSize: '0.825rem', padding: '0.4rem 0.75rem' }}
                      placeholder="Explain the incident details..." 
                      value={complaintDetails}
                      onChange={(e) => setComplaintDetails(e.target.value)}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-filter-apply" 
                    style={{ background: 'var(--danger)', justifyContent: 'center', padding: '0.5rem', marginTop: '0.25rem', fontSize: '0.85rem' }}
                  >
                    <ShieldAlert size={14} /> Submit Complaint
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Tab 3: Request Instant Callback Form */}
          {activeTab === 'callback' && (
            <div style={{ padding: '1.25rem' }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={40} style={{ color: 'var(--secondary)' }} />
                  <h5 style={{ fontWeight: '800', fontSize: '1rem' }}>Callback Request Logged!</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Our customer care agent will call your phone within 15 minutes.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitCallback} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="filter-label" style={{ fontSize: '0.75rem' }}>Support Category</label>
                    <select className="form-input" style={{ fontSize: '0.825rem', padding: '0.4rem 0.75rem' }} value={topic} onChange={(e) => setTopic(e.target.value)}>
                      <option value="Booking Inquiry">Booking Inquiry</option>
                      <option value="Roommate Matching Issue">Roommate Matching Issue</option>
                      <option value="Landlord Listing Help">Landlord Listing Help</option>
                      <option value="Payment & Payout Question">Payment & Payout Question</option>
                      <option value="Urgent Complaint">Urgent Complaint</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="filter-label" style={{ fontSize: '0.75rem' }}>Your Contact Phone Number</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      style={{ fontSize: '0.825rem', padding: '0.4rem 0.75rem' }}
                      placeholder="e.g. 01700000000" 
                      value={phoneNum}
                      onChange={(e) => setPhoneNum(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="filter-label" style={{ fontSize: '0.75rem' }}>Brief Message / Question (Optional)</label>
                    <textarea 
                      className="form-input" 
                      rows="2" 
                      style={{ fontSize: '0.825rem', padding: '0.4rem 0.75rem' }}
                      placeholder="Describe your issue..." 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-filter-apply" style={{ justifyContent: 'center', padding: '0.5rem', marginTop: '0.25rem', fontSize: '0.85rem' }}>
                    <Send size={14} /> Request Call Back
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
