import React, { useState } from 'react';
import { Printer, FileText, CheckCircle } from 'lucide-react';

function ContractBuilder({ currentUser }) {
  const [landlordName, setLandlordName] = useState('Abdur Rahman');
  const [tenantName, setTenantName] = useState(currentUser.name);
  const [address, setAddress] = useState('Mirpur 2, Dhaka (Near BUBT Campus)');
  const [rent, setRent] = useState('8,500');
  const [advance, setAdvance] = useState('17,000');
  const [commenceDate, setCommenceDate] = useState('June 01, 2026');
  const [duration, setDuration] = useState('12 Months');
  const [terms, setTerms] = useState('The tenant agrees to keep the premises clean and pay the utilities (electricity, internet, and water bills) by the 10th of every month. No loud music or parties are allowed after 11:00 PM.');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', background: 'white', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Interactive Rental Agreement Builder</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Quickly generate formal tenancy contracts. Fill in the fields below to customize terms. Press print to save the output directly as a PDF.
        </p>
      </div>

      <div className="contract-split">
        {/* Form fields */}
        <section className="glass-panel" style={{ padding: '2rem', background: 'white', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} style={{ color: 'var(--primary)' }} /> Contract Details
          </h3>
          
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="filter-label">Landlord Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={landlordName} 
                onChange={(e) => setLandlordName(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="filter-label">Tenant Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={tenantName} 
                onChange={(e) => setTenantName(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="filter-label">Property Address</label>
              <input 
                type="text" 
                className="form-input" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="filter-label">Monthly Rent (BDT)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={rent} 
                  onChange={(e) => setRent(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="filter-label">Security Deposit (BDT)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={advance} 
                  onChange={(e) => setAdvance(e.target.value)} 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="filter-label">Start Date</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={commenceDate} 
                  onChange={(e) => setCommenceDate(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="filter-label">Lease Term</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={duration} 
                  onChange={(e) => setDuration(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="filter-label">Special Terms & Covenants</label>
              <textarea 
                className="form-input" 
                rows="4" 
                value={terms} 
                onChange={(e) => setTerms(e.target.value)}
                style={{ resize: 'none' }}
              ></textarea>
            </div>

            <button 
              type="button" 
              className="btn-filter-apply" 
              style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem' }} 
              onClick={handlePrint}
            >
              <Printer size={18} /> Print / Download PDF
            </button>
          </form>
        </section>

        {/* Live print preview */}
        <section className="contract-preview-container" style={{ border: '1px solid var(--border-light)' }}>
          <div className="contract-header">
            <h1 className="contract-title">House Tenancy Agreement</h1>
            <p style={{ fontSize: '0.8rem', letterSpacing: '2px', color: '#666', marginTop: '0.25rem' }}>LEGAL BINDING DOCUMENT</p>
          </div>

          <div className="contract-body">
            <p className="contract-clause">
              This Tenancy Agreement is entered into on this day of <span className="contract-underline">{commenceDate}</span> by and between:
            </p>

            <p className="contract-clause" style={{ textIndent: '2rem' }}>
              <strong>LANDLORD:</strong> <span className="contract-underline">{landlordName}</span>, hereinafter referred to as the First Party (Owner).
            </p>
            
            <p className="contract-clause" style={{ textIndent: '2rem', marginBottom: '2rem' }}>
              <strong>TENANT:</strong> <span className="contract-underline">{tenantName}</span>, hereinafter referred to as the Second Party (Student).
            </p>

            <p className="contract-clause">
              <strong>1. PROPERTY DESCRIPTION:</strong> The Owner hereby leases to the Tenant the housing accommodation located at: <span className="contract-underline">{address}</span>.
            </p>

            <p className="contract-clause">
              <strong>2. LEASE TERM:</strong> The tenancy shall commence on <span className="contract-underline">{commenceDate}</span> and remain in effect for a total duration of <span className="contract-underline">{duration}</span>.
            </p>

            <p className="contract-clause">
              <strong>3. MONTHLY RENT & ADVANCE:</strong> The Tenant agrees to pay a monthly rent of <span className="contract-underline">{rent} BDT</span> due on or before the 5th day of each calendar month. The Tenant has deposited an advance security amount of <span className="contract-underline">{advance} BDT</span> which shall be refundable at the termination of the lease, subject to normal wear and tear deductions.
            </p>

            <p className="contract-clause">
              <strong>4. UTILITIES AND MAINTENANCE:</strong> The Tenant shall be responsible for paying utility bills. Major repairs shall be borne by the Landlord, while minor day-to-day maintenance shall be handled by the Tenant.
            </p>

            <p className="contract-clause">
              <strong>5. COVENANTS AND CONDUCT:</strong> <span className="contract-underline">{terms}</span>
            </p>

            <p className="contract-clause" style={{ marginTop: '2.5rem' }}>
              IN WITNESS WHEREOF, the parties hereto have signed this Agreement on the date first written above.
            </p>

            <div className="contract-signatures">
              <div className="signature-line">
                <p><strong>First Party (Landlord)</strong></p>
                <p style={{ fontSize: '0.7rem', color: '#888', marginTop: '0.25rem' }}>Signature & Date</p>
              </div>
              <div className="signature-line">
                <p><strong>Second Party (Tenant)</strong></p>
                <p style={{ fontSize: '0.7rem', color: '#888', marginTop: '0.25rem' }}>Signature & Date</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ContractBuilder;
