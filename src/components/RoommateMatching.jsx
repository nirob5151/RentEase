import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Brush, Sofa, Sun, Moon, BookOpen, Users, Ban, Flame, 
  MessageSquare, ArrowRight, Check, Search, Filter, ChevronLeft, 
  ChevronRight, X, Heart, ShieldCheck, Clock, Award, Star, Plus, Edit3, UserCheck, Trash2
} from 'lucide-react';
import { dbService } from '../database/supabaseClient';

function RoommateMatching({ currentUser, onStartChat }) {
  const [filterUni, setFilterUni] = useState('All');
  const [filterBudget, setFilterBudget] = useState('All');
  const [filterGender, setFilterGender] = useState('Any');

  // Selected Roommate State for View Profile Modal
  const [selectedRoommate, setSelectedRoommate] = useState(null);
  const [connectedList, setConnectedList] = useState([]);

  // Create / Edit My Roommate Profile Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [myProfileCreated, setMyProfileCreated] = useState(false);
  const [myBudget, setMyBudget] = useState('6,500 BDT/mo');
  const [mySleep, setMySleep] = useState('Night Owl (1 AM - 8 AM)');
  const [myCleanliness, setMyCleanliness] = useState('Very Organized & Tidy');
  const [myStudy, setMyStudy] = useState('Quiet Library & Coding Sessions');
  const [mySmoke, setMySmoke] = useState('Non-smoker');
  const [myPets, setMyPets] = useState('No Pets');
  const [myBio, setMyBio] = useState('Computer Science student at BUBT. Looking for a quiet, organized study environment near campus.');
  const [isDiscoverable, setIsDiscoverable] = useState(true);

  const defaultRoommatesSeed = [];

  // Dynamic Realtime Match Percentage Calculator based on profile comparison
  const calculateMatchScore = (candidate) => {
    if (!candidate) return '85% Match';
    
    let score = 70; // Baseline compatibility for university peers

    // 1. Sleep Schedule Compatibility (+10%)
    if (mySleep && candidate.sleepSchedule) {
      if (mySleep.toLowerCase().includes('night') && candidate.sleepSchedule.toLowerCase().includes('night')) score += 10;
      else if (mySleep.toLowerCase().includes('early') && candidate.sleepSchedule.toLowerCase().includes('early')) score += 10;
      else score += 5;
    }

    // 2. Cleanliness Compatibility (+10%)
    if (myCleanliness && candidate.cleanliness) {
      if (myCleanliness.toLowerCase().includes('tidy') && candidate.cleanliness.toLowerCase().includes('tidy')) score += 10;
      else if (myCleanliness.toLowerCase().includes('clean') && candidate.cleanliness.toLowerCase().includes('clean')) score += 10;
      else score += 5;
    }

    // 3. Study Habits Compatibility (+5%)
    if (myStudy && candidate.studyHabits) {
      if (myStudy.toLowerCase().includes('quiet') && candidate.studyHabits.toLowerCase().includes('quiet')) score += 5;
      else score += 3;
    }

    // 4. University / Department Match (+3%)
    if (currentUser?.university && candidate.uni && candidate.uni.toLowerCase().includes('bubt')) {
      score += 3;
    }

    const finalScore = Math.min(98, Math.max(68, score));
    return `${finalScore}% Match`;
  };

  // Roommate profiles loaded from Supabase PostgreSQL with seed fallback
  const [roommates, setRoommates] = useState(defaultRoommatesSeed);

  useEffect(() => {
    async function loadRoommatesAndMyProfile() {
      try {
        // 1. Fetch current logged in user's saved roommate profile from database (SINGLE SOURCE OF TRUTH)
        if (currentUser) {
          const myProfile = await dbService.getMyRoommateProfile(currentUser);
          if (myProfile) {
            setMyProfileCreated(true);
            if (myProfile.bio) setMyBio(myProfile.bio);
            if (myProfile.budget) setMyBudget(myProfile.budget);
            if (myProfile.sleepSchedule) setMySleep(myProfile.sleepSchedule);
            if (myProfile.cleanliness) setMyCleanliness(myProfile.cleanliness);
            if (myProfile.studyHabits) setMyStudy(myProfile.studyHabits);
          } else {
            setMyProfileCreated(false);
          }
        } else {
          setMyProfileCreated(false);
        }

        // 2. Fetch all candidate roommate profiles
        const data = await dbService.getRoommates(currentUser);
        if (Array.isArray(data)) {
          const normalized = data.map(item => ({
            id: item.id || 'rm_' + Math.random(),
            student_id: item.student_id || item.user_id,
            email: item.email || item.student_email,
            name: item.name || item.student_name || 'Student Roommate',
            uni: item.uni || 'BUBT • Student',
            budget: typeof item.budget === 'number' ? `${item.budget.toLocaleString()} BDT/mo` : (item.budget || '6,500 BDT/mo'),
            match: item.match || '92% Match',
            bio: item.bio || 'Looking for flatmate near BUBT campus.',
            tags: Array.isArray(item.tags) ? item.tags : (item.cleanliness ? [item.cleanliness, 'Non-smoker'] : ['Non-smoker', 'Studious']),
            image: item.image || item.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
            gender: item.gender || 'Male',
            budgetTier: 'All',
            sleepSchedule: item.sleepSchedule || item.sleep_schedule || 'Night Owl',
            cleanliness: item.cleanliness || 'Clean',
            studyHabits: item.studyHabits || item.study_habits || 'Quiet Study',
            pets: item.pets || 'No Pets',
            is_active: item.is_active !== false
          }));
          setRoommates(normalized);
        }
      } catch (e) {
        console.warn('Error loading roommates:', e);
      }
    }
    loadRoommatesAndMyProfile();
  }, [currentUser]);

  const handleCreateProfileSubmit = async (e) => {
    e.preventDefault();
    setMyProfileCreated(true);
    setShowCreateModal(false);

    const myProfileCard = {
      id: currentUser?.id || 'r_' + Date.now(),
      student_id: currentUser?.id,
      email: currentUser?.email,
      isMyProfile: true,
      name: currentUser?.name || 'Registered Student',
      uni: `${currentUser?.university ? 'BUBT' : 'BUBT'} • ${currentUser?.intake || 'Intake 51/8'}`,
      budget: myBudget,
      match: '100% (You)',
      bio: myBio,
      tags: [mySmoke, 'Studious', 'Discoverable'],
      image: currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      gender: 'Male',
      budgetTier: 'All',
      dept: currentUser?.department || 'BSc in Computer Science & Engineering (CSE)',
      sleepSchedule: mySleep,
      cleanliness: myCleanliness,
      studyHabits: myStudy,
      pets: myPets,
      food: 'Home Cooking & Healthy',
      is_active: true
    };

    setRoommates(prev => [myProfileCard, ...prev.filter(r => r.id !== myProfileCard.id)]);
    await dbService.saveRoommate(myProfileCard);
    alert('✨ Your Roommate Profile is now PUBLIC & DISCOVERABLE! Other students can connect and message you.');
  };

  const handleDeleteProfile = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove your Roommate Profile?\n\nOther students will no longer be able to find or match with you on RentEase."
    );
    if (!confirmDelete) return;

    await dbService.deleteRoommate(currentUser);
    setMyProfileCreated(false);
    setShowCreateModal(false);

    // Refresh candidate roommates list
    const data = await dbService.getRoommates(currentUser);
    if (Array.isArray(data)) {
      setRoommates(data);
    }

    alert('🗑️ Your Roommate Profile has been successfully removed.');
  };

  const filteredRoommates = (roommates || []).filter(person => {
    if (!person) return false;

    // 1. STRICTLY EXCLUDE CURRENT LOGGED-IN USER'S OWN PROFILE
    const currentEmail = (currentUser?.email || '').toLowerCase().trim();
    const currentId = (currentUser?.id || '').toString();
    const currentName = (currentUser?.name || '').toLowerCase().trim();

    const personEmail = (person.email || person.student_email || '').toLowerCase().trim();
    const personId = (person.student_id || person.id || person.user_id || '').toString();
    const personName = (person.name || '').toLowerCase().trim();

    if (person.isMyProfile) return false;
    if (currentEmail && personEmail && currentEmail === personEmail) return false;
    if (currentId && personId && currentId === personId) return false;
    if (currentName && personName && currentName === personName) return false;

    const uniText = person.uni || 'BUBT Student';
    if (filterUni !== 'All' && !uniText.toLowerCase().includes(filterUni.toLowerCase())) return false;
    if (filterBudget !== 'All' && person.budgetTier && person.budgetTier !== filterBudget) return false;
    if (filterGender !== 'Any' && person.gender && person.gender !== filterGender) return false;
    return true;
  });

  const toggleConnect = (personName) => {
    if (connectedList.includes(personName)) {
      setConnectedList(prev => prev.filter(n => n !== personName));
    } else {
      setConnectedList(prev => [...prev, personName]);
      alert(`🤝 Connection Request sent to ${personName}! They will receive a notification.`);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Title Header & Create Profile CTA */}
      <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem' }}>Roommate Finder 🤝</h2>
          <p style={{ color: 'var(--text-muted)' }}>Match with university students sharing similar lifestyle habits and budget preferences.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-filter-apply"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
        >
          {myProfileCreated ? <Edit3 size={18} /> : <Plus size={18} />}
          <span>{myProfileCreated ? 'Edit My Roommate Profile' : 'Create Roommate Profile'}</span>
        </button>
      </div>

      {/* DISCOVERABLE PROFILE BANNER STATUS */}
      {myProfileCreated && (
        <div style={{
          marginTop: '1.25rem',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#059669', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={22} />
            </div>
            <div>
              <h4 style={{ fontWeight: 800, margin: 0, color: '#047857', fontSize: '0.95rem' }}>
                Your Roommate Profile is Live & Discoverable 🟢
              </h4>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Students searching for roommates can now view your preferences, send connection requests, or start a chat.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{ background: 'white', border: '1px solid #a7f3d0', color: '#047857', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
          >
            Manage Profile
          </button>
        </div>
      )}

      {/* Filter Row */}
      <section className="roommate-filters-header" style={{ marginTop: '1.5rem' }}>
        <div className="roommate-filters-row">
          <div className="roommate-filter-select-group">
            <label className="roommate-filter-label">University</label>
            <select className="filter-input" value={filterUni} onChange={(e) => setFilterUni(e.target.value)}>
              <option value="All">All Universities</option>
              <option value="BUBT">BUBT Only</option>
            </select>
          </div>

          <div className="roommate-filter-select-group">
            <label className="roommate-filter-label">Budget Range</label>
            <select className="filter-input" value={filterBudget} onChange={(e) => setFilterBudget(e.target.value)}>
              <option value="All">Any Budget</option>
              <option value="low">Under 5,000 BDT/mo</option>
              <option value="high">5,000+ BDT/mo</option>
            </select>
          </div>

          <div className="roommate-filter-select-group">
            <label className="roommate-filter-label">Gender Preference</label>
            <select className="filter-input" value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
              <option value="Any">Any Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>
      </section>

      {/* Roommates Grid */}
      <section style={{ marginTop: '1.5rem' }}>
        {filteredRoommates.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            marginTop: '1rem'
          }}>
            <Users size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)' }}>No Roommate Profiles Found</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem', maxWidth: '480px', margin: '0.35rem auto 1.5rem' }}>
              Be the first student to publish your roommate preferences and start matching with university peers!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-filter-apply"
              style={{ padding: '0.65rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
            >
              <Plus size={18} /> Create Roommate Profile
            </button>
          </div>
        ) : (
          <div className="roommates-grid">
            {filteredRoommates.map((person, i) => (
            <div key={i} className="roommate-card" style={{ border: person.isMyProfile ? '2px solid #059669' : '1px solid var(--border-light)' }}>
              <span className="roommate-card-match-score" style={{ background: person.isMyProfile ? '#ecfdf5' : undefined, color: person.isMyProfile ? '#059669' : undefined }}>
                <Sparkles size={12} fill={person.isMyProfile ? '#059669' : 'var(--secondary)'} /> {calculateMatchScore(person)}
              </span>

              <div className="roommate-card-header">
                <img src={person.image} alt={person.name} className="roommate-card-photo" />
                <div className="roommate-card-title">
                  <h3>{person.name} {person.isMyProfile && '(You)'}</h3>
                  <p>{person.uni}</p>
                </div>
              </div>

              <div className="roommate-card-budget-row">
                <span className="roommate-card-budget-label">BUDGET</span>
                <span className="roommate-card-budget-val">{person.budget}</span>
              </div>

              <p className="roommate-card-bio">
                {person.bio}
              </p>

              <div className="roommate-card-tags">
                {person.tags.map((tag, idx) => (
                  <span key={idx} className="facility-tag" style={{ borderRadius: '50px', padding: '0.15rem 0.6rem' }}>{tag}</span>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn-card-secondary" 
                  style={{ flex: 1, padding: '0.5rem', fontSize: '0.825rem', fontWeight: '700', justifyContent: 'center' }}
                  onClick={() => setSelectedRoommate(person)}
                >
                  View Profile
                </button>

                {!person.isMyProfile && (
                  <>
                    <button 
                      className={'btn-card-primary ' + (connectedList.includes(person.name) ? 'connected' : '')}
                      style={{ 
                        flex: 1, 
                        padding: '0.5rem', 
                        fontSize: '0.825rem', 
                        fontWeight: '700', 
                        justifyContent: 'center',
                        background: connectedList.includes(person.name) ? '#ecfdf5' : undefined,
                        color: connectedList.includes(person.name) ? '#059669' : undefined,
                        borderColor: connectedList.includes(person.name) ? '#a7f3d0' : undefined
                      }}
                      onClick={() => toggleConnect(person.name)}
                    >
                      {connectedList.includes(person.name) ? '✓ Connected' : '🤝 Connect'}
                    </button>

                    <button 
                      className="btn-card-secondary"
                      style={{ padding: '0.5rem', color: 'var(--primary)', borderColor: 'var(--primary-glow)' }}
                      onClick={() => onStartChat(person.name, 'Hi ' + person.name + '! I saw your roommate profile on RentEase and would love to discuss shared flat availability.', 'Student / Roommate', person.image)}
                      title={'Message ' + person.name}
                    >
                      <MessageSquare size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>

      {/* VIEW ROOMMATE DETAILED PROFILE MODAL */}
      {selectedRoommate && (
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
            borderRadius: 'var(--radius-lg)',
            maxWidth: '520px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-light)'
          }}>
            <div style={{ position: 'relative', height: '140px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e40af 100%)', padding: '1rem' }}>
              <button onClick={() => setSelectedRoommate(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', marginTop: '-45px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                <img src={selectedRoommate.image} alt={selectedRoommate.name} style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid white', objectFit: 'cover' }} />
                <span style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.3rem 0.75rem', borderRadius: '20px', fontWeight: 800, fontSize: '0.85rem' }}>
                  ✨ {selectedRoommate.match} Lifestyle Match
                </span>
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{selectedRoommate.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 1rem 0' }}>{selectedRoommate.uni}</p>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                <strong>Bio:</strong> "{selectedRoommate.bio}"
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Budget:</span> <strong>{selectedRoommate.budget}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Sleep:</span> <strong>{selectedRoommate.sleepSchedule}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Cleanliness:</span> <strong>{selectedRoommate.cleanliness}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Study:</span> <strong>{selectedRoommate.studyHabits}</strong></div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  className="btn-card-primary"
                  style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}
                  onClick={() => {
                    const name = selectedRoommate.name;
                    setSelectedRoommate(null);
                    toggleConnect(name);
                  }}
                >
                  🤝 Send Connection Request
                </button>

                <button
                  className="btn-card-secondary"
                  style={{ flex: 1, padding: '0.75rem', justifyContent: 'center', color: 'var(--primary)' }}
                  onClick={() => {
                    const name = selectedRoommate.name;
                    const avatar = selectedRoommate.image;
                    setSelectedRoommate(null);
                    onStartChat(name, `Hi ${name}! Let's connect on RentEase.`, 'Student / Roommate', avatar);
                  }}
                >
                  <MessageSquare size={16} /> 💬 Start Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ROOMMATE PROFILE MODAL */}
      {showCreateModal && (
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
            maxWidth: '520px',
            width: '100%',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-light)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Create Your Roommate Profile 🤝</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Monthly Rent Budget (BDT)</label>
                <select className="form-input" value={myBudget} onChange={(e) => setMyBudget(e.target.value)}>
                  <option value="4,500 BDT/mo">৳4,500 BDT/mo</option>
                  <option value="6,500 BDT/mo">৳6,500 BDT/mo</option>
                  <option value="8,000 BDT/mo">৳8,000 BDT/mo</option>
                  <option value="12,000 BDT/mo">৳12,000+ BDT/mo</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Sleep Schedule</label>
                  <select className="form-input" value={mySleep} onChange={(e) => setMySleep(e.target.value)}>
                    <option value="Early Riser (6 AM - 10 PM)">Early Riser (6 AM - 10 PM)</option>
                    <option value="Night Owl (1 AM - 8 AM)">Night Owl (1 AM - 8 AM)</option>
                    <option value="Flexible Hours">Flexible Hours</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Cleanliness Standard</label>
                  <select className="form-input" value={myCleanliness} onChange={(e) => setMyCleanliness(e.target.value)}>
                    <option value="Very Organized & Tidy">Very Organized & Tidy</option>
                    <option value="Moderate & Clean">Moderate & Clean</option>
                    <option value="Relaxed">Relaxed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Study Habits</label>
                  <input type="text" className="form-input" value={myStudy} onChange={(e) => setMyStudy(e.target.value)} placeholder="e.g. Quiet Library" required />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Smoking Preference</label>
                  <select className="form-input" value={mySmoke} onChange={(e) => setMySmoke(e.target.value)}>
                    <option value="Non-smoker">Non-smoker</option>
                    <option value="Smoker">Smoker</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Bio & Lifestyle Description</label>
                <textarea className="form-input" rows={3} value={myBio} onChange={(e) => setMyBio(e.target.value)} required />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', marginTop: '0.25rem' }}>
                <input type="checkbox" checked={isDiscoverable} onChange={(e) => setIsDiscoverable(e.target.checked)} />
                <span><strong>Make my profile PUBLIC & DISCOVERABLE</strong> to other university students on RentEase</span>
              </label>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}>
                  Cancel
                </button>
                {myProfileCreated && (
                  <button
                    type="button"
                    onClick={handleDeleteProfile}
                    style={{ flex: 1, padding: '0.75rem', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <Trash2 size={16} />
                    <span>Remove Profile</span>
                  </button>
                )}
                <button type="submit" className="btn-filter-apply" style={{ flex: 1.5, padding: '0.75rem' }}>
                  Save & Publish Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoommateMatching;
