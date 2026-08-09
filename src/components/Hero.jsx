import React, { useState, useEffect } from 'react';
import { ShieldCheck, Brain, MessageSquareCode, FileSignature, ArrowRight, MapPin, Search, Star } from 'lucide-react';
import { dbService } from '../database/supabaseClient';

function Hero({ onSearch, onExploreRoommates }) {
  const [searchValue, setSearchValue] = useState('');
  const [stats, setStats] = useState({
    verified_listings: 0,
    active_students: 0,
    trusted_landlords: 0,
    roommate_profiles: 0
  });

  useEffect(() => {
    async function fetchRealtimeStats() {
      const data = await dbService.getRentEaseStats();
      if (data) {
        setStats({
          verified_listings: Number(data.verified_listings || 0),
          active_students: Number(data.active_students || 0),
          trusted_landlords: Number(data.trusted_landlords || 0),
          roommate_profiles: Number(data.roommate_profiles || 0)
        });
      }
    }
    fetchRealtimeStats();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  return (
    <div className="landing-page-flow">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-left">
          <div className="badge-pill-light">
            <ShieldCheck size={16} /> Designed for University Students
          </div>
          <h1 className="hero-title-main">
            Find your perfect <span>home</span><br />and ideal roommates.
          </h1>
          <p className="hero-subtitle-main">
            The stress-free platform for student housing. Verified listings near campus, smart matching technology, and simplified legal contracts.
          </p>
          
          <form className="hero-search-box" onSubmit={handleSearchSubmit}>
            <div className="hero-search-input-wrapper">
              <MapPin size={18} />
              <input 
                type="text" 
                placeholder="Enter Campus or City..." 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            <button type="submit" className="hero-search-btn">
              Find Housing
            </button>
          </form>

          <a href="#" className="hero-roommates-link" onClick={(e) => { e.preventDefault(); onExploreRoommates(); }}>
            Find Roommates <ArrowRight size={16} />
          </a>
        </div>

        <div className="hero-right-card">
          <img 
            src="/assets/hero_apart.png" 
            alt="Verified Student Housing Layout" 
            className="hero-image-crop"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80";
            }}
          />
          <div className="hero-badge-top">
            <div className="badge-dot"></div>
            <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>Verified Landlord</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PROPERTY CHECKED</span>
          </div>

          <div className="hero-badge-bottom">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>Match Score</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--secondary)' }}>90%</span>
            </div>
            <div className="badge-progress-bar">
              <div className="badge-progress-fill" style={{ width: '90%' }}></div>
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Perfect lifestyle match with Anas</span>
          </div>
        </div>
      </section>

      {/* Realtime Database Statistics Metrics Row */}
      <section className="landing-metrics" style={{ padding: '2rem 1rem', background: 'white' }}>
        <div className="metrics-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <div className="metric-item">
            <h3 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0252cc', margin: 0, letterSpacing: '-0.5px' }}>
              {stats.verified_listings}
            </h3>
            <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.3rem' }}>
              VERIFIED LISTINGS
            </p>
          </div>

          <div className="metric-item">
            <h3 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0252cc', margin: 0, letterSpacing: '-0.5px' }}>
              {stats.active_students}
            </h3>
            <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.3rem' }}>
              ACTIVE STUDENTS
            </p>
          </div>

          <div className="metric-item">
            <h3 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0252cc', margin: 0, letterSpacing: '-0.5px' }}>
              {stats.trusted_landlords}
            </h3>
            <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.3rem' }}>
              TRUSTED LANDLORDS
            </p>
          </div>

          <div className="metric-item">
            <h3 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0252cc', margin: 0, letterSpacing: '-0.5px' }}>
              {stats.roommate_profiles}
            </h3>
            <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.3rem' }}>
              ROOMMATE PROFILES
            </p>
          </div>
        </div>
      </section>

      {/* Why RentEase Grid */}
      <section className="why-section">
        <div className="why-container">
          <div className="section-header-center">
            <h2>Why students love RentEase</h2>
            <p>We've built the most reliable platform specifically for the unique needs of university life.</p>
          </div>
          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon">
                <ShieldCheck size={24} />
              </div>
              <h3>Verified Listings</h3>
              <p>Every property and landlord is manually vetted to prevent scams and ensure safety.</p>
            </div>
            <div className="why-card">
              <div className="why-icon">
                <Brain size={24} />
              </div>
              <h3>Smart Matching</h3>
              <p>Our algorithm pairs you with roommates based on lifestyle, study habits, and budget.</p>
            </div>
            <div className="why-card">
              <div className="why-icon">
                <MessageSquareCode size={24} />
              </div>
              <h3>Secure Messaging</h3>
              <p>Chat with potential roommates and landlords directly within our safe ecosystem.</p>
            </div>
            <div className="why-card">
              <div className="why-icon">
                <FileSignature size={24} />
              </div>
              <h3>Legal Templates</h3>
              <p>Access attorney-reviewed roommate agreements and lease addendums for peace of mind.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="process-section">
        <div className="process-container">
          <div className="section-header-center">
            <h2>Your path to a new home</h2>
            <p>Four simple steps to housing freedom.</p>
          </div>
          <div className="process-steps">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create Account</h3>
              <p>Set up your student profile and preferences.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Search</h3>
              <p>Filter by campus distance, price, and amenities.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Connect</h3>
              <p>Chat with landlords or match with roommates.</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Move In</h3>
              <p>Sign digital agreements and get your keys!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="testimonials-container">
          <div className="section-header-center">
            <h2>What our students say</h2>
            <p>Read about experiences from verified students who found housing and roommates through our platform.</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="var(--warning)" color="var(--warning)" />)}
              </div>
              <p className="testimonial-text">
                "RentEase made finding an apartment near BUBT so easy! The verification badge gave me peace of mind that I was dealing with a real landlord."
              </p>
              <div className="testimonial-user">
                <img 
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80" 
                  alt="Bushra" 
                  className="testimonial-avatar" 
                />
                <div className="testimonial-user-info">
                  <h4>Bushra</h4>
                  <p>BUBT Sophomore</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="var(--warning)" color="var(--warning)" />)}
              </div>
              <p className="testimonial-text">
                "I found my roommate Anas through the compatibility finder. We matched at 95% and it has been a perfect study-focused arrangement!"
              </p>
              <div className="testimonial-user">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80" 
                  alt="Anas" 
                  className="testimonial-avatar" 
                />
                <div className="testimonial-user-info">
                  <h4>Anas</h4>
                  <p>BUBT Senior</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="var(--warning)" color="var(--warning)" />)}
              </div>
              <p className="testimonial-text">
                "The lease agreement builder saved us hours. We generated a print-ready tenancy PDF customized for BUBT students in under five minutes."
              </p>
              <div className="testimonial-user">
                <img 
                  src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&h=120&q=80" 
                  alt="Anika" 
                  className="testimonial-avatar" 
                />
                <div className="testimonial-user-info">
                  <h4>Anika</h4>
                  <p>BUBT Graduate Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-card">
            <h2>Ready to find your place?</h2>
            <p>Join thousands of university students who have already secured safe accommodations and found ideal roommates through RentEase.</p>
            <div className="cta-buttons">
              <button className="btn-cta-white" onClick={() => onExploreRoommates()}>
                Get Started Now
              </button>
              <button className="btn-cta-outline" onClick={() => onSearch('')}>
                Browse Listings
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Hero;
