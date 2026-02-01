# Collection Hub System - Chennai Implementation

## Overview
The Collection Hub System provides a complete solution for managing collection points in Chennai with 5 strategically located hubs across different areas of the city.

## 5 Main Collection Hubs in Chennai

### 1. **Downtown Hub** - T. Nagar
- **Location:** 123 Main Street, T. Nagar, Chennai - 600017
- **Coordinates:** 13.0341° N, 80.2481° E
- **Distance:** 2.5 km (from city center)
- **Collection Days:** Daily
- **Collection Hours:** 9 AM - 8 PM
- **Capacity:** 150 items
- **Current Items:** 87 (58% capacity)
- **Accepted Items:** Clothing, Electronics, Books, Furniture
- **Contact:** +91 44 4123 4567 | tnagar@loopify.eco
- **Manager:** Rajesh Kumar
- **Facilities:** 24/7 Security, Temperature Control, Safe Handling, Free Pickup Available
- **Rating:** 4.8/5 (342 reviews)

### 2. **South Side Hub** - Adyar
- **Location:** 456 Green Lane, Adyar, Chennai - 600020
- **Coordinates:** 13.0021° N, 80.2540° E
- **Distance:** 5.2 km
- **Collection Days:** Mon, Wed, Fri, Sun
- **Collection Hours:** 10 AM - 6 PM
- **Capacity:** 120 items
- **Current Items:** 65 (54% capacity)
- **Accepted Items:** Textiles, Plastic, Metal, Glass
- **Contact:** +91 44 4234 5678 | adyar@loopify.eco
- **Manager:** Priya Sharma
- **Facilities:** Sorting Facility, Recycling Station, Community Area, Online Booking
- **Rating:** 4.6/5 (285 reviews)

### 3. **North Side Hub** - Perambur
- **Location:** 789 Eco Road, Perambur, Chennai - 600012
- **Coordinates:** 13.1489° N, 80.2431° E
- **Distance:** 7.8 km
- **Collection Days:** Tue, Thu, Sat, Sun
- **Collection Hours:** 8 AM - 7 PM
- **Capacity:** 180 items
- **Current Items:** 142 (79% capacity)
- **Accepted Items:** All Categories, Electronics, White Goods
- **Contact:** +91 44 4345 6789 | perambur@loopify.eco
- **Manager:** Arun Singh
- **Facilities:** Large Storage, Pickup Service, Staff Training, Certification Program
- **Rating:** 4.7/5 (418 reviews)

### 4. **West Side Hub** - Guindy
- **Location:** 321 Industrial Park, Guindy, Chennai - 600032
- **Coordinates:** 13.0011° N, 80.2239° E
- **Distance:** 3.1 km
- **Collection Days:** Daily
- **Collection Hours:** 7 AM - 9 PM (Extended Hours)
- **Capacity:** 200 items (Largest Hub)
- **Current Items:** 156 (78% capacity)
- **Accepted Items:** Bulk Items, Industrial Waste, Commercial Items, Construction Materials
- **Contact:** +91 44 4456 7890 | guindy@loopify.eco
- **Manager:** Vikram Patel
- **Facilities:** Industrial Grade, Forklift Available, 24/7 Access, Bulk Discounts
- **Rating:** 4.5/5 (521 reviews)

### 5. **East Side Hub** - Besant Nagar
- **Location:** 654 Circular Road, Besant Nagar, Chennai - 600090
- **Coordinates:** 12.9829° N, 80.2701° E
- **Distance:** 6.4 km
- **Collection Days:** Mon-Sat
- **Collection Hours:** 9 AM - 8 PM
- **Capacity:** 140 items
- **Current Items:** 102 (73% capacity)
- **Accepted Items:** Premium Items, Vintage Collections, Designer Wear, Luxury Goods
- **Contact:** +91 44 4567 8901 | besantnagar@loopify.eco
- **Manager:** Deepa Iyer
- **Facilities:** Premium Handling, Climate Control, Insurance Coverage, Expert Valuation
- **Rating:** 4.9/5 (389 reviews)

## Files Included

### 1. **collection-hub-selector.html**
Interactive hub selection interface with:
- Visual hub cards with capacity indicators
- Real-time availability status
- Hub details modal
- Map integration placeholder
- Statistics dashboard

**Features:**
- Select hub by clicking on the card
- View hub details including capacity, schedule, and contact info
- Get directions to selected hub
- Download hub maps
- Automatic hub pre-selection from previous sessions

### 2. **collection-booking.html**
Complete booking flow with 4 steps:

**Step 1 - Select Date:**
- Calendar view of available collection days
- Respects hub-specific collection schedules
- 14-day advance booking window

**Step 2 - Select Time:**
- Dynamic time slots based on hub hours
- Hub operating hours respected
- Available from opening to closing time

**Step 3 - Item Details:**
- Item category selection (8 categories)
- Item count and description
- Special handling flags (fragile, heavy, bulky)
- Category-specific guidelines

**Step 4 - Confirmation:**
- Review booking summary
- Enter customer details (name, phone, email)
- Accept terms and conditions
- Booking reference generated

### 3. **collection-hub-system.js**
Core system library with methods:

**Hub Management:**
- `getAllHubs()` - Get all 5 hubs
- `getHubById(hubId)` - Get specific hub
- `getHubsByArea(area)` - Filter by area
- `getNearestHub()` - Find closest hub

**Scheduling:**
- `getHubsByDay(day)` - Hubs open on specific day
- `isHubOpen(hubId, time)` - Check if hub is open
- `schedulePickup(hubId, scheduleData)` - Create booking

**Capacity Management:**
- `getCapacityStatus(hubId)` - Get capacity info
- `updateHubItems(hubId, newCount)` - Update item count
- `addItemsToHub(hubId, count)` - Add items

**Utilities:**
- `getHubStatistics()` - Overall metrics
- `searchHubs(criteria)` - Advanced search
- `getHubDetails(hubId)` - Complete hub info

## Technology Stack

- **Frontend:** HTML5, CSS3, Tailwind CSS, Vanilla JavaScript
- **Styling:** Sage green theme (#6b9e83) with dark mode
- **Storage:** Browser localStorage (no backend required)
- **Maps:** Google Maps integration ready
- **Font Awesome:** Icon library for UI elements

## Color Scheme

- **Primary:** Sage Green (#6b9e83)
- **Background:** Dark (#000, #0a0a0a, #1a1a1a)
- **Text:** Light Gray (#f5f5f5, #999)
- **Borders:** Subtle (#333)

## Usage Guide

### For Users

1. **Browse Hubs:**
   - Open `collection-hub-selector.html`
   - View 5 available hubs in Chennai
   - Check capacity and operating hours
   - Read reviews and ratings

2. **Select Hub:**
   - Click on desired hub card
   - View detailed information
   - Check accepted items
   - Confirm location

3. **Schedule Pickup:**
   - Click "Proceed to Collection"
   - Select date from available days
   - Choose time slot
   - Enter item details
   - Confirm booking

4. **Get Confirmation:**
   - Receive booking reference
   - Email confirmation sent
   - SMS notification received
   - Can download confirmation

### For Developers

**Include the system:**
```javascript
<script src="collection-hub-system.js"></script>
```

**Initialize system:**
```javascript
const hubs = collectionHubSystem.getAllHubs();
```

**Get specific hub:**
```javascript
const hub = collectionHubSystem.getHubById('hub-tnagar');
```

**Schedule pickup:**
```javascript
collectionHubSystem.schedulePickup('hub-tnagar', {
  date: '2026-02-01',
  time: '10:00',
  itemCount: 5,
  items: ['clothing', 'electronics']
});
```

**Search hubs:**
```javascript
const results = collectionHubSystem.searchHubs({
  area: 'T. Nagar',
  maxDistance: 5,
  minRating: 4.5,
  acceptsItem: 'Electronics'
});
```

## Data Structure

### Hub Object
```javascript
{
  id: 'hub-tnagar',
  name: 'Downtown Hub',
  area: 'T. Nagar',
  location: 'Full address',
  coordinates: { lat: 13.0341, lng: 80.2481 },
  collectionDays: ['Monday', 'Tuesday', ...],
  collectionHours: { start: '09:00', end: '20:00' },
  distance: 2.5,
  capacity: 150,
  currentItems: 87,
  acceptedItems: [...],
  contact: { phone, email, manager },
  facilities: [...],
  rating: 4.8,
  reviews: 342,
  icon: 'fas fa-map-marker-alt'
}
```

### Booking Object
```javascript
{
  id: 'schedule-1234567890',
  hubId: 'hub-tnagar',
  hubName: 'Downtown Hub',
  date: '2026-02-01',
  time: '10:00',
  itemCount: 5,
  items: ['clothing', 'electronics'],
  status: 'scheduled',
  createdAt: '2026-01-31T10:30:00Z',
  userName: 'John Doe',
  userPhone: '+91 98765 43210',
  userEmail: 'john@example.com'
}
```

## Features

✅ **5 Strategic Hub Locations** in Chennai
✅ **Real-time Capacity Tracking** - Monitor item count per hub
✅ **Dynamic Scheduling** - Book based on hub availability
✅ **Item Categorization** - 8 different item types
✅ **Special Handling** - Flag fragile, heavy, or bulky items
✅ **Hub Ratings** - Community reviews and ratings
✅ **Nearby Hub Finder** - Distance-based search
✅ **Schedule Management** - View and manage bookings
✅ **Mobile Responsive** - Works on all devices
✅ **Dark Mode UI** - Eye-friendly interface
✅ **Local Storage** - No account needed
✅ **Map Integration Ready** - Google Maps support

## Integration Points

### With Main App
```javascript
// Link from main navigation
<a href="collection-hub-selector.html">Collection Hubs</a>

// Store selected hub globally
localStorage.setItem('selectedHub', JSON.stringify(hub));

// Retrieve in other pages
const selectedHub = JSON.parse(localStorage.getItem('selectedHub'));
```

### With Firebase/Backend
```javascript
// Optional: Save booking to database
firebase.firestore().collection('bookings').add(bookingData);

// Optional: Update hub capacity real-time
firebase.database().ref(`hubs/${hubId}`).update(capacityData);
```

### With Payment System
```javascript
// Integration point for collection fees
if (specialHandling.heavy || specialHandling.bulky) {
  // Apply additional charges
  bookingData.specialCharge = 50;
}
```

## Future Enhancements

- [ ] Real-time hub location tracking
- [ ] Driver assignment and tracking
- [ ] Push notifications for bookings
- [ ] Loyalty points system
- [ ] Video item pickup verification
- [ ] AR visualization of hubs
- [ ] Multi-language support
- [ ] Accessibility improvements
- [ ] Advanced analytics dashboard
- [ ] API integration with logistics partners

## Statistics

**Platform Overview:**
- **Total Hubs:** 5
- **Total Capacity:** 790 items
- **Current Items:** 452 (57% utilization)
- **Average Rating:** 4.7/5
- **Total Reviews:** 1,955
- **Operating Hours:** 7 AM - 9 PM (varies by hub)
- **Coverage Area:** 14.2 km radius
- **Average Distance:** 4.8 km from city center

## Support

**Technical Issues:**
- Email: support@loopify.eco
- Phone: +91 44 XXXX XXXX

**Hub-Specific Support:**
Contact the hub manager listed in the hub details

## License

Loopify Platform © 2026. All rights reserved.
