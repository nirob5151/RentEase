/**
 * RentEase Official Payment Receipt Generator & PDF Downloader Utility
 */

export function generatePaymentReceiptHtml(payment) {
  const receiptId = payment.receiptId || payment.receiptNo || payment.receipt_id || ('REC-' + Math.floor(100000 + Math.random() * 900000));
  const dateStr = payment.date || payment.paymentDate || payment.payment_date || new Date().toISOString().split('T')[0];
  const amountStr = (Number(payment.amount) || 0).toLocaleString();

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>RentEase Payment Receipt - ${receiptId}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 40px; }
    .receipt-card { max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0052cc; padding-bottom: 20px; margin-bottom: 25px; }
    .logo { font-size: 26px; font-weight: 800; color: #0052cc; text-transform: uppercase; letter-spacing: 1px; }
    .status-badge { background: #d1fae5; color: #065f46; font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 50px; text-transform: uppercase; }
    .receipt-title { font-size: 16px; font-weight: 700; color: #64748b; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .receipt-id { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 25px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; background: #f1f5f9; padding: 20px; border-radius: 8px; }
    .info-label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
    .info-value { font-size: 15px; color: #0f172a; font-weight: 700; }
    .amount-box { background: #0052cc; color: #ffffff; padding: 22px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
    .amount-label { font-size: 13px; text-transform: uppercase; opacity: 0.9; margin-bottom: 5px; font-weight: 600; }
    .amount-val { font-size: 34px; font-weight: 800; }
    .footer { text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; line-height: 1.5; }
    .no-print-btn { display: block; margin: 0 auto 20px auto; background: #0052cc; color: white; border: none; padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: bold; cursor: pointer; }
    @media print { body { background: white; padding: 0; } .receipt-card { border: none; box-shadow: none; } .no-print-btn { display: none; } }
  </style>
</head>
<body>
  <button class="no-print-btn" onclick="window.print()">🖨️ Print / Save as PDF Receipt</button>
  <div class="receipt-card">
    <div class="header">
      <div class="logo">RentEase</div>
      <div class="status-badge">✓ PAYMENT CONFIRMED</div>
    </div>
    <div class="receipt-title">Official Rent Payment Receipt</div>
    <div class="receipt-id">${receiptId}</div>

    <div class="info-grid">
      <div>
        <div class="info-label">Tenant Name</div>
        <div class="info-value">${payment.tenantName || payment.studentName || payment.tenant_name || 'Student Tenant'}</div>
      </div>
      <div>
        <div class="info-label">Payment Date</div>
        <div class="info-value">${dateStr}</div>
      </div>
      <div>
        <div class="info-label">Property Description</div>
        <div class="info-value">${payment.propertyTitle || payment.property || payment.property_title || 'Student Housing Unit'}</div>
      </div>
      <div>
        <div class="info-label">Billing Month</div>
        <div class="info-value">${payment.month || payment.billing_month || 'Current Month'}</div>
      </div>
      <div>
        <div class="info-label">Security Deposit Status</div>
        <div class="info-value">${payment.depositStatus || payment.deposit_status || 'Refundable'}</div>
      </div>
      <div>
        <div class="info-label">Payment Channel</div>
        <div class="info-value">${payment.paymentMethod || payment.payment_method || 'bKash Mobile Wallet / Bank Transfer'}</div>
      </div>
    </div>

    <div class="amount-box">
      <div class="amount-label">Total Amount Paid</div>
      <div class="amount-val">৳ ${amountStr} BDT</div>
    </div>

    <div class="footer">
      <p><strong>RentEase Student Housing & Lease Management System</strong> • BUBT Senior Intake 51/8</p>
      <p>Verified electronic payment receipt. Certified for university housing records.</p>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`;
}

export function downloadPaymentReceipt(payment) {
  if (!payment) return;
  const htmlContent = generatePaymentReceiptHtml(payment);
  const win = window.open('', '_blank');
  if (win) {
    win.document.open();
    win.document.write(htmlContent);
    win.document.close();
  }
}
