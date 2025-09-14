// Input validation and sanitization middleware

export const validateEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

export const validateCustomerRegistration = (req, res, next) => {
  const { name, email, password, phone } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!email || !validateEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password || !validatePassword(password)) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!phone || !validatePhone(phone)) {
    errors.push('Please provide a valid 10-digit phone number');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Sanitize inputs
  req.body.name = sanitizeString(name);
  req.body.email = email.toLowerCase().trim();
  req.body.phone = phone.trim();

  next();
};

export const validateProviderRegistration = (req, res, next) => {
  const { name, email, password, phone, businessName, categories } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!email || !validateEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password || !validatePassword(password)) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!phone || !validatePhone(phone)) {
    errors.push('Please provide a valid 10-digit phone number');
  }

  if (!businessName || businessName.trim().length < 2) {
    errors.push('Business name must be at least 2 characters long');
  }

  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    errors.push('Please select at least one service category');
  }

  const validCategories = ['wedding', 'corporate', 'birthday', 'anniversary', 'conference', 'party'];
  if (categories && Array.isArray(categories)) {
    const invalidCategories = categories.filter(cat => !validCategories.includes(cat));
    if (invalidCategories.length > 0) {
      errors.push('Invalid service categories provided');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Sanitize inputs
  req.body.name = sanitizeString(name);
  req.body.email = email.toLowerCase().trim();
  req.body.phone = phone.trim();
  req.body.businessName = sanitizeString(businessName);

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !validateEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  req.body.email = email.toLowerCase().trim();
  next();
};

export const validateEventCreation = (req, res, next) => {
  const { title, description, category, price, location } = req.body;
  const errors = [];

  if (!title || title.trim().length < 5) {
    errors.push('Event title must be at least 5 characters long');
  }

  if (!description || description.trim().length < 20) {
    errors.push('Event description must be at least 20 characters long');
  }

  const validCategories = ['wedding', 'corporate', 'birthday', 'anniversary', 'conference', 'party'];
  if (!category || !validCategories.includes(category)) {
    errors.push('Please select a valid event category');
  }

  if (!price || isNaN(price) || price < 0) {
    errors.push('Please provide a valid price');
  }

  // Parse location if it's a JSON string
  let locationObj = location;
  if (typeof location === 'string') {
    try {
      locationObj = JSON.parse(location);
    } catch (e) {
      errors.push('Invalid location format');
    }
  }

  if (!locationObj || !locationObj.address || !locationObj.city) {
    errors.push('Please provide complete location details');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Sanitize inputs
  req.body.title = sanitizeString(title);
  req.body.description = sanitizeString(description);
  req.body.price = parseFloat(price);
  
  // Parse location for controller
  if (typeof req.body.location === 'string') {
    req.body.location = JSON.parse(req.body.location);
  }

  next();
};

export const validateBookingCreation = (req, res, next) => {
  const { eventDate, eventTime, venue, guestCount, contactDetails } = req.body;
  const errors = [];

  if (!eventDate) {
    errors.push('Event date is required');
  } else {
    const selectedDate = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.push('Event date cannot be in the past');
    }
  }

  if (!eventTime) {
    errors.push('Event time is required');
  }

  if (!venue || venue.trim().length < 5) {
    errors.push('Venue address must be at least 5 characters long');
  }

  if (!guestCount || isNaN(guestCount) || guestCount < 1) {
    errors.push('Please provide a valid guest count');
  }

  if (!contactDetails || !contactDetails.name || !contactDetails.email || !contactDetails.phone) {
    errors.push('Complete contact details are required');
  }

  if (contactDetails && contactDetails.email && !validateEmail(contactDetails.email)) {
    errors.push('Please provide a valid contact email');
  }

  if (contactDetails && contactDetails.phone && !validatePhone(contactDetails.phone)) {
    errors.push('Please provide a valid contact phone number');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Sanitize inputs
  req.body.venue = sanitizeString(venue);
  req.body.guestCount = parseInt(guestCount);
  if (contactDetails) {
    req.body.contactDetails.name = sanitizeString(contactDetails.name);
    req.body.contactDetails.email = contactDetails.email.toLowerCase().trim();
    req.body.contactDetails.phone = contactDetails.phone.trim();
  }

  next();
};