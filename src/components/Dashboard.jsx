import React, { useState, useEffect } from 'react';
import { 
  BarChart3, MessageSquare, Star, Zap, MapPin, Plus, Trash2, Edit, 
  Check, X, FileText, Download, ShieldCheck, UserCheck, AlertTriangle, 
  TrendingUp, Users, DollarSign, Calendar, Upload, FileSignature, 
  Eye, RefreshCw, HelpCircle, ArrowUpRight, Bell, CreditCard, Home, Settings,
  Map, Phone, Sparkles, ShieldAlert, CheckCircle, Mail, ChevronRight, Ban, Lock
} from 'lucide-react';
import { 
  DEFAULT_BOOKINGS, 
  DEFAULT_PAYMENTS, 
  DEFAULT_TENANTS, 
  DEFAULT_REVIEWS, 
  DEFAULT_NOTIFICATIONS 
} from '../database/mockDb';
import { dbService } from '../database/supabaseClient';
import { downloadPaymentReceipt } from '../utils/receiptGenerator';
import { downloadSignedContract } from '../utils/contractGenerator';
import { checkLandlordProfileCompleteness, getAvatarUrl, compressImage } from '../utils/profileCompleteness';

import Messaging from './Messaging';

function Dashboard({ listings, onAddListing, onEditListing, onDeleteListing, currentUser, activeTab: propActiveTab = 'dashboard', onTabChange, onSaveSettings, payments: propPayments = [], onApprovePayment, chats = [], notifications: propNotifications = [], onStartChat }) {
  
  // Map page names from App.jsx to internal dashboard sub-tab IDs
  let activeTab = 'overview';
  if (propActiveTab === 'landlord_properties') activeTab = 'properties';
  else if (propActiveTab === 'landlord_add_property') activeTab = 'add_property';
  else if (propActiveTab === 'landlord_bookings') activeTab = 'bookings';
  else if (propActiveTab === 'landlord_tenants') activeTab = 'tenants';
  else if (propActiveTab === 'landlord_contracts') activeTab = 'contracts';
  else if (propActiveTab === 'landlord_payments') activeTab = 'payments';
  else if (propActiveTab === 'landlord_reviews') activeTab = 'reviews';
  else if (propActiveTab === 'landlord_analytics') activeTab = 'analytics';
  else if (propActiveTab === 'landlord_notifications') activeTab = 'notifications';
  else if (propActiveTab === 'landlord_profile' || propActiveTab === 'profile') activeTab = 'verification';
  else if (propActiveTab === 'landlord_nid') activeTab = 'verification';
  else if (propActiveTab === 'messages' || propActiveTab === 'landlord_messages') activeTab = 'messages';
  else if (propActiveTab === 'dashboard') activeTab = 'overview';

  // Dynamic Landlord Portal States (Backed by localStorage for persistence)
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('rentease_bookings');
    return saved ? JSON.parse(saved) : DEFAULT_BOOKINGS;
  });
  
  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem('rentease_payments');
    return saved ? JSON.parse(saved) : DEFAULT_PAYMENTS;
  });

  const [tenants, setTenants] = useState(() => {
    const saved = localStorage.getItem('rentease_tenants');
    return saved ? JSON.parse(saved) : DEFAULT_TENANTS;
  });

  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('rentease_reviews');
    return saved ? JSON.parse(saved) : DEFAULT_REVIEWS;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('rentease_notifications');
    return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
  });

  // Local Storage synchronization
  useEffect(() => {
    localStorage.setItem('rentease_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('rentease_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('rentease_tenants', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('rentease_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('rentease_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Form states for Property Management (Add/Edit)
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [propertyTitle, setPropertyTitle] = useState('');
  const [propertyPrice, setPropertyPrice] = useState('');
  const [propertyDeposit, setPropertyDeposit] = useState('');
  const [propertyLocation, setPropertyLocation] = useState('Mirpur 2, Dhaka');
  const [propertyType, setPropertyType] = useState('Entire Apartment');
  const [propertyDescription, setPropertyDescription] = useState('');
  const [propertyBedrooms, setPropertyBedrooms] = useState('2');
  const [propertyBathrooms, setPropertyBathrooms] = useState('2');
  const [propertyFurnished, setPropertyFurnished] = useState('Furnished');
  const [propertyDistance, setPropertyDistance] = useState('0.4 miles');
  const [propertyMapLink, setPropertyMapLink] = useState('https://maps.google.com/?q=BUBT');
  const [propertyImages, setPropertyImages] = useState('');
  const [propertyVideo, setPropertyVideo] = useState('');
  
  // Facilities checkboxes
  const [facilityWifi, setFacilityWifi] = useState(true);
  const [facilityAC, setFacilityAC] = useState(false);
  const [facilitySecurity, setFacilitySecurity] = useState(true);
  const [facilityGenerator, setFacilityGenerator] = useState(false);
  const [facilityLift, setFacilityLift] = useState(false);
  const [facilityKitchen, setFacilityKitchen] = useState(true);

  // Contract Agreement form states
  const [contractTenant, setContractTenant] = useState('Ashikur Rahman');
  const [contractAddress, setContractAddress] = useState('Mirpur 2, Dhaka (Near BUBT Gate 1)');
  const [contractRent, setContractRent] = useState('1,250');
  const [contractDeposit, setContractDeposit] = useState('2,500');
  const [contractStart, setContractStart] = useState('2026-07-01');
  const [contractExpiry, setContractExpiry] = useState('2027-06-30');
  const [contractTerms, setContractTerms] = useState('The tenant agrees to keep the premises clean and pay utilities by the 10th of every month. No loud music or events are permitted after 11:00 PM.');
  const [uploadedContractName, setUploadedContractName] = useState('');

  // Contract Signature & List State
  const [landlordProfileName, setLandlordProfileName] = useState(currentUser.name || 'Mehadi Hasan');
  const [landlordSignatureInput, setLandlordSignatureInput] = useState(currentUser.name || 'Mehadi Hasan');
  const [contractsList, setContractsList] = useState([]);

  useEffect(() => {
    dbService.getContracts().then(fetched => {
      if (Array.isArray(fetched)) setContractsList(fetched);
    });
  }, []);

  const handleSendContractToStudent = async (e) => {
    e.preventDefault();
    if (!landlordSignatureInput.trim()) {
      alert('Please type your legal name in the signature field before sending to student.');
      return;
    }

    const newContract = {
      id: 'contract_' + Date.now(),
      landlordName: landlordProfileName,
      landlord_name: landlordProfileName,
      landlordEmail: currentLandlordEmail,
      landlord_email: currentLandlordEmail,
      landlordSignatureName: landlordSignatureInput,
      landlord_signature_name: landlordSignatureInput,
      studentName: contractTenant,
      student_name: contractTenant,
      tenantName: contractTenant,
      propertyAddress: contractAddress,
      property_address: contractAddress,
      propertyTitle: contractAddress,
      monthlyRent: parseInt(String(contractRent).replace(/[^0-9.]/g, '')) || 8500,
      securityDeposit: parseInt(String(contractDeposit).replace(/[^0-9.]/g, '')) || 17000,
      commenceDate: contractStart,
      expiryDate: contractExpiry,
      specialTerms: contractTerms,
      status: 'pending_student_signature',
      createdAt: new Date().toISOString()
    };

    const updated = await dbService.saveContract(newContract);
    setContractsList(updated);

    // Notify Student
    dbService.addNotification({
      id: 'notif_' + Date.now(),
      type: 'contract',
      title: 'Tenancy Contract Ready for Signature 📝',
      message: `Landlord ${landlordProfileName} sent a lease contract for "${contractAddress}". Please review and sign under Contracts.`,
      desc: `Landlord ${landlordProfileName} sent a lease contract for "${contractAddress}".`,
      user_email: '', // student email
      time: 'Just now',
      read: false
    });

    addNotification('contract', 'Lease Contract Sent', `Tenancy agreement sent to ${contractTenant} for signature.`);
    alert(`Tenancy contract sent to ${contractTenant} successfully! Status set to Pending Student Signature.`);
  };
  const [landlordEmail] = useState(currentUser.email || 'mehadi@rentease.com');
  const [landlordPassword, setLandlordPassword] = useState('••••••••');
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [paymentAccount, setPaymentAccount] = useState('+880 1712-345678');
  const [bankName, setBankName] = useState('City Bank PLC');
  const [bankBranch, setBankBranch] = useState('Mirpur Branch');
  const [bankAccountNo, setBankAccountNo] = useState('2201992813123');

  // Landlord Profile States
  const [landlordCode] = useState(() => currentUser?.landlordCode || currentUser?.landlord_code || ('LND-' + Math.floor(100000 + Math.random() * 900000)));
  const [landlordPhone, setLandlordPhone] = useState(currentUser?.phone || currentUser?.phone_number || '+880 1712-345678');
  const [landlordAddress, setLandlordAddress] = useState(currentUser?.address || 'House 45, Road 12, Block C, Mirpur 2, Dhaka');
  const [landlordNidNumber, setLandlordNidNumber] = useState(currentUser?.nidNumber || currentUser?.nid_number || '19922692518293019');
  const [landlordAvatar, setLandlordAvatar] = useState(currentUser?.avatar || currentUser?.avatar_url || currentUser?.profile_picture || '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Change Password Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleLandlordChangePassword = async (e) => {
    if (e) e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!oldPassword.trim()) {
      setPasswordError('Current password is required.');
      return;
    }
    if (!newPassword.trim()) {
      setPasswordError('New password is required.');
      return;
    }
    if (!confirmPassword.trim()) {
      setPasswordError('Please confirm your new password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New Password and Confirm New Password do not match!');
      return;
    }
    if (newPassword === oldPassword) {
      setPasswordError('New Password cannot be identical to your Current Password.');
      return;
    }

    setIsChangingPassword(true);
    try {
      // SERVER-SIDE BACKEND PASSWORD VERIFICATION & HASH UPDATE
      await dbService.changePassword({
        userEmail: landlordEmail,
        oldPassword,
        newPassword,
        confirmPassword
      });

      setPasswordSuccess('✓ Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('✓ Password updated successfully! Please use your new password on next login.');
    } catch (err) {
      setPasswordError(err.message || 'Current password is incorrect.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const currentLandlordProfile = {
    id: currentUser?.id || 'lnd_1',
    name: landlordProfileName,
    full_name: landlordProfileName,
    email: landlordEmail,
    phone: landlordPhone,
    address: landlordAddress,
    nidNumber: landlordNidNumber,
    nid_number: landlordNidNumber,
    avatar: landlordAvatar,
    avatar_url: landlordAvatar,
    profile_picture: landlordAvatar,
    payoutChannel: paymentMethod,
    paymentMethod: paymentMethod,
    accountNumber: paymentAccount,
    paymentAccount: paymentAccount,
    landlordCode: landlordCode,
    landlord_code: landlordCode
  };

  const { isComplete: isLandlordProfileComplete, missingFields: missingLandlordFields } = checkLandlordProfileCompleteness(currentLandlordProfile);

  const handleLandlordAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      alert('❌ Invalid file format! Only JPG, PNG, and WEBP image files are allowed for your profile picture.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('❌ File size exceeds 2 MB limit! Please upload a smaller profile picture.');
      return;
    }

    setAvatarUploading(true);
    try {
      const compressedDataUrl = await compressImage(file, 300, 300, 0.85);
      setLandlordAvatar(compressedDataUrl);
      alert('✓ Profile photo updated! Click "Save Profile Settings" below to save your changes.');
    } catch (err) {
      alert('Failed to process image file. Please try another photo.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveLandlordProfile = async (e) => {
    e.preventDefault();
    if (!landlordProfileName.trim()) {
      alert('❌ Please enter your full legal owner name.');
      return;
    }
    if (!landlordPhone.trim()) {
      alert('❌ Please enter a valid contact phone number.');
      return;
    }
    if (!landlordAddress.trim()) {
      alert('❌ Please enter your official address.');
      return;
    }
    if (!landlordNidNumber.trim()) {
      alert('❌ Please enter your National ID (NID) Number.');
      return;
    }

    const updatedProfile = await dbService.saveLandlordProfile(currentLandlordProfile);

    if (onSaveSettings) {
      onSaveSettings({
        name: landlordProfileName,
        phone: landlordPhone,
        address: landlordAddress,
        nidNumber: landlordNidNumber,
        avatar: landlordAvatar,
        paymentMethod: paymentMethod,
        paymentAccount: paymentAccount,
        bankName,
        bankBranch,
        bankAccountNo
      });
    }

    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 4000);
    alert('✓ Landlord profile settings saved successfully! All updates saved to database.');
  };

  // Verification upload states
  const [nidUploaded, setNidUploaded] = useState(false);
  const [deedsUploaded, setDeedsUploaded] = useState(false);
  const [utilityBillUploaded, setUtilityBillUploaded] = useState(false);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [propertyVerificationStatus, setPropertyVerificationStatus] = useState('Pending');
  const [landlordNidRecord, setLandlordNidRecord] = useState(null);

  useEffect(() => {
    if (currentUser?.email) {
      dbService.getIdVerificationStatus(currentUser.email).then(rec => {
        if (rec) setLandlordNidRecord(rec);
      });
    }
  }, [currentUser?.email]);

  // Review reply states
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Mock message quick replies
  const [quickMessageText, setQuickMessageText] = useState('');
  const [activeMessageRecipient, setActiveMessageRecipient] = useState(null);

  // Exporters simulated state
  const [exportMessage, setExportMessage] = useState('');

  // Sync profile details & fetch live database tenants for logged-in landlord
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setLandlordProfileName(currentUser.name);
      if (currentUser.paymentMethod) setPaymentMethod(currentUser.paymentMethod);
      if (currentUser.paymentAccount) setPaymentAccount(currentUser.paymentAccount);
      if (currentUser.bankName) setBankName(currentUser.bankName);
      if (currentUser.bankBranch) setBankBranch(currentUser.bankBranch);
      if (currentUser.bankAccountNo) setBankAccountNo(currentUser.bankAccountNo);

      dbService.getTenantsForLandlord(currentUser).then(fetchedTenants => {
        if (Array.isArray(fetchedTenants)) {
          setTenants(fetchedTenants);
        }
      });
    }
  }, [currentUser]);

  const currentLandlordEmail = (currentUser?.email || '').toLowerCase().trim();
  const currentLandlordName = (currentUser?.name || landlordProfileName || '').toLowerCase().trim();

  // 1. STATS CARDS: Strictly filter listings belonging to this logged-in landlord
  const myProperties = listings.filter(item => {
    if (!item) return false;
    const lEmail = (item.landlord_email || item.landlord?.email || '').toLowerCase().trim();
    const lId = (item.landlord_id || item.landlord?.id || '').toString();
    const lName = (item.landlord_name || item.landlord?.name || '').toLowerCase().trim();

    if (currentLandlordEmail && lEmail && lEmail === currentLandlordEmail) return true;
    if (currentUser?.id && lId && lId === currentUser.id.toString()) return true;
    if (currentLandlordName && lName && lName === currentLandlordName) return true;
    return false;
  });

  // Filter bookings tied to this landlord's properties or email
  const myBookings = bookings.filter(b => {
    if (!b) return false;
    const isMyProp = myProperties.some(p => String(p.id) === String(b.propertyId || b.property_id));
    const bEmail = (b.landlord_email || b.landlordEmail || '').toLowerCase().trim();
    return isMyProp || (currentLandlordEmail && bEmail === currentLandlordEmail);
  });

  // Filter payments received for this landlord
  const combinedPayments = propPayments.length > 0 ? propPayments : payments;
  const myPayments = combinedPayments.filter(p => {
    if (!p) return false;
    const isMyProp = myProperties.some(l => String(l.id) === String(p.propertyId || p.property_id) || l.title === p.propertyTitle);
    const pEmail = (p.landlord_email || p.landlordEmail || '').toLowerCase().trim();
    return isMyProp || (currentLandlordEmail && pEmail === currentLandlordEmail);
  });

  // Dynamic Landlord Helper Stats (Live Count & Sum Queries)
  const totalProperties = myProperties.length;
  const activeListings = myProperties.filter(p => !p.occupied && (p.status === 'approved' || p.status === 'available' || !p.status)).length;
  const rentedProperties = myProperties.filter(p => p.occupied || p.status === 'rented').length;
  const pendingRequests = myBookings.filter(b => (b.status || '').toLowerCase() === 'pending').length;
  const totalEarnings = myPayments
    .filter(p => (p.status || '').toLowerCase() === 'paid' || (p.status || '').toLowerCase() === 'completed')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // 2. LIVE NOTIFICATIONS FEED: Filter by landlord user_email or user_id
  const combinedNotifications = propNotifications.length > 0 ? propNotifications : notifications;
  const myNotifications = combinedNotifications.filter(n => {
    if (!n) return false;
    const nEmail = (n.user_email || n.email || '').toLowerCase().trim();
    const nUser = (n.user_id || n.userId || '').toString();
    if (!nEmail && !nUser) return true;
    return (currentLandlordEmail && nEmail === currentLandlordEmail) || (currentUser?.id && nUser === currentUser.id.toString());
  });

  // 3. RECENT TENANT CHATS: Filter conversations belonging to this landlord (excluding roommate student chats)
  const landlordChats = (chats || []).filter(c => {
    if (!c) return false;
    if (c.conversation_type === 'roommate_chat' || c.type === 'roommate_chat' || c.role === 'Student / Roommate') return false;
    const lEmail = (c.landlord_email || c.landlordEmail || '').toLowerCase().trim();
    const lId = (c.landlord_id || c.landlordId || '').toString();
    if (currentLandlordEmail && lEmail && lEmail === currentLandlordEmail) return true;
    if (currentUser?.id && lId && lId === currentUser.id.toString()) return true;
    return false;
  });

  // Form management for adding/editing property
  const handlePropertySubmit = (e) => {
    e.preventDefault();
    if (!propertyTitle || !propertyPrice || !propertyDescription) return;

    const facilities = [];
    if (facilityWifi) facilities.push('Wifi Included');
    if (facilityAC) facilities.push('AC');
    if (facilitySecurity) facilities.push('Security');
    if (facilityGenerator) facilities.push('Generator');
    if (facilityLift) facilities.push('Lift');
    if (facilityKitchen) facilities.push('Kitchen');
    if (propertyFurnished === 'Furnished') facilities.push('Furnished');

    const imageUrls = propertyImages.trim()
      ? propertyImages.split(',').map(url => url.trim())
      : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'];

    const newProperty = {
      title: propertyTitle,
      price: parseInt(propertyPrice),
      deposit: parseInt(propertyDeposit) || parseInt(propertyPrice) * 2,
      location: `${propertyLocation} (${propertyDistance} from BUBT)`,
      type: propertyType,
      facilities,
      image: imageUrls[0],
      images: imageUrls,
      video: propertyVideo,
      description: propertyDescription,
      bedrooms: propertyBedrooms,
      bathrooms: propertyBathrooms,
      furnished: propertyFurnished,
      occupied: false,
      mapLink: propertyMapLink,
      landlord: {
        name: landlordProfileName,
        rating: 4.8,
        phone: '+880 1712-345678'
      }
    };

    if (editingPropertyId) {
      onEditListing({
        ...newProperty,
        id: editingPropertyId,
        reviews: listings.find(l => l.id === editingPropertyId)?.reviews || []
      });
      setEditingPropertyId(null);
      // Create notification
      addNotification('properties', 'Property Updated', `You updated property details for "${propertyTitle}".`);
    } else {
      onAddListing(newProperty);
      // Create notification
      addNotification('properties', 'Property Added', `You listed a new property: "${propertyTitle}".`);
    }

    // Reset Form
    setPropertyTitle('');
    setPropertyPrice('');
    setPropertyDeposit('');
    setPropertyLocation('Mirpur 2, Dhaka');
    setPropertyType('Entire Apartment');
    setPropertyDescription('');
    setPropertyImages('');
    setPropertyVideo('');
    setPropertyBedrooms('2');
    setPropertyBathrooms('2');
    setPropertyFurnished('Furnished');
    setPropertyDistance('0.4 miles');
    setFacilityWifi(true);
    setFacilityAC(false);
    setFacilitySecurity(true);
    setFacilityGenerator(false);
    setFacilityLift(false);
    setFacilityKitchen(true);

    // Redirect to list
    onTabChange('landlord_properties');
  };

  const handleEditClick = (prop) => {
    setEditingPropertyId(prop.id);
    setPropertyTitle(prop.title);
    setPropertyPrice(prop.price.toString());
    setPropertyDeposit((prop.deposit || prop.price * 2).toString());
    setPropertyLocation(prop.location.split(' (')[0]);
    setPropertyType(prop.type);
    setPropertyDescription(prop.description || '');
    setPropertyBedrooms(prop.bedrooms || '2');
    setPropertyBathrooms(prop.bathrooms || '2');
    setPropertyFurnished(prop.furnished || 'Furnished');
    setPropertyDistance(prop.location.includes('BUBT') ? '0.4 miles' : '1.2 miles');
    setPropertyMapLink(prop.mapLink || 'https://maps.google.com/?q=BUBT');
    setPropertyImages(prop.images ? prop.images.join(', ') : prop.image);
    setPropertyVideo(prop.video || '');
    setFacilityWifi(prop.facilities.includes('Wifi Included') || prop.facilities.includes('Wi-Fi'));
    setFacilityAC(prop.facilities.includes('AC'));
    setFacilitySecurity(prop.facilities.includes('Security'));
    setFacilityGenerator(prop.facilities.includes('Generator'));
    setFacilityLift(prop.facilities.includes('Lift'));
    setFacilityKitchen(prop.facilities.includes('Kitchen'));

    // Go to edit page
    onTabChange('landlord_add_property');
  };

  const handleDeleteClick = (id, title) => {
    if (window.confirm(`Are you sure you want to delete listing: "${title}"?`)) {
      onDeleteListing(id);
      addNotification('properties', 'Property Deleted', `You deleted the property: "${title}".`);
    }
  };

  const toggleOccupiedStatus = (prop) => {
    const updated = {
      ...prop,
      occupied: !prop.occupied
    };
    onEditListing(updated);
    addNotification('properties', 'Occupancy Changed', `"${prop.title}" marked as ${!prop.occupied ? 'Occupied' : 'Available'}.`);
  };

  // Notification center helper
  const addNotification = (type, title, message) => {
    const newNotif = {
      id: 'notif_' + Date.now(),
      type,
      title,
      message,
      user_email: currentLandlordEmail,
      user_id: currentUser?.id,
      time: 'Just now',
      read: false
    };
    dbService.addNotification(newNotif);
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Booking & Roommate approval logic
  const handleBookingRequest = (bookingId, status) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    const targetBooking = bookings.find(b => b.id === bookingId);
    
    if (status === 'Accepted') {
      // Add to tenants
      const newTenant = {
        id: 'ten_' + Date.now(),
        name: targetBooking.tenantName,
        email: targetBooking.tenantEmail,
        phone: targetBooking.tenantPhone,
        studentId: targetBooking.studentId,
        studentIdVerified: true,
        propertyTitle: targetBooking.propertyTitle,
        propertyId: targetBooking.propertyId,
        rentAmount: targetBooking.price,
        moveInDate: new Date().toISOString().split('T')[0],
        status: 'Current',
        nidPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80'
      };
      setTenants(prev => [newTenant, ...prev]);
      
      // Auto create billing record
      const newBilling = {
        id: 'pay_' + Date.now(),
        tenantName: targetBooking.tenantName,
        propertyTitle: targetBooking.propertyTitle,
        amount: targetBooking.price,
        month: 'July 2026',
        status: 'Pending',
        date: '',
        receiptId: 'REC-' + Math.floor(10000 + Math.random() * 90000),
        depositStatus: 'Refundable'
      };
      setPayments(prev => [newBilling, ...prev]);

      // Set property as occupied
      const targetProperty = listings.find(l => l.id === targetBooking.propertyId);
      if (targetProperty) {
        onEditListing({ ...targetProperty, occupied: true });
      }

      addNotification('booking', 'Booking Request Accepted', `You approved ${targetBooking.tenantName} for ${targetBooking.propertyTitle}.`);
    } else {
      addNotification('booking', 'Booking Request Rejected', `You rejected ${targetBooking.tenantName}'s booking request.`);
    }
  };

  // Tenant ID Verification
  const verifyTenantId = (tenantId, tenantName) => {
    setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, studentIdVerified: true } : t));
    alert(`${tenantName}'s Student ID has been verified successfully!`);
    addNotification('verification', 'ID Verified', `You verified the identity of ${tenantName}.`);
  };

  // Payment status updating
  const markPaymentAsPaid = (payId, tenantName, month) => {
    const today = new Date().toISOString().split('T')[0];
    const targetPay = (propPayments.length > 0 ? propPayments : payments).find(p => p.id === payId);
    const receiptId = targetPay?.receiptId || targetPay?.receiptNo || 'REC-' + Math.floor(100000 + Math.random() * 900000);

    if (onApprovePayment) {
      onApprovePayment(payId);
    }
    
    setPayments(prev => prev.map(p => {
      if (p.id === payId) {
        return {
          ...p,
          status: 'Paid',
          date: p.date || today,
          paymentDate: p.date || today,
          receiptId: receiptId,
          receiptNo: receiptId
        };
      }
      return p;
    }));

    // In-App Notification for Student
    const studentEmail = targetPay?.tenantEmail || targetPay?.studentEmail || targetPay?.email;
    const notifMsg = `Your rent payment of ৳${(targetPay?.amount || 0).toLocaleString()} BDT for ${month} has been CONFIRMED as Paid. Receipt #${receiptId} is now available for download.`;

    dbService.addNotification({
      id: 'notif_' + Date.now(),
      type: 'payment',
      title: 'Rent Payment Confirmed! 🧾',
      message: notifMsg,
      desc: notifMsg,
      user_email: studentEmail,
      time: 'Just now',
      read: false
    });

    addNotification('payment', 'Rent Payment Confirmed', `You marked ${tenantName}'s payment for ${month} as Paid (Receipt #${receiptId}).`);
    alert(`Payment of ${month} for ${tenantName} confirmed as PAID! Student notified and Receipt #${receiptId} generated.`);
  };

  // Review reply
  const handleReviewReplySubmit = (e, revId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setReviews(prev => prev.map(r => r.id === revId ? { ...r, replied: true, replyText } : r));
    setReplyText('');
    setActiveReplyId(null);
    alert('Reply posted successfully!');
  };

  // Flag review
  const flagReview = (revId) => {
    setReviews(prev => prev.map(r => r.id === revId ? { ...r, isFake: true } : r));
    alert('This review has been reported to administrators for inspection.');
  };

  // Exporters download simulations
  const triggerExport = (reportType) => {
    setExportMessage(`Simulating report compilation... Downloading ${reportType}_Report.csv`);
    setTimeout(() => {
      // Create a dummy CSV download
      let csvContent = "data:text/csv;charset=utf-8,";
      if (reportType === 'Income') {
        csvContent += "Month,Tenant,Property,Amount Paid,Status,Date\n";
        payments.forEach(p => {
          csvContent += `"${p.month}","${p.tenantName}","${p.propertyTitle}",${p.amount},"${p.status}","${p.date || 'N/A'}"\n`;
        });
      } else if (reportType === 'Tenant') {
        csvContent += "Name,Email,Phone,Student ID,Verified,Property,Move-in Date,Status\n";
        tenants.forEach(t => {
          csvContent += `"${t.name}","${t.email}","${t.phone}","${t.studentId}",${t.studentIdVerified},"${t.propertyTitle}","${t.moveInDate}","${t.status}"\n`;
        });
      } else {
        csvContent += "Booking ID,Tenant,Property,Rent Price,Request Date,Status\n";
        bookings.forEach(b => {
          csvContent += `"${b.id}","${b.tenantName}","${b.propertyTitle}",${b.price},"${b.date}","${b.status}"\n`;
        });
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `RentEase_${reportType}_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExportMessage('');
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Landlord Top Welcome Pane (Tab bar removed as tabs are in sidebar) */}
      <div className="glass-panel" style={{ padding: '1rem', background: 'white', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Host Manager Portal
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Welcome back, {landlordProfileName} ({currentUser.id})</p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className={`badge-pill-light`} style={{ background: (identityVerified || currentUser?.is_verified) ? '#d1fae5' : '#fef3c7', color: (identityVerified || currentUser?.is_verified) ? '#065f46' : '#92400e' }}>
              <ShieldCheck size={14} /> Identity: {(identityVerified || currentUser?.is_verified) ? 'Verified' : 'Pending Upload'}
            </span>
            <span className={`badge-pill-light`} style={{ background: '#dbeafe', color: '#1e40af' }}>
              Properties: {totalProperties === 0 ? 'No Listings' : `${myProperties.filter(p => p.verified || p.verification_status === 'approved').length}/${totalProperties} Verified`}
            </span>
          </div>
        </div>
      </div>

      {/* RENDER ACTIVE TAB FROM SIDEBAR ACTION */}
      
      {/* 1. OVERVIEW VIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Dashboard Stats Grid */}
          <div className="dashboard-grid">
            <div className="glass-panel dashboard-card">
              <div style={{ color: 'var(--primary-light)', marginBottom: '0.75rem' }}><Home size={28} /></div>
              <h3>{totalProperties}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Properties</p>
            </div>
            <div className="glass-panel dashboard-card">
              <div style={{ color: 'var(--secondary)', marginBottom: '0.75rem' }}><Zap size={28} /></div>
              <h3>{activeListings} / {totalProperties}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active / Available</p>
            </div>
            <div className="glass-panel dashboard-card">
              <div style={{ color: 'var(--primary-light)', marginBottom: '0.75rem' }}><Users size={28} /></div>
              <h3>{rentedProperties}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Rented Properties</p>
            </div>
            <div className="glass-panel dashboard-card">
              <div style={{ color: 'var(--danger)', marginBottom: '0.75rem' }}><Calendar size={28} /></div>
              <h3>{pendingRequests}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pending Requests</p>
            </div>
            <div className="glass-panel dashboard-card">
              <div style={{ color: '#059669', marginBottom: '0.75rem' }}><DollarSign size={28} /></div>
              <h3>{totalEarnings.toLocaleString()} BDT</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Monthly Earnings</p>
            </div>
          </div>

          <div className="dashboard-layout-main">
            {/* Center column */}
            <div className="dashboard-center-panel">
              {/* Notification Center snippet */}
              <div className="recent-activity-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bell size={18} style={{ color: 'var(--primary)' }} /> Live Notifications Feed
                  </h3>
                  <button className="widget-link" style={{ border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => onTabChange('landlord_notifications')}>
                    See All
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {myNotifications.length === 0 ? (
                    <div style={{ padding: '1rem 1.25rem', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      🔔 No recent notifications for your account.
                    </div>
                  ) : (
                    myNotifications.slice(0, 3).map(notif => (
                      <div key={notif.id || Math.random()} className="glass-panel" style={{ padding: '1rem', background: '#f8fafc', borderLeft: notif.read ? '3px solid var(--border-light)' : '3px solid var(--primary)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ marginTop: '0.2rem' }}>
                          {notif.type === 'booking' && <Calendar size={18} style={{ color: 'var(--primary)' }} />}
                          {notif.type === 'payment' && <DollarSign size={18} style={{ color: '#059669' }} />}
                          {notif.type === 'contract' && <FileText size={18} style={{ color: 'var(--warning)' }} />}
                          {(!notif.type || notif.type === 'general') && <Bell size={18} style={{ color: 'var(--primary)' }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', display: 'flex', justifyContent: 'space-between' }}>
                            {notif.title || notif.desc || 'Notification'}
                            <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'var(--text-muted)' }}>{notif.time || 'Recently'}</span>
                          </h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{notif.message || notif.desc || ''}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Host Quick Actions */}
              <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Host Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <button className="sidebar-cta-btn" style={{ margin: 0 }} onClick={() => onTabChange('landlord_add_property')}>
                    + Post New Property
                  </button>
                  <button className="btn-card-secondary" style={{ padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '600' }} onClick={() => onTabChange('landlord_contracts')}>
                    <FileSignature size={16} /> Draft a Tenancy Lease
                  </button>
                  <button className="btn-card-secondary" style={{ padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '600' }} onClick={() => onTabChange('landlord_payments')}>
                    <CreditCard size={16} /> Collect Rental Payment
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel: Recent messages & inquiries */}
            <div className="dashboard-right-panel">
              <div className="widget-card">
                <div className="widget-header">
                  <h3>Recent Tenant Chats</h3>
                </div>
                
                <div className="widget-messages-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {landlordChats.length === 0 ? (
                    <div style={{ padding: '1.25rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      💬 No tenant messages yet.
                    </div>
                  ) : (
                    landlordChats.slice(0, 3).map(chat => (
                      <div 
                        key={chat.id || Math.random()} 
                        className="widget-msg-item" 
                        style={{ cursor: 'pointer', background: 'var(--bg-deep)', padding: '0.75rem', borderRadius: '8px' }} 
                        onClick={() => {
                          if (onStartChat) {
                            onStartChat(chat.name || chat.contactName, '', chat.role || 'Student / Roommate');
                          }
                        }}
                      >
                        <div className="widget-msg-icon-box" style={{ background: 'var(--primary)', color: 'white', fontWeight: '700' }}>
                          {(chat.name || chat.contactName || 'T')[0].toUpperCase()}
                        </div>
                        <div className="widget-msg-details">
                          <div className="widget-msg-title-row">
                            <span className="widget-msg-name">{chat.name || chat.contactName || 'Tenant'}</span>
                            <span className="widget-msg-time">{chat.time || 'Recently'}</span>
                          </div>
                          <div className="widget-msg-text">{chat.lastMsg || chat.lastMessage || 'Click to open conversation'}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {activeMessageRecipient && (
                  <form onSubmit={(e) => { e.preventDefault(); alert(`Message sent to ${activeMessageRecipient}: "${quickMessageText}"`); setActiveMessageRecipient(null); setQuickMessageText(''); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Reply to {activeMessageRecipient}:</div>
                    <textarea 
                      className="form-input" 
                      placeholder="Type reply message..." 
                      rows="2" 
                      style={{ fontSize: '0.85rem' }}
                      value={quickMessageText}
                      onChange={(e) => setQuickMessageText(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn-filter-apply" style={{ padding: '0.4rem', fontSize: '0.8rem', alignSelf: 'flex-end' }}>
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MY PROPERTIES LIST VIEW */}
      {activeTab === 'properties' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Active Managed Properties ({myProperties.length})</h3>
            <button className="sidebar-cta-btn" style={{ margin: 0, width: 'auto', padding: '0.6rem 1.25rem' }} onClick={() => onTabChange('landlord_add_property')}>
              + Add New Property
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {myProperties.map(prop => (
              <div key={prop.id} className="glass-panel" style={{ padding: '1.25rem', background: 'white', display: 'flex', gap: '1.25rem', flexDirection: 'column', borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', gap: '1.25rem' }}>
                  <img 
                    src={prop.image} 
                    alt={prop.title} 
                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-light)' }} 
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80" }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '700', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{prop.title}</h4>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button className="nav-icon-btn" style={{ padding: '0.35rem', background: '#f1f5f9', borderRadius: '4px' }} onClick={() => handleEditClick(prop)} title="Edit Property">
                          <Edit size={14} />
                        </button>
                        <button className="nav-icon-btn" style={{ padding: '0.35rem', background: '#fee2e2', color: 'var(--danger)', borderRadius: '4px' }} onClick={() => handleDeleteClick(prop.id, prop.title)} title="Delete Property">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                      <MapPin size={12} style={{ color: 'var(--primary)' }} />
                      {prop.location}
                    </p>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>
                        {prop.price.toLocaleString()} BDT/mo
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        • Deposit: {(prop.deposit || prop.price * 2).toLocaleString()} BDT
                      </span>
                    </div>

                    <div className="listing-facilities" style={{ marginTop: '0.5rem' }}>
                      {prop.facilities.map((f, i) => (
                        <span key={i} className="facility-tag" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>{f}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: prop.occupied ? 'var(--danger)' : 'var(--secondary)' }}>
                      {prop.occupied ? 'Occupied' : 'Available'}
                    </span>
                  </div>

                  <button 
                    className="btn-card-secondary" 
                    style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.35rem 0.75rem', 
                      border: '1px solid var(--border-light)',
                      background: prop.occupied ? '#f8fafc' : '#ecfdf5',
                      color: prop.occupied ? 'var(--text-main)' : '#047857',
                      fontWeight: '700'
                    }}
                    onClick={() => toggleOccupiedStatus(prop)}
                  >
                    {prop.occupied ? 'Mark as Available' : 'Mark as Occupied'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. ADD PROPERTY VIEW */}
      {activeTab === 'add_property' && (
        <section className="glass-panel" style={{ padding: '2rem', background: 'white', maxWidth: '800px', margin: '0 auto', width: '100%', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
            {editingPropertyId ? 'Edit Listed Property' : 'Post a New Listing'}
          </h3>
          
          <form onSubmit={handlePropertySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="filter-label">Listing Title *</label>
              <input 
                type="text" 
                placeholder="e.g. Cozy Sublet Room near BUBT Gate 1" 
                className="form-input"
                value={propertyTitle}
                onChange={(e) => setPropertyTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="filter-label">Monthly Rent (BDT) *</label>
                <input 
                  type="number" 
                  placeholder="e.g. 5000" 
                  className="form-input"
                  value={propertyPrice}
                  onChange={(e) => setPropertyPrice(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="filter-label">Security Deposit (BDT)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 10000" 
                  className="form-input"
                  value={propertyDeposit}
                  onChange={(e) => setPropertyDeposit(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="filter-label">Property Type *</label>
                <select className="form-input" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                  <option value="Private Room">Private Room</option>
                  <option value="Entire Apartment">Entire Apartment</option>
                  <option value="Shared Room">Shared Room</option>
                  <option value="Hostel">Hostel</option>
                </select>
              </div>
              <div className="form-group">
                <label className="filter-label">Furnishing Status *</label>
                <select className="form-input" value={propertyFurnished} onChange={(e) => setPropertyFurnished(e.target.value)}>
                  <option value="Furnished">Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="filter-label">Bedrooms *</label>
                <input type="number" min="1" max="10" className="form-input" value={propertyBedrooms} onChange={(e) => setPropertyBedrooms(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="filter-label">Bathrooms *</label>
                <input type="number" min="1" max="10" className="form-input" value={propertyBathrooms} onChange={(e) => setPropertyBathrooms(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="filter-label">Distance from Campus *</label>
                <input type="text" placeholder="e.g. 0.4 miles" className="form-input" value={propertyDistance} onChange={(e) => setPropertyDistance(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="filter-label">Full Address *</label>
              <input 
                type="text" 
                placeholder="e.g. House 45, Road 2, Block B, Mirpur 2, Dhaka" 
                className="form-input"
                value={propertyLocation}
                onChange={(e) => setPropertyLocation(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="filter-label">Google Maps Link</label>
                <input 
                  type="url" 
                  placeholder="https://maps.google.com/..." 
                  className="form-input"
                  value={propertyMapLink}
                  onChange={(e) => setPropertyMapLink(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="filter-label">Campus Nearby Selection</label>
                <select className="form-input">
                  <option>BUBT Campus Only</option>
                  <option>BUBT & Central University</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="filter-label">Property Images (Comma separated URLs for multiples)</label>
              <input 
                type="text" 
                placeholder="https://image1.com, https://image2.com" 
                className="form-input"
                value={propertyImages}
                onChange={(e) => setPropertyImages(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="filter-label">Property Tour Video URL (Optional)</label>
              <input 
                type="url" 
                placeholder="https://youtube.com/watch?v=..." 
                className="form-input"
                value={propertyVideo}
                onChange={(e) => setPropertyVideo(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="filter-label">Facilities & Amenities</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                <label className="checkbox-item">
                  <input type="checkbox" checked={facilityWifi} onChange={(e) => setFacilityWifi(e.target.checked)} />
                  Wi-Fi Included
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" checked={facilityAC} onChange={(e) => setFacilityAC(e.target.checked)} />
                  AC Available
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" checked={facilitySecurity} onChange={(e) => setFacilitySecurity(e.target.checked)} />
                  24/7 Security
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" checked={facilityGenerator} onChange={(e) => setFacilityGenerator(e.target.checked)} />
                  Generator Backup
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" checked={facilityLift} onChange={(e) => setFacilityLift(e.target.checked)} />
                  Lift/Elevator
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" checked={facilityKitchen} onChange={(e) => setFacilityKitchen(e.target.checked)} />
                  Kitchen Access
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="filter-label">Property Description *</label>
              <textarea 
                placeholder="Tell students about rent rules, details of roommates, utility fees etc." 
                className="form-input"
                rows="4"
                style={{ resize: 'none' }}
                value={propertyDescription}
                onChange={(e) => setPropertyDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn-filter-apply" style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}>
                {editingPropertyId ? 'Update Listing' : 'Publish Property'}
              </button>
              <button type="button" className="btn-card-secondary" style={{ border: '1px solid var(--border-light)', padding: '0.75rem' }} onClick={() => { setEditingPropertyId(null); setPropertyTitle(''); setPropertyPrice(''); setPropertyDescription(''); onTabChange('landlord_properties'); }}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 4. BOOKING REQUESTS VIEW */}
      {activeTab === 'bookings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Booking & Roommate Requests</h3>
            <p style={{ color: 'var(--text-muted)' }}>Review and manage applications from students and roommate pairs seeking housing.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {bookings.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', background: 'white' }}>
                <p style={{ color: 'var(--text-muted)' }}>No current booking or roommate inquiries found.</p>
              </div>
            ) : (
              bookings.map(book => (
                <div key={book.id} className="glass-panel" style={{ padding: '1.5rem', background: 'white', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: book.status === 'Pending' ? '4px solid var(--warning)' : book.status === 'Accepted' ? '4px solid var(--secondary)' : '4px solid var(--border-light)' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{book.tenantName}</h4>
                        {book.isRoommateRequest && (
                          <span className="badge-pill-light" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', fontWeight: '700' }}>
                            <Sparkles size={12} /> Roommate Group Compatibility: {book.compatibilityScore}
                          </span>
                        )}
                      </div>
                      
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        Requesting: <strong style={{ color: 'var(--text-main)' }}>{book.propertyTitle}</strong>
                      </p>
                      <p style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>Submitted Date: {book.date}</p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>MONTHLY RENT</span>
                      <h4 style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.25rem' }}>{book.price.toLocaleString()} BDT</h4>
                      <span className={`badge`} style={{ position: 'static', background: book.status === 'Pending' ? 'var(--warning)' : book.status === 'Accepted' ? 'var(--secondary)' : 'var(--text-light)', color: 'white', marginTop: '0.5rem', display: 'inline-block' }}>
                        {book.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', background: 'var(--bg-deep)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <Mail size={14} style={{ color: 'var(--text-muted)' }} /> {book.tenantEmail}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <Phone size={14} style={{ color: 'var(--text-muted)' }} /> {book.tenantPhone}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <ShieldCheck size={14} style={{ color: book.studentIdVerified ? 'var(--secondary)' : 'var(--text-light)' }} /> Student ID: {book.studentId}
                    </div>
                  </div>

                  {book.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-end', marginTop: '0.5rem' }}>
                      <button 
                        className="btn-filter-apply" 
                        style={{ background: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1.25rem' }}
                        onClick={() => handleBookingRequest(book.id, 'Accepted')}
                      >
                        <Check size={16} /> {book.isRoommateRequest ? 'Approve Roommates' : 'Accept Request'}
                      </button>
                      <button 
                        className="btn-card-secondary" 
                        style={{ border: '1px solid var(--danger)', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1.25rem' }}
                        onClick={() => handleBookingRequest(book.id, 'Rejected')}
                      >
                        <X size={16} /> Reject Request
                      </button>
                    </div>
                  )}

                  {book.status === 'Accepted' && (
                    <button 
                      className="btn-card-secondary" 
                      style={{ border: '1px solid var(--border-light)', color: 'var(--text-muted)', alignSelf: 'flex-end', fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                      onClick={() => handleBookingRequest(book.id, 'Cancelled')}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. TENANTS VIEW */}
      {activeTab === 'tenants' && (
        <div className="contract-split">
          {/* Active Tenant List */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>Current Active Tenants</h3>
            </div>

            {tenants.filter(t => t.status === 'Current').map(ten => (
              <div key={ten.id} className="glass-panel" style={{ padding: '1.5rem', background: 'white', display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img src={ten.nidPhoto} alt={ten.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-light)' }} />
                  <div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: '800' }}>{ten.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tenant of <strong style={{ color: 'var(--text-main)' }}>{ten.propertyTitle}</strong></p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <div>Email: <strong style={{ color: 'var(--text-main)' }}>{ten.email}</strong></div>
                  <div>Phone: <strong style={{ color: 'var(--text-main)' }}>{ten.phone}</strong></div>
                  <div>Student ID: <strong style={{ color: 'var(--text-main)' }}>{ten.studentId}</strong></div>
                  <div>Move-in Date: <strong style={{ color: 'var(--text-main)' }}>{ten.moveInDate}</strong></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <ShieldCheck size={16} style={{ color: ten.studentIdVerified ? 'var(--secondary)' : 'var(--warning)' }} />
                    <span style={{ fontSize: '0.85rem' }}>Student ID Status: <strong>{ten.studentIdVerified ? 'Verified' : 'Pending Verification'}</strong></span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!ten.studentIdVerified && (
                      <button className="btn-filter-apply" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={() => verifyTenantId(ten.id, ten.name)}>
                        Verify Student ID
                      </button>
                    )}
                    <button 
                      className="btn-filter-apply" 
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }} 
                      onClick={() => {
                        if (onStartChat) {
                          console.log('[Message Tenant Clicked]', { name: ten.name, email: ten.email, id: ten.studentId || ten.id });
                          onStartChat(ten.name, '', 'Tenant / Student', ten.nidPhoto, ten.email, ten.studentId || ten.id);
                        }
                      }}
                    >
                      <MessageSquare size={14} /> Message Tenant
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Tenant History Timeline */}
          <section className="glass-panel" style={{ padding: '2rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Previous Lease History</h3>
            
            <div className="activity-timeline">
              {tenants.filter(t => t.status === 'Previous').map(ten => (
                <div key={ten.id} className="timeline-item">
                  <div className="timeline-dot orange"></div>
                  <div className="timeline-body">
                    <div className="timeline-content">
                      <h4 style={{ fontWeight: '700' }}>{ten.name}</h4>
                      <p style={{ fontSize: '0.8rem' }}>Rented Mirpur House (Lease finished)</p>
                      <p style={{ color: 'var(--text-light)', fontSize: '0.75rem', marginTop: '0.15rem' }}>Lease: Jan 2025 - Dec 2025</p>
                    </div>
                    <div className="timeline-time"><ShieldCheck size={14} style={{ color: 'var(--secondary)' }} /> Left clean</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* 6. LEASE AGREEMENT BUILDER VIEW */}
      {activeTab === 'contracts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Leases & Tenancy Contracts</h3>
            <p style={{ color: 'var(--text-muted)' }}>Generate formal tenancy agreements, print/save them directly as PDFs, and configure agreement expirations.</p>
          </div>

          <div className="contract-split">
            {/* Editor form */}
            <div className="glass-panel" style={{ padding: '2rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <h4 style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Lease Terms Editor</h4>
              
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="filter-label">Landlord Name (First Party)</label>
                  <input type="text" className="form-input" value={landlordProfileName} disabled />
                </div>

                <div className="form-group">
                  <label className="filter-label">Tenant Name (Second Party)</label>
                  <input type="text" className="form-input" value={contractTenant} onChange={(e) => setContractTenant(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="filter-label">Leased Address</label>
                  <input type="text" className="form-input" value={contractAddress} onChange={(e) => setContractAddress(e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="filter-label">Monthly Rent (BDT)</label>
                    <input type="text" className="form-input" value={contractRent} onChange={(e) => setContractRent(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="filter-label">Refundable Deposit (BDT)</label>
                    <input type="text" className="form-input" value={contractDeposit} onChange={(e) => setContractDeposit(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="filter-label">Commencement Date</label>
                    <input type="date" className="form-input" value={contractStart} onChange={(e) => setContractStart(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="filter-label">Expiry Date</label>
                    <input type="date" className="form-input" value={contractExpiry} onChange={(e) => setContractExpiry(e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="filter-label">Special Terms & Rules</label>
                  <textarea className="form-input" rows="3" style={{ resize: 'none' }} value={contractTerms} onChange={(e) => setContractTerms(e.target.value)}></textarea>
                </div>

                <div className="form-group" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <label className="filter-label" style={{ color: 'var(--primary)' }}>Landlord Typed Signature (Script Style Font):</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive", fontSize: '1.5rem', background: 'white' }}
                    value={landlordSignatureInput} 
                    onChange={(e) => setLandlordSignatureInput(e.target.value)} 
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <button type="button" className="btn-filter-apply" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }} onClick={handleSendContractToStudent}>
                    <FileSignature size={16} /> Send to Student for Signature
                  </button>
                  <button type="button" className="btn-card-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', border: '1px solid var(--border-light)' }} onClick={() => downloadSignedContract({
                    landlordName: landlordProfileName,
                    landlordSignatureName: landlordSignatureInput,
                    studentName: contractTenant,
                    propertyAddress: contractAddress,
                    monthlyRent: contractRent,
                    securityDeposit: contractDeposit,
                    commenceDate: contractStart,
                    expiryDate: contractExpiry,
                    specialTerms: contractTerms,
                    status: 'pending'
                  })}>
                    <PrinterIcon size={16} /> Preview Agreement PDF
                  </button>
                </div>
              </form>

              {/* Upload signed lease */}
              <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '2rem', paddingTop: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>Upload Signed Agreement</h4>
                <div style={{ border: '2px dashed var(--border-light)', padding: '1.5rem', textAlign: 'center', borderRadius: '8px', cursor: 'pointer' }} onClick={() => document.getElementById('contract-file-upload').click()}>
                  <input 
                    type="file" 
                    id="contract-file-upload" 
                    style={{ display: 'none' }} 
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        setUploadedContractName(e.target.files[0].name);
                        alert(`Signed agreement saved: ${e.target.files[0].name}`);
                        addNotification('contract', 'Signed Lease Uploaded', `Uploaded signed lease: "${e.target.files[0].name}".`);
                      }
                    }} 
                  />
                  <Upload size={32} style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {uploadedContractName ? `Selected: ${uploadedContractName}` : 'Click to select signed lease PDF file'}
                  </p>
                </div>
              </div>
            </div>

            {/* Agreement Live Preview Sheet */}
            <div className="contract-preview-container" style={{ border: '1px solid var(--border-light)', padding: '2.5rem', background: 'white' }}>
              <div className="contract-header" style={{ borderBottom: '2px double #111', paddingBottom: '0.75rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.35rem', textTransform: 'uppercase', fontFamily: 'serif', fontWeight: '800' }}>House Tenancy Deed</h2>
                <span style={{ fontSize: '0.7rem', color: '#555', letterSpacing: '1px' }}>BUBT CSE CAMPUS APPROVED FRAMEWORK</span>
              </div>

              <div className="contract-body" style={{ fontSize: '0.85rem', fontFamily: 'serif', lineHeight: '1.6', textAlign: 'justify' }}>
                <p className="contract-clause">
                  This Agreement is made on <span className="contract-underline">{contractStart}</span>, by and between:
                </p>

                <p className="contract-clause" style={{ textIndent: '1.5rem' }}>
                  <strong>First Party (Landlord/Owner):</strong> <span className="contract-underline">{landlordProfileName}</span>, residing in Mirpur, Dhaka.
                </p>
                <p className="contract-clause" style={{ textIndent: '1.5rem' }}>
                  <strong>Second Party (Tenant/Student):</strong> <span className="contract-underline">{contractTenant}</span>, enrolled in University.
                </p>

                <p className="contract-clause" style={{ marginTop: '1rem' }}>
                  <strong>1. SUBJECT PREMISES:</strong> The Landlord leases to the Tenant the student room/housing located at: <span className="contract-underline">{contractAddress}</span>.
                </p>
                
                <p className="contract-clause">
                  <strong>2. COMMENCEMENT & TERM:</strong> The lease commences on <span className="contract-underline">{contractStart}</span> and shall terminate on <span className="contract-underline">{contractExpiry}</span>, unless cancelled early.
                </p>

                <p className="contract-clause">
                  <strong>3. FINANCIALS:</strong> The Tenant agrees to pay rent of <span className="contract-underline">{contractRent} BDT/month</span>. A refundable security deposit of <span className="contract-underline">{contractDeposit} BDT</span> has been deposited.
                </p>

                <p className="contract-clause">
                  <strong>4. GENERAL COVENANTS:</strong> <span className="contract-underline">{contractTerms}</span>
                </p>

                <p style={{ marginTop: '2.5rem' }}>In Witness Whereof, the Parties execute this agreement:</p>

                <div className="contract-signatures" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
                  <div className="signature-line" style={{ borderTop: '1px solid #111', width: '40%', padding: '0.5rem 0', textAlign: 'center', fontSize: '0.75rem' }}>
                    First Party (Landlord)
                  </div>
                  <div className="signature-line" style={{ borderTop: '1px solid #111', width: '40%', padding: '0.5rem 0', textAlign: 'center', fontSize: '0.75rem' }}>
                    Second Party (Tenant)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Issued Contracts Ledger */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>
              Issued Tenancy Contracts History ({contractsList.length})
            </h4>

            {contractsList.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                No lease contracts issued yet. Fill the terms above and click "Send to Student for Signature".
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {contractsList.map(c => (
                  <div key={c.id} style={{ padding: '1rem 1.25rem', border: '1px solid var(--border-light)', borderRadius: '8px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h4 style={{ fontWeight: '800', fontSize: '0.95rem', margin: 0 }}>{c.propertyTitle || c.propertyAddress}</h4>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                        Tenant: <strong>{c.studentName || c.tenantName}</strong> • Rent: ৳{(Number(c.monthlyRent || c.rent) || 8500).toLocaleString()} BDT
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: '800', 
                        padding: '0.3rem 0.65rem', 
                        borderRadius: '50px',
                        background: (c.status === 'signed' || c.status === 'Active') ? '#d1fae5' : '#fef3c7',
                        color: (c.status === 'signed' || c.status === 'Active') ? '#065f46' : '#b45309'
                      }}>
                        {(c.status === 'signed' || c.status === 'Active') ? '✓ Fully Signed' : '⏳ Pending Student Signature'}
                      </span>

                      <button className="btn-card-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => downloadSignedContract(c)}>
                        <Download size={14} /> Download PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. PAYMENTS VIEW */}
      {activeTab === 'payments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Rent Payments & Deposits Ledger</h3>
              <p style={{ color: 'var(--text-muted)' }}>Track monthly rental collections, check off pending payments, and view student security deposits.</p>
            </div>
            
            <button className="btn-filter-apply" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => {
              const newBilling = {
                id: 'pay_' + Date.now(),
                tenantName: window.prompt('Enter Tenant Name:') || 'New Tenant',
                propertyTitle: window.prompt('Enter Property Title:') || 'Mirpur Flat',
                amount: parseInt(window.prompt('Enter BDT Amount:') || '5000'),
                month: window.prompt('Enter Month (e.g. July 2026):') || 'July 2026',
                status: 'Pending',
                date: '',
                receiptId: 'REC-' + Math.floor(10000 + Math.random() * 90000),
                depositStatus: 'Refundable'
              };
              setPayments(prev => [newBilling, ...prev]);
              addNotification('payment', 'Invoice Created', `Invoice generated for ${newBilling.tenantName} (${newBilling.amount} BDT).`);
            }}>
              + Generate Rent Invoice
            </button>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', background: 'white', overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem' }}>Receipt ID</th>
                  <th style={{ padding: '0.75rem' }}>Tenant Name</th>
                  <th style={{ padding: '0.75rem' }}>Property</th>
                  <th style={{ padding: '0.75rem' }}>Amount</th>
                  <th style={{ padding: '0.75rem' }}>Billing Month</th>
                  <th style={{ padding: '0.75rem' }}>Deposit Status</th>
                  <th style={{ padding: '0.75rem' }}>Payment Date</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(propPayments.length > 0 ? propPayments : payments).map(pay => (
                  <tr key={pay.id} style={{ borderBottom: '1px solid var(--border-light)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '700' }}>{pay.receiptId || pay.receiptNo}</td>
                    <td style={{ padding: '0.75rem' }}>{pay.tenantName}</td>
                    <td style={{ padding: '0.75rem' }}>{pay.propertyTitle || pay.property}</td>
                    <td style={{ padding: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>{pay.amount.toLocaleString()} BDT</td>
                    <td style={{ padding: '0.75rem' }}>{pay.month}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className="badge-pill-light" style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem', background: '#e0f2fe', color: '#0369a1' }}>
                        {pay.depositStatus || 'Refundable'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{pay.date || 'Pending'}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px',
                        background: pay.status === 'Paid' ? '#d1fae5' : '#fef3c7',
                        color: pay.status === 'Paid' ? '#065f46' : '#b45309',
                        fontWeight: '700'
                      }}>
                        {pay.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      {pay.status !== 'Paid' && (
                        <button className="btn-filter-apply" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'var(--secondary)' }} onClick={() => markPaymentAsPaid(pay.id, pay.tenantName, pay.month)}>
                          Confirm Paid
                        </button>
                      )}
                      
                      <button className="btn-card-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.25rem' }} onClick={() => downloadPaymentReceipt(pay)}>
                        <Download size={12} /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. REVIEWS VIEW */}
      {activeTab === 'reviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Reviews & Student Ratings</h3>
              <p style={{ color: 'var(--text-muted)' }}>Respond to reviews posted by verified student tenants, and inspect overall ratings stats.</p>
            </div>
            
            <div style={{ background: '#fef3c7', color: '#92400e', padding: '1rem', borderRadius: '12px', border: '1px solid #fde68a', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700' }}>Overall Host Rating</span>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '800' }}>4.8 / 5.0</h3>
              <div style={{ color: 'var(--warning)', display: 'flex', gap: '0.1rem', justifyContent: 'center' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--warning)" color="var(--warning)" />)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {reviews.map(rev => (
              <div key={rev.id} className="glass-panel" style={{ padding: '1.5rem', background: 'white', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: rev.isFake ? '4px solid var(--danger)' : '1px solid var(--border-light)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{rev.author}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Property: <strong>{rev.propertyTitle}</strong></span>
                      {rev.isFake && (
                        <span className="badge-pill-light" style={{ background: '#fee2e2', color: 'var(--danger)', fontSize: '0.7rem' }}>
                          <ShieldAlert size={12} /> Flagged: Fake Review
                        </span>
                      )}
                    </div>
                    
                    <div className="review-stars" style={{ display: 'flex', gap: '0.1rem', marginTop: '0.25rem' }}>
                      {[...Array(5)].map((_, idx) => (
                        <Star 
                          key={idx} 
                          size={14} 
                          fill={idx < rev.rating ? "var(--warning)" : "none"} 
                          color={idx < rev.rating ? "var(--warning)" : "var(--text-light)"} 
                        />
                      ))}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date: {rev.date}</span>
                </div>

                <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontStyle: 'italic' }}>
                  "{rev.comment}"
                </p>

                {rev.replied ? (
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--primary-light)', fontSize: '0.9rem' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--primary)' }}>Owner Reply:</div>
                    <p style={{ marginTop: '0.25rem' }}>{rev.replyText}</p>
                  </div>
                ) : (
                  activeReplyId === rev.id ? (
                    <form onSubmit={(e) => handleReviewReplySubmit(e, rev.id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)' }}>Write response reply:</label>
                      <textarea 
                        className="form-input" 
                        placeholder="Write your host reply here..." 
                        rows="2" 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        required
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-end' }}>
                        <button type="submit" className="btn-filter-apply" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: 'var(--secondary)' }}>
                          Publish Reply
                        </button>
                        <button type="button" className="btn-card-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setActiveReplyId(null)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-end' }}>
                      <button className="btn-filter-apply" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setActiveReplyId(rev.id)}>
                        Reply to Review
                      </button>
                      {!rev.isFake && (
                        <button className="btn-card-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', border: '1px solid var(--danger)', color: 'var(--danger)' }} onClick={() => flagReview(rev.id)}>
                          Report Fake Review
                        </button>
                      )}
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. ANALYTICS VIEW */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Export Report message banner */}
          {exportMessage && (
            <div className="glass-panel" style={{ padding: '1rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px' }}>
              <RefreshCw size={16} className="animate-spin" />
              <span>{exportMessage}</span>
            </div>
          )}

          {/* CSS-based Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Monthly Earnings Chart */}
            <div className="glass-panel" style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '1.5rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={16} /> Monthly Revenue BDT
              </h4>
              
              <div style={{ display: 'flex', gap: '1.25rem', height: '200px', alignItems: 'flex-end', justifyContent: 'space-around', borderBottom: '2px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                {[
                  { month: 'Feb', val: 3200 },
                  { month: 'Mar', val: 4000 },
                  { month: 'Apr', val: 5600 },
                  { month: 'May', val: 5000 },
                  { month: 'Jun', val: 6800 },
                  { month: 'Jul', val: 7800 }
                ].map((bar, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.25rem' }}>{(bar.val).toLocaleString()}</div>
                    <div style={{ 
                      width: '100%', 
                      maxWidth: '30px', 
                      height: `${(bar.val / 8000) * 160}px`, 
                      background: i === 5 ? 'var(--primary)' : 'var(--primary-light)', 
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 1s ease'
                    }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Traffic & Occupancy Chart */}
            <div className="glass-panel" style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '1.5rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Eye size={16} /> Portfolio Traffic & Occupancy
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                    <span>Dhaka Rent Views</span>
                    <span>1,240 clicks</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '50px' }}>
                    <div style={{ width: '85%', height: '100%', background: 'var(--primary)', borderRadius: '50px' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                    <span>Mirpur House Views</span>
                    <span>450 clicks</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '50px' }}>
                    <div style={{ width: '40%', height: '100%', background: 'var(--primary-light)', borderRadius: '50px' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                    <span>Portfolio Occupancy Rate</span>
                    <span>{totalProperties > 0 ? Math.round((rentedProperties / totalProperties) * 100) : 0}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '50px' }}>
                    <div style={{ width: `${totalProperties > 0 ? (rentedProperties / totalProperties) * 100 : 0}%`, height: '100%', background: 'var(--secondary)', borderRadius: '50px' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Exporter list */}
          <div className="glass-panel" style={{ padding: '2rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              Host Reports Exporter
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>Monthly Income Ledger</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>CSV sheet detailing monthly payouts and collectings.</p>
                </div>
                <button className="btn-card-secondary" style={{ background: 'white', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem' }} onClick={() => triggerExport('Income')}>
                  <Download size={14} /> Download CSV
                </button>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>Current Tenant List</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Export tenant phone/emails and student verification stats.</p>
                </div>
                <button className="btn-card-secondary" style={{ background: 'white', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem' }} onClick={() => triggerExport('Tenant')}>
                  <Download size={14} /> Download CSV
                </button>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>Booking Ledger</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Track approved, pending and rejected application trends.</p>
                </div>
                <button className="btn-card-secondary" style={{ background: 'white', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem' }} onClick={() => triggerExport('Bookings')}>
                  <Download size={14} /> Download CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. NOTIFICATIONS VIEW */}
      {activeTab === 'notifications' && (
        <div className="recent-activity-panel" style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={20} style={{ color: 'var(--primary)' }} /> Notifications Hub
            </h3>
            <button className="widget-link" style={{ border: 'none', background: 'none', cursor: 'pointer' }} onClick={markAllNotificationsRead}>
              Mark all as read
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notifications.map(notif => (
              <div key={notif.id} className="glass-panel" style={{ padding: '1rem', background: notif.read ? '#f8fafc' : 'rgba(0, 82, 204, 0.03)', borderLeft: notif.read ? '3px solid var(--border-light)' : '3px solid var(--primary)', display: 'flex', gap: '1rem', alignItems: 'flex-start', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div style={{ marginTop: '0.2rem' }}>
                  {notif.type === 'booking' && <Calendar size={18} style={{ color: 'var(--primary)' }} />}
                  {notif.type === 'payment' && <DollarSign size={18} style={{ color: '#059669' }} />}
                  {notif.type === 'contract' && <FileText size={18} style={{ color: 'var(--warning)' }} />}
                  {notif.type === 'properties' && <Home size={18} style={{ color: 'var(--text-light)' }} />}
                  {notif.type === 'verification' && <ShieldCheck size={18} style={{ color: 'var(--secondary)' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', display: 'flex', justifyContent: 'space-between' }}>
                    {notif.title}
                    <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'var(--text-muted)' }}>{notif.time}</span>
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. MESSAGES VIEW */}
      {activeTab === 'messages' && (
        <Messaging 
          chats={chats}
          listings={listings}
          currentUser={currentUser}
        />
      )}

      {/* 12. PROFILE VIEW */}
      {activeTab === 'verification' && (
        <div className="contract-split" id="landlord-profile-form">
          
          {/* Host Profile Info */}
          <section className="glass-panel" style={{ padding: '2rem', background: 'white', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', fontWeight: '800' }}>Personal Profile & Verification</h3>
            
            <form onSubmit={handleSaveLandlordProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Profile Photo Upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <img 
                  src={getAvatarUrl(currentLandlordProfile)} 
                  alt="Landlord Avatar" 
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} 
                />
                <div>
                  <h4 style={{ fontWeight: '800', fontSize: '1.1rem', margin: 0, color: 'var(--text-main)' }}>{landlordProfileName || 'Landlord Owner'}</h4>
                  <span className="badge-pill-light" style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', fontWeight: 'bold', margin: '0.35rem 0', display: 'inline-block' }}>
                    Landlord ID: {landlordCode}
                  </span>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <label className="btn-filter-apply" style={{ display: 'inline-flex', padding: '0.35rem 0.75rem', fontSize: '0.78rem', cursor: avatarUploading ? 'wait' : 'pointer' }}>
                      {avatarUploading ? 'Uploading Photo...' : 'Upload Profile Photo'}
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleLandlordAvatarUpload} style={{ display: 'none' }} disabled={avatarUploading} />
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max 2MB (JPG, PNG, WEBP)</span>
                  </div>
                </div>
              </div>



              {/* Owner Full Name */}
              <div className="form-group">
                <label className="filter-label">Owner Full Name</label>
                <input type="text" className="form-input" value={landlordProfileName} onChange={(e) => setLandlordProfileName(e.target.value)} required />
              </div>

              {/* Email Address (Locked) */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <label className="filter-label" style={{ margin: 0 }}>Email Address (Locked)</label>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: '600' }}>
                    Permanent / Verified Email
                  </span>
                </div>
                <input 
                  type="email" 
                  className="form-input" 
                  value={landlordEmail} 
                  disabled 
                  readOnly 
                  style={{ background: '#f1f5f9', cursor: 'not-allowed', color: '#475569', fontWeight: '600' }} 
                />
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label className="filter-label">Contact Phone Number</label>
                <input type="tel" className="form-input" value={landlordPhone} onChange={(e) => setLandlordPhone(e.target.value)} required placeholder="e.g. +880 1712-345678" />
              </div>

              {/* Address */}
              <div className="form-group">
                <label className="filter-label">Official Residential / Property Address</label>
                <input type="text" className="form-input" value={landlordAddress} onChange={(e) => setLandlordAddress(e.target.value)} required placeholder="e.g. House 45, Road 12, Mirpur 2, Dhaka" />
              </div>

              {/* NID Number */}
              <div className="form-group">
                <label className="filter-label">National ID (NID) Number</label>
                <input type="text" className="form-input" value={landlordNidNumber} onChange={(e) => setLandlordNidNumber(e.target.value)} required placeholder="e.g. 19922692518293019" />
              </div>

              {/* Change Account Password Covenants */}
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                <h4 style={{ fontWeight: '800', fontSize: '0.95rem', marginBottom: '0.75rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Lock size={16} style={{ color: 'var(--primary)' }} /> Change Account Password
                </h4>

                {passwordError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.825rem', marginBottom: '1rem', fontWeight: '600' }}>
                    ⚠️ {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.825rem', marginBottom: '1rem', fontWeight: '600' }}>
                    {passwordSuccess}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="filter-label">Current Account Password (Required)</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Enter current password" 
                    value={oldPassword} 
                    onChange={(e) => setOldPassword(e.target.value)} 
                    style={{ background: 'white' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="filter-label">New Password (Min 8 characters)</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="Min 8 characters" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      style={{ background: 'white' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="filter-label">Confirm New Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="Re-type new password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      style={{ background: 'white' }}
                    />
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn-card-secondary" 
                  style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.45rem 1rem', fontSize: '0.825rem', fontWeight: 'bold' }}
                  onClick={handleLandlordChangePassword}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? 'Updating Password...' : 'Update Password Only'}
                </button>
              </div>

              {/* Rent Payout Channels */}
              <h4 style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '0.5rem', fontWeight: '800' }}>Rent Payout Methods</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="filter-label">Payout Channel</label>
                  <select className="form-input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="bKash">bKash Mobile Wallet</option>
                    <option value="Nagad">Nagad Mobile Wallet</option>
                    <option value="Bank">Bank Account Payout</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="filter-label">Mobile Account Number</label>
                  <input type="text" className="form-input" value={paymentAccount} onChange={(e) => setPaymentAccount(e.target.value)} required />
                </div>
              </div>

              {paymentMethod === 'Bank' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border-light)', padding: '1rem', borderRadius: '8px', background: '#f8fafc' }}>
                  <div className="form-group">
                    <label className="filter-label">Bank Name</label>
                    <input type="text" className="form-input" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="filter-label">Branch Name</label>
                      <input type="text" className="form-input" value={bankBranch} onChange={(e) => setBankBranch(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="filter-label">Account Number</label>
                      <input type="text" className="form-input" value={bankAccountNo} onChange={(e) => setBankAccountNo(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className="btn-filter-apply" style={{ justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem' }}>
                Save Profile Settings
              </button>
            </form>
          </section>

          {/* Verification documents */}
          <section className="glass-panel" style={{ padding: '2rem', background: 'white', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', fontWeight: '800' }}>Official Property Verification</h3>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Upload property ownership documents and proof of identity to gain the "Verified Property" badge. Handled by CSE BUBT Intake 51/8 admins.
            </p>

            {/* Profile Completeness Gating Banner */}
            {!isLandlordProfileComplete && (
              <div style={{ background: '#fffbebfb', border: '1px solid #fcd34d', padding: '1.25rem', borderRadius: '10px', color: '#92400e' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', fontSize: '0.95rem' }}>
                  <ShieldAlert size={20} style={{ color: '#b45309' }} /> Profile Incomplete — Verification Submission Gated
                </div>
                <p style={{ fontSize: '0.85rem', marginTop: '0.35rem', color: '#78350f' }}>
                  Please complete all required landlord profile fields before submitting property verification documents:
                </p>
                <ul style={{ fontSize: '0.825rem', margin: '0.5rem 0 0.75rem 1.25rem', color: '#b45309', fontWeight: '700' }}>
                  {missingLandlordFields.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
                <a 
                  href="#landlord-profile-form" 
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('landlord-profile-form')?.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1d4ed8', textDecoration: 'underline' }}
                >
                  &rarr; Complete Missing Profile Fields Above
                </a>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Document 1: NID Scan */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-deep)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>National ID / Passport Scan</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {(landlordNidRecord?.verification_status === 'verified' || currentUser?.is_verified)
                      ? '✓ Verified by Admin'
                      : landlordNidRecord?.verification_status === 'pending'
                      ? '⏳ Pending Admin Review'
                      : 'Required: Front & Back Scan'}
                  </p>
                </div>
                {(landlordNidRecord?.verification_status === 'verified' || currentUser?.is_verified) ? (
                  <CheckCircle size={24} style={{ color: 'var(--secondary)' }} />
                ) : landlordNidRecord?.verification_status === 'pending' ? (
                  <span style={{ fontSize: '0.8rem', background: '#fef3c7', color: '#b45309', padding: '0.3rem 0.6rem', borderRadius: '4px', fontWeight: '600' }}>
                    Pending Review
                  </span>
                ) : (
                  <label className="btn-card-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', border: '1px solid var(--border-light)', cursor: isLandlordProfileComplete ? 'pointer' : 'not-allowed', opacity: isLandlordProfileComplete ? 1 : 0.6 }}>
                    Upload Scan
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      style={{ display: 'none' }} 
                      disabled={!isLandlordProfileComplete}
                      onChange={async (e) => {
                        if (!isLandlordProfileComplete) {
                          alert(`❌ Profile Incomplete! Please complete your landlord profile first.\nMissing fields: ${missingLandlordFields.join(', ')}`);
                          return;
                        }
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = async (evt) => {
                          const docUrl = evt.target.result;
                          try {
                            await dbService.submitLandlordVerification(currentLandlordProfile, { nidPhotoUrl: docUrl });
                            setLandlordNidRecord({ verification_status: 'pending' });
                            addNotification('verification', 'NID Document Submitted', 'Your Landlord National ID document has been submitted to Admin for review.');
                            alert('✓ Landlord NID document submitted successfully! Admin review in progress.');
                          } catch (err) {
                            alert(`❌ Submission Error: ${err.message}`);
                          }
                        };
                        reader.readAsDataURL(file);
                      }} 
                    />
                  </label>
                )}
              </div>

              {/* Document 2: Property Deed */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-deep)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Property Deed / Ownership Proof</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {deedsUploaded ? 'Uploaded (Verified)' : 'Required: Property ownership registration'}
                  </p>
                </div>
                {deedsUploaded ? (
                  <CheckCircle size={24} style={{ color: 'var(--secondary)' }} />
                ) : (
                  <label className="btn-card-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', border: '1px solid var(--border-light)', cursor: isLandlordProfileComplete ? 'pointer' : 'not-allowed', opacity: isLandlordProfileComplete ? 1 : 0.6 }}>
                    Upload Deed
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      style={{ display: 'none' }} 
                      disabled={!isLandlordProfileComplete}
                      onChange={async (e) => {
                        if (!isLandlordProfileComplete) {
                          alert(`❌ Profile Incomplete! Please complete your landlord profile first.\nMissing fields: ${missingLandlordFields.join(', ')}`);
                          return;
                        }
                        if (e.target.files[0]) {
                          try {
                            await dbService.submitLandlordVerification(currentLandlordProfile, { propertyDeedUrl: 'deed.pdf' });
                            setDeedsUploaded(true);
                            addNotification('verification', 'Deeds Uploaded', 'Property ownership registration uploaded for verification.');
                            alert('✓ Property ownership document uploaded!');
                          } catch (err) {
                            alert(`❌ Submission Error: ${err.message}`);
                          }
                        }
                      }} 
                    />
                  </label>
                )}
              </div>

              {/* Document 3: Utility Bill */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-deep)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Utility Gas/Electric Bill</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {utilityBillUploaded ? 'Uploaded (Approved)' : 'Required: Latest month bill'}
                  </p>
                </div>
                {utilityBillUploaded ? (
                  <CheckCircle size={24} style={{ color: 'var(--secondary)' }} />
                ) : (
                  <label className="btn-card-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', border: '1px solid var(--border-light)', cursor: isLandlordProfileComplete ? 'pointer' : 'not-allowed', opacity: isLandlordProfileComplete ? 1 : 0.6 }}>
                    Upload Bill
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      style={{ display: 'none' }} 
                      disabled={!isLandlordProfileComplete}
                      onChange={async (e) => {
                        if (!isLandlordProfileComplete) {
                          alert(`❌ Profile Incomplete! Please complete your landlord profile first.\nMissing fields: ${missingLandlordFields.join(', ')}`);
                          return;
                        }
                        if (e.target.files[0]) {
                          try {
                            await dbService.submitLandlordVerification(currentLandlordProfile, { utilityBillUrl: 'utility.pdf' });
                            setUtilityBillUploaded(true);
                            addNotification('verification', 'Utility Bill Uploaded', 'Utility bill successfully uploaded.');
                            alert('✓ Utility bill uploaded!');
                          } catch (err) {
                            alert(`❌ Submission Error: ${err.message}`);
                          }
                        }
                      }} 
                    />
                  </label>
                )}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem' }}>Verification status:</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: (landlordNidRecord?.verification_status === 'verified' || currentUser?.is_verified) ? 'var(--secondary)' : 'var(--warning)' }}>
                {(landlordNidRecord?.verification_status === 'verified' || currentUser?.is_verified) ? '✓ NID Verified & Active' : landlordNidRecord?.verification_status === 'pending' ? '⏳ Pending Admin Review' : 'Pending Upload'}
              </span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

// Dummy Print PDF trigger icon
function PrinterIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-printer"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>
  );
}

export default Dashboard;
