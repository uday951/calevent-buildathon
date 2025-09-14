import express from 'express';
import FeedPost from '../models/FeedPost.js';
import { providerAuth, verifyToken, optionalAuth } from '../middleware/auth.js';
import { uploadMultiple } from '../middleware/upload.js';
import { getFileUrl } from '../middleware/upload.js';

const router = express.Router();

// Get all feed posts
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;

    const filter = { isActive: true };
    if (category && category !== 'all') {
      filter.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const posts = await FeedPost.find(filter)
      .populate('providerId', 'name businessName profileImage isVerified')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPosts = await FeedPost.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / parseInt(limit));

    // Add full image URLs and like status
    const postsWithUrls = posts.map(post => {
      const postObj = post.toObject();
      postObj.images = postObj.images.map(img => getFileUrl(req, img));
      postObj.likeCount = postObj.likes.length;
      postObj.commentCount = postObj.comments.length;
      
      // Check if current user liked the post
      if (req.user) {
        postObj.isLiked = postObj.likes.some(like => 
          like.userId.toString() === req.user.id && like.userType === req.user.role
        );
      }
      
      delete postObj.likes; // Remove likes array from response
      return postObj;
    });

    res.json({
      success: true,
      data: {
        posts: postsWithUrls,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalPosts,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get feed posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feed posts',
      error: error.message
    });
  }
});

// Create new feed post (Provider only)
router.post('/', providerAuth, uploadMultiple('images', 5), async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const providerId = req.user.id;

    const post = new FeedPost({
      providerId,
      providerName: req.provider.businessName || req.provider.name,
      title,
      content,
      category: category || 'general',
      tags: tags ? JSON.parse(tags) : [],
      images: req.files ? req.files.map(file => file.path) : []
    });

    await post.save();

    const populatedPost = await FeedPost.findById(post._id)
      .populate('providerId', 'name businessName profileImage isVerified');

    // Add full image URLs
    const postObj = populatedPost.toObject();
    postObj.images = postObj.images.map(img => getFileUrl(req, img));
    postObj.likeCount = 0;
    postObj.commentCount = 0;

    res.status(201).json({
      success: true,
      message: 'Feed post created successfully',
      data: { post: postObj }
    });
  } catch (error) {
    console.error('Create feed post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create feed post',
      error: error.message
    });
  }
});

// Like/Unlike post
router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userType = req.user.role === 'customer' ? 'Customer' : 'Provider';

    const post = await FeedPost.findById(id);
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if already liked
    const existingLikeIndex = post.likes.findIndex(
      like => like.userId.toString() === userId && like.userType === userType
    );

    let message;
    if (existingLikeIndex > -1) {
      // Unlike
      post.likes.splice(existingLikeIndex, 1);
      message = 'Post unliked successfully';
    } else {
      // Like
      post.likes.push({ userId, userType });
      message = 'Post liked successfully';
    }

    await post.save();

    res.json({
      success: true,
      message,
      data: {
        isLiked: existingLikeIndex === -1,
        likeCount: post.likes.length
      }
    });
  } catch (error) {
    console.error('Toggle post like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like',
      error: error.message
    });
  }
});

// Add comment to post
router.post('/:id/comment', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;
    const userType = req.user.role === 'customer' ? 'Customer' : 'Provider';

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot be empty'
      });
    }

    const post = await FeedPost.findById(id);
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Get user name
    const userName = req.user.role === 'customer' ? req.customer?.name : req.provider?.name;

    post.comments.push({
      userId,
      userType,
      userName: userName || 'Anonymous',
      comment: comment.trim()
    });

    await post.save();

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: {
        commentCount: post.comments.length
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
});

// Get post comments
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const post = await FeedPost.findById(id);
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Paginate comments
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const comments = post.comments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + parseInt(limit));

    const totalComments = post.comments.length;
    const totalPages = Math.ceil(totalComments / parseInt(limit));

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalComments,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: error.message
    });
  }
});

export default router;