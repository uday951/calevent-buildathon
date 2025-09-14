import express from 'express';
import Event from '../models/EventModel.js';
import Provider from '../models/Provider.js';
import { getFileUrl } from '../middleware/upload.js';

const router = express.Router();

// Search events
router.get('/events', async (req, res) => {
  try {
    const {
      q: query,
      category,
      location,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12
    } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    // Build search filter
    const filter = { isActive: true };

    // Text search
    filter.$or = [
      { title: new RegExp(query, 'i') },
      { description: new RegExp(query, 'i') },
      { tags: new RegExp(query, 'i') },
      { providerName: new RegExp(query, 'i') }
    ];

    // Additional filters
    if (category && category !== 'all') {
      filter.category = category;
    }

    if (location) {
      filter['location.city'] = new RegExp(location, 'i');
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Execute search with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const events = await Event.find(filter)
      .populate('providerId', 'name businessName isVerified profileImage')
      .sort({ rating: -1, views: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalEvents = await Event.countDocuments(filter);
    const totalPages = Math.ceil(totalEvents / parseInt(limit));

    // Add full image URLs
    const eventsWithUrls = events.map(event => {
      const eventObj = event.toObject();
      eventObj.eventImage = getFileUrl(req, eventObj.eventImage);
      return eventObj;
    });

    res.json({
      success: true,
      data: {
        events: eventsWithUrls,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalEvents,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        },
        searchQuery: query
      }
    });
  } catch (error) {
    console.error('Search events error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
});

// Search providers
router.get('/providers', async (req, res) => {
  try {
    const {
      q: query,
      category,
      location,
      verified,
      page = 1,
      limit = 12
    } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    // Build search filter
    const filter = { isActive: true };

    // Text search
    filter.$or = [
      { name: new RegExp(query, 'i') },
      { businessName: new RegExp(query, 'i') },
      { description: new RegExp(query, 'i') }
    ];

    // Additional filters
    if (category && category !== 'all') {
      filter.categories = category;
    }

    if (location) {
      filter['location.city'] = new RegExp(location, 'i');
    }

    if (verified === 'true') {
      filter.isVerified = true;
    }

    // Execute search with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const providers = await Provider.find(filter)
      .select('-password -bankDetails -documents')
      .sort({ rating: -1, totalReviews: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalProviders = await Provider.countDocuments(filter);
    const totalPages = Math.ceil(totalProviders / parseInt(limit));

    // Add full image URLs
    const providersWithUrls = providers.map(provider => {
      const providerObj = provider.toObject();
      if (providerObj.profileImage) {
        providerObj.profileImage = getFileUrl(req, providerObj.profileImage);
      }
      return providerObj;
    });

    res.json({
      success: true,
      data: {
        providers: providersWithUrls,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProviders,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        },
        searchQuery: query
      }
    });
  } catch (error) {
    console.error('Search providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
});

// Get search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q: query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }

    // Get event title suggestions
    const eventSuggestions = await Event.find({
      title: new RegExp(query, 'i'),
      isActive: true
    })
    .select('title')
    .limit(5);

    // Get provider name suggestions
    const providerSuggestions = await Provider.find({
      $or: [
        { name: new RegExp(query, 'i') },
        { businessName: new RegExp(query, 'i') }
      ],
      isActive: true
    })
    .select('name businessName')
    .limit(5);

    // Combine and format suggestions
    const suggestions = [
      ...eventSuggestions.map(event => ({
        type: 'event',
        text: event.title,
        id: event._id
      })),
      ...providerSuggestions.map(provider => ({
        type: 'provider',
        text: provider.businessName || provider.name,
        id: provider._id
      }))
    ];

    res.json({
      success: true,
      data: { suggestions: suggestions.slice(0, 8) }
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions',
      error: error.message
    });
  }
});

export default router;