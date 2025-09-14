import ComboPackage from '../models/ComboPackageModel.js';
import { getFileUrl } from '../middleware/upload.js';

// Get all combo packages
export const getAllComboPackages = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      location,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { isActive: true };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (location) {
      filter['location.city'] = new RegExp(location, 'i');
    }

    if (minPrice || maxPrice) {
      filter.comboPrice = {};
      if (minPrice) filter.comboPrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.comboPrice.$lte = parseFloat(maxPrice);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const combos = await ComboPackage.find(filter)
      .populate('providers.providerId', 'name businessName profileImage')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCombos = await ComboPackage.countDocuments(filter);
    const totalPages = Math.ceil(totalCombos / parseInt(limit));

    // Add full image URLs
    const combosWithUrls = combos.map(combo => {
      const comboObj = combo.toObject();
      comboObj.images = comboObj.images.map(img => getFileUrl(req, img));
      return comboObj;
    });

    res.json({
      success: true,
      data: {
        combos: combosWithUrls,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCombos,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get combo packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch combo packages',
      error: error.message
    });
  }
};

// Get single combo package by ID
export const getComboPackageById = async (req, res) => {
  try {
    const { id } = req.params;

    const combo = await ComboPackage.findById(id)
      .populate('providers.providerId', 'name businessName phone email profileImage location')
      .populate('reviews.customerId', 'name profileImage');

    if (!combo || !combo.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Combo package not found'
      });
    }

    const comboObj = combo.toObject();
    comboObj.images = comboObj.images.map(img => getFileUrl(req, img));

    res.json({
      success: true,
      data: { combo: comboObj }
    });
  } catch (error) {
    console.error('Get combo package by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch combo package',
      error: error.message
    });
  }
};

// Create new combo package (Provider only)
export const createComboPackage = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      originalPrice,
      comboPrice,
      services,
      providers,
      location,
      duration,
      maxGuests,
      minGuests,
      tags
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required'
      });
    }

    const originalPriceNum = parseFloat(originalPrice);
    const comboPriceNum = parseFloat(comboPrice);
    const savings = originalPriceNum - comboPriceNum;
    const savingsPercent = Math.round((savings / originalPriceNum) * 100);

    // Process services to add descriptions
    const processedServices = services ? JSON.parse(services).map(service => ({
      name: service.name,
      description: service.description || service.name, // Use name as description if missing
      included: service.included !== false,
      price: parseFloat(service.price) || 0
    })) : [];

    const combo = new ComboPackage({
      title,
      description,
      category,
      originalPrice: originalPriceNum,
      comboPrice: comboPriceNum,
      savings,
      savingsPercent,
      images: req.files.map(file => file.path),
      services: processedServices,
      providers: providers ? JSON.parse(providers) : [],
      location: location ? JSON.parse(location) : {},
      duration,
      maxGuests: parseInt(maxGuests),
      minGuests: parseInt(minGuests) || 1,
      tags: tags ? JSON.parse(tags) : []
    });

    await combo.save();

    const comboObj = combo.toObject();
    comboObj.images = comboObj.images.map(img => getFileUrl(req, img));

    res.status(201).json({
      success: true,
      message: 'Combo package created successfully',
      data: { combo: comboObj }
    });
  } catch (error) {
    console.error('Create combo package error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create combo package',
      error: error.message
    });
  }
};

// Update combo package
export const updateComboPackage = async (req, res) => {
  try {
    const { id } = req.params;

    const combo = await ComboPackage.findById(id);
    if (!combo) {
      return res.status(404).json({
        success: false,
        message: 'Combo package not found'
      });
    }

    const updateFields = { ...req.body };
    
    // Handle JSON fields
    if (updateFields.services) updateFields.services = JSON.parse(updateFields.services);
    if (updateFields.providers) updateFields.providers = JSON.parse(updateFields.providers);
    if (updateFields.location) updateFields.location = JSON.parse(updateFields.location);
    if (updateFields.tags) updateFields.tags = JSON.parse(updateFields.tags);

    // Handle price conversion
    if (updateFields.originalPrice) updateFields.originalPrice = parseFloat(updateFields.originalPrice);
    if (updateFields.comboPrice) updateFields.comboPrice = parseFloat(updateFields.comboPrice);
    if (updateFields.maxGuests) updateFields.maxGuests = parseInt(updateFields.maxGuests);
    if (updateFields.minGuests) updateFields.minGuests = parseInt(updateFields.minGuests);

    // Handle image updates
    if (req.files && req.files.length > 0) {
      updateFields.images = req.files.map(file => file.path);
    }

    const updatedCombo = await ComboPackage.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    const comboObj = updatedCombo.toObject();
    comboObj.images = comboObj.images.map(img => getFileUrl(req, img));

    res.json({
      success: true,
      message: 'Combo package updated successfully',
      data: { combo: comboObj }
    });
  } catch (error) {
    console.error('Update combo package error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update combo package',
      error: error.message
    });
  }
};

// Delete combo package
export const deleteComboPackage = async (req, res) => {
  try {
    const { id } = req.params;

    const combo = await ComboPackage.findById(id);
    if (!combo) {
      return res.status(404).json({
        success: false,
        message: 'Combo package not found'
      });
    }

    combo.isActive = false;
    await combo.save();

    res.json({
      success: true,
      message: 'Combo package deleted successfully'
    });
  } catch (error) {
    console.error('Delete combo package error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete combo package',
      error: error.message
    });
  }
};