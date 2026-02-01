# Collection Hub Selector - Quick Start Guide

## What's New

The Loopify Collection Hub system provides 5 strategically located collection points around Chennai, allowing users to easily drop off or schedule pickup of items for recycling and reuse.

## Files Created

1. **collection-hub-selector.html** - Main hub selection interface
2. **collection-booking.html** - Booking and scheduling interface
3. **collection-hub-system.js** - Core system library
4. **COLLECTION_HUB_DOCUMENTATION.md** - Complete documentation

## 5 Main Collection Hubs

### Coverage Map
```
                 North Side (Perambur)
                    7.8 km away
                         |
    West Side ---- Downtown ---- East Side
    (Guindy)      (T. Nagar)  (Besant Nagar)
    3.1 km         2.5 km       6.4 km
         \            |            /
          South Side (Adyar)
             5.2 km away
```

### Hub Details at a Glance

| Area | Distance | Hours | Days | Capacity | Rating |
|------|----------|-------|------|----------|--------|
| T. Nagar (Downtown) | 2.5 km | 9 AM - 8 PM | Daily | 150 | ⭐ 4.8 |
| Adyar (South Side) | 5.2 km | 10 AM - 6 PM | M,W,F,Sun | 120 | ⭐ 4.6 |
| Perambur (North Side) | 7.8 km | 8 AM - 7 PM | T,Th,Sat,Sun | 180 | ⭐ 4.7 |
| Guindy (West Side) | 3.1 km | 7 AM - 9 PM | Daily | 200 | ⭐ 4.5 |
| Besant Nagar (East Side) | 6.4 km | 9 AM - 8 PM | M-Sat | 140 | ⭐ 4.9 |

## How to Use

### Step 1: Open Hub Selector
Open `collection-hub-selector.html` in your browser to see all 5 hubs.

```
Visit: http://localhost/collection-hub-selector.html
```

### Step 2: Browse Hubs
- Scroll through the hub cards
- Check capacity status (progress bar)
- View collection schedule
- See contact information
- Read reviews and ratings

### Step 3: Select a Hub
- Click on the hub card that works best for you
- The card will highlight in sage green
- Card will show a checkmark when selected

### Step 4: Schedule Collection
After selecting a hub, you can:
- **View Details:** Click "View Hub Details" button
- **Proceed to Collection:** Click "Proceed to Collection" to book a pickup
- **Get Directions:** Open in Google Maps
- **Download Map:** Save hub map locally

### Step 5: Complete Booking
The booking flow guides you through:

1. **Select Date** - Choose from available collection days (14-day window)
2. **Select Time** - Pick a time slot during hub hours
3. **Item Details** - Describe your items and quantity
4. **Confirm** - Enter contact info and confirm booking

## Feature Highlights

### 🎯 Smart Selection
- Capacity indicators show how full each hub is
- Ratings help you choose the best-reviewed hub
- Distance shows proximity to your location

### 📅 Flexible Scheduling
- Each hub has different collection days
- Pick time slots during operating hours
- Up to 14 days in advance

### 📦 Item Tracking
- Categorize your items (8 different types)
- Flag special handling needs (fragile, heavy, bulky)
- Provide descriptions for better handling

### 💾 Local Storage
- All data saved to browser (no account needed)
- Bookings stored locally
- Hub preferences remembered

### 📱 Mobile Ready
- Responsive design works on all devices
- Touch-friendly interface
- Dark mode for eye comfort

## Hub Information

### T. Nagar (Downtown) - Best for General Items
- **Speed:** Closest hub (2.5 km)
- **Availability:** Open daily 9 AM - 8 PM
- **Specialty:** Clothing, Electronics, Books, Furniture
- **Why Choose:** Most convenient location, highest rating

### Adyar (South Side) - Best for Specific Materials
- **Specialization:** Textiles, Plastic, Metal, Glass
- **Schedule:** M, W, F, Sunday
- **Capacity:** Medium (120 items)
- **Why Choose:** Expert handling of specific materials

### Perambur (North Side) - Best for Bulk Items
- **Capacity:** Largest (180 items)
- **Range:** Accepts all categories including white goods
- **Schedule:** T, Th, Sat, Sun
- **Why Choose:** Large storage and expert team

### Guindy (West Side) - Best for Heavy/Industrial Items
- **Specialty:** Industrial waste, bulk items, commercial goods
- **Hours:** Extended (7 AM - 9 PM)
- **Special:** Has forklift and industrial-grade equipment
- **Why Choose:** Only option for very heavy items

### Besant Nagar (East Side) - Best for Premium Items
- **Premium:** Climate-controlled storage
- **Focus:** Designer wear, vintage collections, luxury goods
- **Insurance:** Coverage available
- **Why Choose:** Expert valuation and care

## Common Scenarios

### Scenario 1: I have clothes to drop off
**Recommendation:** T. Nagar (Downtown)
- Closest location (2.5 km)
- Open daily
- Specializes in clothing

**Booking Steps:**
1. Click T. Nagar hub card
2. Select any day (open daily)
3. Choose preferred time
4. Enter item details
5. Confirm booking

### Scenario 2: I work on weekends only
**Recommendation:** Perambur (North Side) or Adyar (South Side)
- Both open on Sundays
- Flexible scheduling

### Scenario 3: I have heavy/bulk items
**Recommendation:** Guindy (West Side)
- Extended hours (7 AM - 9 PM)
- Industrial equipment available
- Forklift service

### Scenario 4: I have premium/designer items
**Recommendation:** Besant Nagar (East Side)
- Premium handling
- Climate control
- Insurance coverage

## Technical Details

### For Web Developers
Include the system in your HTML:
```html
<script src="collection-hub-system.js"></script>
```

### Basic Usage
```javascript
// Get all hubs
const allHubs = collectionHubSystem.getAllHubs();

// Get specific hub
const hub = collectionHubSystem.getHubById('hub-tnagar');

// Search hubs
const results = collectionHubSystem.searchHubs({
  area: 'T. Nagar',
  maxDistance: 5
});

// Schedule pickup
collectionHubSystem.schedulePickup('hub-tnagar', {
  date: '2026-02-05',
  time: '14:00',
  itemCount: 5,
  items: ['clothing', 'electronics']
});
```

## Booking Confirmation

After booking, you'll receive:
- ✅ Booking reference number (format: LOAD-XXXXXXXX)
- ✅ Email confirmation with all details
- ✅ SMS notification
- ✅ Downloadable confirmation PDF

**Example Reference:** LOAD-1704002400

## Support

**Hub Issues:**
- Contact hub manager (details in hub information)
- Call hub phone number
- Email hub support address

**Technical Issues:**
- Check browser console for errors (F12)
- Clear browser cache and try again
- Ensure JavaScript is enabled
- Try different browser if issues persist

## Data Storage

All data is stored locally in your browser:
- Hub information (read-only)
- Your bookings
- Selected hub preference

**No data is sent to external servers** - all processing happens locally.

## Privacy & Security

- No personal data shared
- Bookings stored locally only
- No cookies or trackers
- Completely private

## Tips & Tricks

1. **Bookmark your favorite hub:** Save the hub page for quick access
2. **Check capacity first:** Visit hub selector to see which hub has space
3. **Book in advance:** Schedule 1-2 weeks ahead for better time slots
4. **Set reminders:** Save booking date/time to your calendar
5. **Download confirmation:** Keep backup of your booking reference

## Troubleshooting

### Hub selector not loading?
- Refresh the page (Ctrl+R or Cmd+R)
- Clear browser cache
- Try incognito/private mode

### Booking not saved?
- Enable localStorage (check privacy settings)
- Check available storage space on device
- Try again after clearing cache

### Can't select a hub?
- Make sure you clicked directly on the hub card
- Check that JavaScript is enabled
- Reload page and try again

### Need a different hub after booking?
- Create a new booking for the different hub
- Or contact the hub directly to reschedule

## Next Steps

1. Visit the hub selector to browse hubs
2. Click on your preferred hub
3. Review hub details and facilities
4. Click "Proceed to Collection" to book
5. Follow the 4-step booking process
6. Receive confirmation

---

**Ready to make an impact?** Select your collection hub and schedule a pickup today! 🌱

For more information, see `COLLECTION_HUB_DOCUMENTATION.md`
