import React, { useState } from 'react';
import { Search, MapPin, SlidersHorizontal, ShieldCheck, Star, MessageSquare, Phone, X, Grid, Map, Check, Eye, HelpCircle, Calendar, MessageCircle, ChevronLeft, ChevronRight, Wifi, Wind, Car, Coffee } from 'lucide-react';

function Listings({ listings, selectedListing, setSelectedListing, onStartChat, onSubmitReview }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [maxPrice, setMaxPrice] = useState(3000);
  const [filterVerified, setFilterVerified] = useState(false);
  const [locationFilter, setLocationFilter] = useState('All');
  
  // States for checkbox filters
  const [selectedRoomTypes, setSelectedRoomTypes] = useState({
    'Private Room': false,
    'Entire Apartment': false,
    'Shared Room': false
  });
  
  const [selectedAmenities, setSelectedAmenities] = useState({
    'Wi-Fi': false,
    'Laundry': false,
    'Gym Access': false,
    'Furnished': false
  });
  
  // Rating states for writing a review
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Extract unique locations
  const locations = ['All', ...new Set(listings.map(item => {
    if (item.location.includes('Mirpur 2')) return 'Mirpur 2';
    if (item.location.includes('Mirpur 10')) return 'Mirpur 10';
    if (item.location.includes('Mirpur 1')) return 'Mirpur 1';
    if (item.location.includes('Mirpur 11')) return 'Mirpur 11';
    return 'Other';
  }))];

  // Filtering Logic
  const filteredListings = listings.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPrice = item.price <= maxPrice;
    const matchesVerified = !filterVerified || item.verified;
    
    let matchesLocation = true;
    if (locationFilter !== 'All') {
      matchesLocation = item.location.toLowerCase().includes(locationFilter.toLowerCase());
    }

    // Room Type Filter (If none are selected, show all. Otherwise, show matching)
    const activeRoomTypes = Object.keys(selectedRoomTypes).filter(type => selectedRoomTypes[type]);
    const matchesRoomType = activeRoomTypes.length === 0 || activeRoomTypes.includes(item.type);

    // Amenities Filter (Must match all checked amenities)
    const activeAmenities = Object.keys(selectedAmenities).filter(amenity => selectedAmenities[amenity]);
    const matchesAmenities = activeAmenities.every(amenity => {
      if (amenity === 'Wi-Fi') {
        return item.facilities.some(f => f.toLowerCase().includes('wifi'));
      }
      if (amenity === 'Laundry') {
        return item.facilities.some(f => f.toLowerCase().includes('laundry'));
      }
      if (amenity === 'Gym Access') {
        return item.facilities.some(f => f.toLowerCase().includes('gym'));
      }
      if (amenity === 'Furnished') {
        return item.facilities.some(f => f.toLowerCase().includes('furnished'));
      }
      return true;
    });

    return matchesSearch && matchesPrice && matchesVerified && matchesLocation && matchesRoomType && matchesAmenities;
  });

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewerName || !reviewComment) return;

    const newReview = {
      author: reviewerName,
      rating: reviewRating,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      comment: reviewComment
    };

    onSubmitReview(selectedListing.id, newReview);
    
    // Clear review inputs
    setReviewerName('');
    setReviewComment('');
    setReviewRating(5);
  };

  return (
    <div style={{ width: '100%' }}>
      {!selectedListing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Search Banner */}
          <div style={{ display: 'flex', gap: '1rem', width: '100%', alignItems: 'center' }}>
            <div className="chat-inbox-search-box" style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: '8px' }}>
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search by university, city, or neighborhood..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontSize: '0.95rem' }}
              />
            </div>
            
            <div style={{ display: 'flex', background: 'white', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.2rem' }}>
              <button className="btn-card-secondary" style={{ padding: '0.4rem 1rem', background: 'var(--bg-secondary)', border: 'none', borderRadius: '6px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Grid size={16} /> List View
              </button>
              <button className="btn-card-secondary" style={{ padding: '0.4rem 1rem', border: 'none', background: 'transparent', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Map size={16} /> Map View
              </button>
            </div>
          </div>

          <div className="listings-layout">
            {/* Filters Sidebar */}
            <aside className="filters-sidebar">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
                <SlidersHorizontal size={18} style={{ color: 'var(--primary)' }} />
                Filter Properties
              </h3>
              
              <div className="filter-group">
                <label className="filter-label">Rent Range</label>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>$400</span>
                  <span style={{ color: 'var(--primary)', fontWeight: '700' }}>${maxPrice.toLocaleString()}+</span>
                  <span>$3,000</span>
                </div>
                <input 
                  type="range" 
                  min="400" 
                  max="3000" 
                  step="50" 
                  className="price-slider"
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">Room Type</label>
                <div className="checkbox-group">
                  <label className="checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={selectedRoomTypes['Private Room']} 
                      onChange={() => setSelectedRoomTypes(prev => ({ ...prev, 'Private Room': !prev['Private Room'] }))} 
                    /> Private Room
                  </label>
                  <label className="checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={selectedRoomTypes['Entire Apartment']} 
                      onChange={() => setSelectedRoomTypes(prev => ({ ...prev, 'Entire Apartment': !prev['Entire Apartment'] }))} 
                    /> Entire Apartment
                  </label>
                  <label className="checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={selectedRoomTypes['Shared Room']} 
                      onChange={() => setSelectedRoomTypes(prev => ({ ...prev, 'Shared Room': !prev['Shared Room'] }))} 
                    /> Shared Room
                  </label>
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label">Amenities</label>
                <div className="checkbox-group">
                  <label className="checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={selectedAmenities['Wi-Fi']} 
                      onChange={() => setSelectedAmenities(prev => ({ ...prev, 'Wi-Fi': !prev['Wi-Fi'] }))} 
                    /> Wi-Fi
                  </label>
                  <label className="checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={selectedAmenities['Laundry']} 
                      onChange={() => setSelectedAmenities(prev => ({ ...prev, 'Laundry': !prev['Laundry'] }))} 
                    /> Laundry
                  </label>
                  <label className="checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={selectedAmenities['Gym Access']} 
                      onChange={() => setSelectedAmenities(prev => ({ ...prev, 'Gym Access': !prev['Gym Access'] }))} 
                    /> Gym Access
                  </label>
                  <label className="checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={selectedAmenities['Furnished']} 
                      onChange={() => setSelectedAmenities(prev => ({ ...prev, 'Furnished': !prev['Furnished'] }))} 
                    /> Furnished
                  </label>
                </div>
              </div>

              <div className="filter-group" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                <div className="filter-toggle-container">
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Verified Only</span>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={filterVerified} 
                      onChange={(e) => setFilterVerified(e.target.checked)} 
                    />
                    <span className="slider-toggle"></span>
                  </label>
                </div>
              </div>

              <button className="btn-filter-apply" style={{ width: '100%' }} onClick={() => {}}>
                Apply Filters
              </button>
            </aside>

            {/* Listings Catalog Grid */}
            <section className="listings-container">
              <div className="listings-header">
                <h2 style={{ fontSize: '1.25rem' }}>Available Rooms ({filteredListings.length})</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Sort by:</span>
                  <select className="filter-input" style={{ width: '150px', padding: '0.25rem 0.5rem', height: '32px' }}>
                    <option>Recommended</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>
              </div>

              {filteredListings.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', background: 'white' }}>
                  <p style={{ color: 'var(--text-muted)' }}>No properties match your filter preferences. Try resetting filters.</p>
                </div>
              ) : (
                <div className="listings-grid">
                  {filteredListings.map(listing => (
                    <div key={listing.id} className="listing-card">
                      <div className="listing-image-wrapper">
                        <img 
                          src={listing.image} 
                          alt={listing.title} 
                          className="listing-card-image" 
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80";
                          }}
                        />
                        {listing.verified && (
                          <span className="badge badge-verified" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', textTransform: 'none', borderRadius: '4px', fontSize: '0.7rem' }}>
                            <ShieldCheck size={12} /> Verified Listing
                          </span>
                        )}
                        <span className="badge badge-price">${listing.price.toLocaleString()}/mo</span>
                      </div>

                      <div className="listing-info">
                        <div className="listing-title-row">
                          <h3 className="listing-title">{listing.title}</h3>
                          <div className="listing-rating">
                            <Star size={14} fill="var(--warning)" color="var(--warning)" />
                            {listing.landlord.rating}
                          </div>
                        </div>
                        
                        <div className="listing-location">
                          <MapPin size={12} style={{ color: 'var(--primary)' }} />
                          {listing.location.includes('BUBT') ? 'BUBT Campus (0.4 miles)' : listing.location}
                        </div>
                        
                        <div className="listing-facilities">
                          {listing.facilities.map((f, i) => (
                            <span key={i} className="facility-tag">{f}</span>
                          ))}
                        </div>

                        <button className="btn-card-action" onClick={() => setSelectedListing(listing)}>
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              <div className="pagination">
                <button className="pagination-item"><ChevronLeft size={16} /></button>
                <button className="pagination-item active">1</button>
                <button className="pagination-item">2</button>
                <button className="pagination-item">3</button>
                <span style={{ color: 'var(--text-light)', margin: '0 0.25rem' }}>...</span>
                <button className="pagination-item">12</button>
                <button className="pagination-item"><ChevronRight size={16} /></button>
              </div>
            </section>
          </div>
        </div>
      ) : (
        /* Detailed View Page */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Back Action Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn-card-secondary" onClick={() => setSelectedListing(null)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem' }}>
              <X size={16} /> Close Details
            </button>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Catalog / details / {selectedListing.title}</span>
          </div>

          {/* Photo Layout */}
          <div className="details-photo-grid">
            <img 
              src={selectedListing.image} 
              alt={selectedListing.title} 
              className="details-photo-main" 
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80";
              }}
            />
            <div className="details-photo-sub-col">
              <img 
                src="https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80" 
                alt="Bedroom workspace" 
                className="details-photo-sub"
              />
              <div className="details-photo-sub details-photo-more-card">
                <img 
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80" 
                  alt="Kitchen layout" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} 
                />
                <div className="details-photo-overlay">
                  +12 photos
                </div>
              </div>
            </div>
          </div>

          {/* Details splits */}
          <div className="details-grid">
            {/* Left detail card */}
            <div className="detail-card">
              <div className="detail-header-row">
                <div>
                  <h2 style={{ fontSize: '1.85rem', fontWeight: '800' }}>{selectedListing.title}</h2>
                  <div className="listing-location" style={{ fontSize: '0.95rem', marginTop: '0.5rem' }}>
                    <MapPin size={16} style={{ color: 'var(--primary)' }} />
                    {selectedListing.location}
                  </div>
                </div>

                <div className="detail-price-box">
                  <div className="detail-price-lbl">STARTING FROM</div>
                  <div className="detail-price-val">${selectedListing.price}/mo</div>
                </div>
              </div>

              {/* Status Pills */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge-pill-light" style={{ background: '#d1fae5', color: '#065f46' }}>
                  <ShieldCheck size={14} /> Verified Property
                </span>
                <span className="badge-pill-light" style={{ background: '#dbeafe', color: '#1e40af' }}>
                  Available Now
                </span>
                <span className="badge-pill-light" style={{ background: '#f3e8ff', color: '#6b21a8' }}>
                  Utilities Included
                </span>
                <span className="badge-pill-light" style={{ background: '#fef3c7', color: '#92400e' }}>
                  Student Only
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>About this space</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  {selectedListing.description} Our management team is dedicated to providing a frictionless student housing experience, with 24/7 maintenance support and all utilities (water, electricity, gas, and gigabit Wi-Fi) covered in your monthly rent.
                </p>
              </div>

              {/* Facilities Grid */}
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>Facilities & Amenities</h3>
                <div className="amenities-icons-grid">
                  <div className="amenity-icon-box">
                    <Wifi size={24} />
                    <span>High-speed Wi-Fi</span>
                  </div>
                  <div className="amenity-icon-box">
                    <Wind size={24} />
                    <span>Central A/C</span>
                  </div>
                  <div className="amenity-icon-box">
                    <Car size={24} />
                    <span>Secure Parking</span>
                  </div>
                  <div className="amenity-icon-box">
                    <Coffee size={24} />
                    <span>Full Kitchen</span>
                  </div>
                </div>
              </div>

              {/* Reviews list */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.2rem' }}>Reviews & Ratings ({selectedListing.reviews.length})</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700' }}>
                    <Star size={18} fill="var(--warning)" color="var(--warning)" />
                    {selectedListing.landlord.rating} (124 reviews)
                  </div>
                </div>

                <div className="reviews-list">
                  {selectedListing.reviews.length === 0 ? (
                    <div className="glass-panel review-item" style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-light)' }}>
                      <div className="review-header">
                        <span className="review-author">Ashik</span>
                        <span className="review-date">Oct 2023</span>
                      </div>
                      <div className="review-stars">
                        {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--warning)" color="var(--warning)" />)}
                      </div>
                      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                        Amazing student flat, extremely close to BUBT! Utilities are fully bundled and fiber wifi is super fast. Highly recommended.
                      </p>
                    </div>
                  ) : (
                    selectedListing.reviews.map((rev, i) => (
                      <div key={i} className="glass-panel review-item" style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-light)', padding: '1.25rem' }}>
                        <div className="review-header">
                          <span className="review-author">{rev.author}</span>
                          <span className="review-date">{rev.date}</span>
                        </div>
                        <div className="review-stars">
                          {[...Array(5)].map((_, idx) => (
                            <Star 
                              key={idx} 
                              size={14} 
                              fill={idx < rev.rating ? "var(--warning)" : "none"} 
                              color={idx < rev.rating ? "var(--warning)" : "var(--text-light)"} 
                            />
                          ))}
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.95rem' }}>{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Submit review */}
                <form onSubmit={handleReviewSubmit} style={{ margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
                  <h4 style={{ color: 'var(--primary)' }}>Write a Review</h4>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      className="form-input" 
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      required
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Rating:</span>
                      <select 
                        className="form-input" 
                        style={{ width: '80px', padding: '0.4rem' }}
                        value={reviewRating}
                        onChange={(e) => setReviewRating(parseInt(e.target.value))}
                      >
                        <option value="5">5 ⭐</option>
                        <option value="4">4 ⭐</option>
                        <option value="3">3 ⭐</option>
                        <option value="2">2 ⭐</option>
                        <option value="1">1 ⭐</option>
                      </select>
                    </div>
                  </div>
                  <textarea 
                    placeholder="Write your review comments here..." 
                    className="form-input" 
                    rows="3"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                  ></textarea>
                  <button type="submit" className="btn-filter-apply" style={{ alignSelf: 'flex-start', padding: '0.5rem 1.25rem' }}>
                    Submit Review
                  </button>
                </form>
              </div>
            </div>

            {/* Right sidebar details widgets */}
            <div className="dashboard-right-panel">
              {/* Landlord Profile Widget */}
              <div className="widget-card">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80" 
                    alt="Landlord avatar" 
                    className="sidebar-avatar" 
                    style={{ width: '3.5rem', height: '3.5rem' }} 
                  />
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{selectedListing.landlord.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Landlord Since 2019</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem', fontWeight: '600', marginTop: '0.15rem' }}>
                      <Star size={12} fill="var(--warning)" color="var(--warning)" />
                      {selectedListing.landlord.rating} • 15 Listings
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button 
                    className="btn-card-action" 
                    style={{ borderRadius: '6px' }}
                    onClick={() => {
                      const messageText = `Hi ${selectedListing.landlord.name}, I am interested in booking a viewing for "${selectedListing.title}". Can we schedule one?`;
                      onStartChat(selectedListing.landlord.name, messageText);
                    }}
                  >
                    Book Viewing
                  </button>
                  <button 
                    className="btn-card-secondary" 
                    style={{ color: 'white', background: '#0f766e', border: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem' }}
                    onClick={() => {
                      const messageText = `Hi ${selectedListing.landlord.name}, I am interested in your property "${selectedListing.title}" listed in ${selectedListing.location}. Is it still available?`;
                      onStartChat(selectedListing.landlord.name, messageText);
                    }}
                  >
                    <MessageSquare size={16} /> Contact Landlord
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                  <span>Response time</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>&lt; 1 hour</span>
                </div>
              </div>

              {/* Map Widget */}
              <div className="widget-card" style={{ padding: '0', overflow: 'hidden' }}>
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80" 
                  alt="City Map crop" 
                  style={{ width: '100%', height: '150px', objectFit: 'cover' }} 
                />
                <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700' }}>Downtown Metro</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>5 min walk to Campus</p>
                  </div>
                  <a href="#" className="widget-link" onClick={(e) => e.preventDefault()}>View Map</a>
                </div>
              </div>

              {/* Roommate Compatibility Widget */}
              <div className="lease-status-card" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ color: '#0369a1', fontWeight: '700' }}>Roommate Compatibility</h4>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', background: '#bae6fd', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>94% Match</span>
                </div>
                <p style={{ fontSize: '0.85rem', opacity: '0.9', marginTop: '0.25rem', color: '#0c4a6e' }}>
                  Based on your preferences, this property is a great match for your lifestyle and study habits.
                </p>
                <div className="lease-progress-container" style={{ marginTop: '0.25rem' }}>
                  <div className="lease-progress-bar" style={{ background: 'rgba(3, 105, 161, 0.2)' }}>
                    <div className="lease-progress-fill" style={{ width: '94%', background: '#0284c7' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Listings;
