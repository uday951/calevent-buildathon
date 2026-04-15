# 🎯 Admin-Curated Events System

## Overview

CALEVENT now supports **Admin-Curated Events** - a powerful feature that allows the platform to look fully populated and production-ready even before real providers join. This creates an Amazon-style marketplace experience from day one.

---

## 🌟 Key Features

### Two-Tier Event System

1. **Admin-Curated Events** (Platform-Owned)
   - Created and managed by admin
   - Acts as "CALEVENT Premium Services"
   - Always visible and bookable
   - Professional, high-quality listings

2. **Provider-Created Events** (Future)
   - Created by verified providers
   - Linked to specific provider accounts
   - Coexists with admin events

---

## 📊 Current Database (20 Premium Events)

### Categories Distribution:
- **Wedding**: 10 events (Catering, Decoration, Photography, DJ, Venue, Videography, Lighting, Anchor)
- **Corporate**: 4 events (Conference Hall, Event Management, Product Launch, Team Building)
- **Birthday**: 4 events (Decoration, Complete Package, DJ, Catering)
- **Anniversary**: 1 event (Celebration Package)
- **Party**: 1 event (Entertainment Package)

### Tags Distribution:
- **Premium**: 5 events
- **Bestseller**: 4 events
- **Popular**: 6 events
- **Top Rated**: 3 events
- **Trending**: 2 events

### Price Ranges:
- **Budget**: ₹8,000 - ₹35,000
- **Mid-Range**: ₹35,000 - ₹85,000
- **Premium**: ₹85,000 - ₹400,000

### Cities Covered:
- Mumbai, Delhi, Bangalore, Pune, Hyderabad, Chennai, Jaipur

---

## 🚀 Quick Start

### 1. Seed Admin Events

```bash
# Run from project root
seed-admin-events.bat

# Or manually
cd calevent-backend
node seed-admin-events.js
```

This will:
- ✅ Delete existing admin events (if any)
- ✅ Insert 20 high-quality admin events
- ✅ Display category and tag statistics

### 2. Verify in Database

```javascript
// MongoDB query
db.events.find({ createdBy: 'admin' }).count()
// Should return: 20
```

---

## 🔧 Technical Implementation

### Database Schema Extension

```javascript
// EventModel.js - Already supports:
{
  createdBy: {
    type: String,
    enum: ['admin', 'provider'],
    default: 'provider'
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    default: null  // null for admin events
  },
  providerName: {
    type: String,
    required: true  // "CALEVENT Premium Services" for admin
  }
}
```

### API Endpoints

#### Public (Customer-Facing)
```
GET /api/events
- Returns ALL events (admin + provider)
- Filter by category, location, price
- Admin events shown with priority

GET /api/events/:id
- Get single event details
- Works for both admin and provider events
```

#### Admin-Only
```
GET /api/admin/events
- List all admin-curated events
- Filter by category, status

POST /api/admin/events
- Create new admin event
- Requires: title, description, category, price, etc.

PUT /api/admin/events/:eventId
- Update admin event
- Only works for createdBy: 'admin'

DELETE /api/admin/events/:eventId
- Soft delete (isActive: false)
```

---

## 📝 Event Data Structure

```javascript
{
  title: "Royal Wedding Catering Package",
  description: "Premium wedding catering service...",
  category: "wedding",
  subcategory: "catering",
  tag: "premium",
  createdBy: "admin",
  price: 85000,
  priceMax: 150000,
  eventImage: "weddings/wedding-party-event-management.jpg",
  providerId: null,
  providerName: "CALEVENT Premium Services",
  location: {
    address: "Service available across city",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001"
  },
  features: ["Live Counters", "Multi-Cuisine", "Professional Staff"],
  tags: ["wedding", "catering", "premium", "luxury"],
  maxCapacity: 500,
  minCapacity: 200,
  duration: "Full Day (8-10 hours)",
  inclusions: ["Food for all guests", "Service staff", "Buffet setup"],
  exclusions: ["Venue charges", "Decoration", "Beverages"],
  isActive: true,
  rating: 4.8,
  views: 245,
  bookingCount: 18
}
```

---

## 🎨 Frontend Display Strategy

### Homepage Sections (Recommended)

```jsx
// Featured Events (Admin + Top Provider)
<FeaturedEvents filter={{ tag: 'premium' }} limit={6} />

// Trending Now (Admin events with high views)
<TrendingEvents filter={{ tag: 'trending' }} limit={8} />

// Category-Wise Display
<WeddingPackages filter={{ category: 'wedding' }} limit={12} />
<CorporateEvents filter={{ category: 'corporate' }} limit={8} />
<BirthdayParties filter={{ category: 'birthday' }} limit={8} />
```

### Event Card Display

```jsx
<EventCard>
  {event.tag === 'premium' && <Badge>Premium</Badge>}
  {event.tag === 'bestseller' && <Badge>Best Seller</Badge>}
  
  <Image src={event.eventImage} />
  <Title>{event.title}</Title>
  <Provider>{event.providerName}</Provider>
  <Price>₹{event.price.toLocaleString()}</Price>
  <Rating>{event.rating} ⭐</Rating>
  <Location>{event.location.city}</Location>
</EventCard>
```

---

## 🔄 Booking Flow for Admin Events

### Customer Journey:
1. **Browse** → Customer sees admin events mixed with provider events
2. **Select** → Clicks on admin event (e.g., "Royal Wedding Catering")
3. **Book** → Fills booking form with event details
4. **Payment** → Completes payment via Razorpay
5. **Admin Review** → Admin receives booking request
6. **Provider Assignment** → Admin assigns real provider to fulfill
7. **Execution** → Assigned provider delivers the service

### Backend Flow:
```javascript
// Booking Model
{
  eventId: ObjectId("admin_event_id"),
  customerId: ObjectId("customer_id"),
  assignedProvider: null,  // Initially null
  adminStatus: "pending_review",
  // ... other fields
}

// Admin assigns provider later
booking.assignedProvider = ObjectId("real_provider_id");
booking.adminStatus = "provider_assigned";
```

---

## 📈 Scaling Strategy

### Phase 1: Admin Events Only (Current)
- 20 admin-curated events
- Platform looks fully populated
- All bookings handled by admin

### Phase 2: Mixed Marketplace (Next)
- Admin events: 20-50 (curated, premium)
- Provider events: Growing organically
- Display priority: Admin events first, then provider

### Phase 3: Provider-Dominated (Future)
- Admin events: 50-100 (evergreen packages)
- Provider events: 1000+ (marketplace)
- Display priority: Based on ratings, bookings, relevance

---

## 🛠️ Admin Dashboard Features (To Be Built)

### Event Management Panel
```
┌─────────────────────────────────────┐
│  Admin Events Dashboard             │
├─────────────────────────────────────┤
│  Total Events: 20                   │
│  Active: 20 | Inactive: 0           │
│                                     │
│  [+ Create New Event]               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Royal Wedding Catering      │   │
│  │ Category: Wedding           │   │
│  │ Price: ₹85,000             │   │
│  │ Bookings: 18 | Views: 245   │   │
│  │ [Edit] [Delete] [View]      │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 🎯 Best Practices

### DO:
✅ Keep admin events high-quality and realistic
✅ Update prices based on market research
✅ Use real images from public folder
✅ Maintain consistent naming: "CALEVENT Premium Services"
✅ Set realistic ratings (4.5 - 4.9)
✅ Add proper inclusions/exclusions

### DON'T:
❌ Mix admin and provider logic in same functions
❌ Allow customers to see "admin" label
❌ Create fake/unrealistic packages
❌ Use placeholder images
❌ Set providerId for admin events

---

## 🔐 Security Considerations

1. **Admin-Only Creation**: Only admins can create admin events
2. **Separate Filtering**: Admin events filtered by `createdBy: 'admin'`
3. **Provider Protection**: Providers cannot edit admin events
4. **Booking Isolation**: Admin bookings tracked separately

---

## 📊 Analytics & Insights

### Track These Metrics:
- Admin event views vs provider event views
- Admin event bookings vs provider event bookings
- Most popular admin event categories
- Conversion rate: Views → Bookings
- Average booking value: Admin vs Provider

---

## 🚀 Future Enhancements

### Phase 1 (Immediate):
- [ ] Admin dashboard UI for event management
- [ ] Bulk upload CSV for 100+ events
- [ ] Image upload for admin events
- [ ] Event analytics dashboard

### Phase 2 (Next Sprint):
- [ ] Auto-assign providers based on category
- [ ] Dynamic pricing based on demand
- [ ] Seasonal event packages
- [ ] Multi-city expansion

### Phase 3 (Long-term):
- [ ] AI-generated event descriptions
- [ ] Smart provider matching algorithm
- [ ] Customer preference learning
- [ ] Automated event recommendations

---

## 📞 Support

For issues or questions:
- Check MongoDB connection
- Verify .env configuration
- Ensure images exist in public folder
- Check admin authentication

---

## 🎉 Success Metrics

After seeding, you should see:
- ✅ 20 events in database
- ✅ Events visible on homepage
- ✅ Events bookable by customers
- ✅ Professional marketplace appearance
- ✅ No "empty state" messages

---

**Built with ❤️ for CALEVENT - Making event booking seamless**
