import Event from '../models/EventModel.js';
import Provider from '../models/Provider.js';
import { getFileUrl } from '../middleware/upload.js';

// Get all events with filtering and pagination
export const getAllEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      location,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

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

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const events = await Event.find(filter)
      .populate('providerId', 'name businessName isVerified profileImage')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
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
        }
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

// Get single event by ID
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .populate('providerId', 'name businessName phone email isVerified profileImage location description')
      .populate('reviews.customerId', 'name profileImage');

    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Increment view count
    event.views += 1;
    await event.save();

    // Add full image URL
    const eventObj = event.toObject();
    eventObj.eventImage = getFileUrl(req, eventObj.eventImage);

    res.json({
      success: true,
      data: { event: eventObj }
    });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message
    });
  }
};

// Create new event (Provider only)
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      location,
      features,
      tags,
      maxCapacity,
      minCapacity,
      duration,
      inclusions,
      exclusions,
      availability
    } = req.body;

    const providerId = req.user.id;

    // Get provider details
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Event image is required'
      });
    }

    // Create event
    const event = new Event({
      title,
      description,
      category,
      price: parseFloat(price),
      eventImage: req.file.path,
      providerId,
      providerName: provider.businessName || provider.name,
      location,
      features: features ? JSON.parse(features) : [],
      tags: tags ? JSON.parse(tags) : [],
      maxCapacity: parseInt(maxCapacity),
      minCapacity: parseInt(minCapacity) || 1,
      duration,
      inclusions: inclusions ? JSON.parse(inclusions) : [],
      exclusions: exclusions ? JSON.parse(exclusions) : [],
      availability: availability ? JSON.parse(availability) : []
    });

    await event.save();

    // Add full image URL
    const eventObj = event.toObject();
    eventObj.eventImage = getFileUrl(req, eventObj.eventImage);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event: eventObj }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

// Update event (Provider only)
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user.id;

    // Find event and verify ownership
    const event = await Event.findOne({ _id: id, providerId });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or unauthorized'
      });
    }

    // Update fields
    const updateFields = { ...req.body };
    
    // Handle JSON fields
    if (updateFields.features) updateFields.features = JSON.parse(updateFields.features);
    if (updateFields.tags) updateFields.tags = JSON.parse(updateFields.tags);
    if (updateFields.inclusions) updateFields.inclusions = JSON.parse(updateFields.inclusions);
    if (updateFields.exclusions) updateFields.exclusions = JSON.parse(updateFields.exclusions);
    if (updateFields.availability) updateFields.availability = JSON.parse(updateFields.availability);

    // Handle price conversion
    if (updateFields.price) updateFields.price = parseFloat(updateFields.price);
    if (updateFields.maxCapacity) updateFields.maxCapacity = parseInt(updateFields.maxCapacity);
    if (updateFields.minCapacity) updateFields.minCapacity = parseInt(updateFields.minCapacity);

    // Handle image update
    if (req.file) {
      updateFields.eventImage = req.file.path;
    }

    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('providerId', 'name businessName isVerified');

    // Add full image URL
    const eventObj = updatedEvent.toObject();
    eventObj.eventImage = getFileUrl(req, eventObj.eventImage);

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: { event: eventObj }
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
};

// Delete event (Provider only)
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user.id;

    // Find event and verify ownership
    const event = await Event.findOne({ _id: id, providerId });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or unauthorized'
      });
    }

    // Soft delete by setting isActive to false
    event.isActive = false;
    await event.save();

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
};

// Like/Unlike event (Customer only)
export const toggleEventLike = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user.id;

    const event = await Event.findById(id);
    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if already liked
    const existingLikeIndex = event.likes.findIndex(
      like => like.customerId.toString() === customerId
    );

    let message;
    if (existingLikeIndex > -1) {
      // Unlike
      event.likes.splice(existingLikeIndex, 1);
      message = 'Event unliked successfully';
    } else {
      // Like
      event.likes.push({ customerId });
      message = 'Event liked successfully';
    }

    await event.save();

    res.json({
      success: true,
      message,
      data: {
        isLiked: existingLikeIndex === -1,
        likeCount: event.likes.length
      }
    });
  } catch (error) {
    console.error('Toggle event like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like',
      error: error.message
    });
  }
};

// Add review to event
export const addEventReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const customerId = req.user.id;

    const event = await Event.findById(id);
    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if customer already reviewed
    const existingReview = event.reviews.find(
      review => review.customerId.toString() === customerId
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this event'
      });
    }

    // Add review
    event.reviews.push({
      customerId,
      customerName: req.customer.name,
      rating: parseInt(rating),
      comment
    });

    // Recalculate average rating
    event.calculateAverageRating();
    await event.save();

    res.json({
      success: true,
      message: 'Review added successfully',
      data: {
        rating: event.rating,
        reviewCount: event.reviews.length
      }
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review',
      error: error.message
    });
  }
};