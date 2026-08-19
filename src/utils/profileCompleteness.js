/**
 * Shared Profile Completeness Helper
 * Reused in: Auth Login/Signup notification, Dashboard Banner, and ID Verification Gating (Frontend & Backend Service)
 * 
 * Required Profile Fields:
 * 1. Emergency Contact Phone (emergencyContact / emergency_contact)
 * 2. Date of Birth (dob / date_of_birth)
 * 3. Gender (gender)
 * 4. Academic Year / Intake (academicYear / academic_year / year)
 */

export function getMissingProfileFields(profile) {
  if (!profile) {
    return ['Emergency Contact Phone', 'Date of Birth', 'Gender', 'Academic Year / Intake'];
  }

  const missing = [];

  // 1. Emergency Contact Phone
  const emergencyPhone = profile.emergencyContact || profile.emergency_contact || profile.emergencyPhone || profile.emergency_phone;
  if (!emergencyPhone || !String(emergencyPhone).trim()) {
    missing.push('Emergency Contact Phone');
  }

  // 2. Date of Birth
  const dob = profile.dob || profile.date_of_birth || profile.dateOfBirth;
  if (!dob || !String(dob).trim()) {
    missing.push('Date of Birth');
  }

  // 3. Gender
  const gender = profile.gender;
  if (!gender || !String(gender).trim()) {
    missing.push('Gender');
  }

  // 4. Academic Year / Intake
  const academicYear = profile.academicYear || profile.academic_year || profile.year;
  if (!academicYear || !String(academicYear).trim()) {
    missing.push('Academic Year / Intake');
  }

  return missing;
}

export function checkProfileCompleteness(profile) {
  const missingFields = getMissingProfileFields(profile);
  return {
    isComplete: missingFields.length === 0,
    missingFields
  };
}

/**
 * Landlord Profile Completeness Checker
 * Required Fields:
 * 1. Owner Full Name
 * 2. Phone Number
 * 3. Address
 * 4. NID Number
 * 5. Profile Photo
 * 6. Payout Channel
 * 7. Mobile / Bank Account Number
 */
export function getMissingLandlordProfileFields(profile) {
  if (!profile) {
    return [
      'Owner Full Name',
      'Phone Number',
      'Address',
      'NID Number',
      'Profile Photo',
      'Payout Channel',
      'Mobile / Bank Account Number'
    ];
  }

  const missing = [];

  const name = profile.name || profile.full_name || profile.ownerName;
  if (!name || !String(name).trim()) missing.push('Owner Full Name');

  const phone = profile.phone || profile.phone_number || profile.phoneNumber;
  if (!phone || !String(phone).trim()) missing.push('Phone Number');

  const address = profile.address;
  if (!address || !String(address).trim()) missing.push('Address');

  const nidNumber = profile.nidNumber || profile.nid_number || profile.nid;
  if (!nidNumber || !String(nidNumber).trim()) missing.push('NID Number');

  const photo = profile.avatar || profile.avatar_url || profile.profile_picture;
  if (!photo || !String(photo).trim()) missing.push('Profile Photo');

  const payoutChannel = profile.payoutChannel || profile.payout_channel || profile.paymentMethod || profile.payout_method;
  if (!payoutChannel || !String(payoutChannel).trim()) missing.push('Payout Channel');

  const accountNum = profile.accountNumber || profile.account_number || profile.paymentAccount || profile.payout_account;
  if (!accountNum || !String(accountNum).trim()) missing.push('Mobile / Bank Account Number');

  return missing;
}

export function checkLandlordProfileCompleteness(profile) {
  const missingFields = getMissingLandlordProfileFields(profile);
  return {
    isComplete: missingFields.length === 0,
    missingFields
  };
}

/**
 * Dynamic Avatar Fallback Helper
 * Returns uploaded profile_picture/avatar, or a clean UI Avatar placeholder with student's initials
 */
export function getAvatarUrl(user) {
  if (user?.avatar && user.avatar.trim()) return user.avatar;
  if (user?.avatar_url && user.avatar_url.trim()) return user.avatar_url;
  if (user?.profile_picture && user.profile_picture.trim()) return user.profile_picture;
  
  const name = user?.name || user?.full_name || 'Student User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=ffffff&bold=true&font-size=0.4`;
}

/**
 * Fast Client Canvas Image Compressor & Resizer
 * Converts uploaded photos (up to 10MB) to a lightweight ~30KB JPEG
 * Prevents browser localStorage quota crashes and accelerates loading!
 */
export function compressImage(file, maxWidth = 300, maxHeight = 300, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
