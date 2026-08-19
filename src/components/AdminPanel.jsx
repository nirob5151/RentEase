import { useState, useEffect } from 'react';
import { dbService } from '../database/supabaseClient';
import { getAvatarUrl } from '../utils/profileCompleteness';
import { 
  Users, Home, ShieldCheck, Calendar, FileText, CreditCard, 
  Star, AlertCircle, BarChart3, Bell, Settings, Lock, 
  Database, User, ShieldAlert, CheckCircle, RefreshCw, X, 
  Trash2, UserX, UserCheck, Eye, EyeOff, Search, FileDown, 
  AlertTriangle, Play, HelpCircle, Save, Plus, ArrowUpRight, Zap,
  Camera, Pencil, Upload, Image
} from 'lucide-react';

export default function AdminPanel({ currentUser, activeTab: propActiveTab = 'dashboard', onTabChange, listings = [], onEditListing, onDeleteListing, onSaveSettings }) {
  
  // Role Permission Guard Helpers
  const isSuperAdmin = currentUser?.role?.includes('Super Admin');
  const isSupportStaff = currentUser?.role?.includes('Support Staff');
  const isStandardAdmin = currentUser?.role?.includes('Admin Account');

  // Convert app.jsx currentPage name to internal tab name
  let activeTab = 'dashboard';
  if (propActiveTab === 'dashboard') activeTab = 'dashboard';
  else if (propActiveTab === 'admin_users') activeTab = 'users';
  else if (propActiveTab === 'admin_properties') activeTab = 'properties';
  else if (propActiveTab === 'admin_verification') activeTab = 'verification';
  else if (propActiveTab === 'admin_bookings') activeTab = 'bookings';
  else if (propActiveTab === 'admin_contracts') activeTab = 'contracts';
  else if (propActiveTab === 'admin_payments') activeTab = 'payments';
  else if (propActiveTab === 'admin_reviews') activeTab = 'reviews';
  else if (propActiveTab === 'admin_reports') activeTab = 'reports';
  else if (propActiveTab === 'admin_analytics') activeTab = 'analytics';
  else if (propActiveTab === 'admin_notifications') activeTab = 'notifications';
  else if (propActiveTab === 'admin_content') activeTab = 'content';
  else if (propActiveTab === 'admin_settings') activeTab = 'settings';
  else if (propActiveTab === 'admin_security') activeTab = 'security';
  else if (propActiveTab === 'admin_audit') activeTab = 'audit';
  else if (propActiveTab === 'admin_backup') activeTab = 'backup';
  else if (propActiveTab === 'admin_profile') activeTab = 'profile';

  // Helper tab routing callback
  const handleTabSelect = (tab) => {
    let appPage = 'dashboard';
    if (tab === 'dashboard') appPage = 'dashboard';
    else if (tab === 'users') appPage = 'admin_users';
    else if (tab === 'properties') appPage = 'admin_properties';
    else if (tab === 'verification') appPage = 'admin_verification';
    else if (tab === 'bookings') appPage = 'admin_bookings';
    else if (tab === 'contracts') appPage = 'admin_contracts';
    else if (tab === 'payments') appPage = 'admin_payments';
    else if (tab === 'reviews') appPage = 'admin_reviews';
    else if (tab === 'reports') appPage = 'admin_reports';
    else if (tab === 'analytics') appPage = 'admin_analytics';
    else if (tab === 'notifications') appPage = 'admin_notifications';
    else if (tab === 'content') appPage = 'admin_content';
    else if (tab === 'settings') appPage = 'admin_settings';
    else if (tab === 'security') appPage = 'admin_security';
    else if (tab === 'audit') appPage = 'admin_audit';
    else if (tab === 'backup') appPage = 'admin_backup';
    else if (tab === 'profile') appPage = 'admin_profile';
    onTabChange(appPage);
  };

  // --- STATE SEEDING & SIMULATIONS ---
  
  // 1. Audit Logs State
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, admin: 'Super Admin (Root)', action: 'Suspended Landlord: Abdur Rahman', date: '2026-07-23 09:12 AM', ip: '192.168.1.45' },
    { id: 2, admin: 'System Admin', action: 'Approved Property: Dhaka Rent', date: '2026-07-22 04:30 PM', ip: '192.168.1.12' },
    { id: 3, admin: 'Super Admin (Root)', action: 'Changed Roommate Matching rules configuration weights', date: '2026-07-22 10:15 AM', ip: '192.168.1.45' },
    { id: 4, admin: 'Support Staff', action: 'Resolved Complaint Case #4102', date: '2026-07-21 02:44 PM', ip: '192.168.1.92' },
    { id: 5, admin: 'System Admin', action: 'Approved Landlord Registration: Mehadi Hasan', date: '2026-07-21 11:20 AM', ip: '10.0.0.12' },
  ]);

  const addAuditLog = (action) => {
    const newLog = {
      id: Date.now(),
      admin: currentUser?.name || 'Admin',
      action,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      ip: '192.168.1.' + Math.floor(10 + Math.random() * 90)
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Admin Profile Edit State
  const [adminAvatar, setAdminAvatar] = useState(currentUser?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80');
  const [adminName, setAdminName] = useState(currentUser?.name || 'Super Admin (Root)');
  const [adminPhone, setAdminPhone] = useState(currentUser?.phone || '+880 1900-112233');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Student & Landlord ID Document Verification Queue State
  const [pendingIdVerifications, setPendingIdVerifications] = useState([]);
  const [rejectionModalItem, setRejectionModalItem] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  const fetchPendingVerifications = () => {
    dbService.getPendingIdVerifications().then(list => {
      setPendingIdVerifications(list || []);
    });
  };

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const handleReviewIdAction = async (item, action) => {
    if (action === 'reject') {
      setRejectionModalItem(item);
      setRejectionReasonInput('');
      return;
    }

    if (window.confirm(`Are you sure you want to APPROVE ID verification for ${item.user_name} (${item.user_email})?`)) {
      await dbService.reviewIdVerification(item.id, item.user_email, 'approve');
      addAuditLog(`Approved ID Verification for: ${item.user_name} (${item.user_email})`);
      alert(`🎉 ID verification APPROVED for ${item.user_name}! In-App alert and status email dispatched.`);
      fetchPendingVerifications();
    }
  };

  const handleConfirmRejection = async () => {
    if (!rejectionReasonInput.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }
    await dbService.reviewIdVerification(rejectionModalItem.id, rejectionModalItem.user_email, 'reject', rejectionReasonInput.trim());
    addAuditLog(`Rejected ID Verification for: ${rejectionModalItem.user_name} (${rejectionModalItem.user_email}). Reason: ${rejectionReasonInput.trim()}`);
    alert(`❌ ID verification REJECTED for ${rejectionModalItem.user_name}. Reason & notifications dispatched.`);
    setRejectionModalItem(null);
    setRejectionReasonInput('');
    fetchPendingVerifications();
  };

  const presetAdminAvatars = [
    { label: 'Executive Female', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80' },
    { label: 'Executive Male', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80' },
    { label: 'Tech Admin', url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&h=200&q=80' },
    { label: 'Creative Lead', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80' },
    { label: 'Student Admin', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80' }
  ];

  // 2. User Management state
  const [users, setUsers] = useState([
    { id: '22235103412', name: 'Ashikur Rahman', email: 'ashik@cse.bubt.edu.bd', role: 'Student', status: 'Active', identity: 'Verified', university: 'BUBT' },
    { id: '22235103467', name: 'Anas Ahmed', email: 'anas@cse.bubt.edu.bd', role: 'Student', status: 'Active', identity: 'Verified', university: 'BUBT' },
    { id: '22235103496', name: 'Nirob Ahmed', email: 'nirob@cse.bubt.edu.bd', role: 'Student', status: 'Active', identity: 'Verified', university: 'BUBT' },
    { id: 'LND-992813', name: 'Mehadi Hasan', email: 'mehadi@rentease.com', role: 'Landlord', status: 'Active', identity: 'Verified', listings: 3 },
    { id: 'LND-992011', name: 'Abdur Rahman', email: 'abdur@rentease.com', role: 'Landlord', status: 'Active', identity: 'Pending Approval', listings: 1 },
    { id: 'LND-881232', name: 'Mrs. Begum', email: 'begum@rentease.com', role: 'Landlord', status: 'Suspended', identity: 'Unverified', listings: 1 },
  ]);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('All'); // 'All', 'Student', 'Landlord'

  const toggleUserStatus = (userIdOrName, name) => {
    const searchTarget = (name || userIdOrName).toLowerCase();
    setUsers(prev => prev.map(u => {
      if (u.id === userIdOrName || u.name.toLowerCase().includes(searchTarget) || searchTarget.includes(u.name.toLowerCase())) {
        const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        addAuditLog(`${nextStatus === 'Suspended' ? 'Suspended' : 'Unsuspended'} user Account: ${u.name}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const suspendOffenderAccount = (reportedName, reportId) => {
    const searchTarget = reportedName.toLowerCase();
    setUsers(prev => prev.map(u => {
      if (u.name.toLowerCase().includes(searchTarget) || searchTarget.includes(u.name.toLowerCase()) || u.id === reportedName) {
        addAuditLog(`Admin Action: Suspended Offender Account ${u.name} (Case #${reportId})`);
        return { ...u, status: 'Suspended' };
      }
      return u;
    }));

    resolveReport(reportId, 'Offender Suspended');
    alert(`🚫 Account "${reportedName}" has been SUSPENDED!\nAll platform access and listings for ${reportedName} have been disabled.`);
  };

  const deleteUser = (userId, name) => {
    if (window.confirm(`Are you sure you want to permanently delete user: ${name}?`)) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      addAuditLog(`Permanently deleted user: ${name} (${userId})`);
    }
  };

  const approveUserIdentity = (userId, name) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        addAuditLog(`Manually verified identity credentials for: ${name}`);
        return { ...u, identity: 'Verified' };
      }
      return u;
    }));
  };

  // 3. Property Verification List
  const [pendingProperties, setPendingProperties] = useState([
    { id: 101, title: 'Mirpur 11 Sublet Room', landlord: 'Mrs. Begum', address: 'Mirpur 11, Dhaka', docs: 'Deeds_MrsBegum.pdf', utilityBill: 'Gas_Bill_July2026.jpg', status: 'Pending Review' },
    { id: 102, title: 'Mirpur 6 Premium Bachelor Suite', landlord: 'Mehadi Hasan', address: 'Mirpur 6, Dhaka', docs: 'Deed_Mehadi_Hasan.pdf', utilityBill: 'Electric_Bill_July.jpg', status: 'Pending Review' }
  ]);

  const verifyPropertyAction = (id, title, action) => {
    // Approve or reject
    if (action === 'Approve') {
      addAuditLog(`Approved property listing verification: "${title}"`);
      alert(`Property "${title}" approved successfully!`);
    } else {
      addAuditLog(`Rejected property listing verification: "${title}"`);
      alert(`Property "${title}" verification rejected.`);
    }
    setPendingProperties(prev => prev.filter(p => p.id !== id));
  };

  // 4. Reports & Complaints (Submitted by Students & Landlords to Admin)
  const [reports, setReports] = useState([
    { id: 4101, complainantRole: 'Student', reporter: 'Ashikur Rahman', reported: 'Mrs. Begum', targetRole: 'Landlord', reason: 'Poor Property Conditions', description: 'The property lacks generator support though listed and lift works intermittently.', date: '2026-07-22', status: 'Open' },
    { id: 4102, complainantRole: 'Student', reporter: 'Nirob Ahmed', reported: 'Mrs. Begum', targetRole: 'Landlord', reason: 'Fake Listings', description: 'Listing images of Mirpur 11 room are copied from online hotel directories.', date: '2026-07-21', status: 'Investigating' },
    { id: 4103, complainantRole: 'Landlord', reporter: 'Mehadi Hasan', reported: 'Sumon Paul', targetRole: 'Student', reason: 'Inappropriate Messages', description: 'Tenant sends inappropriate texts in direct chat logs.', date: '2026-07-19', status: 'Closed' },
    { id: 4104, complainantRole: 'Student', reporter: 'Anas Ahmed', reported: 'Abdur Rahman', targetRole: 'Landlord', reason: 'Deposit Retention Scam', description: 'Landlord refused to refund security deposit after lease ended with clean inspection.', date: '2026-07-23', status: 'Open' },
    { id: 4105, complainantRole: 'Landlord', reporter: 'Mehadi Hasan', reported: 'Nirob Ahmed', targetRole: 'Student', reason: 'Property Damages', description: 'Student tenant caused physical damage to air conditioner unit without reporting.', date: '2026-07-20', status: 'Open' }
  ]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportCategoryFilter, setReportCategoryFilter] = useState('All'); // 'All', 'Student', 'Landlord'

  const resolveReport = (id, action) => {
    setReports(prev => prev.map(r => {
      if (r.id === id) {
        addAuditLog(`Admin Action: ${action} for complaint Case #${id}`);
        return { ...r, status: action };
      }
      return r;
    }));
    setSelectedReport(null);
  };

  // 5. System Settings State
  const [siteName, setSiteName] = useState('RentEase Platform');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [weightCleanliness, setWeightCleanliness] = useState(25);
  const [weightStudyHabits, setWeightStudyHabits] = useState(25);
  const [weightBudget, setWeightBudget] = useState(30);
  const [weightSchedules, setWeightSchedules] = useState(20);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const saveSettings = (e) => {
    e.preventDefault();
    if (isSupportStaff) return alert('Error: Support Staff role lacks permissions to edit system settings.');
    
    addAuditLog(`Updated general system preferences and weights matching parameters`);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // 6. Security Management & Sub-Admin Role Access Control
  const [enableAdmin2FA, setEnableAdmin2FA] = useState(false);
  const [failedAttempts] = useState([
    { id: 1, ip: '185.220.101.44', time: '2026-07-23 04:12 AM', username: 'admin_test' },
    { id: 2, ip: '92.44.122.9', time: '2026-07-22 09:30 PM', username: 'root_admin' }
  ]);

  // Sub-Admins Management state (Super Admin Access Control)
  const [subAdmins, setSubAdmins] = useState([
    {
      id: 'sub_101',
      name: 'Verification Officer Nirob',
      email: 'nirob.subadmin@rentease.com',
      role: 'Sub-Admin (Verification Officer)',
      status: 'Active',
      permissions: {
        properties: true,
        verification: true,
        payments: false,
        users: true,
        database: false
      }
    },
    {
      id: 'sub_102',
      name: 'Finance & Payment Auditor Sumon',
      email: 'sumon.subadmin@rentease.com',
      role: 'Sub-Admin (Payment Auditor)',
      status: 'Active',
      permissions: {
        properties: false,
        verification: false,
        payments: true,
        users: false,
        database: false
      }
    }
  ]);

  const [showAddSubAdminModal, setShowAddSubAdminModal] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubRole, setNewSubRole] = useState('Sub-Admin (Moderator)');
  const [newSubPerms, setNewSubPerms] = useState({
    properties: true,
    verification: true,
    payments: false,
    users: true,
    database: false
  });

  const handleAddSubAdminSubmit = (e) => {
    e.preventDefault();
    if (!newSubName || !newSubEmail) return alert('Please enter Sub-Admin name and email address.');
    const newSub = {
      id: 'sub_' + Math.floor(1000 + Math.random() * 9000),
      name: newSubName,
      email: newSubEmail.toLowerCase(),
      role: newSubRole,
      status: 'Active',
      permissions: { ...newSubPerms }
    };
    setSubAdmins(prev => [newSub, ...prev]);
    addAuditLog(`Super Admin created new Sub-Admin: ${newSubName} (${newSubEmail})`);
    setShowAddSubAdminModal(false);
    setNewSubName('');
    setNewSubEmail('');
    alert(`✓ Sub-Admin "${newSubName}" added successfully with custom module permissions!`);
  };

  const toggleSubAdminStatus = (id) => {
    setSubAdmins(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'Active' ? 'Suspended' : 'Active';
        addAuditLog(`Super Admin ${nextStatus === 'Suspended' ? 'suspended' : 'activated'} Sub-Admin: ${s.name}`);
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const deleteSubAdmin = (id, name) => {
    if (window.confirm(`Are you sure you want to delete Sub-Admin account for ${name}?`)) {
      setSubAdmins(prev => prev.filter(s => s.id !== id));
      addAuditLog(`Super Admin deleted Sub-Admin account: ${name}`);
    }
  };

  // 7. Booking Disputes
  const [disputes, setDisputes] = useState([
    { id: 'dsp_1', bookingId: 'req_1', tenantName: 'Ashikur Rahman', landlordName: 'Mehadi Hasan', propertyTitle: 'Dhaka Rent', price: 1250, status: 'Active dispute' }
  ]);

  const resolveDisputeAction = (id, action) => {
    setDisputes(prev => prev.filter(d => d.id !== id));
    addAuditLog(`Resolved dispute for booking id ${id}: mark as ${action}`);
    alert(`Dispute ${id} resolved with action: ${action}`);
  };

  // 8. Payment Ledger & Commission
  const [payments, setPayments] = useState([
    { id: 'txn_101', tenant: 'Ashikur Rahman', amount: 1250, commission: 62.5, date: '2026-07-15', status: 'Verified' },
    { id: 'txn_102', tenant: 'Anas Ahmed', amount: 850, commission: 42.5, date: '2026-07-12', status: 'Refund Pending' },
    { id: 'txn_103', tenant: 'Sumon Paul', amount: 500, commission: 25.0, date: '2026-07-10', status: 'Verified' }
  ]);

  const triggerRefund = (id, tenant) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'Refunded' } : p));
    addAuditLog(`Approved rental invoice refund for transaction ${id} of ${tenant}`);
    alert(`Refund processed for transaction ${id}`);
  };

  // 9. Backups
  const [backups, setBackups] = useState([
    { name: 'rentease_db_backup_20260722.sql', size: '24.5 MB', date: '2026-07-22 11:59 PM', type: 'Auto' },
    { name: 'rentease_db_backup_20260715.sql', size: '24.1 MB', date: '2026-07-15 11:59 PM', type: 'Auto' }
  ]);

  const createBackup = () => {
    const newB = {
      name: `rentease_db_backup_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.sql`,
      size: '24.8 MB',
      date: new Date().toISOString().slice(0, 10) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'Manual'
    };
    setBackups(prev => [newB, ...prev]);
    addAuditLog(`Triggered manual database snapshot: ${newB.name}`);
    alert('Manual backup completed successfully!');
  };

  // 10. Content CMS States
  const [homeBannerText, setHomeBannerText] = useState('Find Campus Housing and Compatible Roommates easily.');
  const [faqTitle, setFaqTitle] = useState('How does identity verification work?');
  const [faqAns, setFaqAns] = useState('Students submit university email/IDs. Landlords submit official ownership deeds scans.');

  // 11. Broadcast alerts
  const [broadcastTarget, setBroadcastTarget] = useState('all');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');

  const sendBroadcastAlert = (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMsg) return;
    
    addAuditLog(`Broadcasted system alert to target audience: "${broadcastTarget}"`);
    alert(`Broadcast alert sent to all: ${broadcastTarget}`);
    setBroadcastTitle('');
    setBroadcastMsg('');
  };

  // --- ANALYTICS CALCULATIONS ---
  const totalUsersCount = users.length;
  const totalStudents = users.filter(u => u.role === 'Student').length;
  const totalLandlords = users.filter(u => u.role === 'Landlord').length;
  const totalListings = listings.length;
  const activeVerifications = pendingProperties.length;
  const openReportsCount = reports.filter(r => r.status === 'Open').length;
  const totalRevenueCollected = payments
    .filter(p => p.status === 'Verified')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Visual CSS Settings */}
      <style>{`
        .admin-stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
        }

        .admin-stat-card {
          background: white;
          padding: 1.5rem;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 1.25rem;
          box-shadow: var(--shadow-sm);
        }

        .admin-stat-icon-wrapper {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .admin-table th {
          background: #f8fafc;
          padding: 0.75rem 1rem;
          font-weight: 700;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-light);
          font-size: 0.8rem;
          text-transform: uppercase;
        }

        .admin-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--border-light);
          font-size: 0.9rem;
          vertical-align: middle;
        }

        .admin-table tr:hover {
          background: #f8fafc;
        }

        .admin-pane-container {
          background: white;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 2rem;
          box-shadow: var(--shadow-sm);
        }

        .admin-tab-btn-row {
          display: flex;
          gap: 0.5rem;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .admin-tab-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          border-radius: 4px;
        }

        .admin-tab-btn.active {
          background: var(--primary-glow);
          color: var(--primary);
        }

        .admin-badge-pill {
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .admin-chart-bar-container {
          height: 160px;
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          border-bottom: 2px solid var(--border-light);
          padding-bottom: 0.5rem;
        }

        .admin-chart-bar {
          width: 35px;
          background: var(--primary-light);
          border-radius: 4px 4px 0 0;
          transition: height 0.5s ease;
          position: relative;
        }

        .admin-chart-bar:hover {
          background: var(--primary);
        }

        .admin-chart-bar-tooltip {
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          background: #334155;
          color: white;
          padding: 0.15rem 0.35rem;
          font-size: 0.7rem;
          border-radius: 4px;
          font-weight: bold;
          white-space: nowrap;
          display: none;
        }

        .admin-chart-bar:hover .admin-chart-bar-tooltip {
          display: block;
        }

        .admin-audit-log-row {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border-light);
          font-size: 0.85rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .admin-audit-log-row:hover {
          background: #f8fafc;
        }
      `}</style>

      {/* Admin Top Welcome Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem 2rem', background: 'white', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            System Administrator Control Suite
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.15rem' }}>
            Logged in as: <strong style={{ color: 'var(--text-main)' }}>{currentUser.name}</strong> ({currentUser.role})
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="badge-pill-light" style={{ background: '#f1f5f9', color: '#334155', fontWeight: '700' }}>
            Admin Node: {currentUser.id}
          </span>
          <span className="badge-pill-light" style={{ background: '#dbeafe', color: '#1e40af', fontWeight: '700' }}>
            Intake: CSE BUBT 51/8
          </span>
        </div>
      </div>

      {/* RENDER THE ACTIVE SUB-VIEW TAB */}

      {/* 1. OVERVIEW DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Key Metrics Grid */}
          <div className="admin-stat-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <Users size={24} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Total Users</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{totalUsersCount}</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{totalStudents} Students / {totalLandlords} Landlords</span>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <Home size={24} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Rental Listings</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{totalListings}</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Verified Property Listings</span>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon-wrapper" style={{ background: '#fffbeb', color: '#d97706' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Pending Approvals</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{activeVerifications}</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: '700' }}>Requires review badge</span>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon-wrapper" style={{ background: '#fef2f2', color: '#dc2626' }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Open Complaints</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{openReportsCount}</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pending audit cases</span>
              </div>
            </div>
          </div>

          {/* Platform Analytics Charts overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div className="admin-pane-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={16} /> User Registration Trends (Monthly)
              </h4>
              <div className="admin-chart-bar-container">
                {[
                  { m: 'Feb', v: 45, h: '45%' },
                  { m: 'Mar', v: 62, h: '62%' },
                  { m: 'Apr', v: 75, h: '75%' },
                  { m: 'May', v: 90, h: '90%' },
                  { m: 'Jun', v: 110, h: '100%' },
                  { m: 'Jul', v: 95, h: '88%' }
                ].map((bar, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div className="admin-chart-bar" style={{ height: bar.h }}>
                      <span className="admin-chart-bar-tooltip">{bar.v} new users</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{bar.m}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-pane-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={16} /> Property Statistics Overview
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'center', height: '160px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                    <span>Verified Listings</span>
                    <span>75%</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '50px' }}>
                    <div style={{ width: '75%', height: '100%', background: 'var(--primary)', borderRadius: '50px' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                    <span>Active Bookings</span>
                    <span>48%</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '50px' }}>
                    <div style={{ width: '48%', height: '100%', background: 'var(--secondary)', borderRadius: '50px' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Operations Log widget */}
          <div className="admin-pane-container">
            <h4 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              Recent Audit Operations Feed
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {auditLogs.slice(0, 3).map(log => (
                <div key={log.id} className="admin-audit-log-row">
                  <div>
                    <span style={{ fontWeight: '700', color: 'var(--primary)' }}>[{log.admin}]</span>
                    <span style={{ marginLeft: '0.5rem' }}>{log.action}</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{log.date}</span>
                </div>
              ))}
            </div>
            <button className="widget-link" style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.85rem', marginTop: '1rem', cursor: 'pointer' }} onClick={() => handleTabSelect('audit')}>
              See All Audit Trails &rarr;
            </button>
          </div>
        </div>
      )}

      {/* 2. USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="admin-pane-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>User Directory Registry</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage all registered student and landlord profiles.</p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div className="chat-inbox-search-box" style={{ margin: 0, padding: '0.4rem 0.75rem', background: '#f1f5f9' }}>
                <Search size={14} />
                <input 
                  type="text" 
                  placeholder="Search name/email..." 
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <select 
                className="settings-select" 
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                <option value="All">All User Roles</option>
                <option value="Student">Students Only</option>
                <option value="Landlord">Landlords Only</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Email Account</th>
                  <th>Role</th>
                  <th>Details/Univ</th>
                  <th>Identity status</th>
                  <th>Ledger Status</th>
                  <th style={{ textAlign: 'center' }}>Moderation Tools</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(u => {
                    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()) || u.id.toLowerCase().includes(userSearch.toLowerCase());
                    const matchesFilter = userFilter === 'All' || u.role === userFilter;
                    return matchesSearch && matchesFilter;
                  })
                  .map(u => (
                    <tr key={u.id} style={{ opacity: u.status === 'Suspended' ? 0.6 : 1 }}>
                      <td style={{ fontWeight: '700' }}>{u.id}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className="admin-badge-pill" style={{ background: u.role === 'Student' ? '#e0f2fe' : '#f3e8ff', color: u.role === 'Student' ? '#0369a1' : '#6b21a8' }}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.role === 'Student' ? `BUBT intake 51/8` : `${u.listings} Listings posted`}</td>
                      <td>
                        <span className="admin-badge-pill" style={{ background: u.identity === 'Verified' ? '#d1fae5' : '#fef3c7', color: u.identity === 'Verified' ? '#065f46' : '#92400e' }}>
                          {u.identity}
                        </span>
                      </td>
                      <td>
                        <span className="admin-badge-pill" style={{ background: u.status === 'Active' ? '#d1fae5' : '#fee2e2', color: u.status === 'Active' ? '#065f46' : 'var(--danger)' }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                        {u.identity !== 'Verified' && (
                          <button className="nav-icon-btn" style={{ padding: '0.35rem', background: '#d1fae5', color: '#065f46', borderRadius: '4px' }} onClick={() => approveUserIdentity(u.id, u.name)} title="Approve Identity Scan">
                            <UserCheck size={14} />
                          </button>
                        )}
                        <button className="nav-icon-btn" style={{ padding: '0.35rem', background: u.status === 'Active' ? '#ffe4e6' : '#ecfdf5', color: u.status === 'Active' ? 'var(--danger)' : '#059669', borderRadius: '4px' }} onClick={() => toggleUserStatus(u.id, u.name)} title={u.status === 'Active' ? "Suspend Account" : "Un-suspend Account"}>
                          <UserX size={14} />
                        </button>
                        {!isSupportStaff && (
                          <button className="nav-icon-btn" style={{ padding: '0.35rem', background: '#f1f5f9', color: '#64748b', borderRadius: '4px' }} onClick={() => deleteUser(u.id, u.name)} title="Delete Account permanently">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PROPERTY & STUDENT ID VERIFICATION QUEUE */}
      {activeTab === 'verification' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* STUDENT & LANDLORD IDENTITY VERIFICATION SUBMISSIONS */}
          <div className="admin-pane-container">
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>🎓 Student & Landlord ID Verification Submissions</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Review uploaded Student Cards / NID documents, approve verified accounts, or reject invalid uploads.</p>
              </div>

              <button className="btn-card-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }} onClick={fetchPendingVerifications}>
                <RefreshCw size={14} /> Refresh Queue
              </button>
            </div>

            {pendingIdVerifications.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed var(--border-light)' }}>
                <CheckCircle size={32} style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }} />
                <h4 style={{ fontWeight: '700' }}>No Pending Student ID Verifications</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>All submitted Student & Landlord ID documents have been reviewed.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingIdVerifications.map(item => (
                  <div key={item.id} style={{ padding: '1.25rem', background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img 
                        src={getAvatarUrl({ name: item.user_name, avatar: item.avatar || item.avatar_url || item.profile_picture })} 
                        alt="Student Profile" 
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getAvatarUrl({ name: item.user_name });
                        }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h4 style={{ fontWeight: '800', fontSize: '1rem' }}>{item.user_name}</h4>
                          <span className="admin-badge-pill" style={{ background: '#fef3c7', color: '#b45309' }}>Pending Review</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Email: <strong>{item.user_email}</strong></p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Submitted: {item.submitted_at ? new Date(item.submitted_at).toLocaleString() : 'Recently'}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {item.id_document_url && (
                        <a 
                          href={item.id_document_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn-card-secondary"
                          style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
                        >
                          <Eye size={14} /> View ID Document
                        </a>
                      )}

                      <button 
                        className="btn-filter-apply" 
                        style={{ background: 'var(--secondary)', fontSize: '0.8rem', padding: '0.4rem 0.85rem' }} 
                        onClick={() => handleReviewIdAction(item, 'approve')}
                      >
                        Approve
                      </button>

                      <button 
                        className="btn-card-secondary" 
                        style={{ border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: '0.8rem', padding: '0.4rem 0.85rem' }} 
                        onClick={() => handleReviewIdAction(item, 'reject')}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PROPERTY VERIFICATION QUEUE */}
          <div className="admin-pane-container">
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Property Verification Queue</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Verify landlords property deeds and utility documentation uploads before making them public.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {pendingProperties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <CheckCircle size={36} style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }} />
                <p>All property listings have been reviewed and approved. Verification queue is empty.</p>
              </div>
            ) : (
              pendingProperties.map(p => (
                <div key={p.id} style={{ border: '1px solid var(--border-light)', padding: '1.5rem', borderRadius: '8px', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h4 style={{ fontWeight: '800', fontSize: '1.1rem' }}>{p.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Address: {p.address}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Landlord Owner: <strong>{p.landlord}</strong></p>
                    </div>

                    <span className="admin-badge-pill" style={{ background: '#fffbeb', color: '#b45309' }}>
                      {p.status}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', margin: '1.5rem 0', background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>PROPERTY DEEDS SCAN</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: '1px solid #bfdbfe', background: '#eff6ff', borderRadius: '4px', fontSize: '0.8rem', color: '#1e40af', cursor: 'pointer' }} onClick={() => alert(`Opening simulated viewer for deeds document: ${p.docs}`)}>
                        <FileText size={16} /> <span>{p.docs}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>LATEST MONTH UTILITY ELECTRIC BILL</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: '1px solid #bfdbfe', background: '#eff6ff', borderRadius: '4px', fontSize: '0.8rem', color: '#1e40af', cursor: 'pointer' }} onClick={() => alert(`Opening simulated viewer for utility bill image: ${p.utilityBill}`)}>
                        <FileText size={16} /> <span>{p.utilityBill}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button className="btn-filter-apply" style={{ background: 'var(--secondary)', padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => verifyPropertyAction(p.id, p.title, 'Approve')}>
                      Approve & Publish Listing
                    </button>
                    <button className="btn-card-secondary" style={{ border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => verifyPropertyAction(p.id, p.title, 'Reject')}>
                      Reject Upload Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        </div>
      )}

      {/* 4. RENTAL LISTINGS MANAGEMENT */}
      {activeTab === 'properties' && (
        <div className="admin-pane-container">
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Rental Listing Directory</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Modify, hide, delete, or flag featured active listings posted on the platform.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {listings.map(item => (
              <div key={item.id} style={{ background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <img src={item.image} alt={item.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80" }} />
                
                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>{item.type}</span>
                    <span className="admin-badge-pill" style={{ background: item.verified ? '#d1fae5' : '#fee2e2', color: item.verified ? '#065f46' : 'var(--danger)' }}>
                      {item.verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>

                  <h4 style={{ fontWeight: '800', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.title}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Owner Host: <strong>{item.landlord?.name}</strong></p>
                  <p style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem' }}>{item.price.toLocaleString()} BDT/mo</p>
                  
                  <div style={{ display: 'flex', gap: '0.25rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                    <button className="btn-card-secondary" style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem', border: '1px solid var(--border-light)', background: 'white' }} onClick={() => alert(`Opening simulated property editor for listing: "${item.title}"`)}>
                      Edit Details
                    </button>
                    
                    {isSuperAdmin && (
                      <button className="btn-card-secondary" style={{ padding: '0.35rem', background: '#ffe4e6', color: 'var(--danger)', border: 'none' }} onClick={() => onDeleteListing(item.id)} title="Delete Listing">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. REPORTS & COMPLAINTS (Admin Investigation & Actions) */}
      {activeTab === 'reports' && (
        <div className="admin-pane-container">
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>User Complaints & Moderation Center</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Review grievances submitted by Students and Landlords to the company. Investigate evidence and enforce platform actions.</p>
          </div>

          {/* Sub-tab section buttons for Student & Landlord complaints */}
          <div className="admin-tab-btn-row" style={{ gap: '0.5rem', marginBottom: '1.5rem' }}>
            <button 
              className={`admin-tab-btn ${reportCategoryFilter === 'All' ? 'active' : ''}`}
              onClick={() => setReportCategoryFilter('All')}
            >
              All Complaints ({reports.length})
            </button>
            <button 
              className={`admin-tab-btn ${reportCategoryFilter === 'Student' ? 'active' : ''}`}
              onClick={() => setReportCategoryFilter('Student')}
            >
              🎓 Student Complaints ({reports.filter(r => r.complainantRole === 'Student').length})
            </button>
            <button 
              className={`admin-tab-btn ${reportCategoryFilter === 'Landlord' ? 'active' : ''}`}
              onClick={() => setReportCategoryFilter('Landlord')}
            >
              🏢 Landlord Complaints ({reports.filter(r => r.complainantRole === 'Landlord').length})
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: selectedReport ? '1.2fr 0.8fr' : '1fr', gap: '1.5rem' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Submitted By</th>
                    <th>Reported Offender</th>
                    <th>Offender Role</th>
                    <th>Category</th>
                    <th>Date Received</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Admin Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports
                    .filter(r => reportCategoryFilter === 'All' || r.complainantRole === reportCategoryFilter)
                    .map(r => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: '700' }}>#{r.id}</td>
                        <td>
                          <div><strong>{r.reporter}</strong></div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.complainantRole}</span>
                        </td>
                        <td>
                          <div><strong style={{ color: 'var(--danger)' }}>{r.reported}</strong></div>
                        </td>
                        <td>
                          <span className="admin-badge-pill" style={{ background: r.targetRole === 'Landlord' ? '#f3e8ff' : '#e0f2fe', color: r.targetRole === 'Landlord' ? '#6b21a8' : '#0369a1' }}>
                            {r.targetRole}
                          </span>
                        </td>
                        <td>
                          <span className="admin-badge-pill" style={{ background: '#fef3c7', color: '#92400e' }}>
                            {r.reason}
                          </span>
                        </td>
                        <td>{r.date}</td>
                        <td>
                          <span className="admin-badge-pill" style={{ 
                            background: r.status === 'Open' ? '#fee2e2' : r.status === 'Closed' ? '#d1fae5' : r.status === 'Offender Suspended' ? '#dc2626' : '#e0f2fe',
                            color: r.status === 'Open' ? 'var(--danger)' : r.status === 'Closed' ? '#065f46' : r.status === 'Offender Suspended' ? '#ffffff' : '#0369a1'
                          }}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button className="btn-filter-apply" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }} onClick={() => setSelectedReport(r)}>
                            Investigate Case
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {selectedReport && (
              <div style={{ border: '1px solid var(--border-light)', padding: '1.5rem', borderRadius: '8px', background: '#f8fafc', animation: 'fadeSlideIn 0.2s ease', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontWeight: '800' }}>Admin Investigation: #{selectedReport.id}</h4>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setSelectedReport(null)}>
                    <X size={16} />
                  </button>
                </div>

                <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', background: 'white', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                  <div>Complainant ({selectedReport.complainantRole}): <strong>{selectedReport.reporter}</strong></div>
                  <div>Reported Offender ({selectedReport.targetRole}): <strong style={{ color: 'var(--danger)' }}>{selectedReport.reported}</strong></div>
                  <div>Grievance Category: <strong>{selectedReport.reason}</strong></div>
                  <div>Date Logged: <strong>{selectedReport.date}</strong></div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>COMPLAINT EVIDENCE & DETAILS</span>
                  <p style={{ fontSize: '0.9rem', background: 'white', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-light)', marginTop: '0.25rem', minHeight: '80px', lineHeight: '1.4' }}>
                    "{selectedReport.description}"
                  </p>
                </div>

                {selectedReport.status === 'Offender Suspended' && (
                  <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserX size={18} /> Offender ({selectedReport.reported}) is SUSPENDED
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>ENFORCE ADMIN ACTION</span>
                  
                  <button className="btn-filter-apply" style={{ background: 'var(--warning)', justifyContent: 'center' }} onClick={() => resolveReport(selectedReport.id, 'Warning Issued')}>
                    ⚠️ Issue Warning Notice to Offender
                  </button>
                  
                  <button 
                    className="btn-filter-apply" 
                    style={{ background: 'var(--danger)', justifyContent: 'center', opacity: selectedReport.status === 'Offender Suspended' ? 0.7 : 1 }} 
                    onClick={() => suspendOffenderAccount(selectedReport.reported, selectedReport.id)}
                  >
                    🚫 Suspend Reported Offender Account
                  </button>
                  
                  <button className="btn-card-secondary" style={{ background: 'white', border: '1px solid var(--border-light)', justifyContent: 'center' }} onClick={() => resolveReport(selectedReport.id, 'Closed')}>
                    ✅ Dismiss / Close Case
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. REVIEWS MODERATION */}
      {activeTab === 'reviews' && (
        <div className="admin-pane-container">
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Tenants Ratings & Reviews Moderation</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Moderate and purge offensive ratings, flagged comment streams, or fake landlord reviews.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="recent-activity-panel" style={{ padding: '1rem', background: '#fffbeb', borderLeft: '4px solid var(--warning)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Star size={16} style={{ color: 'var(--warning)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Flagged Review: Case ID #9901</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date: Oct 2025</span>
              </div>
              <p style={{ fontSize: '0.9rem', fontStyle: 'italic', margin: '0.5rem 0' }}>
                "Amazing student flat, extremely close to BUBT! Utilities are fully bundled and fiber wifi is super fast. Highly recommended." — Posted by Ashikur Rahman for Dhaka Rent
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button className="btn-filter-apply" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', background: 'var(--secondary)' }} onClick={() => alert('Flag approved. Review remains public.')}>
                  Approve Review
                </button>
                <button className="btn-card-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', border: '1px solid var(--danger)', color: 'var(--danger)' }} onClick={() => alert('Review deleted permanently')}>
                  Purge & Delete Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. BOOKINGS DISPUTE RESOLUTION */}
      {activeTab === 'bookings' && (
        <div className="admin-pane-container">
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Booking & Tenant Disputes Ledger</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Intervene, cancel, or mediate lease booking disputes between landlords and students.</p>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Dispute ID</th>
                <th>Booking Ref</th>
                <th>Student Tenant</th>
                <th>Landlord Owner</th>
                <th>Property</th>
                <th>Rent Price</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: '700' }}>{d.id}</td>
                  <td>{d.bookingId}</td>
                  <td>{d.tenantName}</td>
                  <td>{d.landlordName}</td>
                  <td>{d.propertyTitle}</td>
                  <td style={{ fontWeight: '700' }}>{d.price.toLocaleString()} BDT</td>
                  <td>
                    <span className="admin-badge-pill" style={{ background: '#fee2e2', color: 'var(--danger)' }}>
                      {d.status}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                    <button className="btn-filter-apply" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => resolveDisputeAction(d.id, 'Resolved in favor of Student')}>
                      Resolve for Student
                    </button>
                    <button className="btn-filter-apply" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'var(--secondary)' }} onClick={() => resolveDisputeAction(d.id, 'Resolved in favor of Landlord')}>
                      Resolve for Landlord
                    </button>
                    <button className="btn-card-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', border: '1px solid var(--danger)', color: 'var(--danger)' }} onClick={() => resolveDisputeAction(d.id, 'Cancelled Booking')}>
                      Cancel Booking
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 8. PAYMENT & TRANSACTION MANAGEMENT */}
      {activeTab === 'payments' && (
        <div className="admin-pane-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Financial Transactions Ledger</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Inspect mobile payout ledgers, track commission revenues, and review refunds requests.</p>
            </div>

            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.75rem 1.25rem', borderRadius: '8px', textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: '700', textTransform: 'uppercase' }}>Total Commission Earned (5%)</span>
              <h3 style={{ color: '#065f46', fontSize: '1.35rem', fontWeight: '800' }}>{(totalRevenueCollected * 0.05).toLocaleString()} BDT</h3>
            </div>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Tenant Name</th>
                <th>Transaction Amount</th>
                <th>Commission Fee (5%)</th>
                <th>Date Paid</th>
                <th>Ledger Status</th>
                <th style={{ textAlign: 'center' }}>Tools</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: '700' }}>{p.id}</td>
                  <td>{p.tenant}</td>
                  <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{p.amount.toLocaleString()} BDT</td>
                  <td style={{ color: '#047857', fontWeight: '600' }}>{p.commission} BDT</td>
                  <td>{p.date}</td>
                  <td>
                    <span className="admin-badge-pill" style={{ 
                      background: p.status === 'Verified' ? '#d1fae5' : p.status === 'Refunded' ? '#cbd5e1' : '#fef3c7',
                      color: p.status === 'Verified' ? '#065f46' : p.status === 'Refunded' ? '#334155' : '#b45309'
                    }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {p.status === 'Refund Pending' && (
                      <button className="btn-filter-apply" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => triggerRefund(p.id, p.tenant)}>
                        Approve Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 9. CONTRACT TEMPLATES MANAGEMENT */}
      {activeTab === 'contracts' && (
        <div className="admin-pane-container">
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Lease Agreement Templates Registry</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Approve formal tenancy contract frameworks or download archived lease agreements.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="admin-badge-pill" style={{ background: '#d1fae5', color: '#065f46' }}>APPROVED</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>v1.2 Template</span>
              </div>
              <h4 style={{ fontWeight: '800' }}>Standard BUBT Tenancy Deed</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>General student housing lease template containing safety deposit covenants and roommate clauses.</p>
              <button className="btn-card-secondary" style={{ background: 'white', border: '1px solid var(--border-light)', marginTop: 'auto' }} onClick={() => alert('Downloading BUBT_Tenancy_Deed_v1.2.pdf')}>
                Download Template PDF
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="admin-badge-pill" style={{ background: '#fffbeb', color: '#b45309' }}>PENDING AUDIT</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>v1.3 Draft</span>
              </div>
              <h4 style={{ fontWeight: '800' }}>Hostel Group Lease Deed</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Multi-roommate lease draft incorporating split payments logic and utilities commission bounds.</p>
              <div style={{ display: 'flex', gap: '0.25rem', marginTop: 'auto' }}>
                <button className="btn-filter-apply" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', background: 'var(--secondary)' }} onClick={() => alert('v1.3 Draft approved.')}>
                  Approve Template
                </button>
                <button className="btn-card-secondary" style={{ padding: '0.4rem', border: '1px solid var(--border-light)', background: 'white' }} onClick={() => alert('Downloading v1.3 draft for review.')}>
                  Review PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. NOTIFICATIONS & EVENT FEEDS */}
      {activeTab === 'notifications' && (
        <div className="admin-pane-container">
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Admin Notifications & System Broadcaster 🔔</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Real-time alerts for property submissions, verifications, bookings, security events, and announcements.</p>
          </div>

          {/* 11 ADMIN EVENT FEED NOTIFICATIONS */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} style={{ color: 'var(--primary)' }} /> Live Platform Event Notifications Feed (11 Event Types)
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>🏠</span>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>New property submitted</strong>
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Landlord Mehadi Hasan submitted property listing "Modern BUBT Female Sublet" for approval.</p>
                  </div>
                </div>
                <span className="badge-pill-light" style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', fontWeight: 700 }}>2 mins ago</span>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>🛡️</span>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Property verification requested</strong>
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Holding tax deed & electricity utility bill uploaded for Listing #104 verification audit.</p>
                  </div>
                </div>
                <span className="badge-pill-light" style={{ background: '#ecfdf5', color: '#047857', fontSize: '0.75rem', fontWeight: 700 }}>15 mins ago</span>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>👤</span>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>New landlord registration</strong>
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>New landlord account "Kabir Hossain" signed up requiring background identity check.</p>
                  </div>
                </div>
                <span className="badge-pill-light" style={{ background: '#f3e8ff', color: '#6b21a8', fontSize: '0.75rem', fontWeight: 700 }}>45 mins ago</span>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>🪪</span>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Landlord verification submitted</strong>
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>NID card scans (Front & Back) uploaded by Landlord #LND-9928 for NID verification.</p>
                  </div>
                </div>
                <span className="badge-pill-light" style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.75rem', fontWeight: 700 }}>1 hr ago</span>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>📅</span>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>New booking</strong>
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Student Maruf Billah Anas submitted room booking application for Listing #101.</p>
                  </div>
                </div>
                <span className="badge-pill-light" style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', fontWeight: 700 }}>2 hrs ago</span>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>💳</span>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Payment issue</strong>
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>bKash transaction #TXN-99201 (৳12,000 BDT) flagged for manual payment reconciliation audit.</p>
                  </div>
                </div>
                <span className="badge-pill-light" style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.75rem', fontWeight: 700 }}>3 hrs ago</span>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>⭐</span>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>New review</strong>
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified student tenant posted a 5.0-star rating review for "Sunny Single Room near BUBT".</p>
                  </div>
                </div>
                <span className="badge-pill-light" style={{ background: '#ecfdf5', color: '#047857', fontSize: '0.75rem', fontWeight: 700 }}>5 hrs ago</span>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>⚠️</span>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>New complaint / report</strong>
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Priority report #REP-804 filed regarding maintenance issue at Mirpur 2 Apartment.</p>
                  </div>
                </div>
                <span className="badge-pill-light" style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.75rem', fontWeight: 700 }}>6 hrs ago</span>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>🚨</span>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Security event</strong>
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Multiple failed login attempts detected from IP 103.220.10.45 on superadmin account.</p>
                  </div>
                </div>
                <span className="badge-pill-light" style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.75rem', fontWeight: 700 }}>Yesterday</span>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>📝</span>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Rental contract issue</strong>
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lease agreement #AGR-401 pending landlord digital signature for 72 hours.</p>
                  </div>
                </div>
                <span className="badge-pill-light" style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.75rem', fontWeight: 700 }}>2 days ago</span>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>📢</span>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>System announcement broadcast</strong>
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Platform maintenance window announced to all users for Friday 2:00 AM - 4:00 AM.</p>
                  </div>
                </div>
                <span className="badge-pill-light" style={{ background: '#ecfdf5', color: '#047857', fontSize: '0.75rem', fontWeight: 700 }}>3 days ago</span>
              </div>
            </div>
          </div>

          {/* BROADCAST ALERT FORM */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1rem' }}>📢 Dispatch Custom Broadcast Notification</h4>
            <form onSubmit={sendBroadcastAlert} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="filter-label">Target Audience Group</label>
                <select className="form-input" value={broadcastTarget} onChange={(e) => setBroadcastTarget(e.target.value)}>
                  <option value="all">All Platform Users</option>
                  <option value="student">Student Accounts Only</option>
                  <option value="landlord">Landlord Accounts Only</option>
                </select>
              </div>

              <div className="form-group">
                <label className="filter-label">Broadcast Alert Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Server Maintenance Notice or Security Upgrade alert" 
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="filter-label">Alert Body Details</label>
                <textarea 
                  className="form-input" 
                  rows="4" 
                  placeholder="Type your broadcasting message text..." 
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-filter-apply" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={16} /> Send Broadcast Alert Notification
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 11. ANALYTICS & EXPORTS */}
      {activeTab === 'analytics' && (
        <div className="admin-pane-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>System Reports & Analytics</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Analyze platform metrics and export raw data sheets (CSV/PDF/Excel).</p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-card-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid var(--border-light)' }} onClick={() => alert('Simulating PDF report download...')}>
                <FileDown size={16} /> Export PDF Report
              </button>
              <button className="btn-card-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid var(--border-light)' }} onClick={() => alert('Simulating Excel data download...')}>
                <FileDown size={16} /> Export Excel Sheet
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Popular Sublet Locations</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                    <span>BUBT Campus (Mirpur 2)</span>
                    <span style={{ fontWeight: 'bold' }}>65%</span>
                  </div>
                  <div style={{ height: '6px', background: '#cbd5e1', borderRadius: '30px' }}>
                    <div style={{ width: '65%', height: '100%', background: 'var(--primary)', borderRadius: '30px' }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                    <span>Mirpur 10</span>
                    <span style={{ fontWeight: 'bold' }}>20%</span>
                  </div>
                  <div style={{ height: '6px', background: '#cbd5e1', borderRadius: '30px' }}>
                    <div style={{ width: '20%', height: '100%', background: 'var(--primary-light)', borderRadius: '30px' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Active Rental Occupancy</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                    <span>Occupied Properties</span>
                    <span style={{ fontWeight: 'bold' }}>42%</span>
                  </div>
                  <div style={{ height: '6px', background: '#cbd5e1', borderRadius: '30px' }}>
                    <div style={{ width: '42%', height: '100%', background: 'var(--secondary)', borderRadius: '30px' }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                    <span>Available Properties</span>
                    <span style={{ fontWeight: 'bold' }}>58%</span>
                  </div>
                  <div style={{ height: '6px', background: '#cbd5e1', borderRadius: '30px' }}>
                    <div style={{ width: '58%', height: '100%', background: 'var(--primary-light)', borderRadius: '30px' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12. SYSTEM SETTINGS */}
      {activeTab === 'settings' && (
        <div className="admin-pane-container">
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>General System Preferences</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage portal names, matching algorithm parameter weight configurations, and maintenance modes.</p>
          </div>

          {saveSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '6px', marginBottom: '1.5rem' }}>
              <CheckCircle size={18} />
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>System configurations updated successfully!</span>
            </div>
          )}

          <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '680px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="filter-label">App Interface Site Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={siteName} 
                  onChange={(e) => setSiteName(e.target.value)}
                  disabled={isSupportStaff}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span className="filter-label">Portal Maintenance Mode</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <label className="custom-toggle">
                    <input 
                      type="checkbox" 
                      checked={maintenanceMode} 
                      onChange={(e) => setMaintenanceMode(e.target.checked)}
                      disabled={isSupportStaff}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {maintenanceMode ? 'ACTIVE: Public users blocked' : 'DISABLED: Normal public access active'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
              <h4 style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={18} style={{ color: 'var(--primary)' }} /> Roommate Matching Parameter Weights (%)
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="filter-label">Cleanliness Preference Weight</label>
                  <input type="number" min="0" max="100" className="form-input" value={weightCleanliness} onChange={(e) => setWeightCleanliness(parseInt(e.target.value))} disabled={isSupportStaff} />
                </div>
                <div className="form-group">
                  <label className="filter-label">Study Habits Preference Weight</label>
                  <input type="number" min="0" max="100" className="form-input" value={weightStudyHabits} onChange={(e) => setWeightStudyHabits(parseInt(e.target.value))} disabled={isSupportStaff} />
                </div>
                <div className="form-group">
                  <label className="filter-label">Monthly Budget Weight</label>
                  <input type="number" min="0" max="100" className="form-input" value={weightBudget} onChange={(e) => setWeightBudget(parseInt(e.target.value))} disabled={isSupportStaff} />
                </div>
                <div className="form-group">
                  <label className="filter-label">Daily Schedules Compatibility Weight</label>
                  <input type="number" min="0" max="100" className="form-input" value={weightSchedules} onChange={(e) => setWeightSchedules(parseInt(e.target.value))} disabled={isSupportStaff} />
                </div>
              </div>
            </div>

            {!isSupportStaff && (
              <button type="submit" className="btn-filter-apply" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center', padding: '0.75rem' }}>
                <Save size={16} /> Save Configurations
              </button>
            )}
          </form>
        </div>
      )}

      {/* 13. SECURITY MANAGEMENT & SUB-ADMIN ROLE ACCESS CONTROL */}
      {activeTab === 'security' && (
        <div className="admin-pane-container">
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Platform Security & Access Control</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage Super Admin privileges, sub-admin accounts, and module permissions.</p>
            </div>

            {isSuperAdmin && (
              <button 
                onClick={() => setShowAddSubAdminModal(true)}
                className="btn-filter-apply" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem' }}
              >
                <Plus size={16} /> Add Sub-Admin
              </button>
            )}
          </div>

          {/* SUPER ADMIN SUB-ADMIN MANAGEMENT PANEL */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
                <h4 style={{ fontWeight: '800', fontSize: '1rem', margin: 0 }}>
                  👑 Super Admin Sub-Admin Access Control
                </h4>
              </div>
              <span style={{ fontSize: '0.8rem', background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 700 }}>
                {subAdmins.length} Active Sub-Admins
              </span>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', background: 'white' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-light)' }}>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem' }}>Sub-Admin Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Email / Login</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Role Title</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Module Permissions</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subAdmins.map(sub => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{sub.name}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--primary)' }}>{sub.email}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{sub.role}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          {sub.permissions.properties && <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>Properties</span>}
                          {sub.permissions.verification && <span style={{ background: '#ecfdf5', color: '#047857', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>NID Verification</span>}
                          {sub.permissions.payments && <span style={{ background: '#fef3c7', color: '#b45309', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>Payments</span>}
                          {sub.permissions.users && <span style={{ background: '#f3e8ff', color: '#6b21a8', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>Users</span>}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: sub.status === 'Active' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          color: sub.status === 'Active' ? '#059669' : '#dc2626'
                        }}>
                          {sub.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        {isSuperAdmin && (
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => toggleSubAdminStatus(sub.id)}
                              style={{ padding: '0.3rem 0.6rem', border: '1px solid var(--border-light)', borderRadius: '4px', background: 'white', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                            >
                              {sub.status === 'Active' ? 'Suspend' : 'Activate'}
                            </button>
                            <button
                              onClick={() => deleteSubAdmin(sub.id, sub.name)}
                              style={{ padding: '0.3rem 0.6rem', border: 'none', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div>
              <h4 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={16} style={{ color: 'var(--primary)' }} /> Security Policies
              </h4>

              <div className="switch-container">
                <div className="switch-details">
                  <span className="switch-title">Force Admin Two-Factor (2FA)</span>
                  <span className="switch-desc">Require OTP auth confirmation on admin sign ins.</span>
                </div>
                <label className="custom-toggle">
                  <input type="checkbox" checked={enableAdmin2FA} onChange={(e) => setEnableAdmin2FA(e.target.checked)} disabled={isSupportStaff} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div>
              <h4 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--danger)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={16} /> Failed Login Warnings (IP Monitoring)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {failedAttempts.map(f => (
                  <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.75rem', background: '#fecdd3', color: '#9f1239', border: '1px solid #fda4af', borderRadius: '4px' }}>
                    <span>IP: <strong>{f.ip}</strong> (Username: "{f.username}")</span>
                    <span>{f.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ADD SUB-ADMIN MODAL */}
          {showAddSubAdminModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(5px)',
              zIndex: 20000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}>
              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                maxWidth: '480px',
                width: '100%',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Add New Sub-Admin Account</h3>
                  <button onClick={() => setShowAddSubAdminModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleAddSubAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Sub-Admin Full Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Officer Sumon"
                      value={newSubName} 
                      onChange={(e) => setNewSubName(e.target.value)}
                      required 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Email Address / Login</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="e.g. subadmin@rentease.com"
                      value={newSubEmail} 
                      onChange={(e) => setNewSubEmail(e.target.value)}
                      required 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Role Title</label>
                    <select 
                      className="form-input" 
                      value={newSubRole}
                      onChange={(e) => setNewSubRole(e.target.value)}
                    >
                      <option value="Sub-Admin (Moderator)">Sub-Admin (Moderator)</option>
                      <option value="Sub-Admin (Verification Officer)">Sub-Admin (Verification Officer)</option>
                      <option value="Sub-Admin (Payment Auditor)">Sub-Admin (Payment Auditor)</option>
                      <option value="Sub-Admin (Support Staff)">Sub-Admin (Support Staff)</option>
                    </select>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                      Assign Granted Access Permissions:
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={newSubPerms.properties} onChange={(e) => setNewSubPerms({ ...newSubPerms, properties: e.target.checked })} />
                        <span>☑ Property Audit & Listing Approval Access</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={newSubPerms.verification} onChange={(e) => setNewSubPerms({ ...newSubPerms, verification: e.target.checked })} />
                        <span>☑ Landlord NID & Property Verification Access</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={newSubPerms.payments} onChange={(e) => setNewSubPerms({ ...newSubPerms, payments: e.target.checked })} />
                        <span>☑ Rent Payments & Ledger Approval Access</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={newSubPerms.users} onChange={(e) => setNewSubPerms({ ...newSubPerms, users: e.target.checked })} />
                        <span>☑ User Account Moderation & Complaints Access</span>
                      </label>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => setShowAddSubAdminModal(false)} style={{ flex: 1, padding: '0.65rem', border: '1px solid var(--border-light)', borderRadius: '4px', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-filter-apply" style={{ flex: 1.5, padding: '0.65rem' }}>
                      Create Sub-Admin
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 14. CONTENT CMS */}
      {activeTab === 'content' && (
        <div className="admin-pane-container">
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Platform Content CMS Manager</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Directly modify landing page headings, FAQ accordions, and terms clauses.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert('Website content updated!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '680px' }}>
            <div className="form-group">
              <label className="filter-label">Homepage Sub-Heading Banner Text</label>
              <input type="text" className="form-input" value={homeBannerText} onChange={(e) => setHomeBannerText(e.target.value)} />
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
              <span className="filter-label" style={{ fontWeight: 'bold' }}>FAQ Entry Configuration</span>
              
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label className="filter-label">Question Text</label>
                <input type="text" className="form-input" value={faqTitle} onChange={(e) => setFaqTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="filter-label">Answer Body Details</label>
                <textarea className="form-input" rows="3" value={faqAns} onChange={(e) => setFaqAns(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn-filter-apply" style={{ justifyContent: 'center' }}>
              Publish CMS Changes
            </button>
          </form>
        </div>
      )}

      {/* 15. MY PROFILE */}
      {activeTab === 'profile' && (
        <div className="admin-pane-container">
          {profileSavedMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '6px', marginBottom: '1.5rem' }}>
              <CheckCircle size={18} />
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Admin Profile & Photo updated successfully!</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            {/* Personal Details & Avatar Change */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                Admin Credentials Profile 👤
              </h3>
              
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <div 
                  style={{ position: 'relative', cursor: 'pointer' }} 
                  onClick={() => setShowPhotoModal(true)} 
                  title="Click to Change Admin Profile Photo"
                >
                  <img 
                    src={adminAvatar} 
                    alt="avatar" 
                    style={{ width: '85px', height: '85px', borderRadius: '50%', border: '3px solid var(--primary)', objectFit: 'cover' }} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80";
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '0.35rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <Camera size={14} />
                  </div>
                </div>

                <div>
                  <h4 style={{ fontWeight: '800', fontSize: '1.2rem', margin: 0 }}>{adminName}</h4>
                  <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem', margin: '0.15rem 0 0.5rem 0' }}>{currentUser.role}</p>
                  <button
                    onClick={() => setShowPhotoModal(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'white',
                      border: '1px solid var(--border-light)',
                      color: 'var(--text-main)',
                      padding: '0.3rem 0.7rem',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      fontSize: '0.775rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Pencil size={12} /> Change Profile Photo
                  </button>
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                currentUser.avatar = adminAvatar;
                currentUser.name = adminName;
                currentUser.phone = adminPhone;
                if (onSaveSettings) {
                  onSaveSettings({ name: adminName, avatar: adminAvatar, phone: adminPhone });
                }
                setProfileSavedMsg(true);
                setTimeout(() => setProfileSavedMsg(false), 3000);
              }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label className="filter-label">Admin Display Name</label>
                  <input type="text" className="form-input" value={adminName} onChange={(e) => setAdminName(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="filter-label">Official Phone Number</label>
                  <input type="tel" className="form-input" value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="filter-label">Verified Email (System Node Locked)</label>
                  <input type="email" className="form-input" value={currentUser.email} disabled />
                </div>

                <button type="submit" className="btn-filter-apply" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center', padding: '0.7rem' }}>
                  <Save size={16} /> Save Admin Profile Changes
                </button>
              </form>
            </div>

            {/* Account Settings & Password Reset */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                Reset Access Password 🔐
              </h3>
              
              <form onSubmit={(e) => { e.preventDefault(); alert('Password updated successfully!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="filter-label">Current Node Password</label>
                  <input type="password" placeholder="••••••••" className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="filter-label">New Node Password</label>
                  <input type="password" placeholder="••••••••" className="form-input" required />
                </div>
                <button type="submit" className="btn-filter-apply" style={{ justifyContent: 'center', background: 'var(--secondary)' }}>
                  Update Password Credentials
                </button>
              </form>
            </div>
          </div>

          {/* CHANGE PROFILE PHOTO MODAL */}
          {showPhotoModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(5px)',
              zIndex: 20000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}>
              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                maxWidth: '480px',
                width: '100%',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Change Admin Profile Photo 📷</h3>
                  <button onClick={() => setShowPhotoModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Current Avatar Preview */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <img 
                      src={customAvatarUrl || adminAvatar} 
                      alt="Preview" 
                      style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid var(--primary)', objectFit: 'cover' }} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80";
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avatar Preview</span>
                  </div>

                  {/* Preset Avatars Chooser */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Choose from Admin Presets:</label>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {presetAdminAvatars.map((preset, idx) => (
                        <img
                          key={idx}
                          src={preset.url}
                          alt={preset.label}
                          title={preset.label}
                          onClick={() => {
                            setAdminAvatar(preset.url);
                            setCustomAvatarUrl('');
                          }}
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            border: adminAvatar === preset.url ? '3px solid var(--primary)' : '2px solid var(--border-light)',
                            transform: adminAvatar === preset.url ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.2s ease'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Custom Image URL Input */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Or Enter Image URL:</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://images.unsplash.com/..."
                      value={customAvatarUrl}
                      onChange={(e) => {
                        setCustomAvatarUrl(e.target.value);
                        if (e.target.value.trim()) {
                          setAdminAvatar(e.target.value.trim());
                        }
                      }}
                    />
                  </div>

                  {/* File Upload Dropzone */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Or Upload File from Computer:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            const base64Url = evt.target.result;
                            setAdminAvatar(base64Url);
                            setCustomAvatarUrl(base64Url);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => setShowPhotoModal(false)} style={{ flex: 1, padding: '0.65rem', border: '1px solid var(--border-light)', borderRadius: '4px', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}>
                      Cancel
                    </button>
                    <button type="button" className="btn-filter-apply" style={{ flex: 1.5, padding: '0.65rem' }} onClick={() => {
                      currentUser.avatar = adminAvatar;
                      if (onSaveSettings) {
                        onSaveSettings({ name: adminName, avatar: adminAvatar });
                      }
                      setShowPhotoModal(false);
                      setProfileSavedMsg(true);
                      setTimeout(() => setProfileSavedMsg(false), 3000);
                    }}>
                      Apply Profile Photo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 16. AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="admin-pane-container">
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Platform Audit Trails Log</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chronological registry tracking every critical action performed by system administrators.</p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Audit ID</th>
                  <th>Admin Node</th>
                  <th>Action Log Description</th>
                  <th>Logged Date & Time</th>
                  <th>IP Node Location</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: '700' }}>#{log.id}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: '700' }}>{log.admin}</td>
                    <td>{log.action}</td>
                    <td>{log.date}</td>
                    <td style={{ fontFamily: 'monospace' }}>{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 17. BACKUP & RECOVERY */}
      {activeTab === 'backup' && (
        <div className="admin-pane-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Database Backup & Recovery</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Generate manual SQL snapshots, schedule automatic checkpoints, or restore the platform state.</p>
            </div>

            {!isSupportStaff && (
              <button className="btn-filter-apply" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={createBackup}>
                <Database size={16} /> Trigger Database Backup Snapshot
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontWeight: '800', fontSize: '0.95rem' }}>Backup Log Archive</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {backups.map((b, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1rem', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Database size={20} style={{ color: 'var(--text-muted)' }} />
                    <div>
                      <h5 style={{ fontWeight: '700', fontSize: '0.9rem' }}>{b.name}</h5>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created on: {b.date} • Type: <strong>{b.type}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{b.size}</span>
                    
                    <button className="btn-card-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: 'white', border: '1px solid var(--border-light)' }} onClick={() => alert(`Downloading SQL script: ${b.name}`)}>
                      Download SQL File
                    </button>
                    {!isSupportStaff && (
                      <button className="btn-filter-apply" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: 'var(--warning)' }} onClick={() => {
                        if (window.confirm(`CRITICAL WARNING: Restore system database from ${b.name}? All current session updates will be overwritten.`)) {
                          addAuditLog(`Restored database state from backup: ${b.name}`);
                          alert('System snapshot state successfully restored.');
                        }
                      }}>
                        Restore Checkpoint
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectionModalItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.75rem', width: '100%', maxWidth: '450px', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--danger)' }}>Reject ID Verification</h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setRejectionModalItem(null)}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Enter the reason for rejecting <strong>{rejectionModalItem.user_name}</strong>'s ID verification submission:
            </p>

            <textarea 
              className="settings-textarea"
              rows={4}
              placeholder="e.g. ID card photo is blurry / expired document / student ID name does not match profile name..."
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.88rem' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="btn-card-secondary" style={{ border: '1px solid var(--border-light)' }} onClick={() => setRejectionModalItem(null)}>
                Cancel
              </button>

              <button className="btn-filter-apply" style={{ background: 'var(--danger)' }} onClick={handleConfirmRejection}>
                Confirm Rejection & Send Notifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
