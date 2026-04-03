# Event Image Updater - Free & Safe Images

This script updates all event images in your database with high-quality, free images from trusted sources.

## 📸 Image Sources

All images are sourced from these **100% FREE and SAFE** platforms:

1. **Unsplash** (https://unsplash.com)
   - Over 3 million free high-resolution photos
   - No attribution required
   - Free for commercial use

2. **Pexels** (https://pexels.com)
   - Thousands of free stock photos
   - All photos under Pexels License
   - Free for personal and commercial use

3. **Pixabay** (https://pixabay.com)
   - Over 2.7 million free images
   - Pixabay License - Free for commercial use
   - No attribution required

## 🎯 Features

- ✅ Updates all events with category-appropriate images
- ✅ High-quality images (1200px width)
- ✅ Completely free and legal to use
- ✅ No attribution required
- ✅ Optimized for web performance
- ✅ Diverse image collection per category

## 📂 Categories Covered

- **Wedding** (14 images) - Ceremonies, decorations, venues, flowers
- **Corporate** (14 images) - Conferences, meetings, seminars, offices
- **Birthday** (14 images) - Parties, cakes, balloons, celebrations
- **Anniversary** (14 images) - Romantic dinners, elegant setups
- **Conference** (14 images) - Large halls, auditoriums, tech events
- **Party** (14 images) - Music events, DJ parties, night parties

## 🚀 How to Use

### Method 1: Using Batch File (Easiest)
```bash
# Simply double-click this file:
update-images.bat
```

### Method 2: Using Node.js
```bash
# Basic version
node update-event-images.js

# Enhanced version (recommended)
node update-event-images-enhanced.js
```

## 📋 Prerequisites

1. MongoDB must be running
2. `.env` file must be configured with `MONGODB_URI` or `MONGO_URI`
3. Node.js must be installed
4. Events must exist in the database

## 🔧 Configuration

The script automatically reads your MongoDB connection from `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/calevent
# OR
MONGO_URI=mongodb://localhost:27017/calevent
```

## 📊 What It Does

1. Connects to your MongoDB database
2. Fetches all events from the `events` collection
3. Assigns a random, category-appropriate image to each event
4. Updates the `eventImage` field with the new URL
5. Saves the changes to the database
6. Displays a summary of updates

## 🎨 Image Selection

Images are randomly selected from a curated collection based on event category:

```javascript
Wedding Event → Wedding-related images (ceremonies, venues, decorations)
Corporate Event → Business/conference images
Birthday Event → Party/celebration images
Anniversary Event → Romantic/elegant images
Conference Event → Large venue/auditorium images
Party Event → Music/entertainment images
```

## ✨ Output Example

```
╔════════════════════════════════════════════════════════════╗
║        CALEVENT - Event Image Updater                     ║
║        Using Free Images from Trusted Sources             ║
╚════════════════════════════════════════════════════════════╝

🔌 Connecting to MongoDB...
✅ Connected to MongoDB

📊 Found 20 events to update

📝 [1/20] Premium Wedding Package
   📂 Category: wedding
   🖼️  New Image: https://images.unsplash.com/photo-1519741497674...

...

============================================================
✅ Successfully updated all events with free images!
============================================================

📊 Summary by Category:
   wedding        : 5 events
   corporate      : 4 events
   birthday       : 6 events
   anniversary    : 2 events
   conference     : 2 events
   party          : 1 events

📸 Image Sources Used:
   ✓ Unsplash - Free high-quality photos
   ✓ Pexels - Free stock photos
   ✓ Pixabay - Free images & videos

✨ All images are:
   • Completely FREE to use
   • High quality (1200px width)
   • Safe and licensed
   • No attribution required
   • Optimized for web

🔌 Database connection closed
```

## 🔒 Legal & Safety

### ✅ All Images Are:
- **Legally Free**: Licensed for commercial use
- **Safe**: From trusted, verified sources
- **High Quality**: Professional photography
- **No Attribution Required**: Use freely without credit
- **Permanent URLs**: Direct CDN links that won't break

### 📜 Licenses:
- **Unsplash License**: Free to use for any purpose
- **Pexels License**: Free for personal and commercial use
- **Pixabay License**: Free for commercial use, no attribution required

## 🛠️ Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution**: Make sure MongoDB is running and `.env` is configured correctly

### Issue: "No events found"
**Solution**: Add events to your database first using the seed scripts

### Issue: "Module not found"
**Solution**: Run `npm install` in the backend directory

### Issue: Images not loading in frontend
**Solution**: Images are external URLs, ensure your frontend can load external images

## 📝 Notes

- Images are stored as URLs, not downloaded locally
- This saves disk space and bandwidth
- Images are served from CDNs for fast loading
- No copyright issues or attribution needed
- Images are high-resolution and web-optimized

## 🔄 Re-running the Script

You can run this script multiple times safely. Each run will:
- Assign new random images to all events
- Not create duplicates
- Update existing events only

## 🎯 Best Practices

1. **Run after seeding events**: Ensure events exist first
2. **Backup database**: Always backup before bulk updates
3. **Check results**: Verify images load correctly in frontend
4. **Re-run if needed**: Script is idempotent and safe to re-run

## 📞 Support

If you encounter any issues:
1. Check MongoDB connection
2. Verify `.env` configuration
3. Ensure events exist in database
4. Check console output for specific errors

## 🌟 Credits

Images provided by:
- Unsplash contributors
- Pexels photographers
- Pixabay community

All images are used in accordance with their respective licenses.

---

**Made with ❤️ for CALEVENT**
