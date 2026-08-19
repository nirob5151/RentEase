import React, { useState, useEffect } from 'react';
import { dbService, isConfigured } from '../database/supabaseClient';
import { 
  Database, RefreshCw, Download, RotateCcw, X, Search, CheckCircle2, 
  Building, Users, FileText, CreditCard, MessageSquare, ShieldCheck, Copy, Check
} from 'lucide-react';

function DatabaseViewer({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('listings');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  // Table Data States
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  const fetchAllTables = async () => {
    setLoading(true);
    const [lData, bData, pData, cData] = await Promise.all([
      dbService.getListings(),
      dbService.getBookings(),
      dbService.getPayments(),
      dbService.getChats()
    ]);
    setListings(lData || []);
    setBookings(bData || []);
    setPayments(pData || []);
    setChats(cData || []);
    setLoading(false);
  };

  const handleSeedDatabase = async () => {
    setLoading(true);
    const res = await dbService.seedAllDatabaseTables();
    setSeedMsg(res.message);
    await fetchAllTables();
    setLoading(false);
    setTimeout(() => setSeedMsg(''), 4000);
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllTables();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const exportJsonData = () => {
    const fullDbData = {
      listings,
      bookings,
      payments,
      chats,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(fullDbData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rentease_database_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const sqlSchemaCode = `-- RentEase PostgreSQL Schema for Supabase SQL Editor

-- 1. Create Listings Table
CREATE TABLE IF NOT EXISTS listings (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  price NUMERIC NOT NULL,
  type VARCHAR(100),
  facilities TEXT[],
  verified BOOLEAN DEFAULT true,
  image TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(100) PRIMARY KEY,
  tenant_name VARCHAR(255),
  tenant_email VARCHAR(255),
  property_title VARCHAR(255),
  price NUMERIC,
  status VARCHAR(50) DEFAULT 'Pending',
  date DATE DEFAULT CURRENT_DATE
);

-- 3. Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(100) PRIMARY KEY,
  receipt_id VARCHAR(100),
  tenant_name VARCHAR(255),
  property_title VARCHAR(255),
  amount NUMERIC,
  month VARCHAR(100),
  status VARCHAR(50),
  date DATE DEFAULT CURRENT_DATE
);
`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchemaCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 20000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        width: '100%',
        maxWidth: '1080px',
        maxHeight: '90vh',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid var(--border-light)'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--primary-glow)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Database size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                RentEase Database Inspector
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '20px',
                  background: isConfigured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 82, 204, 0.12)',
                  color: isConfigured ? '#059669' : 'var(--primary)',
                  fontWeight: 700,
                  border: isConfigured ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--primary-glow)'
                }}>
                  {isConfigured ? '🟢 Supabase Cloud Active' : '⚡ Local + Cloud DB Ready'}
                </span>
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                Live database collection browser and SQL schema exporter
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={fetchAllTables}
              style={{
                background: 'white',
                border: '1px solid var(--border-light)',
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
            </button>

            <button
              onClick={exportJsonData}
              style={{
                background: 'white',
                border: '1px solid var(--border-light)',
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Download size={14} /> Export JSON
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '50%'
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          borderBottom: '1px solid var(--border-light)',
          padding: '0 1rem',
          gap: '0.5rem',
          overflowX: 'auto'
        }}>
          <button
            onClick={() => setActiveTab('listings')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: activeTab === 'listings' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'listings' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Building size={16} /> Listings ({listings.length})
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: activeTab === 'bookings' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'bookings' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <FileText size={16} /> Bookings ({bookings.length})
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: activeTab === 'payments' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'payments' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <CreditCard size={16} /> Payments ({payments.length})
          </button>

          <button
            onClick={() => setActiveTab('chats')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: activeTab === 'chats' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'chats' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <MessageSquare size={16} /> Messages ({chats.length})
          </button>

          <button
            onClick={() => setActiveTab('sql_schema')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: activeTab === 'sql_schema' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'sql_schema' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginLeft: 'auto'
            }}
          >
            <ShieldCheck size={16} /> Supabase SQL Schema
          </button>
        </div>

        {/* Modal Main Content Pane */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
          
          {/* LISTINGS TABLE VIEW */}
          {activeTab === 'listings' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Table: <code>listings</code> ({listings.length} rows)
                </span>
              </div>
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
                    <tr>
                      <th style={{ padding: '0.65rem 1rem' }}>ID</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Title</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Location</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Price</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Type</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Verified</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Landlord</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map(row => (
                      <tr key={row.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '0.65rem 1rem', fontWeight: 700 }}>#{row.id}</td>
                        <td style={{ padding: '0.65rem 1rem', fontWeight: 600, color: 'var(--primary)' }}>{row.title}</td>
                        <td style={{ padding: '0.65rem 1rem' }}>{row.location}</td>
                        <td style={{ padding: '0.65rem 1rem', fontWeight: 700 }}>৳{row.price}</td>
                        <td style={{ padding: '0.65rem 1rem' }}>{row.type}</td>
                        <td style={{ padding: '0.65rem 1rem' }}>
                          <span style={{ color: row.verified ? '#059669' : '#d97706', fontWeight: 700 }}>
                            {row.verified ? '✓ Verified' : '🟡 Unverified'}
                          </span>
                        </td>
                        <td style={{ padding: '0.65rem 1rem' }}>{row.landlord?.name || 'Mehadi'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BOOKINGS TABLE VIEW */}
          {activeTab === 'bookings' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Table: <code>bookings</code> ({bookings.length} rows)
                </span>
              </div>
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
                    <tr>
                      <th style={{ padding: '0.65rem 1rem' }}>Booking ID</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Tenant Name</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Property</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Monthly Rent</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(row => (
                      <tr key={row.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '0.65rem 1rem', fontWeight: 700 }}>{row.id}</td>
                        <td style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>{row.tenantName}</td>
                        <td style={{ padding: '0.65rem 1rem', color: 'var(--primary)' }}>{row.propertyTitle}</td>
                        <td style={{ padding: '0.65rem 1rem', fontWeight: 700 }}>৳{row.price}</td>
                        <td style={{ padding: '0.65rem 1rem' }}>
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: row.status === 'Confirmed' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                            color: row.status === 'Confirmed' ? '#059669' : '#d97706'
                          }}>
                            {row.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.65rem 1rem', color: 'var(--text-muted)' }}>{row.date || '2026-07-02'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAYMENTS TABLE VIEW */}
          {activeTab === 'payments' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Table: <code>payments</code> ({payments.length} rows)
                </span>
              </div>
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
                    <tr>
                      <th style={{ padding: '0.65rem 1rem' }}>Receipt No</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Tenant</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Property</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Amount</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Month</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(row => (
                      <tr key={row.id || row.receiptId} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '0.65rem 1rem', fontWeight: 700, color: 'var(--primary)' }}>{row.receiptId || row.receiptNo}</td>
                        <td style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>{row.tenantName}</td>
                        <td style={{ padding: '0.65rem 1rem' }}>{row.propertyTitle || row.property}</td>
                        <td style={{ padding: '0.65rem 1rem', fontWeight: 700 }}>৳{row.amount}</td>
                        <td style={{ padding: '0.65rem 1rem' }}>{row.month}</td>
                        <td style={{ padding: '0.65rem 1rem' }}>
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: row.status === 'Paid' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                            color: row.status === 'Paid' ? '#059669' : '#d97706'
                          }}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CHATS TABLE VIEW */}
          {activeTab === 'chats' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Table: <code>chats</code> ({chats.length} threads)
                </span>
              </div>
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
                    <tr>
                      <th style={{ padding: '0.65rem 1rem' }}>Chat ID</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Contact Name</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Last Message</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chats.map(row => (
                      <tr key={row.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '0.65rem 1rem', fontWeight: 700 }}>{row.id}</td>
                        <td style={{ padding: '0.65rem 1rem', fontWeight: 600, color: 'var(--primary)' }}>{row.name}</td>
                        <td style={{ padding: '0.65rem 1rem', color: 'var(--text-muted)' }}>"{row.lastMessage}"</td>
                        <td style={{ padding: '0.65rem 1rem' }}>{row.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUPABASE SQL SCHEMA EXPORTER */}
          {activeTab === 'sql_schema' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                    Supabase PostgreSQL Table Generator Code
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                    Paste this SQL query into your Supabase project's SQL Editor to instantiate cloud tables.
                  </p>
                </div>

                <button
                  onClick={copySqlToClipboard}
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  {copiedSql ? <Check size={16} /> : <Copy size={16} />}
                  {copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}
                </button>
              </div>

              <pre style={{
                background: '#0f172a',
                color: '#38bdf8',
                padding: '1.25rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                overflowX: 'auto',
                lineHeight: 1.5,
                border: '1px solid #1e293b'
              }}>
                {sqlSchemaCode}
              </pre>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default DatabaseViewer;
