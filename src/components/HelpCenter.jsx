import React, { useState } from 'react';
import { 
  HelpCircle, MessageSquare, AlertTriangle, ShieldCheck, FileText, 
  ChevronDown, ChevronUp, Send, CheckCircle, Mail, Phone, Clock
} from 'lucide-react';

function HelpCenter({ currentUser }) {
  const [activeTab, setActiveTab] = useState('support');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  
  // Form states
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  
  const [problemCategory, setProblemCategory] = useState('Payment Issue');
  const [problemDescription, setProblemDescription] = useState('');
  const [problemSubmitted, setProblemSubmitted] = useState(false);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportMessage.trim()) return;
    setSupportSubmitted(true);
    setTimeout(() => {
      setSupportSubmitted(false);
      setSupportSubject('');
      setSupportMessage('');
    }, 3000);
  };

  const handleProblemSubmit = (e) => {
    e.preventDefault();
    if (!problemDescription.trim()) return;
    setProblemSubmitted(true);
    setTimeout(() => {
      setProblemSubmitted(false);
      setProblemDescription('');
    }, 3000);
  };

  const faqs = [
    {
      q: "How do I verify my Student ID status?",
      a: "Go to your Profile page from the sidebar menu, fill in your details, and upload a clear scan of your official University Student ID card. Our administrative staff at CSE BUBT will inspect and approve the request within 24 hours."
    },
    {
      q: "Is the security deposit fully refundable?",
      a: "Yes. Under standard RentEase contracts, the security deposit is fully refundable at the end of your lease term, subject to inspections to verify there are no property damages."
    },
    {
      q: "How do I pay my monthly rent?",
      a: "Your landlord creates an invoice invoice directly in the Payments portal. You can view payment details, confirm the payout via the landlord's mobile wallet (bKash/Nagad) or bank details, and upload the confirmation reference code."
    },
    {
      q: "How does the Roommate Matching system work?",
      a: "You complete a roommate quiz describing your lifestyle (sleeping patterns, study habits, campus proximity, cleanliness). Our system compares your profile against other students in the dataset and computes compatibility scores (e.g. 95% compatibility)."
    },
    {
      q: "Can landlords draft custom tenancy leases?",
      a: "Yes! Landlords can use our Tenancy Contracts builder tool directly in their portal to customize terms, dates, and rent pricing, compile a PDF preview, and print it out."
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Title header */}
      <div className="glass-panel" style={{ padding: '2rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          RentEase Help Center & Support
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Get immediate assistance, search frequently asked questions, or inspect platform legal guidelines.
        </p>
      </div>

      <div className="contract-split" style={{ gridTemplateColumns: '250px 1fr' }}>
        
        {/* Help Center Sidebar Nav */}
        <aside className="glass-panel" style={{ padding: '1rem', background: 'white', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          {[
            { id: 'support', label: 'Contact Support', icon: MessageSquare },
            { id: 'problem', label: 'Report a Problem', icon: AlertTriangle },
            { id: 'faq', label: 'FAQs', icon: HelpCircle },
            { id: 'terms', label: 'Terms & Conditions', icon: FileText },
            { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  borderRadius: '6px',
                  background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                  fontWeight: activeTab === tab.id ? '700' : '500',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <Icon size={18} /> {tab.label}
              </button>
            );
          })}
        </aside>

        {/* Content Pane */}
        <div style={{ minWidth: 0 }}>
          
          {/* 1. CONTACT SUPPORT TAB */}
          {activeTab === 'support' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
              <section className="glass-panel" style={{ padding: '2rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <h3 style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Send Support Ticket</h3>
                
                {supportSubmitted ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem 1rem', textAlign: 'center' }}>
                    <CheckCircle size={48} style={{ color: 'var(--secondary)' }} />
                    <h4 style={{ fontSize: '1.25rem' }}>Ticket Created Successfully</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Our administrative team will review your query and reach back within 12 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSupportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label className="filter-label">Your Name</label>
                      <input type="text" className="form-input" value={currentUser?.name || ''} disabled />
                    </div>
                    
                    <div className="form-group">
                      <label className="filter-label">Subject *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Inquiring about Student Verification status" 
                        className="form-input"
                        value={supportSubject}
                        onChange={(e) => setSupportSubject(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="filter-label">Detailed Message *</label>
                      <textarea 
                        placeholder="Explain your inquiry in detail..." 
                        className="form-input" 
                        rows="5"
                        style={{ resize: 'none' }}
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="btn-filter-apply" style={{ justifyContent: 'center', padding: '0.75rem' }}>
                      Submit Support Ticket <Send size={16} style={{ marginLeft: '0.5rem' }} />
                    </button>
                  </form>
                )}
              </section>

              {/* Support info card */}
              <section className="glass-panel" style={{ padding: '1.5rem', background: 'white', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <h4 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Admin Contact Info</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Mail size={16} style={{ color: 'var(--primary)' }} />
                    <span>support@rentease.com</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Phone size={16} style={{ color: 'var(--primary)' }} />
                    <span>+880 1712-987654</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Clock size={16} style={{ color: 'var(--primary)' }} />
                    <span>Office: Sat-Thu, 9 AM - 6 PM</span>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--primary-light)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Developed by CSE BUBT Intake 51/8 Students for campus accommodation management.
                </div>
              </section>
            </div>
          )}

          {/* 2. REPORT A PROBLEM TAB */}
          {activeTab === 'problem' && (
            <section className="glass-panel" style={{ padding: '2rem', background: 'white', maxWidth: '650px', margin: '0 auto', width: '100%', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <h3 style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Report a System Issue / Bug</h3>
              
              {problemSubmitted ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem 1rem', textAlign: 'center' }}>
                  <CheckCircle size={48} style={{ color: 'var(--secondary)' }} />
                  <h4 style={{ fontSize: '1.25rem' }}>Problem Report Logged</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Thank you. Our engineering team has been notified of the error trace.</p>
                </div>
              ) : (
                <form onSubmit={handleProblemSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="filter-label">Issue Category *</label>
                    <select className="form-input" value={problemCategory} onChange={(e) => setProblemCategory(e.target.value)}>
                      <option value="Payment Issue">Rent Payment / Invoice error</option>
                      <option value="Fake Listing">Fake / Misleading listing report</option>
                      <option value="Verification Fail">Student ID upload failure</option>
                      <option value="Interface Glitch">Layout / UI visual error</option>
                      <option value="Other">Other System Problem</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="filter-label">Problem Description *</label>
                    <textarea 
                      placeholder="Please describe what happened, steps to reproduce, or any error messages shown..." 
                      className="form-input" 
                      rows="5"
                      style={{ resize: 'none' }}
                      value={problemDescription}
                      onChange={(e) => setProblemDescription(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn-filter-apply" style={{ background: 'var(--danger)', color: 'white', justifyContent: 'center', padding: '0.75rem' }}>
                    Submit Problem Report
                  </button>
                </form>
              )}
            </section>
          )}

          {/* 3. FAQS TAB */}
          {activeTab === 'faq' && (
            <section className="glass-panel" style={{ padding: '2rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Frequently Asked Questions</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {faqs.map((faq, i) => (
                  <div 
                    key={i} 
                    style={{ border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden' }}
                  >
                    <div 
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: openFaqIndex === i ? '#f8fafc' : 'white', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem' }}
                      onClick={() => toggleFaq(i)}
                    >
                      {faq.q}
                      {openFaqIndex === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                    {openFaqIndex === i && (
                      <div style={{ padding: '1rem 1.25rem', background: 'white', borderTop: '1px solid var(--border-light)', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. TERMS & CONDITIONS TAB */}
          {activeTab === 'terms' && (
            <section className="glass-panel" style={{ padding: '2.5rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Terms & Conditions</h3>
              
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'justify' }}>
                <p>
                  Welcome to RentEase. By accessing or using our university housing portal, roommate finder utilities, and contract management tools, you agree to comply with and be bound by the following Terms of Use.
                </p>
                
                <h4 style={{ color: 'var(--text-main)', fontWeight: '700', marginTop: '0.5rem' }}>1. Platform Eligibility</h4>
                <p>
                  To list properties or search listings, roommates, or contracts, users must register accounts using valid credentials. Students seeking verified accommodation badges must verify their academic identity by uploading their official university student ID card scans.
                </p>

                <h4 style={{ color: 'var(--text-main)', fontWeight: '700', marginTop: '0.5rem' }}>2. Accurate Information</h4>
                <p>
                  Landlords agree to publish accurate property titles, rents, descriptions, deposits, and nearby university proximity details. Misleading descriptions, fraudulent pricing, or fake images are strictly prohibited and subject to immediate administrative suspension.
                </p>

                <h4 style={{ color: 'var(--text-main)', fontWeight: '700', marginTop: '0.5rem' }}>3. Agreement Drafting</h4>
                <p>
                  Lease deeds drafted on the platform are formal templates created for convenience. RentEase does not assume liability for agreement breaches between landlords and students.
                </p>
              </div>
            </section>
          )}

          {/* 5. PRIVACY POLICY TAB */}
          {activeTab === 'privacy' && (
            <section className="glass-panel" style={{ padding: '2.5rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Privacy & Data Policy</h3>
              
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'justify' }}>
                <p>
                  RentEase takes personal privacy seriously. This Policy describes what data we store, how we protect it, and the data ownership rights of our students and host members.
                </p>
                
                <h4 style={{ color: 'var(--text-main)', fontWeight: '700', marginTop: '0.5rem' }}>1. Information We Collect</h4>
                <p>
                  We collect account data (name, email, password), identity files (scans of BUBT Student IDs, landlord NIDs, bank payment details, and bills), and chat history.
                </p>

                <h4 style={{ color: 'var(--text-main)', fontWeight: '700', marginTop: '0.5rem' }}>2. Data Protection & Sharing</h4>
                <p>
                  Identity verifications (like student card scans or property deeds) are strictly confidential. They are only shared with authorized system administrators for host status approvals.
                </p>

                <h4 style={{ color: 'var(--text-main)', fontWeight: '700', marginTop: '0.5rem' }}>3. Local Browser Storage</h4>
                <p>
                  Dynamic portal configurations, chats, bills, and notifications are stored locally in the browser's `localStorage` state for layout performance, and can be cleared in settings.
                </p>
              </div>
            </section>
          )}

        </div>
      </div>

    </div>
  );
}

export default HelpCenter;
