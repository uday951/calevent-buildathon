import Customer from '../models/customer.js';
import Provider from '../models/Provider.js';
import { generateToken } from '../middleware/auth.js';
import { sendWelcomeEmail } from '../services/emailService.js';

// Customer Registration
export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, gender } = req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }

    // Create new customer
    const customer = new Customer({
      name,
      email,
      password,
      phone,
      dateOfBirth,
      gender
    });

    await customer.save();

    // Generate token
    const token = generateToken({
      id: customer._id,
      email: customer.email,
      role: 'customer'
    });

    // Send welcome email
    await sendWelcomeEmail({ name, email }, 'customer');

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      data: {
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          role: 'customer'
        },
        token
      }
    });
  } catch (error) {
    console.error('Customer registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Customer Login
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find customer and include password
    const customer = await Customer.findOne({ email }).select('+password');
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if customer is active
    if (!customer.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await customer.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken({
      id: customer._id,
      email: customer.email,
      role: 'customer'
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          profileImage: customer.profileImage,
          role: 'customer'
        },
        token
      }
    });
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Provider Registration
export const registerProvider = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      businessName, 
      businessType = 'individual', 
      categories, 
      description,
      location 
    } = req.body;

    // Check if provider already exists
    const existingProvider = await Provider.findOne({ email });
    if (existingProvider) {
      return res.status(400).json({
        success: false,
        message: 'Provider with this email already exists'
      });
    }

    // Prepare provider data
    const providerData = {
      name,
      email,
      password,
      phone,
      businessName,
      businessType,
      categories,
      description
    };

    // Add location if provided
    if (location) {
      providerData.location = location;
    }

    // Create new provider
    const provider = new Provider(providerData);
    await provider.save();

    // Generate token
    const token = generateToken({
      id: provider._id,
      email: provider.email,
      role: 'provider'
    });

    // Send welcome email (optional, don't fail registration if email fails)
    try {
      await sendWelcomeEmail({ name, email }, 'provider');
    } catch (emailError) {
      console.warn('Welcome email failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Provider registered successfully',
      data: {
        provider: {
          id: provider._id,
          name: provider.name,
          email: provider.email,
          phone: provider.phone,
          businessName: provider.businessName,
          categories: provider.categories,
          role: 'provider'
        },
        token
      }
    });
  } catch (error) {
    console.error('Provider registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Provider Login
export const loginProvider = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find provider and include password
    const provider = await Provider.findOne({ email }).select('+password');
    if (!provider) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if provider is active
    if (!provider.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await provider.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken({
      id: provider._id,
      email: provider.email,
      role: 'provider'
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        provider: {
          id: provider._id,
          name: provider.name,
          email: provider.email,
          phone: provider.phone,
          businessName: provider.businessName,
          categories: provider.categories,
          profileImage: provider.profileImage,
          isVerified: provider.isVerified,
          role: 'provider'
        },
        token
      }
    });
  } catch (error) {
    console.error('Provider login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Verify Token
export const verifyToken = async (req, res) => {
  try {
    const { id, role } = req.user;

    let user;
    if (role === 'customer') {
      user = await Customer.findById(id);
    } else if (role === 'provider') {
      user = await Provider.findById(id);
    }

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          profileImage: user.profileImage,
          role,
          ...(role === 'provider' && {
            businessName: user.businessName,
            categories: user.categories,
            isVerified: user.isVerified
          })
        }
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: error.message
    });
  }
};