/**
 * RentEase Official Tenancy Lease Contract PDF Generator Utility
 */

export function generateContractHtml(contract) {
  const contractId = contract.id || 'CONTRACT-' + Math.floor(100000 + Math.random() * 900000);
  const landlordSig = contract.landlordSignatureName || contract.landlord_signature_name || contract.landlordName || contract.landlord_name || 'Landlord Signature';
  const studentSig = contract.studentSignatureName || contract.student_signature_name || contract.studentName || contract.student_name || '';
  const isSigned = contract.status === 'signed' || contract.status === 'Active' || Boolean(studentSig);

  const rentVal = (Number(contract.monthlyRent || contract.monthly_rent || contract.rent) || 8500).toLocaleString();
  const depositVal = (Number(contract.securityDeposit || contract.security_deposit || contract.deposit || contract.advance) || 17000).toLocaleString();

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Tenancy Lease Agreement - ${contractId}</title>
  <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Times New Roman', Times, serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 40px; }
    .contract-container { max-width: 750px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; padding: 50px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { text-align: center; border-bottom: 2px double #0f172a; padding-bottom: 15px; margin-bottom: 30px; }
    .title { font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; }
    .subtitle { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px; }
    .section { margin-bottom: 25px; line-height: 1.7; font-size: 14px; text-align: justify; }
    .section-title { font-size: 15px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 10px; color: #0f172a; }
    .term-list { padding-left: 20px; }
    .term-list li { margin-bottom: 8px; }
    .signatures-block { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 25px; }
    .signature-box { display: flex; flex-direction: column; gap: 8px; }
    .signature-label { font-size: 12px; font-weight: bold; color: #475569; text-transform: uppercase; }
    .typed-signature { font-family: 'Dancing Script', 'Brush Script MT', cursive; font-size: 28px; color: #0f172a; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; min-height: 40px; }
    .unsigned-badge { font-style: italic; color: #94a3b8; font-size: 13px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px; min-height: 40px; display: flex; align-items: flex-end; }
    .footer { text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 40px; }
    .no-print-btn { display: block; margin: 0 auto 20px auto; background: #0052cc; color: white; border: none; padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: bold; cursor: pointer; }
    @media print { body { background: white; padding: 0; } .contract-container { border: none; box-shadow: none; padding: 0; } .no-print-btn { display: none; } }
  </style>
</head>
<body>
  <button class="no-print-btn" onclick="window.print()">🖨️ Print / Save Signed Lease PDF</button>
  <div class="contract-container">
    <div class="header">
      <div class="title">House Tenancy Deed Agreement</div>
      <div class="subtitle">RentEase Verified Student Housing Legal Framework</div>
    </div>

    <div class="section">
      <div class="section-title">1. Contracting Parties</div>
      <p>This Tenancy Lease Agreement is made and entered into by and between:</p>
      <p><strong>FIRST PARTY (Landlord Owner):</strong> ${contract.landlordName || contract.landlord_name || 'Landlord'}<br/>
      <strong>SECOND PARTY (Student Tenant):</strong> ${contract.studentName || contract.student_name || contract.tenantName || 'Student'}</p>
    </div>

    <div class="section">
      <div class="section-title">2. Leased Premises & Financial Terms</div>
      <p>The Landlord agrees to let and the Tenant agrees to take the residential property located at:<br/>
      <strong>${contract.propertyAddress || contract.property_address || contract.address || contract.propertyTitle || 'Mirpur 2, Dhaka (Near BUBT Campus)'}</strong></p>
      <ul class="term-list">
        <li><strong>Monthly Rent Amount:</strong> ৳ ${rentVal} BDT per month (payable by the 10th of each calendar month).</li>
        <li><strong>Security Deposit Held:</strong> ৳ ${depositVal} BDT (refundable upon clean lease expiry).</li>
        <li><strong>Lease Duration:</strong> Commencement date ${contract.commenceDate || contract.commence_date || contract.startDate || '2026-07-01'} until expiry date ${contract.expiryDate || contract.expiry_date || contract.endDate || '2027-06-30'}.</li>
      </ul>
    </div>

    <div class="section">
      <div class="section-title">3. House Rules & Special Covenants</div>
      <p>${contract.specialTerms || contract.special_terms || contract.terms || 'The tenant agrees to keep the premises clean and pay utility bills by the 10th of every month. No loud music or unauthorized guests after 11:00 PM.'}</p>
    </div>

    <div class="signatures-block">
      <div class="signature-box">
        <div class="signature-label">Landlord Signature (First Party)</div>
        <div class="typed-signature">${landlordSig}</div>
        <div style="font-size: 11px; color: #64748b;">Digitally Signed & Certified</div>
      </div>

      <div class="signature-box">
        <div class="signature-label">Student Signature (Second Party)</div>
        ${isSigned ? `
          <div class="typed-signature">${studentSig}</div>
          <div style="font-size: 11px; color: #065f46; font-weight: bold;">✓ Signed on ${contract.signedAt || contract.signed_at ? new Date(contract.signedAt || contract.signed_at).toLocaleDateString() : new Date().toLocaleDateString()}</div>
        ` : `
          <div class="unsigned-badge">⏳ Pending Student Signature</div>
        `}
      </div>
    </div>

    <div class="footer">
      <p><strong>RentEase Student Housing & Lease Management System</strong> • BUBT Senior Intake 51/8</p>
      <p>Electronic Tenancy Contract • Contract Reference ID: ${contractId}</p>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`;
}

export function downloadSignedContract(contract) {
  if (!contract) return;
  const htmlContent = generateContractHtml(contract);
  const win = window.open('', '_blank');
  if (win) {
    win.document.open();
    win.document.write(htmlContent);
    win.document.close();
  }
}
