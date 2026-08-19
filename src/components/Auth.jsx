import React, { useState, useRef, useEffect } from 'react';
import { dbService, isConfigured, supabase } from '../database/supabaseClient';
import { emailService } from '../services/emailService';
import { 
  User, Mail, Phone, Lock, GraduationCap, Camera, Pencil, 
  ChevronDown, ShieldCheck, Users, FileText, ArrowRight, 
  AlertCircle, ArrowLeft, RefreshCw, CheckCircle2, Eye, EyeOff, KeyRound,
  UploadCloud, FileCheck, Clock, Building, CreditCard, BadgeCheck, CheckCircle, Sparkles,
  AlertTriangle, Check
} from 'lucide-react';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
    />
  </svg>
);

function Auth({ onAuthSuccess, initialMode = 'signup', onBackToHome }) {
  // Modes: 'signin' | 'signup' | 'verify_otp' | 'complete_profile_student' | 'verify_landlord_nid' | 'admin_review_landlord'
  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState('student'); // 'student' | 'landlord'
  
  // Basic Account Credentials (Blank by default for user input)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [university, setUniversity] = useState('Bangladesh University of Business and Technology (BUBT)');
  const [profileImage, setProfileImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Student Profile Completion State
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('BSc in Computer Science & Engineering (CSE)');
  const [intakeNo, setIntakeNo] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [preferredArea, setPreferredArea] = useState('Mirpur 2 (Near BUBT Campus)');
  const [monthlyBudget, setMonthlyBudget] = useState('৳6,000 - ৳10,000 / month');
  const [roommatePreference, setRoommatePreference] = useState('');

  // Landlord NID & Property Verification State
  const [nidNumber, setNidNumber] = useState('');
  const [nidFrontImg, setNidFrontImg] = useState(null);
  const [nidBackImg, setNidBackImg] = useState(null);
  const [propertyName, setPropertyName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [taxReceiptImg, setTaxReceiptImg] = useState(null);

  // Forgot Password Workflow State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [forgotInput, setForgotInput] = useState('');
  const [forgotOtpDigits, setForgotOtpDigits] = useState(['7', '4', '9', '2', '1', '5']);
  const [forgotResendTimer, setForgotResendTimer] = useState(60); // 60s resend timer
  const [forgotExpiryTimer, setForgotExpiryTimer] = useState(180); // 3 minutes (180s) OTP expiry
  const [forgotFailedAttempts, setForgotFailedAttempts] = useState(0); // max 3 allowed
  const [forgotIsBlocked, setForgotIsBlocked] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [forgotError, setForgotError] = useState(null);

  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // OTP State for Account Registration
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [resendTimer, setResendTimer] = useState(45);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const forgotOtpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const fileInputRef = useRef(null);
  const nidFrontRef = useRef(null);
  const nidBackRef = useRef(null);
  const taxReceiptRef = useRef(null);

  // Timer countdown for Account Registration OTP
  useEffect(() => {
    let interval = null;
    if (mode === 'verify_otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, resendTimer]);

  // Timers countdown for Forgot Password OTP (Resend + Expiry)
  useEffect(() => {
    let interval = null;
    if (showForgotModal && forgotStep === 2) {
      interval = setInterval(() => {
        setForgotResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
        setForgotExpiryTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showForgotModal, forgotStep]);

  const handlePhotoClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return setError('Image size should be less than 2MB.');
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocUpload = (e, setImgState) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImgState(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleOtpChange = (index, value) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError(null);
      if (value && index < 5) otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      setError(null);
      const nextFocus = Math.min(digits.length, 5);
      otpRefs[nextFocus].current?.focus();
    }
  };

  // Forgot Password OTP Input handlers
  const handleForgotOtpChange = (index, value) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...forgotOtpDigits];
      newOtp[index] = value;
      setForgotOtpDigits(newOtp);
      setForgotError(null);
      if (value && index < 5) forgotOtpRefs[index + 1].current?.focus();
    }
  };

  const handleForgotOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !forgotOtpDigits[index] && index > 0) {
      forgotOtpRefs[index - 1].current?.focus();
    }
  };

  const handleForgotOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newOtp = [...forgotOtpDigits];
      digits.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setForgotOtpDigits(newOtp);
      setForgotError(null);
      const nextFocus = Math.min(digits.length, 5);
      forgotOtpRefs[nextFocus].current?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    const inputEmail = (email || '').trim().toLowerCase();
    if (!inputEmail) return setError('Email address missing. Please fill out signup form again.');

    setResendTimer(45); // Rate limiting: 45 seconds cooldown
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();

    const existingRecord = await dbService.getTempVerification(inputEmail);
    const signupData = existingRecord?.signupData || { email: inputEmail, name: name || 'Student', role: 'Student Account' };

    // Update temp code with 10-minute expiry (600s)
    await dbService.saveTempVerification(inputEmail, newCode, signupData);
    await emailService.sendVerificationCode({
      email: inputEmail,
      code: newCode,
      name: signupData.name || name || 'Student'
    });

    setOtp(newCode.split(''));
    setError(null);
    setSuccessMsg(`✓ New 6-digit code [${newCode}] sent to ${inputEmail}!`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  // ----------------------------------------------------
  // Step 1: User fills out form -> Validate & Generate 6-Digit Code (DO NOT save user to DB yet!)
  // ----------------------------------------------------
  const handleCreateAccountSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);

    const inputName = (name || '').trim();
    const inputEmail = (email || '').trim().toLowerCase();
    const inputPhone = (phone || '').trim();
    const inputStudentId = (studentId || '').trim();
    const inputPassword = password || '';
    const inputConfirm = confirmPassword || '';

    if (!inputName) return setError('Please enter your Full Name.');
    if (!inputEmail || !inputEmail.includes('@')) return setError('Please enter a valid Email Address.');
    if (!inputPhone) return setError('Please enter your Phone Number.');
    if (!inputPassword || inputPassword.length < 6) return setError('Password must be at least 6 characters long.');
    if (inputPassword !== inputConfirm) return setError('Passwords do not match. Please re-enter.');
    if (role === 'student' && !inputStudentId) return setError('Please enter your Student ID / Registration No.');
    if (!agreeTerms) return setError('Please check the box to agree to Terms & Conditions.');

    // 2. SIGNUP - EMAIL CHECK (before sending verification code)
    const existingUser = await dbService.getUserByEmail(inputEmail);
    if (existingUser) {
      const rawRole = (existingUser.rawRole || existingUser.role || 'student').toLowerCase();
      const formattedRole = rawRole.includes('landlord') ? 'landlord' : rawRole.includes('admin') ? 'admin' : 'student';
      return setError(`This email is already registered as a ${formattedRole}. Please log in instead.`);
    }

    // Step 3: Generate random 6-digit verification code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Prepare signup payload (DO NOT create user account in database yet!)
    const signupData = {
      name: inputName,
      email: inputEmail,
      phone: inputPhone,
      role: role === 'student' ? 'Student Account' : 'Landlord Account',
      university: university,
      avatar: profileImage || (role === 'student'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80'
        : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80'),
      id: role === 'student' ? (inputStudentId || '22235103467') : ('LND-' + Math.floor(100000 + Math.random() * 900000)),
      studentId: inputStudentId,
      department: department,
      intake: intakeNo || '51/8'
    };

    // Step 4: Store temp code in database with 10-minute expiry
    await dbService.saveTempVerification(inputEmail, generatedCode, signupData);

    // Step 5: Send verification code to user email
    await emailService.sendVerificationCode({
      email: inputEmail,
      code: generatedCode,
      name: inputName
    });

    // Step 6: Load verification screen with code input fields
    setOtp(generatedCode.split(''));
    setMode('verify_otp');
    setResendTimer(45); // Rate-limiting resend cooldown (45s)
    setSuccessMsg(`✓ 6-Digit code [${generatedCode}] dispatched to ${inputEmail}`);
    setTimeout(() => setSuccessMsg(null), 6000);
  };

  // ----------------------------------------------------
  // Step 7: User Submits 6-Digit Code -> Check Expiry, Match Code & Create User Account Now!
  // ----------------------------------------------------
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const enteredCode = otp.join('').trim();
    if (enteredCode.length < 6) {
      return setError('Please enter the complete 6-digit verification code.');
    }

    const inputEmail = (email || '').trim().toLowerCase();

    // Check code against stored code in database for that email
    const storedRecord = await dbService.getTempVerification(inputEmail);

    if (!storedRecord) {
      return setError('No active verification code found for this email. Please click Resend Code.');
    }

    // Check code hasn't expired (10-minute expiry window)
    if (Date.now() > storedRecord.expiresAt) {
      return setError('⏰ Verification code has EXPIRED (10-minute limit). Please click Resend Code for a new code.');
    }

    // Check if code matches
    if (enteredCode !== storedRecord.code) {
      return setError('❌ Invalid verification code. Please check the code and try again.');
    }

    // Code is VALID and MATCHES!
    // Create actual user account in database now!
    const newUser = storedRecord.signupData || {
      name: name || 'Student',
      email: inputEmail,
      phone: phone || '+880 1712-345678',
      role: role === 'student' ? 'Student Account' : 'Landlord Account',
      university: university,
      id: studentId || '22235103467'
    };

    await dbService.saveUser(newUser);

    // Step 8: Delete/invalidate temporary verification code once used
    await dbService.deleteTempVerification(inputEmail);

    // Log user in (create session/JWT) & redirect to Student Dashboard
    setSuccessMsg('🎉 Email verified successfully! Logging in to Student Dashboard...');
    setTimeout(() => {
      onAuthSuccess(newUser);
    }, 1200);
  };

  // Step 3 (Student): Complete Profile -> Go to Dashboard
  const handleCompleteStudentProfileSubmit = (e) => {
    e.preventDefault();
    setError(null);

    onAuthSuccess({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: 'Student Account',
      university: university,
      avatar: profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
      id: studentId || (email.match(/\d+/) ? email.match(/\d+/)[0] : '22235103467'),
      intake: intakeNo || '51/8',
      department: department,
      emergencyPhone: emergencyPhone,
      preferredArea: preferredArea,
      monthlyBudget: monthlyBudget,
      roommatePreference: roommatePreference
    });
  };

  // Step 3 (Landlord): NID & Property Verification -> Go to Admin Review
  const handleLandlordVerificationSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!nidNumber.trim()) return setError('Please enter your National ID (NID) number.');
    if (!propertyName.trim()) return setError('Please enter your primary property title.');
    if (!propertyAddress.trim()) return setError('Please enter your property address.');

    setMode('admin_review_landlord');
  };

  // Step 4 (Landlord): Finish Admin Review Preview -> Go to Landlord Dashboard
  const handleProceedToLandlordDashboard = () => {
    onAuthSuccess({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: 'Landlord Account',
      university: 'N/A',
      avatar: profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80',
      id: 'LND-' + Math.floor(100000 + Math.random() * 900000),
      verificationStatus: 'Pending Admin Review',
      nidNumber: nidNumber,
      propertyName: propertyName,
      propertyAddress: propertyAddress
    });
  };

  // FORGOT PASSWORD WORKFLOW HANDLERS

  // Forgot Step 1: Send OTP
  const handleForgotSendOtp = (e) => {
    e.preventDefault();
    setForgotError(null);

    if (!forgotInput.trim()) {
      return setForgotError('Please enter your registered email or phone number.');
    }

    setForgotStep(2);
    setForgotOtpDigits(['7', '4', '9', '2', '1', '5']); // prefilled demo code for easy testing
    setForgotResendTimer(60); // 60 seconds resend timer
    setForgotExpiryTimer(180); // 3 minutes (180s) expiry timer
    setForgotFailedAttempts(0);
    setForgotIsBlocked(false);
  };

  // Forgot Step 2: Verify OTP
  const handleForgotVerifyOtp = (e) => {
    e.preventDefault();
    setForgotError(null);

    if (forgotIsBlocked) {
      return setForgotError('Too many failed attempts. Verification temporarily blocked. Please click Resend OTP.');
    }

    if (forgotExpiryTimer === 0) {
      return setForgotError('OTP expired. Please click Resend OTP to receive a new code.');
    }

    const enteredCode = forgotOtpDigits.join('');
    if (enteredCode.length < 6) {
      return setForgotError('Please enter the complete 6-digit OTP code.');
    }

    // Security Rule Check: Simulated OTP validation
    if (enteredCode === '749215' || enteredCode === '123456') {
      // Invalidate OTP immediately upon successful verification
      setForgotStep(3);
      setForgotError(null);
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      const newAttempts = forgotFailedAttempts + 1;
      setForgotFailedAttempts(newAttempts);
      if (newAttempts >= 3) {
        setForgotIsBlocked(true);
        setForgotError('⛔ Too many failed attempts (3/3). Verification temporarily blocked for security. Please click Resend OTP.');
      } else {
        setForgotError(`Invalid OTP code. ${3 - newAttempts} attempt(s) remaining.`);
      }
    }
  };

  // Forgot Step 3: Create New Password
  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    setForgotError(null);

    if (!newPassword || newPassword.length < 6) {
      return setForgotError('New password must be at least 6 characters long.');
    }
    if (newPassword !== confirmNewPassword) {
      return setForgotError('Passwords do not match. Please re-enter.');
    }

    // Password reset successful -> Step 4
    setForgotStep(4);
  };

  // Forgot Step 4: Back to Login
  const handleBackToLoginFromReset = () => {
    setShowForgotModal(false);
    setMode('signin');
    setEmail(forgotInput);
    setPassword(newPassword);
    setSuccessMsg('✓ Password changed successfully! Please sign in with your new password.');
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const inputVal = (email || '').trim().toLowerCase();
    if (!inputVal) return setError('Please enter your email address.');
    if (!password) return setError('Please enter your password.');
    
    // Admin account special login bypasses
    if (
      inputVal.includes('superadmin') ||
      inputVal.includes('admin@rentease.com') ||
      inputVal.includes('support@rentease.com') ||
      inputVal === 'admin'
    ) {
      let adminUser = {
        name: 'System Admin',
        email: inputVal.includes('@') ? inputVal : 'admin@rentease.com',
        phone: '+880 1900-778899',
        role: 'Admin Account',
        university: 'N/A',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&h=120&q=80',
        id: 'ADM-002'
      };
      return onAuthSuccess(adminUser);
    }

    // 3. LOGIN - EMAIL + PASSWORD MATCH QUERY
    const dbUser = await dbService.getUserByEmail(inputVal);

    if (!dbUser) {
      return setError('Invalid email or password');
    }

    // If user exists, verify credentials and redirect based on role
    const rawRole = (dbUser.rawRole || dbUser.role || 'student').toLowerCase();
    const roleTitle = rawRole.includes('landlord') ? 'Landlord Account' : rawRole.includes('admin') ? 'Admin Account' : 'Student Account';

    const loggedInUser = {
      ...dbUser,
      role: roleTitle
    };

    onAuthSuccess(loggedInUser);
  };

  const handleGoogleSignIn = () => {
    const googleUser = {
      name: 'Maruf Billah Anas (Google)',
      email: '22235103467@cse.bubt.edu.bd',
      phone: '+880 1712-345678',
      role: 'Student Account',
      university: 'Bangladesh University of Business and Technology (BUBT)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
      id: '22235103496',
      intake: '51/8'
    };
    onAuthSuccess(googleUser);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="auth-split-container">
      {/* Left branding panel */}
      <div className="auth-branding-pane">
        <div className="auth-branding-content">
          <div className="auth-brand-logo" onClick={onBackToHome} style={{ cursor: 'pointer' }}>
            <span>RentEase</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: '1.2' }}>
              Your gateway to simplified student housing.
            </h2>
            <p style={{ opacity: '0.9', fontSize: '1.1rem', lineHeight: '1.5' }}>
              Create an account or sign in to browse verified listings, search for compatible roommates, and draft secure leases.
            </p>
          </div>

          <div className="auth-branding-features">
            <div className="auth-feature-row">
              <div className="auth-feature-icon-wrapper">
                <ShieldCheck size={20} />
              </div>
              <div className="auth-feature-text">
                <h4>100% Verified Listings</h4>
                <p>Every apartment and landlord is vetted manually by campus managers to block housing fraud.</p>
              </div>
            </div>

            <div className="auth-feature-row">
              <div className="auth-feature-icon-wrapper">
                <Users size={20} />
              </div>
              <div className="auth-feature-text">
                <h4>Smart Compatibility Finder</h4>
                <p>Match with roommates based on daily schedules, study preferences, budget limits, and cleanliness standards.</p>
              </div>
            </div>

            <div className="auth-feature-row">
              <div className="auth-feature-icon-wrapper">
                <FileText size={20} />
              </div>
              <div className="auth-feature-text">
                <h4>Digital Lease Agreement Builder</h4>
                <p>Create print-ready digital contracts complying with localized housing guidelines in minutes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right card pane */}
      <div className="auth-card-pane">
        <div className="auth-card">
          
          {/* STEP 1: CREATE ACCOUNT */}
          {mode === 'signup' && (
            <>
              <div className="auth-card-header">
                <h1 className="auth-card-title">
                  Create Your RentEase Account
                </h1>
                <p className="auth-card-subtitle">
                  Get started with your university journey.
                </p>
              </div>

              {/* Role selector tab switcher */}
              <div className="auth-role-tabs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                <button
                  type="button"
                  className={`auth-role-tab ${role === 'student' ? 'active' : ''}`}
                  onClick={() => setRole('student')}
                >
                  Student
                </button>
                <button
                  type="button"
                  className={`auth-role-tab ${role === 'landlord' ? 'active' : ''}`}
                  onClick={() => setRole('landlord')}
                >
                  Landlord
                </button>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="auth-error-banner">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateAccountSubmit} className="auth-form-layout" autoComplete="off">
                {/* Profile photo upload */}
                <div className="profile-photo-upload-wrapper">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <div className="profile-photo-circle" onClick={handlePhotoClick}>
                    {profileImage ? (
                      <img src={profileImage} alt="Profile Preview" />
                    ) : (
                      <div className="placeholder-icon">
                        <Camera size={24} style={{ color: 'var(--text-light)', marginBottom: '4px' }} />
                        <span>img</span>
                      </div>
                    )}
                    <div className="profile-photo-edit-btn">
                      <Pencil size={12} />
                    </div>
                  </div>
                  <span className="profile-photo-label">Profile Photo</span>
                </div>

                {/* Full Name */}
                <div className="auth-form-group">
                  <label className="auth-form-label">Full Name</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><User size={18} /></span>
                    <input
                      type="text"
                      className="auth-input-field"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="auth-form-group">
                  <label className="auth-form-label">Email Address</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><Mail size={18} /></span>
                    <input
                      type="email"
                      className="auth-input-field"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="auth-form-group">
                  <label className="auth-form-label">Phone Number</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><Phone size={18} /></span>
                    <input
                      type="tel"
                      className="auth-input-field"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="auth-form-group">
                  <label className="auth-form-label">Password</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><Lock size={18} /></span>
                    <input
                      type="password"
                      className="auth-input-field"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="auth-form-group">
                  <label className="auth-form-label">Confirm Password</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><Lock size={18} /></span>
                    <input
                      type="password"
                      className="auth-input-field"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {/* Student ID & University selector (if student) */}
                {role === 'student' && (
                  <>
                    <div className="auth-form-group">
                      <label className="auth-form-label">Student ID / Registration No.</label>
                      <div className="auth-input-wrapper">
                        <span className="auth-input-icon"><CreditCard size={18} /></span>
                        <input
                          type="text"
                          className="auth-input-field"
                          placeholder="Student ID / Registration No."
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="auth-form-group">
                      <label className="auth-form-label">University</label>
                      <div className="auth-input-wrapper">
                        <span className="auth-input-icon"><GraduationCap size={18} /></span>
                        <select
                          className="auth-select-field"
                          value={university}
                          onChange={(e) => setUniversity(e.target.value)}
                        >
                          <option value="Bangladesh University of Business and Technology (BUBT)">
                            Bangladesh University of Business and Technology (BUBT)
                          </option>
                          <option value="Dhaka University (DU)">Dhaka University (DU)</option>
                          <option value="North South University (NSU)">North South University (NSU)</option>
                          <option value="BRAC University (BRACU)">BRAC University (BRACU)</option>
                          <option value="American International University-Bangladesh (AIUB)">
                            American International University-Bangladesh (AIUB)
                          </option>
                          <option value="United International University (UIU)">United International University (UIU)</option>
                        </select>
                        <span className="auth-select-chevron"><ChevronDown size={18} /></span>
                      </div>
                    </div>
                  </>
                )}

                {/* Terms & Conditions Checkbox */}
                <label className="auth-checkbox-group">
                  <input
                    type="checkbox"
                    className="auth-checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <span>I agree to <a href="#terms" onClick={(e) => e.preventDefault()} style={{ color: 'var(--primary)', fontWeight: 600 }}>Terms & Conditions</a></span>
                </label>

                <button type="submit" className="btn-auth-submit">
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </button>
              </form>

              <div className="auth-footer" style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                <span>
                  Already have an account?{' '}
                  <span className="auth-link" onClick={() => { setError(null); setMode('signin'); }}>
                    Login
                  </span>
                </span>
              </div>
            </>
          )}

          {/* SIGN IN VIEW */}
          {mode === 'signin' && (
            <>
              <div className="auth-card-header" style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem', fontFamily: 'var(--font-title)' }}>
                  RentEase
                </div>
                <h1 className="auth-card-title" style={{ fontSize: '1.85rem' }}>
                  Welcome Back! 👋
                </h1>
                <p className="auth-card-subtitle" style={{ marginTop: '0.2rem' }}>
                  Sign in to continue to RentEase
                </p>
              </div>

              {error && (
                <div className="auth-error-banner" style={{ marginBottom: '1rem' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="auth-success-banner" style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  color: '#059669',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <CheckCircle2 size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSignInSubmit} className="auth-form-layout">
                <div className="auth-form-group">
                  <label className="auth-form-label">Email or Phone Number</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><User size={18} /></span>
                    <input
                      type="text"
                      className="auth-input-field"
                      placeholder="Email or Phone Number"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">Password</label>
                  <div className="auth-input-wrapper" style={{ position: 'relative' }}>
                    <span className="auth-input-icon"><Lock size={18} /></span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input-field"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingRight: '2.5rem' }}
                      required
                    />
                    <button
                      type="button"
                      className="auth-eye-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Hide Password' : 'Show Password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  <div style={{ textAlign: 'right', marginTop: '0.35rem' }}>
                    <span 
                      className="auth-link" 
                      style={{ fontSize: '0.85rem', fontWeight: 600 }}
                      onClick={() => {
                        setShowForgotModal(true);
                        setForgotStep(1);
                        setForgotInput(email || '');
                        setForgotError(null);
                      }}
                    >
                      Forgot Password?
                    </span>
                  </div>
                </div>

                <button type="submit" className="btn-auth-submit" style={{ marginTop: '0.5rem' }}>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </button>

              </form>

              <div className="auth-footer" style={{ marginTop: '0.75rem' }}>
                <span>
                  Don't have an account?{' '}
                  <span className="auth-link" onClick={() => { setError(null); setMode('signup'); }}>
                    Create Account
                  </span>
                </span>
              </div>
            </>
          )}

          {/* STEP 2: OTP VERIFICATION VIEW */}
          {mode === 'verify_otp' && (
            <div className="otp-verification-wrapper">
              {/* Multi-step progress tracker */}
              <div className="auth-step-tracker">
                <div className="auth-step-item completed">
                  <div className="auth-step-circle">✓</div>
                  <span className="auth-step-label">Account</span>
                </div>
                <div className="auth-step-item active">
                  <div className="auth-step-circle">2</div>
                  <span className="auth-step-label">OTP Code</span>
                </div>
                <div className="auth-step-item">
                  <div className="auth-step-circle">3</div>
                  <span className="auth-step-label">{role === 'student' ? 'Profile' : 'Verification'}</span>
                </div>
              </div>

              <button 
                type="button" 
                className="otp-back-btn" 
                onClick={() => setMode('signup')}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-muted)', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '1rem'
                }}
              >
                <ArrowLeft size={16} /> Back to Sign Up
              </button>

              <div className="auth-card-header" style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--primary-glow)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem auto'
                }}>
                  <ShieldCheck size={32} />
                </div>
                <h1 className="auth-card-title" style={{ fontSize: '1.65rem' }}>
                  Verify Your Account
                </h1>
                <p className="auth-card-subtitle" style={{ marginTop: '0.35rem', lineHeight: '1.5' }}>
                  We've sent a 6-digit verification code to<br />
                  <strong style={{ color: 'var(--text-main)' }}>{email || phone}</strong>
                </p>
              </div>

              {error && (
                <div className="auth-error-banner" style={{ marginBottom: '1.25rem' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="auth-success-banner" style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  color: '#059669',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.25rem'
                }}>
                  <CheckCircle2 size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtpSubmit} className="auth-form-layout">
                <div className="auth-form-group">
                  <label className="auth-form-label" style={{ textAlign: 'center', display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                    Enter 6-Digit OTP Code
                  </label>
                  <div style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    💡 Verification Code: <strong style={{ color: 'var(--primary)', letterSpacing: '3px', fontSize: '1.1rem' }}>{otp.join('') || '123456'}</strong>
                  </div>

                  <div className="otp-inputs-grid" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={otpRefs[idx]}
                        type="text"
                        maxLength={1}
                        className="otp-digit-input"
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>
                </div>

                <div className="otp-resend-container" style={{ textAlign: 'center', marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setOtp(['1', '2', '3', '4', '5', '6']);
                      setError(null);
                      if (role === 'student') {
                        setMode('complete_profile_student');
                      } else {
                        setMode('verify_landlord_nid');
                      }
                    }}
                    style={{
                      background: 'rgba(37, 99, 235, 0.1)',
                      border: '1px solid rgba(37, 99, 235, 0.3)',
                      color: 'var(--primary)',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '50px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    ⚡ Auto-fill 123456 & Continue
                  </button>

                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Didn't receive the code?
                  </span>
                  
                  {resendTimer > 0 ? (
                    <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--primary)' }}>
                      Resend OTP ({formatTimer(resendTimer)})
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="auth-link"
                      onClick={handleResendOtp}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        padding: 0, 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.35rem', 
                        fontSize: '0.88rem',
                        cursor: 'pointer' 
                      }}
                    >
                      <RefreshCw size={14} /> Resend OTP
                    </button>
                  )}
                </div>

                <button type="submit" className="btn-auth-submit" style={{ marginTop: '1.25rem' }}>
                  <span>Verify Account</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          )}

          {/* STEP 3 (STUDENT): COMPLETE PROFILE */}
          {mode === 'complete_profile_student' && (
            <div className="complete-profile-wrapper">
              <div className="auth-step-tracker">
                <div className="auth-step-item completed">
                  <div className="auth-step-circle">✓</div>
                  <span className="auth-step-label">Account</span>
                </div>
                <div className="auth-step-item completed">
                  <div className="auth-step-circle">✓</div>
                  <span className="auth-step-label">OTP</span>
                </div>
                <div className="auth-step-item active">
                  <div className="auth-step-circle">3</div>
                  <span className="auth-step-label">Complete Profile</span>
                </div>
              </div>

              <div className="auth-card-header" style={{ marginBottom: '1.25rem' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'var(--primary-glow)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.5rem auto'
                }}>
                  <GraduationCap size={28} />
                </div>
                <h1 className="auth-card-title" style={{ fontSize: '1.6rem' }}>
                  Complete Profile 🎓
                </h1>
                <p className="auth-card-subtitle" style={{ fontSize: '0.88rem' }}>
                  Customize your student profile & housing preferences.
                </p>
              </div>

              <form onSubmit={handleCompleteStudentProfileSubmit} className="auth-form-layout">
                <div className="auth-form-group">
                  <label className="auth-form-label">Student ID / Registration No.</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><CreditCard size={18} /></span>
                    <input
                      type="text"
                      className="auth-input-field"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. 22235103467"
                      required
                    />
                  </div>
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">Department & Intake</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><GraduationCap size={18} /></span>
                    <input
                      type="text"
                      className="auth-input-field"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. BSc in CSE - Intake 51/8"
                      required
                    />
                  </div>
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">Emergency Guardian Phone</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><Phone size={18} /></span>
                    <input
                      type="tel"
                      className="auth-input-field"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="Guardian Contact"
                      required
                    />
                  </div>
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">Preferred Housing Location</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><Building size={18} /></span>
                    <select
                      className="auth-select-field"
                      value={preferredArea}
                      onChange={(e) => setPreferredArea(e.target.value)}
                    >
                      <option value="Mirpur 2 (Near BUBT Campus)">Mirpur 2 (Near BUBT Campus)</option>
                      <option value="Mirpur 10 (Metro Station Hub)">Mirpur 10 (Metro Station Hub)</option>
                      <option value="Dhanmondi / Sukrabad">Dhanmondi / Sukrabad</option>
                      <option value="Uttara Sector 10/11">Uttara Sector 10/11</option>
                      <option value="Bashundhara R/A">Bashundhara R/A</option>
                    </select>
                    <span className="auth-select-chevron"><ChevronDown size={18} /></span>
                  </div>
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">Monthly Rent Budget</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">৳</span>
                    <select
                      className="auth-select-field"
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(e.target.value)}
                    >
                      <option value="৳4,000 - ৳7,000 / month">৳4,000 - ৳7,000 / month</option>
                      <option value="৳6,000 - ৳10,000 / month">৳6,000 - ৳10,000 / month</option>
                      <option value="৳10,000 - ৳15,000 / month">৳10,000 - ৳15,000 / month</option>
                      <option value="৳15,000+ / month (Private Flat)">৳15,000+ / month (Private Flat)</option>
                    </select>
                    <span className="auth-select-chevron"><ChevronDown size={18} /></span>
                  </div>
                </div>

                <button type="submit" className="btn-auth-submit" style={{ marginTop: '0.75rem' }}>
                  <span>Complete Profile & Go to Dashboard</span>
                  <Sparkles size={18} />
                </button>
              </form>
            </div>
          )}

          {/* STEP 3 (LANDLORD): NID & PROPERTY VERIFICATION */}
          {mode === 'verify_landlord_nid' && (
            <div className="landlord-nid-wrapper">
              <div className="auth-step-tracker">
                <div className="auth-step-item completed">
                  <div className="auth-step-circle">✓</div>
                  <span className="auth-step-label">Account</span>
                </div>
                <div className="auth-step-item completed">
                  <div className="auth-step-circle">✓</div>
                  <span className="auth-step-label">OTP</span>
                </div>
                <div className="auth-step-item active">
                  <div className="auth-step-circle">3</div>
                  <span className="auth-step-label">NID & Property</span>
                </div>
                <div className="auth-step-item">
                  <div className="auth-step-circle">4</div>
                  <span className="auth-step-label">Review</span>
                </div>
              </div>

              <div className="auth-card-header" style={{ marginBottom: '1.25rem' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'var(--primary-glow)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.5rem auto'
                }}>
                  <BadgeCheck size={28} />
                </div>
                <h1 className="auth-card-title" style={{ fontSize: '1.5rem' }}>
                  NID & Property Verification 🛡️
                </h1>
                <p className="auth-card-subtitle" style={{ fontSize: '0.85rem' }}>
                  Required for Landlord Trust Badges on RentEase.
                </p>
              </div>

              {error && (
                <div className="auth-error-banner" style={{ marginBottom: '1rem' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLandlordVerificationSubmit} className="auth-form-layout">
                <div className="auth-form-group">
                  <label className="auth-form-label">National ID (NID) Number</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><CreditCard size={18} /></span>
                    <input
                      type="text"
                      className="auth-input-field"
                      value={nidNumber}
                      onChange={(e) => setNidNumber(e.target.value)}
                      placeholder="e.g. 19922691887766554"
                      required
                    />
                  </div>
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">Upload NID Front Side Photo</label>
                  <input 
                    type="file" 
                    ref={nidFrontRef} 
                    onChange={(e) => handleDocUpload(e, setNidFrontImg)} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                  />
                  <div className="file-upload-dropzone" onClick={() => nidFrontRef.current?.click()}>
                    <UploadCloud className="file-upload-icon" size={24} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {nidFrontImg ? '✓ NID Front Uploaded' : 'Click to Upload NID Front'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JPG, PNG or PDF (Max 5MB)</span>
                    {nidFrontImg && <img src={nidFrontImg} alt="NID Front" className="file-upload-preview" />}
                  </div>
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">Primary Rental Property Title</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><Building size={18} /></span>
                    <input
                      type="text"
                      className="auth-input-field"
                      value={propertyName}
                      onChange={(e) => setPropertyName(e.target.value)}
                      placeholder="e.g. Mirpur Green Villa"
                      required
                    />
                  </div>
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">Full Property Address</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><Building size={18} /></span>
                    <input
                      type="text"
                      className="auth-input-field"
                      value={propertyAddress}
                      onChange={(e) => setPropertyAddress(e.target.value)}
                      placeholder="House, Road, Block, Area"
                      required
                    />
                  </div>
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">Property Holding Tax / Utility Bill Proof</label>
                  <input 
                    type="file" 
                    ref={taxReceiptRef} 
                    onChange={(e) => handleDocUpload(e, setTaxReceiptImg)} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                  />
                  <div className="file-upload-dropzone" onClick={() => taxReceiptRef.current?.click()}>
                    <FileCheck className="file-upload-icon" size={24} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {taxReceiptImg ? '✓ Property Document Uploaded' : 'Upload Electricity Bill or Holding Tax Receipt'}
                    </span>
                    {taxReceiptImg && <img src={taxReceiptImg} alt="Property Proof" className="file-upload-preview" />}
                  </div>
                </div>

                <button type="submit" className="btn-auth-submit" style={{ marginTop: '0.75rem' }}>
                  <span>Submit for Admin Review</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          )}

          {/* STEP 4 (LANDLORD): ADMIN REVIEW SCREEN */}
          {mode === 'admin_review_landlord' && (
            <div className="admin-review-wrapper" style={{ textAlign: 'center' }}>
              <div className="auth-step-tracker">
                <div className="auth-step-item completed">
                  <div className="auth-step-circle">✓</div>
                  <span className="auth-step-label">Account</span>
                </div>
                <div className="auth-step-item completed">
                  <div className="auth-step-circle">✓</div>
                  <span className="auth-step-label">OTP</span>
                </div>
                <div className="auth-step-item completed">
                  <div className="auth-step-circle">✓</div>
                  <span className="auth-step-label">Documents</span>
                </div>
                <div className="auth-step-item active">
                  <div className="auth-step-circle">4</div>
                  <span className="auth-step-label">Admin Review</span>
                </div>
              </div>

              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0.5rem auto 1rem auto'
              }}>
                <Clock size={36} />
              </div>

              <h1 className="auth-card-title" style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>
                Under Admin Review ⏳
              </h1>
              <p className="auth-card-subtitle" style={{ fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                Your NID and Property Ownership documents have been submitted to RentEase Campus Managers for verification.
              </p>

              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                fontSize: '0.88rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Verification Status:</span>
                  <span style={{ color: '#d97706', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    🟡 Pending Review
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>NID Number:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{nidNumber}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Property:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{propertyName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Est. Approval Time:</span>
                  <strong style={{ color: 'var(--primary)' }}>2 - 6 Hours</strong>
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                💡 You can now proceed to your <strong>Landlord Dashboard</strong> in preview mode while our team verifies your trust credentials.
              </p>

              <button 
                type="button" 
                className="btn-auth-submit" 
                onClick={handleProceedToLandlordDashboard}
              >
                <span>Proceed to Landlord Dashboard</span>
                <CheckCircle size={18} />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* FORGOT PASSWORD MODAL (COMPLETE 4-STEP WORKFLOW WITH OTP SECURITY RULES) */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '440px',
            width: '100%',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-light)'
          }}>
            
            {/* STEP 1: ENTER EMAIL / PHONE */}
            {forgotStep === 1 && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
                    <KeyRound size={24} />
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Forgot Password
                  </h2>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: '1.4' }}>
                    Enter your registered email or phone number.
                  </p>
                </div>

                {forgotError && (
                  <div className="auth-error-banner" style={{ marginBottom: '1rem' }}>
                    <AlertCircle size={16} />
                    <span>{forgotError}</span>
                  </div>
                )}

                <form onSubmit={handleForgotSendOtp}>
                  <div className="auth-form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="auth-form-label">Email / Phone Number</label>
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon"><User size={18} /></span>
                      <input 
                        type="text" 
                        className="auth-input-field" 
                        placeholder="Email or Phone Number"
                        value={forgotInput} 
                        onChange={(e) => setForgotInput(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                      type="button" 
                      style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--text-muted)' }}
                      onClick={() => setShowForgotModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-auth-submit" 
                      style={{ flex: 1.5, marginTop: 0 }}
                    >
                      <span>Send OTP</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* STEP 2: VERIFY OTP (WITH EXPIRY & MAX 3 ATTEMPTS SECURITY RULES) */}
            {forgotStep === 2 && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
                    <ShieldCheck size={26} />
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Verify OTP
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: '1.4' }}>
                    Enter the 6-digit code sent to your registered phone/email:<br />
                    <strong style={{ color: 'var(--text-main)' }}>{forgotInput}</strong>
                  </p>
                  
                  {/* Real-time 3-minute OTP Expiry Badge */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className={`otp-security-badge ${forgotExpiryTimer === 0 ? 'expired' : ''}`}>
                      <Clock size={12} />
                      <span>
                        {forgotExpiryTimer > 0 
                          ? `OTP expires in ${formatTimer(forgotExpiryTimer)}` 
                          : '⏰ OTP Expired'}
                      </span>
                    </div>
                  </div>
                </div>

                {forgotError && (
                  <div className="auth-error-banner" style={{ marginBottom: '1rem' }}>
                    <AlertTriangle size={16} />
                    <span>{forgotError}</span>
                  </div>
                )}

                <form onSubmit={handleForgotVerifyOtp}>
                  <div className="auth-form-group" style={{ marginBottom: '1rem' }}>
                    {/* 6-Digit OTP Inputs */}
                    <div className="otp-inputs-grid" onPaste={handleForgotOtpPaste}>
                      {forgotOtpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={forgotOtpRefs[idx]}
                          type="text"
                          maxLength={1}
                          className="otp-digit-input"
                          value={digit}
                          onChange={(e) => handleForgotOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleForgotOtpKeyDown(idx, e)}
                          disabled={forgotIsBlocked || forgotExpiryTimer === 0}
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>
                    
                    {/* Failed Attempts Counter */}
                    {forgotFailedAttempts > 0 && !forgotIsBlocked && (
                      <div className="attempts-warning">
                        Attempts remaining: {3 - forgotFailedAttempts}/3
                      </div>
                    )}
                  </div>

                  {/* Resend Section (60 seconds timer rule) */}
                  <div style={{ textAlign: 'center', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Didn't receive the code?</span>
                    {forgotResendTimer > 0 ? (
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)' }}>
                        Resend OTP ({formatTimer(forgotResendTimer)})
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="auth-link"
                        onClick={handleForgotResendOtp}
                        style={{ background: 'none', border: 'none', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.88rem', cursor: 'pointer' }}
                      >
                        <RefreshCw size={14} /> Resend OTP
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                      type="button" 
                      style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--text-muted)' }}
                      onClick={() => setForgotStep(1)}
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      className="btn-auth-submit" 
                      disabled={forgotIsBlocked || forgotExpiryTimer === 0}
                      style={{ flex: 1.5, marginTop: 0, opacity: (forgotIsBlocked || forgotExpiryTimer === 0) ? 0.6 : 1 }}
                    >
                      <span>Verify OTP</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* STEP 3: CREATE NEW PASSWORD */}
            {forgotStep === 3 && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.12)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
                    <Lock size={24} />
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Create New Password
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Set a strong, secure password for your account.
                  </p>
                </div>

                {forgotError && (
                  <div className="auth-error-banner" style={{ marginBottom: '1rem' }}>
                    <AlertCircle size={16} />
                    <span>{forgotError}</span>
                  </div>
                )}

                <form onSubmit={handleResetPasswordSubmit} className="auth-form-layout">
                  <div className="auth-form-group">
                    <label className="auth-form-label">New Password</label>
                    <div className="auth-input-wrapper" style={{ position: 'relative' }}>
                      <span className="auth-input-icon"><Lock size={18} /></span>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        className="auth-input-field"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{ paddingRight: '2.5rem' }}
                        required
                      />
                      <button
                        type="button"
                        className="auth-eye-toggle"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="auth-form-group">
                    <label className="auth-form-label">Confirm New Password</label>
                    <div className="auth-input-wrapper" style={{ position: 'relative' }}>
                      <span className="auth-input-icon"><Lock size={18} /></span>
                      <input
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        className="auth-input-field"
                        placeholder="Confirm New Password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        style={{ paddingRight: '2.5rem' }}
                        required
                      />
                      <button
                        type="button"
                        className="auth-eye-toggle"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      >
                        {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn-auth-submit" style={{ marginTop: '0.5rem' }}>
                    <span>Reset Password</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              </>
            )}

            {/* STEP 4: PASSWORD RESET SUCCESSFULLY */}
            {forgotStep === 4 && (
              <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <Check size={36} />
                </div>

                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  ✓ Password Reset Successfully
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                  Your password has been changed successfully. You can now log in using your new credentials.
                </p>

                <button 
                  type="button"
                  className="btn-auth-submit" 
                  onClick={handleBackToLoginFromReset}
                  style={{ width: '100%' }}
                >
                  <span>Back to Login</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

export default Auth;
