import { createClient } from '@supabase/supabase-js';
import { DEFAULT_LISTINGS, DEFAULT_CHATS, DEFAULT_BOOKINGS, DEFAULT_PAYMENTS, MOCK_ROOMMATES } from './mockDb';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key';

export const isConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('xyzcompany')
);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// LOCAL STORAGE PERSISTENT ENGINE FALLBACK
const getLocal = (key, defaultVal) => {
  try {
    const saved = localStorage.getItem(`rentease_db_${key}`);
    return saved ? JSON.parse(saved) : defaultVal;
  } catch (e) {
    return defaultVal;
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
// DATABASE & STORAGE API LAYER (Supabase + Local Sync)
// ----------------------------------------------------

export const dbService = {
  // --- 1. USERS COLLECTION ---
  async getUsers() {
    if (isConfigured) {
      const { data, error } = await supabase.from('users').select('*');
      if (!error && data && data.length > 0) return data;
    }
    return getLocal('users', []);
  },

  async saveUser(userData) {
    const current = getLocal('users', []);
    const updated = [userData, ...current];
    setLocal('users', updated);

    if (isConfigured) {
      try {
        await supabase.from('users').insert([userData]);
      } catch (err) {
        console.warn('Supabase save user error:', err);
      }
    }
    return updated;
  },

  // --- 2. PROPERTIES COLLECTION ---
  async getListings() {
    if (isConfigured) {
      const { data, error } = await supabase.from('properties').select('*').order('id', { ascending: true });
      if (!error && data && data.length > 0) return data;
    }
    return getLocal('listings', DEFAULT_LISTINGS);
  },

  async saveListing(newListing) {
    const currentListings = getLocal('listings', DEFAULT_LISTINGS);
    const updated = [newListing, ...currentListings];
    setLocal('listings', updated);

    if (isConfigured) {
      try {
        await supabase.from('properties').insert([newListing]);
      } catch (err) {
        console.warn('Supabase save property error:', err);
      }
    }
    return updated;
  },

  // --- 3. BOOKINGS COLLECTION ---
  async getBookings() {
    if (isConfigured) {
      const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    }
    return getLocal('bookings', DEFAULT_BOOKINGS);
  },

  async createBooking(bookingData) {
    const current = getLocal('bookings', DEFAULT_BOOKINGS);
    const updated = [bookingData, ...current];
    setLocal('bookings', updated);

    if (isConfigured) {
      try {
        await supabase.from('bookings').insert([bookingData]);
      } catch (err) {
        console.warn('Supabase insert booking error:', err);
      }
    }
    return updated;
  },

  async updateBookingStatus(bookingId, status) {
    const current = getLocal('bookings', DEFAULT_BOOKINGS);
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

  // --- 4. PAYMENTS COLLECTION ---
  async getPayments() {
    if (isConfigured) {
      const { data, error } = await supabase.from('payments').select('*');
      if (!error && data && data.length > 0) return data;
    }
    return getLocal('payments', DEFAULT_PAYMENTS);
  },

  async addPayment(paymentData) {
    const current = getLocal('payments', DEFAULT_PAYMENTS);
    const updated = [paymentData, ...current];
    setLocal('payments', updated);

    if (isConfigured) {
      try {
        await supabase.from('payments').insert([paymentData]);
      } catch (err) {
        console.warn('Supabase add payment error:', err);
      }
    }
    return updated;
  },

  async approvePayment(paymentId) {
    const current = getLocal('payments', DEFAULT_PAYMENTS);
    const updated = current.map(p => {
      if (p.id === paymentId || p.receiptId === paymentId) {
        return { ...p, status: 'Paid', date: new Date().toISOString().split('T')[0] };
      }
      return p;
    });
    setLocal('payments', updated);

    if (isConfigured) {
      try {
        await supabase.from('payments').update({ status: 'Paid' }).eq('receiptId', paymentId);
      } catch (err) {
        console.warn('Supabase approve payment error:', err);
      }
    }
    return updated;
  },

  // --- 5. ROOMMATES COLLECTION ---
  async getRoommates() {
    if (isConfigured) {
      const { data, error } = await supabase.from('roommates').select('*');
      if (!error && data && data.length > 0) return data;
    }
    return getLocal('roommates', MOCK_ROOMMATES);
  },

  // --- 6. CHATS COLLECTION ---
  async getChats() {
    if (isConfigured) {
      const { data, error } = await supabase.from('chats').select('*');
      if (!error && data && data.length > 0) return data;
    }
    return getLocal('chats', DEFAULT_CHATS);
  },

  // --- 7. LEASES COLLECTION ---
  async getLeases() {
    if (isConfigured) {
      const { data, error } = await supabase.from('leases').select('*');
      if (!error && data && data.length > 0) return data;
    }
    return getLocal('leases', []);
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

  // Specific Bucket Upload Helpers matching User Architecture Diagram
  async uploadPropertyImage(file, fileName) {
    return this.uploadStorageFile('property-images', fileName, file);
  },

  async uploadProfileImage(file, fileName) {
    return this.uploadStorageFile('profile-images', fileName, file);
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
  // REALTIME HOMEPAGE STATS AGGREGATOR
  // ====================================================
  async getRentEaseStats() {
    if (isConfigured) {
      try {
        const { data, error } = await supabase.rpc('get_rentease_stats');
        if (!error && data) return data;
      } catch (err) {
        console.warn('RPC get_rentease_stats error:', err);
      }
    }
    return {
      verified_listings: 5000,
      active_students: 12000,
      trusted_landlords: 800
    };
  }
};
