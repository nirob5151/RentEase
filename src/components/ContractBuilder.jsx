import React, { useState, useEffect } from 'react';
import { Printer, FileText, CheckCircle, PenTool, Download, ShieldCheck, Clock } from 'lucide-react';
import { dbService } from '../database/supabaseClient';
import { downloadSignedContract } from '../utils/contractGenerator';

function ContractBuilder({ currentUser }) {
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [studentSignatureInput, setStudentSignatureInput] = useState(currentUser?.name || '');
  const [signedSuccess, setSignedSuccess] = useState(false);

  const isStudent = !currentUser?.role?.includes('Landlord') && !currentUser?.role?.includes('Admin');
  const userEmail = (currentUser?.email || '').toLowerCase().trim();
  const userName = (currentUser?.name || '').toLowerCase().trim();

  useEffect(() => {
    async function loadContracts() {
      const allContracts = await dbService.getContracts();
      if (Array.isArray(allContracts)) {
        // Filter contracts related to current user
        const userContracts = allContracts.filter(c => {
          if (!c) return false;
          const sEmail = (c.studentEmail || c.student_email || '').toLowerCase().trim();
          const sName = (c.studentName || c.student_name || c.tenantName || '').toLowerCase().trim();
          const lEmail = (c.landlordEmail || c.landlord_email || '').toLowerCase().trim();
          const lName = (c.landlordName || c.landlord_name || '').toLowerCase().trim();

          if (userEmail && (sEmail === userEmail || lEmail === userEmail)) return true;
          if (userName && (sName === userName || lName === userName)) return true;
          return true;
        });
        setContracts(userContracts);
        if (userContracts.length > 0) {
          setSelectedContract(userContracts[0]);
        }
      }
    }
    loadContracts();
  }, [currentUser]);

  const handleStudentSign = async (e) => {
    e.preventDefault();
    if (!selectedContract) return;
    if (!studentSignatureInput.trim()) {
      alert('Please type your full name in the signature field before confirming.');
      return;
    }

    const updatedContracts = await dbService.signContract(selectedContract.id, studentSignatureInput);
    const updatedContract = updatedContracts.find(c => c.id === selectedContract.id) || {
      ...selectedContract,
      status: 'signed',
      studentSignatureName: studentSignatureInput,
      signedAt: new Date().toISOString()
    };

    setSelectedContract(updatedContract);
    setContracts(updatedContracts);
    setSignedSuccess(true);

    // Notify Landlord
    const landlordEmail = selectedContract.landlordEmail || selectedContract.landlord_email;
    dbService.addNotification({
      id: 'notif_' + Date.now(),
      type: 'contract',
      title: 'Tenancy Contract Signed! ✍️',
      message: `Student ${currentUser.name} signed the tenancy agreement for "${selectedContract.propertyTitle || selectedContract.propertyAddress}".`,
      desc: `Student ${currentUser.name} signed the tenancy agreement for "${selectedContract.propertyTitle || selectedContract.propertyAddress}".`,
      user_email: landlordEmail,
      time: 'Just now',
      read: false
    });

    // Notify Student
    dbService.addNotification({
      id: 'notif_' + Date.now(),
      type: 'contract',
      title: 'Lease Contract Fully Signed! 🎉',
      message: `You signed the tenancy contract for "${selectedContract.propertyTitle || selectedContract.propertyAddress}". Both parties have signed. Download PDF available anytime.`,
      desc: `Contract signed by both parties. Download PDF available anytime.`,
      user_email: currentUser.email,
      time: 'Just now',
      read: false
    });

    alert('Contract signed successfully! Generating your official signed PDF receipt...');
    downloadSignedContract(updatedContract);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet" />

      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '2rem', background: 'white', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', borderRadius: '12px' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: '800' }}>Rental Contracts & Digital Lease Signing</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Review landlord agreement terms, type your legal digital signature, and download officially verified tenancy contracts.
        </p>
      </div>

      {contracts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', background: 'white', textAlign: 'center', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <FileText size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>No Active Tenancy Contracts</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Once a landlord approves your housing booking, they will issue a formal lease contract for your digital signature here.
          </p>
        </div>
      ) : (
        <div className="contract-split" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
          {/* Left Sidebar: Contract Selection List */}
          <div className="glass-panel" style={{ padding: '1.25rem', background: 'white', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              Your Contracts ({contracts.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {contracts.map(c => (
                <div 
                  key={c.id} 
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    border: selectedContract?.id === c.id ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                    background: selectedContract?.id === c.id ? '#eff6ff' : '#f8fafc',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setSelectedContract(c);
                    setSignedSuccess(false);
                  }}
                >
                  <div style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {c.propertyTitle || c.propertyAddress || c.title || 'Lease Contract'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Landlord: {c.landlordName || c.landlord_name || 'Landlord Owner'}
                  </div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '0.72rem', 
                      fontWeight: '800', 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '50px',
                      background: (c.status === 'signed' || c.status === 'Active') ? '#d1fae5' : '#fef3c7',
                      color: (c.status === 'signed' || c.status === 'Active') ? '#065f46' : '#b45309'
                    }}>
                      {(c.status === 'signed' || c.status === 'Active') ? '✓ Fully Signed' : '⏳ Pending Signature'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Contract Review & Digital Signing */}
          {selectedContract && (
            <div className="glass-panel" style={{ padding: '2.5rem', background: 'white', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
              
              {/* Document Header */}
              <div style={{ borderBottom: '2px double #1e293b', paddingBottom: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '900', textTransform: 'uppercase', fontFamily: 'serif', letterSpacing: '0.5px' }}>
                  HOUSE TENANCY DEED AGREEMENT
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', letterSpacing: '1px', marginTop: '0.25rem' }}>
                  RENT EASE LEGAL FRAMEWORK • BUBT SENIOR INTAKE 51/8
                </div>
              </div>

              {/* Terms Body */}
              <div style={{ fontSize: '0.9rem', lineHeight: '1.7', fontFamily: 'serif', color: '#1e293b', display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                <div>
                  <strong>1. PARTIES TO AGREEMENT:</strong><br />
                  This Lease Agreement is entered into between First Party Landlord <strong>{selectedContract.landlordName || selectedContract.landlord_name || 'Landlord Owner'}</strong> and Second Party Student Tenant <strong>{selectedContract.studentName || selectedContract.student_name || selectedContract.tenantName || currentUser.name}</strong>.
                </div>

                <div>
                  <strong>2. PROPERTY & RENT COVENANTS:</strong><br />
                  • <strong>Leased Address:</strong> {selectedContract.propertyAddress || selectedContract.property_address || selectedContract.propertyTitle || 'Mirpur 2, Dhaka'}<br />
                  • <strong>Monthly Rent:</strong> ৳ {(Number(selectedContract.monthlyRent || selectedContract.monthly_rent || selectedContract.rent) || 8500).toLocaleString()} BDT / month<br />
                  • <strong>Security Deposit:</strong> ৳ {(Number(selectedContract.securityDeposit || selectedContract.security_deposit || selectedContract.deposit) || 17000).toLocaleString()} BDT (Refundable)<br />
                  • <strong>Term Period:</strong> {selectedContract.commenceDate || selectedContract.commence_date || '2026-07-01'} to {selectedContract.expiryDate || selectedContract.expiry_date || '2027-06-30'}
                </div>

                <div>
                  <strong>3. SPECIAL TERMS & RULES:</strong><br />
                  {selectedContract.specialTerms || selectedContract.special_terms || selectedContract.terms || 'The tenant agrees to keep the premises clean and pay utility bills by the 10th of every month. No loud music or unauthorized parties after 11:00 PM.'}
                </div>
              </div>

              {/* Signature Blocks Display */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Landlord Signature (First Party)
                  </div>
                  <div style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive", fontSize: '1.8rem', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', minHeight: '45px' }}>
                    {selectedContract.landlordSignatureName || selectedContract.landlord_signature_name || selectedContract.landlordName || selectedContract.landlord_name || 'Landlord Signature'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '700', marginTop: '0.35rem' }}>
                    ✓ Landlord Signed & Certified
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Student Signature (Second Party)
                  </div>
                  {(selectedContract.status === 'signed' || selectedContract.status === 'Active' || selectedContract.studentSignatureName || selectedContract.student_signature_name) ? (
                    <>
                      <div style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive", fontSize: '1.8rem', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', minHeight: '45px' }}>
                        {selectedContract.studentSignatureName || selectedContract.student_signature_name || currentUser.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '700', marginTop: '0.35rem' }}>
                        ✓ Student Signed on {selectedContract.signedAt || selectedContract.signed_at ? new Date(selectedContract.signedAt || selectedContract.signed_at).toLocaleDateString() : 'Today'}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontStyle: 'italic', color: '#94a3b8', fontSize: '0.9rem', borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.5rem', minHeight: '45px', display: 'flex', alignItems: 'flex-end' }}>
                      ⏳ Pending Student Signature Below
                    </div>
                  )}
                </div>
              </div>

              {/* Signature Action Bar */}
              {(selectedContract.status === 'signed' || selectedContract.status === 'Active' || selectedContract.studentSignatureName) ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ecfdf5', padding: '1.25rem', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CheckCircle size={28} style={{ color: '#047857' }} />
                    <div>
                      <h4 style={{ fontWeight: '800', color: '#065f46', fontSize: '1rem' }}>Lease Agreement Fully Executed</h4>
                      <p style={{ fontSize: '0.8rem', color: '#047857' }}>Signed by both Landlord and Student. You can re-download this contract PDF anytime.</p>
                    </div>
                  </div>
                  <button className="btn-filter-apply" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#059669' }} onClick={() => downloadSignedContract(selectedContract)}>
                    <Download size={16} /> Download Signed PDF
                  </button>
                </div>
              ) : isStudent ? (
                <form onSubmit={handleStudentSign} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#eff6ff', padding: '1.5rem', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                  <h4 style={{ fontWeight: '800', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <PenTool size={18} /> Digital Signature Authorization
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#1e3a8a' }}>
                    By typing your full name below, you confirm that you have read and agree to all tenancy covenants and terms above.
                  </p>

                  <div className="form-group">
                    <label className="filter-label" style={{ color: '#1e40af' }}>Type Your Full Legal Name (Signature Preview):</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive", fontSize: '1.6rem', padding: '0.6rem 1rem', background: 'white' }}
                      value={studentSignatureInput} 
                      onChange={(e) => setStudentSignatureInput(e.target.value)} 
                      required 
                    />
                  </div>

                  <button type="submit" className="btn-filter-apply" style={{ padding: '0.85rem', justifyContent: 'center', fontSize: '1rem', background: '#1d4ed8' }}>
                    ✍️ Confirm & Sign Tenancy Contract
                  </button>
                </form>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef3c7', padding: '1.25rem', borderRadius: '10px', border: '1px solid #fde68a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Clock size={24} style={{ color: '#b45309' }} />
                    <div>
                      <h4 style={{ fontWeight: '800', color: '#92400e', fontSize: '0.95rem' }}>Awaiting Student Signature</h4>
                      <p style={{ fontSize: '0.8rem', color: '#b45309' }}>Tenant has been notified. Once signed, the final contract PDF will be available for download.</p>
                    </div>
                  </div>
                  <button className="btn-card-secondary" style={{ background: 'white', border: '1px solid #fde68a' }} onClick={() => downloadSignedContract(selectedContract)}>
                    <Download size={16} /> Preview Draft PDF
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ContractBuilder;
