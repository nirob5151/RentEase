/**
 * Dynamic Review & Rating Calculation Utility
 * Reused in: Listings Grid, Hero Featured Listings, Property Details Modal, and Dashboards
 */

export function getListingReviews(listingOrId, allReviews = []) {
  if (!listingOrId) return [];

  const listingIdStr = typeof listingOrId === 'object' && listingOrId !== null
    ? String(listingOrId.id || listingOrId.listing_id || listingOrId.property_id || '')
    : String(listingOrId || '');

  const listingTitleStr = typeof listingOrId === 'object' && listingOrId !== null
    ? String(listingOrId.title || listingOrId.name || '').toLowerCase().trim()
    : '';

  // 1. Check embedded listing.reviews array
  let embeddedReviews = [];
  if (typeof listingOrId === 'object' && Array.isArray(listingOrId.reviews)) {
    embeddedReviews = listingOrId.reviews;
  }

  // 2. Filter global reviews list matching listingId or title
  const matchedGlobal = (allReviews || []).filter(r => {
    if (!r) return false;
    const rListingId = String(r.listingId || r.listing_id || r.propertyId || r.property_id || r.target_id || '');
    const rTarget = String(r.target || r.propertyTitle || r.property_name || '').toLowerCase().trim();

    if (listingIdStr && rListingId && rListingId === listingIdStr) return true;
    if (listingTitleStr && rTarget && (rTarget.includes(listingTitleStr) || listingTitleStr.includes(rTarget))) return true;
    return false;
  });

  // Combine & deduplicate reviews by ID or author+comment
  const combined = [...embeddedReviews];
  for (const gRev of matchedGlobal) {
    const isDuplicate = combined.some(e => 
      (e.id && gRev.id && e.id === gRev.id) || 
      (e.author === gRev.author && e.comment === gRev.comment)
    );
    if (!isDuplicate) combined.push(gRev);
  }

  return combined;
}

export function getListingRating(listingOrId, allReviews = []) {
  const reviews = getListingReviews(listingOrId, allReviews);
  const count = reviews.length;

  if (count === 0) {
    return {
      avgRating: null,
      count: 0,
      formattedAvg: null,
      hasReviews: false,
      displayText: 'No reviews yet',
      badgeText: 'New'
    };
  }

  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  const avg = sum / count;
  const formattedAvg = (Math.round(avg * 10) / 10).toFixed(1);

  return {
    avgRating: Math.round(avg * 10) / 10,
    count: count,
    formattedAvg: formattedAvg,
    hasReviews: true,
    displayText: `${formattedAvg} ★ (${count} ${count === 1 ? 'review' : 'reviews'})`,
    badgeText: `${formattedAvg} ★`
  };
}
