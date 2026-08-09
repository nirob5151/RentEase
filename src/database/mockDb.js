// Mock Database Seed Data for RentEase matching the screenshots

export const DEFAULT_LISTINGS = [
  {
    id: 1,
    title: 'Dhaka Rent',
    location: 'BUBT Campus (0.4 miles)',
    price: 1250,
    type: 'Entire Apartment',
    facilities: ['Wifi Included', 'Furnished', 'Gym'],
    verified: true,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
    description: 'Perfect student apartment near BUBT. Fully furnished with a bed, desk, and high-speed fiber internet.',
    landlord: {
      name: 'Mehadi',
      rating: 4.9,
      phone: '+880 1712-345678'
    },
    reviews: [
      { author: 'Ashik', rating: 5, date: 'Oct 2023', comment: 'Amazing student flat, extremely close to BUBT! Utilities are fully bundled and fiber wifi is super fast. Highly recommended.' }
    ]
  },
  {
    id: 2,
    title: 'Mirpur House',
    location: 'Mirpur 10, CA',
    price: 850,
    type: 'Private Room',
    facilities: ['Private Bath', 'In-unit Laundry'],
    verified: true,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
    description: 'Quiet room in a friendly shared flat. Close to transport and BUBT. Friendly roommate environment.',
    landlord: {
      name: 'Abdur Rahman',
      rating: 4.7,
      phone: '+880 1819-876543'
    },
    reviews: []
  },
  {
    id: 3,
    title: 'Mirpur 11',
    location: 'BUBT',
    price: 920,
    type: 'Shared Room',
    facilities: ['Rooftop Deck', 'Wifi'],
    verified: false,
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80',
    description: 'Private sublet room in family apartment. Safe and quiet environment for students.',
    landlord: {
      name: 'Mrs. Begum',
      rating: 4.5,
      phone: '+880 1911-223344'
    },
    reviews: []
  },
  {
    id: 4,
    title: 'Mirpur 6',
    location: 'BUBT',
    price: 1400,
    type: 'Entire Apartment',
    facilities: ['Smart Home', 'Quiet Zone'],
    verified: true,
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80',
    description: 'Premium student living with smart facilities. Ideal for study groups.',
    landlord: {
      name: 'Apex Student Living',
      rating: 4.8,
      phone: '+880 1515-667788'
    },
    reviews: []
  }
];

export const MOCK_ROOMMATES = [
  {
    name: 'Bushra',
    gender: 'Female',
    intake: '51/8',
    budget: 5000,
    cleanliness: 'Very Neat',
    study: 'Quiet library setting',
    sleep: 'Early riser',
    smoke: 'Non-smoker',
    bio: 'Biology major. Love weekend hikes and quiet study sessions. Very organized!'
  },
  {
    name: 'Anas',
    gender: 'Male',
    intake: '51/8',
    budget: 6500,
    cleanliness: 'Moderate',
    study: 'Group study',
    sleep: 'Night owl',
    smoke: 'Non-smoker',
    bio: 'Computer Science. I spend a lot of time coding. Looking for a chill environment.'
  },
  {
    name: 'Shimu',
    gender: 'Female',
    intake: '51/8',
    budget: 6000,
    cleanliness: 'Very Neat',
    study: 'Quiet library setting',
    sleep: 'Early riser',
    smoke: 'Non-smoker',
    bio: 'History of Art. I love visiting galleries and I\'m very tidy. Looking for a fellow grad..'
  }
];

export const DEFAULT_CHATS = [
  {
    id: 'chat_anas',
    name: 'Anas',
    avatar: 'A',
    lastMessage: 'Can we schedule a viewing for Tuesday?',
    time: '10:42 AM',
    messages: [
      { sender: 'receiver', text: 'Hello Anas! I saw your inquiry regarding the 2BR suite on Maple Avenue. It\'s still available for the spring semester.', time: '10:30 AM' },
      { sender: 'user', text: 'That\'s great! My roommate and I are really interested. Is the high-speed wifi included in the listed rent?', time: '10:35 AM' },
      { sender: 'receiver', text: 'Yes, all utilities including fiber internet are bundled. Here is the official listing with the full breakdown of amenities:', time: '10:40 AM' },
      { sender: 'receiver', text: 'Can we schedule a viewing for Tuesday?', time: '10:42 AM' }
    ]
  }
];

export const DEFAULT_BOOKINGS = [
  {
    id: 'req_1',
    tenantName: 'Ashikur Rahman',
    tenantEmail: 'ashik@cse.bubt.edu.bd',
    tenantPhone: '+880 1711-223344',
    studentId: '22235103412',
    studentIdVerified: true,
    propertyId: 1,
    propertyTitle: 'Dhaka Rent',
    price: 1250,
    status: 'Pending',
    date: '2026-07-02',
    isRoommateRequest: false
  },
  {
    id: 'req_2',
    tenantName: 'Anas & Nirob (Roommates)',
    tenantEmail: 'anas@cse.bubt.edu.bd',
    tenantPhone: '+880 1500-112233',
    studentId: '22235103467 / 22235103496',
    studentIdVerified: true,
    propertyId: 4,
    propertyTitle: 'Mirpur 6 Flat',
    price: 1400,
    status: 'Pending',
    date: '2026-07-03',
    isRoommateRequest: true,
    compatibilityScore: '94%'
  }
];

export const DEFAULT_PAYMENTS = [
  {
    id: 'pay_1',
    tenantName: 'Ashikur Rahman',
    propertyTitle: 'Dhaka Rent',
    amount: 1250,
    month: 'June 2026',
    status: 'Paid',
    date: '2026-06-05',
    receiptId: 'REC-99182',
    depositStatus: 'Refundable'
  },
  {
    id: 'pay_2',
    tenantName: 'Anas Ahmed',
    propertyTitle: 'Mirpur House',
    amount: 850,
    month: 'June 2026',
    status: 'Paid',
    date: '2026-06-03',
    receiptId: 'REC-99155',
    depositStatus: 'Refundable'
  },
  {
    id: 'pay_3',
    tenantName: 'Ashikur Rahman',
    propertyTitle: 'Dhaka Rent',
    amount: 1250,
    month: 'July 2026',
    status: 'Pending',
    date: '',
    receiptId: 'REC-99201',
    depositStatus: 'Refundable'
  }
];

export const DEFAULT_TENANTS = [
  {
    id: 'ten_1',
    name: 'Ashikur Rahman',
    email: 'ashik@cse.bubt.edu.bd',
    phone: '+880 1711-223344',
    studentId: '22235103412',
    studentIdVerified: true,
    propertyTitle: 'Dhaka Rent',
    propertyId: 1,
    rentAmount: 1250,
    moveInDate: '2026-01-01',
    status: 'Current',
    nidPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80'
  },
  {
    id: 'ten_2',
    name: 'Sumit Paul',
    email: 'sumit@cse.bubt.edu.bd',
    phone: '+880 1819-334455',
    studentId: '21224103112',
    studentIdVerified: true,
    propertyTitle: 'Mirpur House',
    propertyId: 2,
    rentAmount: 850,
    moveInDate: '2025-01-01',
    status: 'Previous',
    nidPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80'
  }
];

export const DEFAULT_REVIEWS = [
  {
    id: 'rev_1',
    author: 'Ashikur Rahman',
    propertyTitle: 'Dhaka Rent',
    rating: 5,
    date: 'Oct 2023',
    comment: 'Amazing student flat, extremely close to BUBT! Utilities are fully bundled and fiber wifi is super fast. Highly recommended.',
    replied: false,
    replyText: '',
    isFake: false
  }
];

export const DEFAULT_NOTIFICATIONS = [
  { id: 'lnd_not_1', type: 'properties', title: '🏠 Property submitted', message: 'Your property "Modern BUBT Female Sublet" was submitted for admin approval.', time: '10 mins ago', read: false },
  { id: 'lnd_not_2', type: 'properties', title: '✅ Property approved', message: 'Your property listing "Sunny Single Room near BUBT" is now LIVE!', time: '30 mins ago', read: false },
  { id: 'lnd_not_3', type: 'properties', title: '❌ Property rejected', message: 'Listing #104 was rejected by Admin (Reason: Please re-upload clear photos).', time: '1 hr ago', read: false },
  { id: 'lnd_not_4', type: 'properties', title: '👁️ Property hidden', message: 'Property #102 is temporarily hidden from public search per your request.', time: '2 hrs ago', read: true },
  { id: 'lnd_not_5', type: 'booking', title: '📅 New booking request', message: 'Student Maruf Billah Anas submitted a booking request for BUBT Flat.', time: '3 hrs ago', read: false },
  { id: 'lnd_not_6', type: 'booking', title: '👍 Booking accepted', message: 'Booking request #BKG-991 approved and move-in date confirmed.', time: '4 hrs ago', read: true },
  { id: 'lnd_not_7', type: 'booking', title: '🚫 Booking cancelled', message: 'Booking application #BKG-984 was cancelled by the student.', time: '5 hrs ago', read: true },
  { id: 'lnd_not_8', type: 'payment', title: '💳 Student payment successful', message: 'Rent payment (৳12,000 BDT) received via bKash #TXN-99201.', time: '6 hrs ago', read: false },
  { id: 'lnd_not_9', type: 'payment', title: '💰 Rent received', message: 'Rent payout of ৳12,000 BDT credited to your verified bKash wallet.', time: 'Yesterday', read: true },
  { id: 'lnd_not_10', type: 'payment', title: '⚠️ Payment failed', message: 'Transaction #TXN-881 failed. Student notified to retry payment.', time: 'Yesterday', read: true },
  { id: 'lnd_not_11', type: 'messages', title: '💬 New student message', message: 'New inquiry message from Maruf Billah Anas regarding BUBT flat.', time: 'Yesterday', read: false },
  { id: 'lnd_not_12', type: 'reviews', title: '⭐ New review', message: 'Verified tenant posted a 5.0-star rating review on your property.', time: '2 days ago', read: true },
  { id: 'lnd_not_13', type: 'verification', title: '🪪 Verification approved', message: 'Your Landlord NID Identity & Holding Tax Deed were verified by RentEase Admin!', time: '3 days ago', read: true },
  { id: 'lnd_not_14', type: 'verification', title: '⚠️ Verification rejected', message: 'NID Verification rejected (Reason: Please re-upload non-blurry NID scan).', time: '4 days ago', read: true },
  { id: 'lnd_not_15', type: 'contract', title: '📝 Contract ready', message: 'Digital tenancy contract #AGR-401 is ready for your review and signature.', time: '5 days ago', read: true },
  { id: 'lnd_not_16', type: 'contract', title: '✒️ Student signed contract', message: 'Student Maruf Billah Anas signed digital tenancy agreement #AGR-401.', time: '6 days ago', read: true }
];
