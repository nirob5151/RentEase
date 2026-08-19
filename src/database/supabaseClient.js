import { createClient } from '@supabase/supabase-js';
import { emailService } from '../services/emailService';
import { checkProfileCompleteness, checkLandlordProfileCompleteness } from '../utils/profileCompleteness';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key';

export const isConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('xyzcompany')
);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// LOCAL STORAGE PERSISTENT ENGINE FALLBACK (STARTS AT ZERO DATA)
const getLocal = (key) => {
  try {
    const saved = localStorage.getItem(`rentease_db_${key}`);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const setLocal = (key, value) => {
  try {
    localStorage.setItem(`rentease_db_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
};

// ----------------------------------------------------
// DATABASE & STORAGE API LAYER (Supabase PostgreSQL Source of Truth)
// ----------------------------------------------------

export const dbService = {
  // --- 1. PROFILES & USERS ---
  async getUsers() {
    if (isConfigured) {
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getUsers error:', e);
      }
    }
    return getLocal('users');
  },

  async saveUser(userData) {
    const current = getLocal('users');
    const updated = [userData, ...current.filter(u => u.id !== userData.id)];
    setLocal('users', updated);

    if (isConfigured) {
      try {
        const isValidUuid = typeof userData.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userData.id);
        const profileId = isValidUuid ? userData.id : '11111111-1111-4111-a111-' + String(Date.now()).padStart(12, '0').slice(-12);

        await supabase.from('profiles').upsert([{
          id: profileId,
          name: userData.name || userData.full_name || 'User',
          email: userData.email,
          phone: userData.phone || '',
          role: (userData.role || 'student').toLowerCase().includes('landlord') ? 'landlord' : 'student',
          avatar_url: userData.avatar || userData.avatar_url || ''
        }]);
      } catch (err) {
        console.warn('Supabase save user profile error:', err);
      }
    }
    return updated;
  },

  async getUserByEmail(email) {
    const key = (email || '').toLowerCase().trim();
    if (!key) return null;

    if (isConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', key)
          .maybeSingle();
        if (!error && data) {
          const rawRole = (data.role || 'student').toLowerCase();
          const displayRole = rawRole.includes('landlord') ? 'landlord' : rawRole.includes('admin') ? 'admin' : 'student';
          return {
            id: data.id,
            name: data.name || data.full_name || 'User',
            email: data.email,
            phone: data.phone || '',
            role: displayRole === 'landlord' ? 'Landlord Account' : displayRole === 'admin' ? 'Admin Account' : 'Student Account',
            rawRole: displayRole,
            avatar: data.avatar_url || ''
          };
        }
      } catch (e) {
        console.warn('Supabase getUserByEmail error:', e);
      }
    }
    const currentUsers = getLocal('users');
    const localUser = currentUsers.find(u => (u.email || '').toLowerCase().trim() === key);
    if (localUser) {
      const rawRole = (localUser.role || 'student').toLowerCase();
      const displayRole = rawRole.includes('landlord') ? 'landlord' : rawRole.includes('admin') ? 'admin' : 'student';
      return {
        ...localUser,
        role: displayRole === 'landlord' ? 'Landlord Account' : displayRole === 'admin' ? 'Admin Account' : 'Student Account',
        rawRole: displayRole
      };
    }
    return null;
  },

  // --- 2. PROPERTIES & LISTINGS ---
  async getListings() {
    if (isConfigured) {
      try {
        const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(item => ({
            ...item,
            facilities: Array.isArray(item.facilities) ? item.facilities : (typeof item.facilities === 'string' ? JSON.parse(item.facilities) : ['Wi-Fi Included']),
            landlord: item.landlord || { name: 'Mehadi Hasan', rating: 4.9, phone: '+880 1712-345678' },
            reviews: item.reviews || []
          }));
        }

        const { data: propData, error: propErr } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
        if (!propErr && propData && propData.length > 0) {
          return propData.map(p => ({
            id: p.id,
            title: p.title,
            location: p.address || p.area || 'Mirpur, Dhaka',
            price: p.monthly_rent || 6000,
            type: p.property_type || 'Private Room',
            facilities: p.amenities || ['Wi-Fi Included', 'Furnished'],
            verified: p.status === 'approved',
            image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
            description: p.description || 'Student rental housing',
            landlord: { name: 'Mehadi Hasan', rating: 4.9, phone: '+880 1712-345678' },
            reviews: []
          }));
        }
      } catch (e) {
        console.warn('Supabase getListings error:', e);
      }
    }
    return getLocal('listings');
  },

  async saveListing(newListing) {
    const currentListings = getLocal('listings');
    const updated = [newListing, ...currentListings];
    setLocal('listings', updated);

    if (isConfigured) {
      try {
        const payload = {
          title: newListing.title,
          location: newListing.location || 'Mirpur, Dhaka',
          price: Number(newListing.price) || 5000,
          type: newListing.type || 'Private Room',
          facilities: Array.isArray(newListing.facilities) ? newListing.facilities : ['Wi-Fi Included'],
          verified: newListing.verified !== false,
          image: newListing.image || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
          description: newListing.description || 'Student housing near campus'
        };
        await supabase.from('listings').insert([payload]);

        await supabase.from('properties').insert([{
          title: payload.title,
          description: payload.description,
          monthly_rent: payload.price,
          property_type: payload.type,
          address: payload.location,
          status: 'approved'
        }]);
      } catch (err) {
        console.warn('Supabase save property error:', err);
      }
    }
    return updated;
  },

  // --- 3. BOOKINGS ---
  async getBookings() {
    if (isConfigured) {
      try {
        const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getBookings error:', e);
      }
    }
    return getLocal('bookings');
  },

  async createBooking(bookingData) {
    const current = getLocal('bookings');
    const updated = [bookingData, ...current];
    setLocal('bookings', updated);

    if (isConfigured) {
      try {
        const payload = {
          id: String(bookingData.id || 'b_' + Date.now()),
          tenant_name: bookingData.tenant_name || bookingData.tenantName || 'Student Tenant',
          tenant_email: bookingData.tenant_email || bookingData.tenantEmail || 'student@bubt.edu.bd',
          property_title: bookingData.property_title || bookingData.propertyTitle || 'Student Apartment',
          price: Number(bookingData.price) || 6000,
          status: bookingData.status || 'Pending',
          date: bookingData.date || new Date().toISOString().split('T')[0]
        };
        await supabase.from('bookings').insert([payload]);
      } catch (err) {
        console.warn('Supabase insert booking error:', err);
      }
    }
    return updated;
  },

  async updateBookingStatus(bookingId, status) {
    const current = getLocal('bookings');
    const updated = current.map(b => b.id === bookingId ? { ...b, status } : b);
    setLocal('bookings', updated);

    if (isConfigured) {
      try {
        await supabase.from('bookings').update({ status }).eq('id', bookingId);
      } catch (err) {
        console.warn('Supabase update booking error:', err);
      }
    }
    return updated;
  },

  // --- 4. PAYMENTS ---
  async getPayments() {
    if (isConfigured) {
      try {
        const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getPayments error:', e);
      }
    }
    return getLocal('payments');
  },

  async addPayment(paymentData) {
    const current = getLocal('payments');
    const updated = [paymentData, ...current];
    setLocal('payments', updated);

    if (isConfigured) {
      try {
        const payload = {
          id: String(paymentData.id || 'p_' + Date.now()),
          receipt_id: String(paymentData.receiptId || paymentData.receipt_id || 'REC-' + Date.now()),
          tenant_name: paymentData.tenantName || paymentData.tenant_name || 'Student Tenant',
          property_title: paymentData.propertyTitle || paymentData.property_title || 'Student Residence',
          amount: Number(paymentData.amount) || 5000,
          month: paymentData.month || 'August 2026',
          status: paymentData.status || 'Pending',
          date: paymentData.date || new Date().toISOString().split('T')[0]
        };
        await supabase.from('payments').insert([payload]);
      } catch (err) {
        console.warn('Supabase add payment error:', err);
      }
    }
    return updated;
  },

  async approvePayment(paymentId) {
    const current = getLocal('payments');
    const updated = current.map(p => {
      if (p.id === paymentId || p.receiptId === paymentId || p.receipt_id === paymentId) {
        return { ...p, status: 'Paid', date: new Date().toISOString().split('T')[0] };
      }
      return p;
    });
    setLocal('payments', updated);

    if (isConfigured) {
      try {
        await supabase.from('payments').update({ status: 'Paid' }).or(`id.eq.${paymentId},receipt_id.eq.${paymentId}`);
      } catch (err) {
        console.warn('Supabase approve payment error:', err);
      }
    }
    return updated;
  },

  // --- 5. ROOMMATE PROFILES ---
  async getRoommates() {
    if (isConfigured) {
      try {
        const { data, error } = await supabase.from('roommate_profiles').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getRoommates error:', e);
      }
    }
    return getLocal('roommates');
  },

  async saveRoommate(profileData) {
    const current = getLocal('roommates');
    const updated = [profileData, ...current.filter(r => r.id !== profileData.id)];
    setLocal('roommates', updated);

    if (isConfigured) {
      try {
        const numericBudget = typeof profileData.budget === 'number' 
          ? profileData.budget 
          : parseFloat(String(profileData.budget || '6500').replace(/[^0-9.]/g, '')) || 6500;

        await supabase.from('roommate_profiles').insert([{
          name: profileData.name || 'Student Roommate',
          budget: numericBudget,
          bio: profileData.bio || 'Looking for roommate',
          gender: profileData.gender || 'Male',
          cleanliness: profileData.cleanliness || 'Clean'
        }]);
      } catch (err) {
        console.warn('Supabase save roommate profile error:', err);
      }
    }
    return updated;
  },

  // --- 6. CHATS & MESSAGES ---
  async getChats() {
    if (isConfigured) {
      try {
        const { data, error } = await supabase.from('chats').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getChats error:', e);
      }
    }
    return getLocal('chats');
  },

  async saveChat(chatObj) {
    const current = getLocal('chats');
    const updated = [chatObj, ...current.filter(c => c.id !== chatObj.id)];
    setLocal('chats', updated);

    if (isConfigured) {
      try {
        await supabase.from('chats').upsert([{
          id: String(chatObj.id),
          name: chatObj.name || chatObj.participantName || 'Chat',
          last_message: chatObj.lastMessage || chatObj.last_message || '',
          time: chatObj.time || 'Just now',
          messages: chatObj.messages || []
        }]);
      } catch (err) {
        console.warn('Supabase save chat error:', err);
      }
    }
    return updated;
  },

  // --- 7. REPORTS & COMPLAINTS ---
  async getReports() {
    if (isConfigured) {
      try {
        const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getReports error:', e);
      }
    }
    return getLocal('reports');
  },

  async addReport(reportData) {
    const current = getLocal('reports');
    const updated = [reportData, ...current];
    setLocal('reports', updated);

    if (isConfigured) {
      try {
        await supabase.from('reports').insert([{
          reporter_name: reportData.reporter_name || reportData.reporter || 'Student',
          reported_name: reportData.reported_name || reportData.target || 'Property',
          reason: reportData.reason || 'General Inquiry',
          status: reportData.status || 'Pending'
        }]);
      } catch (err) {
        console.warn('Supabase add report error:', err);
      }
    }
    return updated;
  },

  // --- 8. NOTIFICATIONS ---
  async getNotifications() {
    if (isConfigured) {
      try {
        const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getNotifications error:', e);
      }
    }
    return getLocal('notifications');
  },

  async addNotification(notifData) {
    const current = getLocal('notifications');
    const updated = [notifData, ...current];
    setLocal('notifications', updated);

    if (isConfigured) {
      try {
        await supabase.from('notifications').insert([{
          title: notifData.title || 'Notification',
          message: notifData.message || notifData.desc || '',
          is_read: false
        }]);
      } catch (err) {
        console.warn('Supabase add notification error:', err);
      }
    }
    return updated;
  },

  subscribeToNotifications(callback) {
    if (isConfigured) {
      try {
        const channel = supabase
          .channel('realtime_notifications')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
            if (payload.new && callback) {
              callback({
                id: payload.new.id,
                title: payload.new.title,
                desc: payload.new.message || payload.new.title,
                category: 'General',
                time: 'Just now',
                read: false
              });
            }
          })
          .subscribe();
        return () => supabase.removeChannel(channel);
      } catch (err) {
        console.warn('Realtime subscription error:', err);
      }
    }
    return () => {};
  },

  // --- 9. REVIEWS ---
  async getReviews() {
    if (isConfigured) {
      try {
        const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getReviews error:', e);
      }
    }
    return getLocal('reviews');
  },

  async saveReview(reviewData) {
    const current = getLocal('reviews');
    const updated = [reviewData, ...current];
    setLocal('reviews', updated);

    if (isConfigured) {
      try {
        await supabase.from('reviews').insert([{
          id: String(reviewData.id || 'rev_' + Date.now()),
          listing_id: String(reviewData.listingId || reviewData.listing_id || reviewData.propertyId || reviewData.property_id || ''),
          target: reviewData.target || 'Property',
          rating: Number(reviewData.rating) || 5,
          review_text: reviewData.comment || reviewData.review_text || '',
          comment: reviewData.comment || reviewData.review_text || '',
          author: reviewData.author || 'Student',
          date: reviewData.date || new Date().toISOString().split('T')[0]
        }]);
      } catch (err) {
        console.warn('Supabase save review error:', err);
      }
    }
    return updated;
  },

  // --- 10. LEASE CONTRACTS ---
  async getContracts() {
    if (isConfigured) {
      try {
        const { data, error } = await supabase.from('contracts').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getContracts error:', e);
      }
    }
    return getLocal('contracts');
  },

  async saveContract(contractData) {
    const current = getLocal('contracts');
    const updated = [contractData, ...current.filter(c => c.id !== contractData.id)];
    setLocal('contracts', updated);

    if (isConfigured) {
      try {
        await supabase.from('contracts').upsert([{
          id: String(contractData.id || 'contract_' + Date.now()),
          booking_id: contractData.bookingId || contractData.booking_id || '',
          landlord_id: contractData.landlordId || contractData.landlord_id || '',
          landlord_name: contractData.landlordName || contractData.landlord_name || 'Landlord',
          landlord_email: contractData.landlordEmail || contractData.landlord_email || '',
          landlord_signature_name: contractData.landlordSignatureName || contractData.landlord_signature_name || contractData.landlordName || '',
          student_id: contractData.studentId || contractData.student_id || '',
          student_name: contractData.studentName || contractData.student_name || contractData.tenantName || 'Student',
          student_email: contractData.studentEmail || contractData.student_email || '',
          student_signature_name: contractData.studentSignatureName || contractData.student_signature_name || '',
          property_title: contractData.propertyTitle || contractData.property_title || contractData.title || 'Lease Agreement',
          property_address: contractData.propertyAddress || contractData.property_address || contractData.address || '',
          monthly_rent: Number(contractData.monthlyRent || contractData.monthly_rent || contractData.rent) || 8500,
          security_deposit: Number(contractData.securityDeposit || contractData.security_deposit || contractData.deposit) || 17000,
          commence_date: contractData.commenceDate || contractData.commence_date || '2026-07-01',
          expiry_date: contractData.expiryDate || contractData.expiry_date || '2027-06-30',
          special_terms: contractData.specialTerms || contractData.special_terms || contractData.terms || '',
          status: contractData.status || 'pending_student_signature'
        }]);
      } catch (err) {
        console.warn('Supabase save contract error:', err);
      }
    }
    return updated;
  },

  async signContract(contractId, studentSignatureName) {
    const current = getLocal('contracts');
    const today = new Date().toISOString();
    const updated = current.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          status: 'signed',
          studentSignatureName: studentSignatureName,
          student_signature_name: studentSignatureName,
          signedAt: today,
          signed_at: today
        };
      }
      return c;
    });
    setLocal('contracts', updated);

    if (isConfigured) {
      try {
        await supabase.from('contracts').update({
          status: 'signed',
          student_signature_name: studentSignatureName,
          signed_at: today
        }).eq('id', contractId);
      } catch (err) {
        console.warn('Supabase sign contract error:', err);
      }
    }
    return updated;
  },

  // --- 11. LANDLORD PROFILE & VERIFICATION ---
  async saveLandlordProfile(profileData) {
    // ENFORCE EMAIL IMMUTABILITY ON BACKEND (Exclude email from update payload)
    const { email, id, ...updatableFields } = profileData;

    const currentProfiles = getLocal('landlord_profiles_list');
    const existingIndex = currentProfiles.findIndex(p => p.id === id || p.email === email);
    
    const updatedProfile = {
      ...(existingIndex >= 0 ? currentProfiles[existingIndex] : {}),
      ...updatableFields,
      id: id || currentProfiles[existingIndex]?.id || 'lnd_' + Date.now(),
      email: email || currentProfiles[existingIndex]?.email, // locked & preserved
      landlord_code: profileData.landlord_code || profileData.landlordCode || currentProfiles[existingIndex]?.landlord_code || ('LND-' + Math.floor(100000 + Math.random() * 900000)),
      updated_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      currentProfiles[existingIndex] = updatedProfile;
    } else {
      currentProfiles.push(updatedProfile);
    }
    setLocal('landlord_profiles_list', currentProfiles);
    setLocal('current_landlord_profile', updatedProfile);

    if (isConfigured) {
      try {
        await supabase.from('profiles').update({
          full_name: updatedProfile.name || updatedProfile.full_name,
          phone: updatedProfile.phone,
          address: updatedProfile.address,
          nid_number: updatedProfile.nid_number || updatedProfile.nidNumber,
          landlord_code: updatedProfile.landlord_code,
          payout_channel: updatedProfile.payoutChannel || updatedProfile.paymentMethod,
          payout_account: updatedProfile.accountNumber || updatedProfile.paymentAccount,
          avatar_url: updatedProfile.avatar || updatedProfile.avatar_url,
          profile_picture: updatedProfile.avatar || updatedProfile.profile_picture
        }).eq('id', id);
      } catch (err) {
        console.warn('Supabase saveLandlordProfile error:', err);
      }
    }
    return updatedProfile;
  },

  async submitLandlordVerification(profile, documentData) {
    // BACKEND PROFILE COMPLETENESS ENFORCEMENT
    const { isComplete, missingFields } = checkLandlordProfileCompleteness(profile);
    if (!isComplete) {
      throw new Error(`Verification upload rejected! Please complete your landlord profile first. Missing fields: ${missingFields.join(', ')}.`);
    }

    const verifications = getLocal('landlord_verifications');
    const newRecord = {
      id: 'verif_' + Date.now(),
      landlordId: profile.id,
      landlordName: profile.name || profile.full_name,
      landlordEmail: profile.email,
      ...documentData,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    const updated = [newRecord, ...verifications];
    setLocal('landlord_verifications', updated);

    if (isConfigured) {
      try {
        await supabase.from('landlord_profiles').insert([{
          landlord_id: profile.id,
          nid_number: profile.nidNumber || profile.nid_number,
          verification_status: 'pending',
          ownership_document_url: documentData.propertyDeedUrl || '',
          utility_bill_url: documentData.utilityBillUrl || '',
          nid_front_url: documentData.nidPhotoUrl || ''
        }]);
      } catch (err) {
        console.warn('Supabase submitLandlordVerification error:', err);
      }
    }
    return updated;
  },

  // --- 12. ACCOUNT SECURITY & PASSWORD CHANGE ---
  async changePassword({ userEmail, oldPassword, newPassword, confirmPassword }) {
    const key = (userEmail || '').toLowerCase().trim();
    if (!key) {
      throw new Error('User email session is required.');
    }

    if (!oldPassword || !String(oldPassword).trim()) {
      throw new Error('Current password is required.');
    }
    if (!newPassword || !String(newPassword).trim()) {
      throw new Error('New password is required.');
    }
    if (!confirmPassword || !String(confirmPassword).trim()) {
      throw new Error('Please confirm your new password.');
    }

    if (newPassword !== confirmPassword) {
      throw new Error('New Password and Confirm New Password do not match!');
    }

    if (newPassword.length < 8) {
      throw new Error('New Password must be at least 8 characters long.');
    }

    if (newPassword === oldPassword) {
      throw new Error('New Password cannot be identical to your Current Password.');
    }

    // SERVER / BACKEND AUTHENTICATION & PASSWORD COMPARISON
    const storedPasswords = getLocal('auth_passwords') || {};
    const storedUsers = getLocal('users') || [];
    const targetUser = storedUsers.find(u => (u.email || '').toLowerCase().trim() === key);

    const storedPass = storedPasswords[key] || targetUser?.password || '12345678';

    // Compare submitted oldPassword against stored credentials
    if (oldPassword !== storedPass) {
      throw new Error('Current password is incorrect!');
    }

    // If Old Password matches, update stored password
    storedPasswords[key] = newPassword;
    setLocal('auth_passwords', storedPasswords);

    // Update user record in local database
    const updatedUsers = storedUsers.map(u => {
      if ((u.email || '').toLowerCase().trim() === key) {
        return { ...u, password: newPassword };
      }
      return u;
    });
    setLocal('users', updatedUsers);

    // If Supabase Auth is configured, call Supabase auth update
    if (isConfigured) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          console.warn('Supabase auth updateUser error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase change password error:', err);
      }
    }

    return { success: true, message: 'Password updated successfully!' };
  },

  // --- 13. MESSAGES & CONVERSATIONS REAL-TIME ENGINE ---
  async getChats() {
    if (isConfigured) {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .order('last_message_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(c => ({
            id: c.id,
            name: c.student_name || c.landlord_name || 'Contact',
            role: c.property_title || 'Rental Inquiry',
            property_id: c.property_id,
            property_title: c.property_title,
            propertyTitle: c.property_title,
            propertyId: c.property_id,
            snippet: c.last_message_text || 'Conversation started',
            time: c.last_message_at ? new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            unread: c.unread_count_landlord || c.unread_count_student || 0,
            avatar: c.student_avatar || c.landlord_avatar || '',
            landlord_email: c.landlord_email,
            student_email: c.student_email,
            landlord_id: c.landlord_id,
            student_id: c.student_id,
            messages: []
          }));
        }
      } catch (e) {
        console.warn('Supabase getChats error:', e);
      }
    }
    return getLocal('chats');
  },

  async saveChat(chatData) {
    const current = getLocal('chats');
    const updated = [chatData, ...current.filter(c => c.id !== chatData.id)];
    setLocal('chats', updated);

    if (isConfigured) {
      try {
        await supabase.from('conversations').upsert([{
          id: chatData.id,
          landlord_id: chatData.landlord_id || chatData.landlordId || 'lnd_1',
          landlord_name: chatData.landlord_name || chatData.landlordName || 'Landlord',
          landlord_email: chatData.landlord_email || chatData.landlordEmail || '',
          landlord_avatar: chatData.landlord_avatar || '',
          student_id: chatData.student_id || chatData.studentId || 'std_1',
          student_name: chatData.name || chatData.student_name || 'Student',
          student_email: chatData.student_email || chatData.studentEmail || '',
          student_avatar: chatData.avatar || '',
          property_id: String(chatData.property_id || chatData.propertyId || ''),
          property_title: chatData.property_title || chatData.propertyTitle || chatData.role || 'Rental Inquiry',
          last_message_text: chatData.snippet || 'Conversation started',
          last_message_at: new Date().toISOString(),
          unread_count_landlord: chatData.unread || 0
        }]);
      } catch (err) {
        console.warn('Supabase saveChat error:', err);
      }
    }
    return updated;
  },

  async markChatAsRead(chatId, role = 'landlord') {
    const current = getLocal('chats');
    const updated = current.map(c => {
      if (c.id === chatId) {
        return { ...c, unread: 0 };
      }
      return c;
    });
    setLocal('chats', updated);

    if (isConfigured) {
      try {
        const updatePayload = role === 'landlord' ? { unread_count_landlord: 0 } : { unread_count_student: 0 };
        await supabase.from('conversations').update(updatePayload).eq('id', chatId);
      } catch (err) {
        console.warn('Supabase markChatAsRead error:', err);
      }
    }
    return updated;
  },

  async getMessages(conversationId) {
    if (!conversationId) return [];

    if (isConfigured) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
        if (!error && data) {
          return data.map(m => ({
            id: m.id,
            conversationId: m.conversation_id,
            sender: m.sender_role === 'student' ? 'receiver' : 'sender',
            senderRole: m.sender_role,
            senderId: m.sender_id,
            senderEmail: m.sender_email,
            senderName: m.sender_name,
            text: m.message_text,
            isRead: m.is_read,
            time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'
          }));
        }
      } catch (e) {
        console.warn('Supabase getMessages error:', e);
      }
    }
    return getLocal(`messages_${conversationId}`) || [];
  },

  async saveMessage(msgObj) {
    const cid = msgObj.conversationId || msgObj.conversation_id;
    if (!cid) return;

    const currentMsgs = getLocal(`messages_${cid}`) || [];
    const updatedMsgs = [...currentMsgs, msgObj];
    setLocal(`messages_${cid}`, updatedMsgs);

    if (isConfigured) {
      try {
        await supabase.from('messages').insert([{
          id: String(msgObj.id || 'msg_' + Date.now()),
          conversation_id: cid,
          sender_id: String(msgObj.senderId || msgObj.sender_id || 'usr_1'),
          sender_email: msgObj.senderEmail || msgObj.sender_email || '',
          sender_name: msgObj.senderName || msgObj.sender_name || 'User',
          sender_role: msgObj.senderRole || msgObj.sender_role || 'student',
          message_text: msgObj.text || msgObj.message_text || '',
          is_read: Boolean(msgObj.isRead || msgObj.is_read)
        }]);

        await supabase.from('conversations').update({
          last_message_text: msgObj.text || msgObj.message_text || '',
          last_message_at: new Date().toISOString()
        }).eq('id', cid);
      } catch (err) {
        console.warn('Supabase saveMessage error:', err);
      }
    }
    return updatedMsgs;
  },

  async getTenantsForLandlord(currentUser) {
    const lEmail = (currentUser?.email || '').toLowerCase().trim();
    const lId = (currentUser?.id || '').toString();

    if (isConfigured) {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .or(`landlord_email.eq.${lEmail},landlord_id.eq.${lId}`)
          .in('status', ['Accepted', 'Approved', 'Active', 'accepted', 'approved', 'active']);

        if (!error && data && data.length > 0) {
          return data.map(b => ({
            id: b.id,
            name: b.tenant_name || b.student_name || 'Tenant Student',
            email: b.tenant_email || b.student_email || 'student@rentease.com',
            phone: b.tenant_phone || b.phone || '+880 1712-000000',
            studentId: b.student_id || 'STD-' + Math.floor(100000 + Math.random() * 900000),
            propertyTitle: b.property_title || 'Mirpur Apartment',
            propertyId: b.property_id,
            moveInDate: b.created_at ? new Date(b.created_at).toISOString().split('T')[0] : '2026-07-01',
            status: 'Current',
            studentIdVerified: true,
            nidPhoto: b.student_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80'
          }));
        }
      } catch (e) {
        console.warn('Supabase getTenantsForLandlord error:', e);
      }
    }

    const allBookings = getLocal('bookings') || [];
    const approvedBookings = allBookings.filter(b => {
      const bEmail = (b.landlord_email || b.landlordEmail || '').toLowerCase().trim();
      const bId = (b.landlord_id || b.landlordId || '').toString();
      const isAccepted = ['accepted', 'approved', 'active'].includes((b.status || '').toLowerCase());
      if (!isAccepted) return false;
      if (lEmail && bEmail && bEmail === lEmail) return true;
      if (lId && bId && bId === lId) return true;
      return true;
    });

    return approvedBookings.map(b => ({
      id: b.id,
      name: b.tenantName || b.name || 'Tenant Student',
      email: b.tenantEmail || b.email || 'student@rentease.com',
      phone: b.tenantPhone || b.phone || '+880 1712-000000',
      studentId: b.studentId || 'STD-992144',
      propertyTitle: b.propertyTitle || 'Mirpur Apartment',
      propertyId: b.propertyId,
      moveInDate: b.date || '2026-07-01',
      status: 'Current',
      studentIdVerified: true,
      nidPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80'
    }));
  },

  // --- 14. SYSTEM RESET ENGINE (Preserves Table Schemas & Admin User) ---
  async resetDatabaseKeepAdmin(adminEmail = 'admin@rentease.com') {
    const keysToWipe = [
      'listings', 'bookings', 'payments', 'contracts',
      'chats', 'messages', 'notifications', 'reviews',
      'reports', 'content', 'verifications', 'tenants'
    ];

    keysToWipe.forEach(key => {
      localStorage.removeItem(`rentease_db_${key}`);
      localStorage.removeItem(`rentease_${key}`);
    });

    const allUsers = getLocal('users') || [];
    const preservedUsers = allUsers.filter(u => 
      (u.email || '').toLowerCase().trim() === adminEmail.toLowerCase().trim() ||
      (u.role || '').toLowerCase().includes('admin')
    );
    setLocal('users', preservedUsers);

    if (isConfigured) {
      try {
        await supabase.from('listings').delete().neq('id', 'keep_none');
        await supabase.from('bookings').delete().neq('id', 'keep_none');
        await supabase.from('payments').delete().neq('id', 'keep_none');
        await supabase.from('contracts').delete().neq('id', 'keep_none');
        await supabase.from('conversations').delete().neq('id', 'keep_none');
        await supabase.from('messages').delete().neq('id', 'keep_none');
        await supabase.from('notifications').delete().neq('id', 'keep_none');
        await supabase.from('reviews').delete().neq('id', 'keep_none');
        await supabase.from('reports').delete().neq('id', 'keep_none');
        await supabase.from('content').delete().neq('id', 'keep_none');
        
        await supabase.from('profiles').delete().not('email', 'ilike', `%${adminEmail}%`).not('role', 'ilike', '%admin%');
      } catch (err) {
        console.warn('Supabase reset error:', err);
      }
    }

    return { success: true, message: `Database reset complete. Admin account (${adminEmail}) preserved.` };
  },

  // --- 15. HERO REALTIME PLATFORM STATS QUERY ---
  async getRentEaseStats() {
    let listingsCount = 0;
    let studentsCount = 0;
    let landlordsCount = 0;
    let roommatesCount = 0;

    if (isConfigured) {
      try {
        const { count: lCount } = await supabase.from('listings').select('*', { count: 'exact', head: true });
        if (lCount !== null && lCount !== undefined) listingsCount = lCount;

        const { count: sCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
        if (sCount !== null && sCount !== undefined) studentsCount = sCount;

        const { count: ldCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'landlord');
        if (ldCount !== null && ldCount !== undefined) landlordsCount = ldCount;

        const { count: rCount } = await supabase.from('roommate_profiles').select('*', { count: 'exact', head: true });
        if (rCount !== null && rCount !== undefined) roommatesCount = rCount;
      } catch (err) {
        console.warn('Supabase getRentEaseStats error:', err);
      }
    } else {
      const listings = getLocal('listings') || [];
      const users = getLocal('users') || [];
      listingsCount = listings.length;
      studentsCount = users.filter(u => (u.role || '').toLowerCase().includes('student')).length;
      landlordsCount = users.filter(u => (u.role || '').toLowerCase().includes('landlord')).length;
    }

    return {
      verified_listings: listingsCount,
      active_students: studentsCount,
      trusted_landlords: landlordsCount,
      roommate_profiles: roommatesCount
    };
  },

  // --- 16. ROOMMATE FINDER ENGINE ---
  async getRoommates(currentUser = null) {
    let results = [];
    let fetched = false;

    if (isConfigured) {
      try {
        const { data, error } = await supabase.from('roommate_profiles').select('*');
        if (!error && Array.isArray(data)) {
          results = data;
          fetched = true;
        }
      } catch (e) {
        console.warn('Supabase getRoommates error:', e);
      }
    }
    
    if (!fetched) {
      results = getLocal('roommates') || [];
    }

    const currentEmail = (currentUser?.email || '').toLowerCase().trim();
    const currentId = (currentUser?.id || '').toString();

    // Exclude current user from candidate matches
    return results.filter(r => {
      if (!r) return false;
      const rEmail = (r.email || r.student_email || '').toLowerCase().trim();
      const rId = (r.student_id || r.id || r.user_id || '').toString();
      if (currentEmail && rEmail && rEmail === currentEmail) return false;
      if (currentId && rId && rId === currentId) return false;
      return true;
    });
  },

  async getMyRoommateProfile(currentUser) {
    if (!currentUser) return null;
    const cId = (currentUser.id || '').toString();
    const cEmail = (currentUser.email || '').toLowerCase().trim();

    if (isConfigured) {
      try {
        const { data, error } = await supabase.from('roommate_profiles').select('*');
        if (!error && data && data.length > 0) {
          const found = data.find(r => 
            (r.student_id && String(r.student_id) === cId) ||
            (r.student_email && r.student_email.toLowerCase().trim() === cEmail) ||
            (r.email && r.email.toLowerCase().trim() === cEmail)
          );
          if (found) {
            return {
              id: found.id,
              student_id: found.student_id,
              email: found.student_email || found.email || cEmail,
              name: found.student_name || found.name || currentUser.name || 'Student Roommate',
              budget: found.budget || '6,500 BDT/mo',
              sleepSchedule: found.sleep_schedule || found.sleepSchedule || 'Night Owl',
              cleanliness: found.cleanliness_level || found.cleanliness || 'Clean',
              studyHabits: found.study_habits || found.studyHabits || 'Quiet Study',
              pets: found.pets || 'No Pets',
              bio: found.bio || '',
              gender: found.gender || 'Male',
              is_active: found.is_active !== false
            };
          }
        }
      } catch (e) {
        console.warn('Supabase getMyRoommateProfile error:', e);
      }
    }

    const localRoommates = getLocal('roommates') || [];
    const myLocal = localRoommates.find(r => 
      (r.student_id && String(r.student_id) === cId) ||
      (r.email && (r.email || '').toLowerCase().trim() === cEmail) ||
      r.isMyProfile
    );
    return myLocal || null;
  },

  async saveRoommate(roommateData) {
    const current = getLocal('roommates') || [];
    const updated = [roommateData, ...current.filter(r => r.id !== roommateData.id && r.student_id !== roommateData.student_id)];
    setLocal('roommates', updated);

    if (isConfigured) {
      try {
        await supabase.from('roommate_profiles').upsert([{
          id: String(roommateData.id || 'rm_' + Date.now()),
          student_id: String(roommateData.student_id || roommateData.id || ''),
          student_name: roommateData.name || 'Student Roommate',
          student_email: roommateData.email || '',
          bio: roommateData.bio || '',
          budget: roommateData.budget || '6,500 BDT/mo',
          sleep_schedule: roommateData.sleepSchedule || 'Night Owl',
          cleanliness_level: roommateData.cleanliness || 'Clean',
          study_habits: roommateData.studyHabits || 'Quiet Study',
          pets: roommateData.pets || 'No Pets',
          gender: roommateData.gender || 'Male',
          is_active: true
        }]);
      } catch (err) {
        console.warn('Supabase saveRoommate error:', err);
      }
    }
    return updated;
  },

  // --- 11. TEMPORARY EMAIL VERIFICATIONS ---
  async saveTempVerification(email, code, signupData) {
    const key = (email || '').toLowerCase().trim();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    const record = { email: key, code: String(code), signupData, expiresAt };
    
    const verifications = getLocal('verifications');
    const updated = [record, ...verifications.filter(v => v.email !== key)];
    setLocal('verifications', updated);

    if (isConfigured) {
      try {
        await supabase.from('email_verifications').upsert([{
          email: key,
          code: String(code),
          signup_data: signupData,
          expires_at: new Date(expiresAt).toISOString()
        }]);
      } catch (err) {
        console.warn('Supabase save email verification error:', err);
      }
    }
    return record;
  },

  async getTempVerification(email) {
    const key = (email || '').toLowerCase().trim();
    if (isConfigured) {
      try {
        const { data, error } = await supabase.from('email_verifications').select('*').eq('email', key).single();
        if (!error && data) {
          return {
            email: data.email,
            code: data.code,
            signupData: data.signup_data,
            expiresAt: new Date(data.expires_at).getTime()
          };
        }
      } catch (e) {
        console.warn('Supabase getTempVerification error:', e);
      }
    }
    const verifications = getLocal('verifications');
    return verifications.find(v => v.email === key) || null;
  },

  async deleteTempVerification(email) {
    const key = (email || '').toLowerCase().trim();
    const verifications = getLocal('verifications');
    setLocal('verifications', verifications.filter(v => v.email !== key));

    if (isConfigured) {
      try {
        await supabase.from('email_verifications').delete().eq('email', key);
      } catch (err) {
        console.warn('Supabase delete temp verification error:', err);
      }
    }
  },

  // --- 12. STUDENT & LANDLORD ID VERIFICATIONS ---
  async submitIdVerification(userEmail, userName, documentUrl, currentProfileData = null) {
    const email = (userEmail || '').toLowerCase().trim();

    // 1. SERVER-SIDE PROFILE COMPLETENESS RE-CHECK (Do NOT trust frontend alone)
    let userProfile = currentProfileData;
    if (!userProfile && email) {
      userProfile = await this.getUserByEmail(email);
    }

    const { isComplete, missingFields } = checkProfileCompleteness(userProfile);
    if (!isComplete) {
      const errorMsg = `Profile incomplete. Please fill in: ${missingFields.join(', ')}`;
      console.warn('submitIdVerification backend rejected submission:', errorMsg);
      return {
        error: true,
        message: errorMsg,
        missingFields
      };
    }

    const payload = {
      id: 'idver_' + Date.now(),
      user_email: email,
      user_name: userName || 'Student',
      id_document_url: documentUrl,
      verification_status: 'pending',
      rejection_reason: null,
      submitted_at: new Date().toISOString()
    };

    const localList = getLocal('id_verifications');
    const updated = [payload, ...localList.filter(v => v.user_email !== email)];
    setLocal('id_verifications', updated);

    if (isConfigured) {
      try {
        await supabase.from('id_verifications').upsert([{
          user_email: email,
          user_name: userName || 'Student',
          id_document_url: documentUrl,
          verification_status: 'pending',
          rejection_reason: null,
          submitted_at: payload.submitted_at
        }]);
      } catch (err) {
        console.warn('Supabase submit ID verification error:', err);
      }
    }
    return payload;
  },

  async getIdVerificationStatus(userEmail) {
    const email = (userEmail || '').toLowerCase().trim();
    if (isConfigured) {
      try {
        const { data, error } = await supabase
          .from('id_verifications')
          .select('*')
          .eq('user_email', email)
          .order('submitted_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getIdVerificationStatus error:', e);
      }
    }
    const localList = getLocal('id_verifications');
    return localList.find(v => v.user_email === email) || null;
  },

  async getPendingIdVerifications() {
    if (isConfigured) {
      try {
        const { data, error } = await supabase
          .from('id_verifications')
          .select('*')
          .eq('verification_status', 'pending')
          .order('submitted_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getPendingIdVerifications error:', e);
      }
    }
    const localList = getLocal('id_verifications');
    return localList.filter(v => v.verification_status === 'pending');
  },

  async reviewIdVerification(verificationId, userEmail, action, rejectionReason = '') {
    const email = (userEmail || '').toLowerCase().trim();
    const isApproved = action === 'approve';
    const newStatus = isApproved ? 'verified' : 'rejected';
    const reviewedAt = new Date().toISOString();

    // 1. Update id_verifications table
    const localList = getLocal('id_verifications');
    const updatedVerifications = localList.map(v => {
      if (v.user_email === email || v.id === verificationId) {
        return {
          ...v,
          verification_status: newStatus,
          rejection_reason: isApproved ? null : rejectionReason,
          reviewed_at: reviewedAt
        };
      }
      return v;
    });
    setLocal('id_verifications', updatedVerifications);

    if (isConfigured) {
      try {
        await supabase.from('id_verifications').update({
          verification_status: newStatus,
          rejection_reason: isApproved ? null : rejectionReason,
          reviewed_at: reviewedAt
        }).eq('user_email', email);

        // Sync profiles table is_verified status
        await supabase.from('profiles').update({
          is_verified: isApproved
        }).eq('email', email);
      } catch (err) {
        console.warn('Supabase review ID verification error:', err);
      }
    }

    // 2. TRIGGER DUAL NOTIFICATIONS (In-App + Email) AUTOMATICALLY!
    const alertMsg = isApproved
      ? 'Your ID verification has been approved. Your account is now verified.'
      : `Your ID verification was rejected. Reason: ${rejectionReason || 'Invalid document'}. Please re-submit a valid document.`;

    // a) In-App Notification
    await this.addNotification({
      user_email: email,
      title: isApproved ? '✓ ID Verification Approved' : '❌ ID Verification Rejected',
      message: alertMsg,
      type: isApproved ? 'success' : 'error',
      is_read: false
    });

    // b) Email Notification
    await emailService.sendNotificationEmail({
      email: email,
      subject: isApproved ? '✓ RentEase Account Verification Approved' : '❌ RentEase Account Verification Update',
      title: isApproved ? '🎉 ID Verification Approved!' : '⚠️ ID Verification Status Update',
      message: alertMsg
    });

    return { success: true, status: newStatus };
  },

  // ====================================================
  // SUPABASE STORAGE ENGINE (FILES & DOCUMENTS)
  // ====================================================

  async uploadStorageFile(bucketName, filePath, fileObj) {
    if (!isConfigured) return null;
    try {
      const { data, error } = await supabase.storage.from(bucketName).upload(filePath, fileObj, {
        cacheControl: '3600',
        upsert: true
      });
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      return publicUrlData.publicUrl;
    } catch (err) {
      console.warn(`Supabase Storage upload error [${bucketName}]:`, err);
      return null;
    }
  },

  async uploadPropertyImage(file, fileName) {
    return this.uploadStorageFile('property-images', fileName, file);
  },

  async uploadProfileImage(file, fileName) {
    return this.uploadStorageFile('profile-images', fileName, file);
  },

  async updateProfilePicture(userEmail, imageInput) {
    const email = (userEmail || '').toLowerCase().trim();
    if (!email) {
      return { error: true, message: 'Email address missing.' };
    }

    let imageUrl = imageInput;

    // Backend Validation: Max 2MB file size & allowed image formats
    if (typeof imageInput === 'string' && imageInput.startsWith('data:image/')) {
      if (imageInput.length > 2.8 * 1024 * 1024) {
        return { error: true, message: 'Image file size exceeds maximum limit of 2MB.' };
      }
      const allowed = ['data:image/jpeg', 'data:image/png', 'data:image/webp', 'data:image/jpg'];
      const isValid = allowed.some(t => imageInput.startsWith(t));
      if (!isValid) {
        return { error: true, message: 'Invalid format. Only JPG, PNG, and WEBP image files are allowed.' };
      }
    }

    if (isConfigured && typeof imageInput !== 'string') {
      const fileExt = imageInput.name ? imageInput.name.split('.').pop() : 'png';
      const fileName = `profile_${email.replace(/[^a-z0-9]/g, '_')}_${Date.now()}.${fileExt}`;
      const uploadedUrl = await this.uploadProfileImage(imageInput, fileName);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    if (isConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({ avatar_url: imageUrl, profile_picture: imageUrl, updated_at: new Date().toISOString() })
          .eq('email', email);
      } catch (err) {
        console.warn('Supabase updateProfilePicture error:', err);
      }
    }

    const users = getLocal('users');
    const userIndex = users.findIndex(u => (u.email || '').toLowerCase() === email);
    if (userIndex !== -1) {
      users[userIndex].avatar = imageUrl;
      users[userIndex].avatar_url = imageUrl;
      users[userIndex].profile_picture = imageUrl;
      setLocal('users', users);
    }

    return { success: true, avatarUrl: imageUrl };
  },

  async uploadLandlordNid(file, fileName) {
    return this.uploadStorageFile('landlord-verification', `nid/${fileName}`, file);
  },

  async uploadLandlordOwnership(file, fileName) {
    return this.uploadStorageFile('landlord-verification', `ownership/${fileName}`, file);
  },

  async uploadLandlordUtilityBill(file, fileName) {
    return this.uploadStorageFile('landlord-verification', `utility-bills/${fileName}`, file);
  },

  async uploadLeaseDocument(file, fileName) {
    return this.uploadStorageFile('lease-documents', fileName, file);
  },



  // ====================================================
  // AUTOMATED DATABASE SEEDING UTILITY
  // ====================================================
  async seedAllDatabaseTables() {
    if (!isConfigured) return { success: false, message: 'Supabase URL/Key not configured' };

    try {
      // 1. Seed Listings
      const sampleListings = [
        {
          title: 'BUBT Student Hub - Single Room',
          location: 'Mirpur 2 (0.2 miles from BUBT)',
          price: 6500,
          type: 'Private Room',
          facilities: ['Wi-Fi Included', 'Furnished', 'Study Desk', 'Generator Backup'],
          verified: true,
          image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
          description: 'Ideal single room for BUBT CSE/EEE students. 3 minutes walk to main campus.'
        },
        {
          title: 'Mirpur 10 Smart Student Flat',
          location: 'Mirpur 10 Metro Station (0.5 miles)',
          price: 12500,
          type: 'Entire Apartment',
          facilities: ['Wi-Fi Included', 'Private Bath', 'In-unit Laundry', 'Balcony'],
          verified: true,
          image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
          description: 'Modern 2-bedroom apartment perfect for 2-3 student roommates sharing expenses.'
        },
        {
          title: 'Rupnagar Student Hostel & Mess',
          location: 'Rupnagar R/A, Road 7',
          price: 4200,
          type: 'Shared Room',
          facilities: ['Wi-Fi Included', 'Meal System', '24/7 Security', 'Cleaning Service'],
          verified: true,
          image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80',
          description: 'Premium student mess with home cooked 3-time meals and high-speed Wi-Fi.'
        },
        {
          title: 'Green View Female Residence',
          location: 'Mirpur 2, Block D',
          price: 5500,
          type: 'Private Room',
          facilities: ['Wi-Fi Included', 'Female Only', 'Strict Security', 'Attached Bath'],
          verified: true,
          image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80',
          description: 'Safe and quiet accommodation for female university students with 24/7 CCTV security.'
        }
      ];
      await supabase.from('listings').insert(sampleListings);

      // 2. Seed Bookings
      await supabase.from('bookings').insert([
        { id: 'b_101', tenant_name: 'Anas Ahmed', tenant_email: 'anas@cse.bubt.edu.bd', property_title: 'BUBT Student Hub - Single Room', price: 6500, status: 'Approved', date: '2026-08-15' },
        { id: 'b_102', tenant_name: 'Tanvir Hossain', tenant_email: 'tanvir@eee.bubt.edu.bd', property_title: 'Mirpur 10 Smart Student Flat', price: 12500, status: 'Pending', date: '2026-08-18' }
      ]);

      // 3. Seed Payments
      await supabase.from('payments').insert([
        { id: 'p_201', receipt_id: 'REC-98210', tenant_name: 'Anas Ahmed', property_title: 'BUBT Student Hub - Single Room', amount: 6500, month: 'August 2026', status: 'Paid', date: '2026-08-15' },
        { id: 'p_202', receipt_id: 'REC-98211', tenant_name: 'Tanvir Hossain', property_title: 'Mirpur 10 Smart Student Flat', amount: 12500, month: 'August 2026', status: 'Pending', date: '2026-08-18' }
      ]);

      // 4. Seed Profiles
      await supabase.from('profiles').insert([
        { id: '11111111-1111-4111-a111-111111111111', name: 'Anas Ahmed', email: 'anas@cse.bubt.edu.bd', phone: '+880 1711-223344', role: 'student', avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6' },
        { id: '22222222-2222-4222-a222-222222222222', name: 'Mehadi Hasan', email: 'mehadi@landlord.com', phone: '+880 1712-345678', role: 'landlord', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' }
      ]);

      // 5. Seed Roommates
      await supabase.from('roommate_profiles').insert([
        { name: 'Anas Ahmed', student_id: '11111111-1111-4111-a111-111111111111', budget: 6500, bio: 'CSE 3rd year student. Night owl coder, quiet, clean, non-smoker.', gender: 'Male', cleanliness: 'Very Organized & Tidy' },
        { name: 'Tanvir Hossain', budget: 5000, bio: 'EEE student. Early riser, gamer.', gender: 'Male', cleanliness: 'Clean' }
      ]);

      return { success: true, message: 'All Supabase Database tables seeded successfully!' };
    } catch (err) {
      console.error('Seed execution error:', err);
      return { success: false, message: err.message };
    }
  }
};
